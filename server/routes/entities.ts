import { Router } from "express";
import { db } from "../db/index";
import { entities } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { validate, entitySchema } from "../validation";

const router = Router();

// Get all entities
router.get("/", async (req, res) => {
  try {
    const { page, limit: qLimit } = req.query;

    if (page || qLimit) {
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(
        200,
        Math.max(1, parseInt(qLimit as string) || 50)
      );
      const offset = (pageNum - 1) * limitNum;

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(entities);
      const total = Number(countResult[0]?.count || 0);

      const data = await db
        .select()
        .from(entities)
        .orderBy(desc(entities.createdAt))
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

    const allEntities = await db.select().from(entities);
    res.json(allEntities);
  } catch (error) {
    console.error("Error fetching entities:", error);
    res.status(500).json({ error: "Failed to fetch entities" });
  }
});

// Get entity by ID
router.get("/:id", async (req, res) => {
  try {
    const entity = await db
      .select()
      .from(entities)
      .where(eq(entities.id, req.params.id));
    if (entity.length === 0) {
      return res.status(404).json({ error: "Entity not found" });
    }
    res.json(entity[0]);
  } catch (error) {
    console.error("Error fetching entity:", error);
    res.status(500).json({ error: "Failed to fetch entity" });
  }
});

// Create new entity
router.post("/", validate(entitySchema), async (req, res) => {
  try {
    const newEntity = await db.insert(entities).values(req.body).returning();
    res.status(201).json(newEntity[0]);
  } catch (error: any) {
    console.error("Error creating entity:", error);
    res.status(500).json({ error: error.message || "Failed to create entity" });
  }
});

// Update entity
router.put("/:id", async (req, res) => {
  try {
    const updated = await db
      .update(entities)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(entities.id, req.params.id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Entity not found" });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating entity:", error);
    res.status(500).json({ error: "Failed to update entity" });
  }
});

// Delete entity
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await db
      .delete(entities)
      .where(eq(entities.id, req.params.id))
      .returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Entity not found" });
    }
    res.json({ message: "Entity deleted successfully" });
  } catch (error) {
    console.error("Error deleting entity:", error);
    res.status(500).json({ error: "Failed to delete entity" });
  }
});

export default router;
