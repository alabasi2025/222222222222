import { Router } from "express";
import { db } from "../db/index";
import { suppliers } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate, supplierSchema } from "../validation";

const router = Router();

// Get all suppliers with pagination and search
router.get("/", async (req, res) => {
  try {
    const { entityId, search, page = "1", limit = "50", isActive } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (entityId) conditions.push(eq(suppliers.entityId, entityId as string));
    if (isActive !== undefined)
      conditions.push(eq(suppliers.isActive, isActive === "true"));
    if (search) conditions.push(ilike(suppliers.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(suppliers)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(suppliers.name),
      db
        .select({ count: sql<number>`count(*)` })
        .from(suppliers)
        .where(whereClause),
    ]);

    res.json({
      data,
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
      .json({ error: "خطأ في جلب الموردين", details: err.message });
  }
});

// Get single supplier
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "المورد غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في جلب المورد", details: err.message });
  }
});

// Create supplier
router.post("/", validate(supplierSchema), async (req, res) => {
  try {
    const result = await db.insert(suppliers).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء المورد", details: err.message });
  }
});

// Update supplier
router.put("/:id", validate(supplierSchema), async (req, res) => {
  try {
    const result = await db
      .update(suppliers)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(suppliers.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "المورد غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث المورد", details: err.message });
  }
});

// Delete supplier
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(suppliers)
      .where(eq(suppliers.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "المورد غير موجود" });
    res.json({ message: "تم حذف المورد بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في حذف المورد", details: err.message });
  }
});

export default router;
