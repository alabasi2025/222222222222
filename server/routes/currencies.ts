import { Router } from "express";
import { db } from "../db/index";
import { currencies } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { validate, currencySchema } from "../validation";

const router = Router();

// Get all currencies
router.get("/", async (req, res) => {
  try {
    const { entityId, isActive } = req.query;

    const conditions = [];
    if (entityId) conditions.push(eq(currencies.entityId, entityId as string));
    if (isActive !== undefined)
      conditions.push(eq(currencies.isActive, isActive === "true"));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(currencies)
      .where(whereClause)
      .orderBy(currencies.code);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في جلب العملات", details: err.message });
  }
});

// Get single currency
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "العملة غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في جلب العملة", details: err.message });
  }
});

// Create currency
router.post("/", validate(currencySchema), async (req, res) => {
  try {
    // Check if base currency already exists
    if (req.body.isBase) {
      const existing = await db
        .select()
        .from(currencies)
        .where(
          and(
            eq(currencies.entityId, req.body.entityId),
            eq(currencies.isBase, true)
          )
        );
      if (existing.length > 0) {
        return res
          .status(400)
          .json({
            error:
              "يوجد عملة أساسية بالفعل. يمكن أن يكون هناك عملة أساسية واحدة فقط.",
          });
      }
    }
    const result = await db.insert(currencies).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء العملة", details: err.message });
  }
});

// Update currency
router.put("/:id", validate(currencySchema), async (req, res) => {
  try {
    const result = await db
      .update(currencies)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(currencies.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "العملة غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث العملة", details: err.message });
  }
});

// Update exchange rate only
router.patch("/:id/exchange-rate", async (req, res) => {
  try {
    const { exchangeRate } = req.body;
    if (!exchangeRate)
      return res.status(400).json({ error: "سعر الصرف مطلوب" });

    const result = await db
      .update(currencies)
      .set({ exchangeRate, updatedAt: new Date() })
      .where(eq(currencies.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "العملة غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث سعر الصرف", details: err.message });
  }
});

// Delete currency
router.delete("/:id", async (req, res) => {
  try {
    // Prevent deleting base currency
    const currency = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, req.params.id));
    if (currency.length > 0 && currency[0].isBase) {
      return res.status(400).json({ error: "لا يمكن حذف العملة الأساسية" });
    }
    const result = await db
      .delete(currencies)
      .where(eq(currencies.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "العملة غير موجودة" });
    res.json({ message: "تم حذف العملة بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في حذف العملة", details: err.message });
  }
});

export default router;
