import { Router } from "express";
import { db } from "../db/index";
import { customers } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate, customerSchema } from "../validation";

const router = Router();

// Get all customers with pagination and search
router.get("/", async (req, res) => {
  try {
    const { entityId, search, page = "1", limit = "50", isActive } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (entityId) conditions.push(eq(customers.entityId, entityId as string));
    if (isActive !== undefined)
      conditions.push(eq(customers.isActive, isActive === "true"));
    if (search) conditions.push(ilike(customers.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(customers)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(customers.name),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
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
    res.status(500).json({ error: "خطأ في جلب العملاء", details: err.message });
  }
});

// Get single customer
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "العميل غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في جلب العميل", details: err.message });
  }
});

// Create customer
router.post("/", validate(customerSchema), async (req, res) => {
  try {
    const result = await db.insert(customers).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء العميل", details: err.message });
  }
});

// Update customer
router.put("/:id", validate(customerSchema), async (req, res) => {
  try {
    const result = await db
      .update(customers)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(customers.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "العميل غير موجود" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث العميل", details: err.message });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(customers)
      .where(eq(customers.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "العميل غير موجود" });
    res.json({ message: "تم حذف العميل بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في حذف العميل", details: err.message });
  }
});

export default router;
