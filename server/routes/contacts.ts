import { Router } from "express";
import { db } from "../db/index";
import { contacts } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate, contactSchema } from "../validation";

const router = Router();

// Get all contacts with pagination and search
router.get("/", async (req, res) => {
  try {
    const { entityId, search, type, page = "1", limit = "50" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (entityId) conditions.push(eq(contacts.entityId, entityId as string));
    if (type) conditions.push(eq(contacts.type, type as string));
    if (search) conditions.push(ilike(contacts.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(contacts)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(contacts.name),
      db
        .select({ count: sql<number>`count(*)` })
        .from(contacts)
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
      .json({ error: "خطأ في جلب جهات الاتصال", details: err.message });
  }
});

// Get single contact
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, req.params.id));
    if (result.length === 0)
      return res.status(404).json({ error: "جهة الاتصال غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في جلب جهة الاتصال", details: err.message });
  }
});

// Create contact
router.post("/", validate(contactSchema), async (req, res) => {
  try {
    const result = await db.insert(contacts).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في إنشاء جهة الاتصال", details: err.message });
  }
});

// Update contact
router.put("/:id", validate(contactSchema), async (req, res) => {
  try {
    const result = await db
      .update(contacts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(contacts.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "جهة الاتصال غير موجودة" });
    res.json(result[0]);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في تحديث جهة الاتصال", details: err.message });
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, req.params.id))
      .returning();
    if (result.length === 0)
      return res.status(404).json({ error: "جهة الاتصال غير موجودة" });
    res.json({ message: "تم حذف جهة الاتصال بنجاح" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "خطأ في حذف جهة الاتصال", details: err.message });
  }
});

export default router;
