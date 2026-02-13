import { Router } from "express";
import { db } from "../db/index";
import { fixedAssets } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate, fixedAssetSchema } from "../validation";

const router = Router();

// Get all fixed assets with pagination
router.get("/", async (req, res) => {
  try {
    const {
      entityId,
      search,
      category,
      status,
      page = "1",
      limit = "50",
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (entityId) conditions.push(eq(fixedAssets.entityId, entityId as string));
    if (category) conditions.push(eq(fixedAssets.category, category as string));
    if (status) conditions.push(eq(fixedAssets.status, status as string));
    if (search) conditions.push(ilike(fixedAssets.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(fixedAssets)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(fixedAssets.code),
      db
        .select({ count: sql<number>`count(*)` })
        .from(fixedAssets)
        .where(whereClause),
    ]);

    // Calculate total values
    const totals = data.reduce(
      (acc: any, asset: any) => ({
        totalPurchasePrice:
          acc.totalPurchasePrice + Number(asset.purchasePrice || 0),
        totalCurrentValue:
          acc.totalCurrentValue + Number(asset.currentValue || 0),
      }),
      { totalPurchasePrice: 0, totalCurrentValue: 0 }
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
      .json({ error: "خطأ في جلب الأصول الثابتة", details: err.message });
  }
});

// Get single fixed asset
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(fixedAssets)
      .where(eq(fixedAssets.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "الأصل الثابت غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في جلب الأصل الثابت", details: err.message });
  }
});

// Create fixed asset
router.post("/", validate(fixedAssetSchema), async (req, res) => {
  try {
    const result = await db
      .insert(fixedAssets)
      .values({
        ...req.body,
        purchaseDate: new Date(req.body.purchaseDate),
      })
      .returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء الأصل الثابت", details: err.message });
  }
});

// Update fixed asset
router.put("/:id", validate(fixedAssetSchema), async (req, res) => {
  try {
    const result = await db
      .update(fixedAssets)
      .set({
        ...req.body,
        purchaseDate: new Date(req.body.purchaseDate),
        updatedAt: new Date(),
      })
      .where(eq(fixedAssets.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "الأصل الثابت غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث الأصل الثابت", details: err.message });
  }
});

// Calculate depreciation for an asset
router.post("/:id/depreciate", async (req, res) => {
  try {
    const asset = await db
      .select()
      .from(fixedAssets)
      .where(eq(fixedAssets.id, req.params.id));
    if (asset.length === 0)
      return res.status(404).json({ error: "الأصل الثابت غير موجود" });

    const a = asset[0];
    const purchasePrice = Number(a.purchasePrice);
    const salvageValue = Number(a.salvageValue || 0);
    const usefulLife = a.usefulLife || 60; // default 5 years in months
    const depreciableAmount = purchasePrice - salvageValue;

    let monthlyDepreciation = 0;
    if (a.depreciationMethod === "straight_line") {
      monthlyDepreciation = depreciableAmount / usefulLife;
    } else if (a.depreciationMethod === "declining_balance") {
      const rate = Number(a.depreciationRate || 0) / 100 / 12;
      monthlyDepreciation = Number(a.currentValue) * rate;
    }

    const newValue = Math.max(
      salvageValue,
      Number(a.currentValue) - monthlyDepreciation
    );

    const result = await db
      .update(fixedAssets)
      .set({ currentValue: String(newValue.toFixed(2)), updatedAt: new Date() })
      .where(eq(fixedAssets.id, req.params.id))
      .returning();

    res.json({
      asset: result[0],
      depreciation: {
        amount: monthlyDepreciation.toFixed(2),
        previousValue: a.currentValue,
        newValue: newValue.toFixed(2),
      },
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في حساب الإهلاك", details: err.message });
  }
});

// Delete fixed asset
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(fixedAssets)
      .where(eq(fixedAssets.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "الأصل الثابت غير موجود" });
    res.json({ message: "تم حذف الأصل الثابت بنجاح" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في حذف الأصل الثابت", details: err.message });
  }
});

export default router;
