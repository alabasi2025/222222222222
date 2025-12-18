import { Router } from 'express';
import { db } from '../db';
import { interUnitTransfers, interUnitAccounts, journalEntries, journalEntryLines, accounts, entities } from '../db/schema';
import { eq, desc, and, or } from 'drizzle-orm';

const router = Router();

// الحصول على جميع التحويلات
router.get('/', async (req, res) => {
  try {
    const { entityId } = req.query;
    
    let transfers;
    if (entityId) {
      transfers = await db.select()
        .from(interUnitTransfers)
        .where(
          or(
            eq(interUnitTransfers.fromEntityId, entityId as string),
            eq(interUnitTransfers.toEntityId, entityId as string)
          )
        )
        .orderBy(desc(interUnitTransfers.createdAt));
    } else {
      transfers = await db.select()
        .from(interUnitTransfers)
        .orderBy(desc(interUnitTransfers.createdAt));
    }
    
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// الحصول على حسابات الجاري بين الوحدات
router.get('/inter-unit-accounts', async (req, res) => {
  try {
    const { entityId } = req.query;
    
    let interAccounts;
    if (entityId) {
      interAccounts = await db.select()
        .from(interUnitAccounts)
        .where(eq(interUnitAccounts.entityId, entityId as string));
    } else {
      interAccounts = await db.select().from(interUnitAccounts);
    }
    
    res.json(interAccounts);
  } catch (error) {
    console.error('Error fetching inter-unit accounts:', error);
    res.status(500).json({ error: 'Failed to fetch inter-unit accounts' });
  }
});

// إنشاء تحويل جديد
router.post('/', async (req, res) => {
  try {
    const { 
      fromEntityId, 
      toEntityId, 
      fromAccountId, 
      toAccountId, 
      amount, 
      currency = 'YER',
      description,
      date 
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!fromEntityId || !toEntityId || !fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fromEntityId === toEntityId) {
      return res.status(400).json({ error: 'Cannot transfer to the same entity' });
    }

    // إنشاء رقم التحويل
    const transferNumber = `TR-${Date.now()}`;
    const transferDate = date ? new Date(date) : new Date();
    const transferId = `transfer-${Date.now()}`;

    // الحصول على أسماء الوحدات
    const [fromEntity] = await db.select().from(entities).where(eq(entities.id, fromEntityId));
    const [toEntity] = await db.select().from(entities).where(eq(entities.id, toEntityId));

    if (!fromEntity || !toEntity) {
      return res.status(400).json({ error: 'Invalid entity IDs' });
    }

    // البحث عن أو إنشاء حساب جاري للوحدة المستلمة في الوحدة المُحوِّلة
    let fromInterAccount = await db.select()
      .from(interUnitAccounts)
      .where(
        and(
          eq(interUnitAccounts.entityId, fromEntityId),
          eq(interUnitAccounts.relatedEntityId, toEntityId)
        )
      );

    let fromInterAccountId: string;
    if (fromInterAccount.length === 0) {
      // إنشاء حساب جاري جديد
      const newAccountId = `ACC-INTER-${fromEntityId}-${toEntityId}`;
      await db.insert(accounts).values({
        id: newAccountId,
        name: `جاري ${toEntity.name}`,
        type: 'asset',
        level: 3,
        balance: '0',
        isGroup: false,
        subtype: 'intercompany',
        entityId: fromEntityId,
      });

      await db.insert(interUnitAccounts).values({
        id: `IUA-${fromEntityId}-${toEntityId}`,
        entityId: fromEntityId,
        relatedEntityId: toEntityId,
        accountId: newAccountId,
        balance: '0',
        currency,
      });

      fromInterAccountId = newAccountId;
    } else {
      fromInterAccountId = fromInterAccount[0].accountId;
    }

    // البحث عن أو إنشاء حساب جاري للوحدة المُحوِّلة في الوحدة المستلمة
    let toInterAccount = await db.select()
      .from(interUnitAccounts)
      .where(
        and(
          eq(interUnitAccounts.entityId, toEntityId),
          eq(interUnitAccounts.relatedEntityId, fromEntityId)
        )
      );

    let toInterAccountId: string;
    if (toInterAccount.length === 0) {
      // إنشاء حساب جاري جديد
      const newAccountId = `ACC-INTER-${toEntityId}-${fromEntityId}`;
      await db.insert(accounts).values({
        id: newAccountId,
        name: `جاري ${fromEntity.name}`,
        type: 'liability',
        level: 3,
        balance: '0',
        isGroup: false,
        subtype: 'intercompany',
        entityId: toEntityId,
      });

      await db.insert(interUnitAccounts).values({
        id: `IUA-${toEntityId}-${fromEntityId}`,
        entityId: toEntityId,
        relatedEntityId: fromEntityId,
        accountId: newAccountId,
        balance: '0',
        currency,
      });

      toInterAccountId = newAccountId;
    } else {
      toInterAccountId = toInterAccount[0].accountId;
    }

    // إنشاء القيد في الوحدة المُحوِّلة
    const fromJournalId = `JE-${fromEntityId}-${Date.now()}`;
    await db.insert(journalEntries).values({
      id: fromJournalId,
      entityId: fromEntityId,
      date: transferDate,
      description: `تحويل إلى ${toEntity.name} - ${description || transferNumber}`,
      reference: transferNumber,
      type: 'auto',
      status: 'posted',
    });

    // سطور القيد في الوحدة المُحوِّلة
    // مدين: جاري الوحدة المستلمة
    await db.insert(journalEntryLines).values({
      id: `JEL-${fromJournalId}-1`,
      entryId: fromJournalId,
      accountId: fromInterAccountId,
      debit: amount.toString(),
      credit: '0',
      currency,
      description: `تحويل إلى ${toEntity.name}`,
    });

    // دائن: الحساب المحدد (صندوق/بنك)
    await db.insert(journalEntryLines).values({
      id: `JEL-${fromJournalId}-2`,
      entryId: fromJournalId,
      accountId: fromAccountId,
      debit: '0',
      credit: amount.toString(),
      currency,
      description: `تحويل إلى ${toEntity.name}`,
    });

    // إنشاء القيد في الوحدة المستلمة
    const toJournalId = `JE-${toEntityId}-${Date.now()}`;
    await db.insert(journalEntries).values({
      id: toJournalId,
      entityId: toEntityId,
      date: transferDate,
      description: `استلام من ${fromEntity.name} - ${description || transferNumber}`,
      reference: transferNumber,
      type: 'auto',
      status: 'posted',
    });

    // سطور القيد في الوحدة المستلمة
    // مدين: الحساب المحدد (صندوق/بنك)
    await db.insert(journalEntryLines).values({
      id: `JEL-${toJournalId}-1`,
      entryId: toJournalId,
      accountId: toAccountId,
      debit: amount.toString(),
      credit: '0',
      currency,
      description: `استلام من ${fromEntity.name}`,
    });

    // دائن: جاري الوحدة المُحوِّلة
    await db.insert(journalEntryLines).values({
      id: `JEL-${toJournalId}-2`,
      entryId: toJournalId,
      accountId: toInterAccountId,
      debit: '0',
      credit: amount.toString(),
      currency,
      description: `استلام من ${fromEntity.name}`,
    });

    // إنشاء سجل التحويل
    const [transfer] = await db.insert(interUnitTransfers).values({
      id: transferId,
      transferNumber,
      fromEntityId,
      toEntityId,
      fromAccountId,
      toAccountId,
      amount: amount.toString(),
      currency,
      description,
      date: transferDate,
      status: 'completed',
      fromJournalEntryId: fromJournalId,
      toJournalEntryId: toJournalId,
    }).returning();

    res.status(201).json({
      success: true,
      transfer,
      message: 'تم التحويل بنجاح وإنشاء القيود في كلا الوحدتين',
      journals: {
        from: fromJournalId,
        to: toJournalId,
      },
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

// الحصول على تحويل محدد
router.get('/:id', async (req, res) => {
  try {
    const [transfer] = await db.select()
      .from(interUnitTransfers)
      .where(eq(interUnitTransfers.id, req.params.id));
    
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

// إلغاء تحويل
router.patch('/:id/cancel', async (req, res) => {
  try {
    const [transfer] = await db.select()
      .from(interUnitTransfers)
      .where(eq(interUnitTransfers.id, req.params.id));
    
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    if (transfer.status === 'cancelled') {
      return res.status(400).json({ error: 'Transfer already cancelled' });
    }

    // تحديث حالة التحويل
    await db.update(interUnitTransfers)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(interUnitTransfers.id, req.params.id));

    // إلغاء القيود المرتبطة
    if (transfer.fromJournalEntryId) {
      await db.update(journalEntries)
        .set({ status: 'cancelled' })
        .where(eq(journalEntries.id, transfer.fromJournalEntryId));
    }

    if (transfer.toJournalEntryId) {
      await db.update(journalEntries)
        .set({ status: 'cancelled' })
        .where(eq(journalEntries.id, transfer.toJournalEntryId));
    }

    res.json({ success: true, message: 'تم إلغاء التحويل بنجاح' });
  } catch (error) {
    console.error('Error cancelling transfer:', error);
    res.status(500).json({ error: 'Failed to cancel transfer' });
  }
});

export default router;
