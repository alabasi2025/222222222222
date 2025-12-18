import { Router } from 'express';
import { db } from '../db/index';
import { stockMovements, itemStock, items } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Get all stock movements
router.get('/', async (_req, res) => {
  try {
    const allMovements = await db.select().from(stockMovements);
    res.json(allMovements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get stock movements by entity
router.get('/entity/:entityId', async (req, res) => {
  try {
    const entityMovements = await db.select().from(stockMovements).where(eq(stockMovements.entityId, req.params.entityId));
    res.json(entityMovements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get stock movements by item
router.get('/item/:itemId', async (req, res) => {
  try {
    const itemMovements = await db.select().from(stockMovements).where(eq(stockMovements.itemId, req.params.itemId));
    res.json(itemMovements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get stock movements by warehouse
router.get('/warehouse/:warehouseId', async (req, res) => {
  try {
    const warehouseMovements = await db.select().from(stockMovements).where(eq(stockMovements.warehouseId, req.params.warehouseId));
    res.json(warehouseMovements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get movement by ID
router.get('/:id', async (req, res) => {
  try {
    const movement = await db.select().from(stockMovements).where(eq(stockMovements.id, req.params.id));
    if (movement.length === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }
    res.json(movement[0]);
  } catch (error) {
    console.error('Error fetching movement:', error);
    res.status(500).json({ error: 'Failed to fetch movement' });
  }
});

// Create new stock movement and update stock levels
router.post('/', async (req, res) => {
  try {
    const movementData = {
      id: req.body.id || `MOV-${Date.now()}`,
      ...req.body,
      date: new Date(req.body.date),
    };

    // Create the movement
    const newMovement = await db.insert(stockMovements).values(movementData).returning();

    // Update stock levels based on movement type
    const { itemId, warehouseId, toWarehouseId, type, quantity, unitCost } = req.body;

    // Check if item stock record exists
    const existingStock = await db.select().from(itemStock)
      .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, warehouseId)));

    if (type === 'in' || type === 'return') {
      // Increase stock
      if (existingStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} + ${quantity}`,
            lastPurchasePrice: unitCost,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, warehouseId)));
      } else {
        await db.insert(itemStock).values({
          id: `STK-${Date.now()}`,
          itemId,
          warehouseId,
          quantity,
          avgCost: unitCost,
          lastPurchasePrice: unitCost,
        });
      }
    } else if (type === 'out') {
      // Decrease stock
      if (existingStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} - ${quantity}`,
            lastSalePrice: unitCost,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, warehouseId)));
      }
    } else if (type === 'transfer' && toWarehouseId) {
      // Decrease from source warehouse
      if (existingStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} - ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, warehouseId)));
      }

      // Increase in destination warehouse
      const destStock = await db.select().from(itemStock)
        .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, toWarehouseId)));

      if (destStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} + ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, toWarehouseId)));
      } else {
        await db.insert(itemStock).values({
          id: `STK-${Date.now()}-dest`,
          itemId,
          warehouseId: toWarehouseId,
          quantity,
          avgCost: unitCost,
        });
      }
    } else if (type === 'adjustment') {
      // Adjustment can be positive or negative
      if (existingStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} + ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId), eq(itemStock.warehouseId, warehouseId)));
      } else if (quantity > 0) {
        await db.insert(itemStock).values({
          id: `STK-${Date.now()}`,
          itemId,
          warehouseId,
          quantity,
          avgCost: unitCost,
        });
      }
    }

    res.status(201).json(newMovement[0]);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ error: 'Failed to create stock movement' });
  }
});

export default router;
