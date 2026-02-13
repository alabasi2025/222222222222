import { Router } from "express";
import { db } from "../db/index";
import { costCenters } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate, costCenterSchema } from "../validation";

const router = Router();

// Get all cost centers with pagination
router.get("/", async (req, res) => {
  try {
    const { entityId, search, status, page = "1", limit = "50" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (entityId) conditions.push(eq(costCenters.entityId, entityId as string));
    if (status) conditions.push(eq(costCenters.status, status as string));
    if (search) conditions.push(ilike(costCenters.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(costCenters)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(costCenters.code),
      db
        .select({ count: sql<number>`count(*)` })
        .from(costCenters)
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
      .json({ error: "خطأ في جلب مراكز التكلفة", details: err.message });
  }
});

// Get single cost center
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "مركز التكلفة غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في جلب مركز التكلفة", details: err.message });
  }
});

// Create cost center
router.post("/", validate(costCenterSchema), async (req, res) => {
  try {
    const result = await db.insert(costCenters).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء مركز التكلفة", details: err.message });
  }
});

// Update cost center
router.put("/:id", validate(costCenterSchema), async (req, res) => {
  try {
    const result = await db
      .update(costCenters)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(costCenters.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "مركز التكلفة غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث مركز التكلفة", details: err.message });
  }
});

// Delete cost center
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(costCenters)
      .where(eq(costCenters.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "مركز التكلفة غير موجود" });
    res.json({ message: "تم حذف مركز التكلفة بنجاح" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في حذف مركز التكلفة", details: err.message });
  }
});

export default router;
