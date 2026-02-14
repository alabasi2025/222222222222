import { Router } from "express";
import { db } from "../db";
import {
  interUnitTransfers,
  interUnitAccounts,
  journalEntries,
  journalEntryLines,
  accounts,
  entities,
} from "../db/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { z } from "zod";
import { validate } from "../validation";

// Zod schema for inter-unit transfers
const interUnitTransferSchema = z.object({
  fromEntityId: z.string().min(1, "معرف الوحدة المُحوِّلة مطلوب"),
  toEntityId: z.string().min(1, "معرف الوحدة المستلمة مطلوب"),
  fromAccountId: z.string().min(1, "حساب المُحوِّل مطلوب"),
  toAccountId: z.string().min(1, "حساب المستلم مطلوب"),
  amount: z
    .union([z.string(), z.number()])
    .refine(v => parseFloat(String(v)) > 0, "المبلغ يجب أن يكون أكبر من صفر"),
  currency: z.string().optional().default("YER"),
  description: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
});

const router = Router();

// الحصول على جميع التحويلات مع pagination اختياري
router.get("/", async (req, res) => {
  try {
    const { entityId, page, limit: qLimit } = req.query;
    const whereClause = entityId
      ? or(
          eq(interUnitTransfers.fromEntityId, entityId as string),
          eq(interUnitTransfers.toEntityId, entityId as string)
        )
      : undefined;

    if (page || qLimit) {
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(
        200,
        Math.max(1, parseInt(qLimit as string) || 50)
      );
      const offset = (pageNum - 1) * limitNum;

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(interUnitTransfers)
        .where(whereClause);
      const total = Number(countResult[0]?.count || 0);

      const data = await db
        .select()
        .from(interUnitTransfers)
        .where(whereClause)
        .orderBy(desc(interUnitTransfers.createdAt))
        .limit(limitNum)
        .offset(offset);

      return res.json({
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const transfers = await db
      .select()
      .from(interUnitTransfers)
      .where(whereClause)
      .orderBy(desc(interUnitTransfers.createdAt));
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
});

// الحصول على حسابات الجاري بين الوحدات
router.get("/inter-unit-accounts", async (req, res) => {
  try {
    const { entityId } = req.query;

    let interAccounts;
    if (entityId) {
      interAccounts = await db
        .select()
        .from(interUnitAccounts)
        .where(eq(interUnitAccounts.entityId, entityId as string));
    } else {
      interAccounts = await db.select().from(interUnitAccounts);
    }

    res.json(interAccounts);
  } catch (error) {
    console.error("Error fetching inter-unit accounts:", error);
    res.status(500).json({ error: "Failed to fetch inter-unit accounts" });
  }
});

// إنشاء تحويل جديد
router.post("/", validate(interUnitTransferSchema), async (req, res) => {
  try {
    const {
      fromEntityId,
      toEntityId,
      fromAccountId,
      toAccountId,
      amount,
      currency = "YER",
      description,
      date,
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (
      !fromEntityId ||
      !toEntityId ||
      !fromAccountId ||
      !toAccountId ||
      !amount
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (fromEntityId === toEntityId) {
      return res
        .status(400)
        .json({ error: "Cannot transfer to the same entity" });
    }

    // إنشاء رقم التحويل
    const transferNumber = `TR-${Date.now()}`;
    const transferDate = date ? new Date(date) : new Date();

    // Wrap in transaction
    const transfer = await db.transaction(async tx => {
      // الحصول على أسماء الوحدات
      const [fromEntity] = await tx
        .select()
        .from(entities)
        .where(eq(entities.id, fromEntityId));
      const [toEntity] = await tx
        .select()
        .from(entities)
        .where(eq(entities.id, toEntityId));

      if (!fromEntity || !toEntity) {
        throw new Error("Invalid entity IDs");
      }

      // البحث عن أو إنشاء حساب جاري للوحدة المستلمة في الوحدة المُحوِّلة
      let fromInterAccount = await tx
        .select()
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
        const [newAccount] = await tx
          .insert(accounts)
          .values({
            name: `جاري ${toEntity.name}`,
            type: "asset",
            level: 3,
            balance: "0",
            isGroup: false,
            subtype: "intercompany",
            entityId: fromEntityId,
          })
          .returning();
        const newAccountId = newAccount.id;

        await tx.insert(interUnitAccounts).values({
          entityId: fromEntityId,
          relatedEntityId: toEntityId,
          accountId: newAccountId,
          balance: "0",
          currency,
        });

        fromInterAccountId = newAccountId;
      } else {
        fromInterAccountId = fromInterAccount[0].accountId;
      }

      // البحث عن أو إنشاء حساب جاري للوحدة المُحوِّلة في الوحدة المستلمة
      let toInterAccount = await tx
        .select()
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
        const [newAccount2] = await tx
          .insert(accounts)
          .values({
            name: `جاري ${fromEntity.name}`,
            type: "liability",
            level: 3,
            balance: "0",
            isGroup: false,
            subtype: "intercompany",
            entityId: toEntityId,
          })
          .returning();
        const newAccountId = newAccount2.id;

        await tx.insert(interUnitAccounts).values({
          entityId: toEntityId,
          relatedEntityId: fromEntityId,
          accountId: newAccountId,
          balance: "0",
          currency,
        });

        toInterAccountId = newAccountId;
      } else {
        toInterAccountId = toInterAccount[0].accountId;
      }

      // إنشاء القيد في الوحدة المُحوِلة - auto-generated ID via returning()
      const [fromJournalEntry] = await tx
        .insert(journalEntries)
        .values({
          entityId: fromEntityId,
          date: transferDate,
          description: `تحويل إلى ${toEntity.name} - ${description || transferNumber}`,
          reference: transferNumber,
          type: "auto",
          status: "posted",
        })
        .returning();
      const fromJournalId = fromJournalEntry.id;

      // سطور القيد في الوحدة المُحوِلة
      // مدين: جاري الوحدة المستلمة
      await tx.insert(journalEntryLines).values({
        entryId: fromJournalId,
        accountId: fromInterAccountId,
        debit: amount.toString(),
        credit: "0",
        currency,
        description: `تحويل إلى ${toEntity.name}`,
      });

      // دائن: الحساب المحدد (صندوق/بنك)
      await tx.insert(journalEntryLines).values({
        entryId: fromJournalId,
        accountId: fromAccountId,
        debit: "0",
        credit: amount.toString(),
        currency,
        description: `تحويل إلى ${toEntity.name}`,
      });

      // إنشاء القيد في الوحدة المستلمة - auto-generated ID via returning()
      const [toJournalEntry] = await tx
        .insert(journalEntries)
        .values({
          entityId: toEntityId,
          date: transferDate,
          description: `استلام من ${fromEntity.name} - ${description || transferNumber}`,
          reference: transferNumber,
          type: "auto",
          status: "posted",
        })
        .returning();
      const toJournalId = toJournalEntry.id;

      // سطور القيد في الوحدة المستلمة
      // مدين: الحساب المحدد (صندوق/بنك)
      await tx.insert(journalEntryLines).values({
        entryId: toJournalId,
        accountId: toAccountId,
        debit: amount.toString(),
        credit: "0",
        currency,
        description: `استلام من ${fromEntity.name}`,
      });

      // دائن: جاري الوحدة المُحوِلة
      await tx.insert(journalEntryLines).values({
        entryId: toJournalId,
        accountId: toInterAccountId,
        debit: "0",
        credit: amount.toString(),
        currency,
        description: `استلام من ${fromEntity.name}`,
      });

      // إنشاء سجل التحويل - auto-generated ID
      const [newTransfer] = await tx
        .insert(interUnitTransfers)
        .values({
          transferNumber,
          fromEntityId,
          toEntityId,
          fromAccountId,
          toAccountId,
          amount: amount.toString(),
          currency,
          description,
          date: transferDate,
          status: "completed",
          fromJournalEntryId: fromJournalId,
          toJournalEntryId: toJournalId,
        })
        .returning();

      return newTransfer;
    });

    res.status(201).json({
      success: true,
      transfer,
      message: "تم التحويل بنجاح وإنشاء القيود في كلا الوحدتين",
      journals: {
        from: transfer.fromJournalEntryId,
        to: transfer.toJournalEntryId,
      },
    });
  } catch (error) {
    console.error("Error creating transfer:", error);
    res.status(500).json({ error: "Failed to create transfer" });
  }
});

// الحصول على تحويل محدد
router.get("/:id", async (req, res) => {
  try {
    const [transfer] = await db
      .select()
      .from(interUnitTransfers)
      .where(eq(interUnitTransfers.id, req.params.id));

    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    res.json(transfer);
  } catch (error) {
    console.error("Error fetching transfer:", error);
    res.status(500).json({ error: "Failed to fetch transfer" });
  }
});

// إلغاء تحويل
router.patch("/:id/cancel", async (req, res) => {
  try {
    const [transfer] = await db
      .select()
      .from(interUnitTransfers)
      .where(eq(interUnitTransfers.id, req.params.id));

    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    if (transfer.status === "cancelled") {
      return res.status(400).json({ error: "Transfer already cancelled" });
    }

    // تحديث حالة التحويل
    await db
      .update(interUnitTransfers)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(interUnitTransfers.id, req.params.id));

    // إلغاء القيود المرتبطة
    if (transfer.fromJournalEntryId) {
      await db
        .update(journalEntries)
        .set({ status: "cancelled" })
        .where(eq(journalEntries.id, transfer.fromJournalEntryId));
    }

    if (transfer.toJournalEntryId) {
      await db
        .update(journalEntries)
        .set({ status: "cancelled" })
        .where(eq(journalEntries.id, transfer.toJournalEntryId));
    }

    res.json({ success: true, message: "تم إلغاء التحويل بنجاح" });
  } catch (error) {
    console.error("Error cancelling transfer:", error);
    res.status(500).json({ error: "Failed to cancel transfer" });
  }
});

export default router;
