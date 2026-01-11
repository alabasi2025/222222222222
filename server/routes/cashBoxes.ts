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
    
    // Normalize old format (currency) to new format (currencies)
    const normalized = allCashBoxes.map((box: any) => {
      if (box.currency && (!box.currencies || !Array.isArray(box.currencies))) {
        return {
          ...box,
          currencies: [box.currency],
          defaultCurrency: box.defaultCurrency || box.currency
        };
      }
      if (!box.currencies || !Array.isArray(box.currencies)) {
        return {
          ...box,
          currencies: ["YER", "SAR", "USD"],
          defaultCurrency: box.defaultCurrency || "YER"
        };
      }
      return box;
    });
    
    res.json(normalized);
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
    const body = { ...req.body };
    
    // Transform currency to currencies if needed (backward compatibility)
    if (body.currency && !body.currencies) {
      body.currencies = [body.currency];
      body.defaultCurrency = body.currency;
      delete body.currency;
    }
    
    // Ensure currencies is an array
    if (!body.currencies || !Array.isArray(body.currencies)) {
      body.currencies = ["YER", "SAR", "USD"];
    }
    
    // Set defaultCurrency if not provided
    if (!body.defaultCurrency && body.currencies.length > 0) {
      body.defaultCurrency = body.currencies[0];
    }
    
    // Generate ID if not provided
    const boxData = {
      ...body,
      id: body.id || `CB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('Creating cash box with data:', boxData);
    const newCashBox = await db.insert(cashBoxes).values(boxData).returning();
    res.status(201).json(newCashBox[0]);
  } catch (error: any) {
    console.error('Error creating cash box:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Failed to create cash box' });
  }
});

// Update cash box
router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    
    // Transform currency to currencies if needed (backward compatibility)
    if (body.currency && !body.currencies) {
      body.currencies = [body.currency];
      body.defaultCurrency = body.currency;
      delete body.currency;
    }
    
    // Ensure currencies is an array
    if (body.currencies && !Array.isArray(body.currencies)) {
      body.currencies = ["YER", "SAR", "USD"];
    }
    
    console.log('Updating cash box with data:', body);
    const updated = await db
      .update(cashBoxes)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(cashBoxes.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Cash box not found' });
    }
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating cash box:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Failed to update cash box' });
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
