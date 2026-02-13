import { Router } from "express";
import { db } from "../db/index";
import { budgets } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate, budgetSchema } from "../validation";

const router = Router();

// Get all budgets with pagination
router.get("/", async (req, res) => {
  try {
    const {
      entityId,
      year,
      period,
      status,
      search,
      page = "1",
      limit = "50",
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (entityId) conditions.push(eq(budgets.entityId, entityId as string));
    if (year) conditions.push(eq(budgets.year, Number(year)));
    if (period) conditions.push(eq(budgets.period, period as string));
    if (status) conditions.push(eq(budgets.status, status as string));
    if (search) conditions.push(ilike(budgets.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(budgets)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(budgets.year),
      db
        .select({ count: sql<number>`count(*)` })
        .from(budgets)
        .where(whereClause),
    ]);

    // Calculate totals
    const totals = data.reduce(
      (acc: any, b: any) => ({
        totalBudget: acc.totalBudget + Number(b.budgetAmount || 0),
        totalActual: acc.totalActual + Number(b.actualAmount || 0),
        totalVariance: acc.totalVariance + Number(b.variance || 0),
      }),
      { totalBudget: 0, totalActual: 0, totalVariance: 0 }
    );

    res.json({
      data,
      totals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult[0]?.count || 0),
        totalPages: Math.ceil(
          Number(countResult[0]?.count || 0) / Number(limit)
        ),
      },
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في جلب الموازنات", details: err.message });
  }
});

// Get single budget
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "الموازنة غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في جلب الموازنة", details: err.message });
  }
});

// Create budget
router.post("/", validate(budgetSchema), async (req, res) => {
  try {
    // Calculate variance
    const budgetAmount = Number(req.body.budgetAmount || 0);
    const actualAmount = Number(req.body.actualAmount || 0);
    const variance = String(budgetAmount - actualAmount);

    const result = await db
      .insert(budgets)
      .values({
        ...req.body,
        variance,
      })
      .returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء الموازنة", details: err.message });
  }
});

// Update budget
router.put("/:id", validate(budgetSchema), async (req, res) => {
  try {
    // Recalculate variance
    const budgetAmount = Number(req.body.budgetAmount || 0);
    const actualAmount = Number(req.body.actualAmount || 0);
    const variance = String(budgetAmount - actualAmount);

    const result = await db
      .update(budgets)
      .set({ ...req.body, variance, updatedAt: new Date() })
      .where(eq(budgets.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "الموازنة غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث الموازنة", details: err.message });
  }
});

// Update actual amount
router.patch("/:id/actual", async (req, res) => {
  try {
    const { actualAmount } = req.body;
    if (actualAmount === undefined)
      return res.status(400).json({ error: "المبلغ الفعلي مطلوب" });

    const budget = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, req.params.id));
    if (budget.length === 0)
      return res.status(404).json({ error: "الموازنة غير موجودة" });

    const budgetAmount = Number(budget[0].budgetAmount || 0);
    const variance = String(budgetAmount - Number(actualAmount));

    const result = await db
      .update(budgets)
      .set({
        actualAmount: String(actualAmount),
        variance,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, req.params.id))
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث المبلغ الفعلي", details: err.message });
  }
});

// Delete budget
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(budgets)
      .where(eq(budgets.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "الموازنة غير موجودة" });
    res.json({ message: "تم حذف الموازنة بنجاح" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في حذف الموازنة", details: err.message });
  }
});

export default router;
