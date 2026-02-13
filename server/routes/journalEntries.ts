import { Router } from 'express';
import { db } from '../db';
import { journalEntries, journalEntryLines, accounts, entities } from '../db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { validate, journalEntrySchema } from '../validation';

const router = Router();

// ===== دالة مساعدة لجلب القيود مع البيانات المرتبطة بدون N+1 =====
async function getEntriesWithRelations(entries: any[]) {
  if (entries.length === 0) return [];

  const entryIds = entries.map(e => e.id);
  const entityIds = [...new Set(entries.map(e => e.entityId).filter(Boolean))];

  // جلب جميع الأسطر دفعة واحدة
  const allLines = await db.select()
    .from(journalEntryLines)
    .where(inArray(journalEntryLines.entryId, entryIds));

  // جلب جميع الحسابات المرتبطة دفعة واحدة
  const accountIds = [...new Set(allLines.map(l => l.accountId).filter(Boolean))];
  const allAccounts = accountIds.length > 0
    ? await db.select().from(accounts).where(inArray(accounts.id, accountIds))
    : [];

  // جلب جميع الكيانات المرتبطة دفعة واحدة
  const allEntities = entityIds.length > 0
    ? await db.select().from(entities).where(inArray(entities.id, entityIds))
    : [];

  // بناء خرائط البحث
  const accountsMap = new Map(allAccounts.map(a => [a.id, a]));
  const entitiesMap = new Map(allEntities.map(e => [e.id, e]));

  return entries.map(entry => {
    const entryLines = allLines
      .filter(l => l.entryId === entry.id)
      .map(line => ({
        ...line,
        account: accountsMap.get(line.accountId) || null,
      }));

    return {
      ...entry,
      lines: entryLines,
      entity: entitiesMap.get(entry.entityId) || null,
    };
  });
}

// Get all journal entries with pagination
router.get('/', async (req, res) => {
  try {
    const { entityId, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    const whereClause = entityId ? eq(journalEntries.entityId, entityId as string) : undefined;

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    const entries = await db.select()
      .from(journalEntries)
      .where(whereClause)
      .orderBy(desc(journalEntries.date))
      .limit(limitNum)
      .offset(offset);

    const entriesWithLines = await getEntriesWithRelations(entries);

    res.json({
      data: entriesWithLines,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
  }
});

// Get journal entries by entity ID
router.get('/entity/:entityId', async (req, res) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.entityId, req.params.entityId));
    const total = Number(countResult[0]?.count || 0);

    const entries = await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.entityId, req.params.entityId))
      .orderBy(desc(journalEntries.date))
      .limit(limitNum)
      .offset(offset);

    const entriesWithLines = await getEntriesWithRelations(entries);

    res.json({
      data: entriesWithLines,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    console.error('Error fetching journal entries by entity:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
  }
});

// Get single journal entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.id, req.params.id))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const result = await getEntriesWithRelations(entry);
    res.json(result[0]);
  } catch (error: any) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Create journal entry with balance validation
router.post('/', validate(journalEntrySchema), async (req, res) => {
  try {
    const { entityId, branchId, date, description, type, status, lines, reference, createdBy } = req.body;

    // ===== التحقق من توازن القيد =====
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += parseFloat(String(line.debit || 0));
      totalCredit += parseFloat(String(line.credit || 0));
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        error: 'القيد غير متوازن',
        details: `إجمالي المدين (${totalDebit.toFixed(2)}) لا يساوي إجمالي الدائن (${totalCredit.toFixed(2)})`,
      });
    }

    // التحقق من أن كل سطر يحتوي على مدين أو دائن
    for (let i = 0; i < lines.length; i++) {
      const d = parseFloat(String(lines[i].debit || 0));
      const c = parseFloat(String(lines[i].credit || 0));
      if (d === 0 && c === 0) {
        return res.status(400).json({ error: `السطر ${i + 1} لا يحتوي على مبلغ` });
      }
      if (d > 0 && c > 0) {
        return res.status(400).json({ error: `السطر ${i + 1} يحتوي على مدين ودائن معاً` });
      }
    }

    let newEntry: any;

    await db.transaction(async (tx) => {
      // Create header (ID auto-generated by schema)
      const [entry] = await tx.insert(journalEntries).values({
        entityId,
        branchId: branchId || null,
        date: new Date(date),
        description,
        type: type || 'manual',
        status: status || 'draft',
        reference: reference || null,
        createdBy: createdBy || null,
      }).returning();

      // Create lines and update account balances
      for (const line of lines) {
        await tx.insert(journalEntryLines).values({
          entryId: entry.id,
          accountId: line.accountId,
          debit: String(line.debit || 0),
          credit: String(line.credit || 0),
          currency: line.currency || 'YER',
          description: line.description || description,
        });

        // Update account balance
        const debitAmount = parseFloat(String(line.debit || 0));
        const creditAmount = parseFloat(String(line.credit || 0));
        if (debitAmount > 0 || creditAmount > 0) {
          await tx.update(accounts)
            .set({
              balance: sql`CAST(CAST(${accounts.balance} AS DECIMAL(15,2)) + ${debitAmount} - ${creditAmount} AS TEXT)`,
              updatedAt: new Date(),
            })
            .where(eq(accounts.id, line.accountId));
        }
      }

      newEntry = entry;
    });

    const result = await getEntriesWithRelations([newEntry]);
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry', details: error.message });
  }
});

// Delete journal entry and reverse balances
router.delete('/:id', async (req, res) => {
  try {
    const entry = await db.select().from(journalEntries).where(eq(journalEntries.id, req.params.id)).limit(1);
    if (entry.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const lines = await db.select().from(journalEntryLines).where(eq(journalEntryLines.entryId, req.params.id));

    await db.transaction(async (tx) => {
      // Reverse account balances
      for (const line of lines) {
        const debitAmount = parseFloat(String(line.debit || 0));
        const creditAmount = parseFloat(String(line.credit || 0));
        if (debitAmount > 0 || creditAmount > 0) {
          await tx.update(accounts)
            .set({
              balance: sql`CAST(CAST(${accounts.balance} AS DECIMAL(15,2)) - ${debitAmount} + ${creditAmount} AS TEXT)`,
              updatedAt: new Date(),
            })
            .where(eq(accounts.id, line.accountId));
        }
      }

      // Delete entry (lines will cascade)
      await tx.delete(journalEntries).where(eq(journalEntries.id, req.params.id));
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
