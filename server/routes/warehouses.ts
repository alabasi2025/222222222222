import { Router } from 'express';
import { db } from '../db/index';
import { warehouses } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all warehouses
router.get('/', async (_req, res) => {
  try {
    const allWarehouses = await db.select().from(warehouses);
    res.json(allWarehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Get warehouses by entity
router.get('/entity/:entityId', async (req, res) => {
  try {
    const entityWarehouses = await db.select().from(warehouses).where(eq(warehouses.entityId, req.params.entityId));
    res.json(entityWarehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Get warehouse by ID
router.get('/:id', async (req, res) => {
  try {
    const warehouse = await db.select().from(warehouses).where(eq(warehouses.id, req.params.id));
    if (warehouse.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    res.json(warehouse[0]);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

// Create new warehouse
router.post('/', async (req, res) => {
  try {
    const newWarehouse = await db.insert(warehouses).values({
      id: req.body.id || `WH-${Date.now()}`,
      ...req.body,
    }).returning();
    res.status(201).json(newWarehouse[0]);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

// Update warehouse
router.put('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(warehouses)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(warehouses.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

// Delete warehouse
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(warehouses).where(eq(warehouses.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

export default router;
