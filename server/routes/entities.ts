import { Router } from 'express';
import { db } from '../db/index';
import { entities } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all entities
router.get('/', async (_req, res) => {
  try {
    const allEntities = await db.select().from(entities);
    res.json(allEntities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

// Get entity by ID
router.get('/:id', async (req, res) => {
  try {
    const entity = await db.select().from(entities).where(eq(entities.id, req.params.id));
    if (entity.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    res.json(entity[0]);
  } catch (error) {
    console.error('Error fetching entity:', error);
    res.status(500).json({ error: 'Failed to fetch entity' });
  }
});

// Create new entity
router.post('/', async (req, res) => {
  try {
    const newEntity = await db.insert(entities).values(req.body).returning();
    res.status(201).json(newEntity[0]);
  } catch (error) {
    console.error('Error creating entity:', error);
    res.status(500).json({ error: 'Failed to create entity' });
  }
});

// Update entity
router.put('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(entities)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(entities.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ error: 'Failed to update entity' });
  }
});

// Delete entity
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(entities).where(eq(entities.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    res.json({ message: 'Entity deleted successfully' });
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ error: 'Failed to delete entity' });
  }
});

export default router;
