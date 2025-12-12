import { Router } from 'express';
import { db } from '../db/index';
import { cashBoxes } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all cash boxes
router.get('/', async (req, res) => {
  try {
    const { entityId } = req.query;
    let query = db.select().from(cashBoxes);
    
    if (entityId) {
      query = query.where(eq(cashBoxes.entityId, entityId as string));
    }
    
    const allCashBoxes = await query;
    res.json(allCashBoxes);
  } catch (error) {
    console.error('Error fetching cash boxes:', error);
    res.status(500).json({ error: 'Failed to fetch cash boxes' });
  }
});

// Get cash box by ID
router.get('/:id', async (req, res) => {
  try {
    const cashBox = await db.select().from(cashBoxes).where(eq(cashBoxes.id, req.params.id));
    if (cashBox.length === 0) {
      return res.status(404).json({ error: 'Cash box not found' });
    }
    res.json(cashBox[0]);
  } catch (error) {
    console.error('Error fetching cash box:', error);
    res.status(500).json({ error: 'Failed to fetch cash box' });
  }
});

// Create new cash box
router.post('/', async (req, res) => {
  try {
    const newCashBox = await db.insert(cashBoxes).values(req.body).returning();
    res.status(201).json(newCashBox[0]);
  } catch (error) {
    console.error('Error creating cash box:', error);
    res.status(500).json({ error: 'Failed to create cash box' });
  }
});

// Update cash box
router.put('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(cashBoxes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(cashBoxes.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Cash box not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating cash box:', error);
    res.status(500).json({ error: 'Failed to update cash box' });
  }
});

// Delete cash box
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(cashBoxes).where(eq(cashBoxes.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Cash box not found' });
    }
    res.json({ message: 'Cash box deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash box:', error);
    res.status(500).json({ error: 'Failed to delete cash box' });
  }
});

export default router;
