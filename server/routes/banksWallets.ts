import { Router } from 'express';
import { db } from '../db/index';
import { banksWallets } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all banks and wallets
router.get('/', async (req, res) => {
  try {
    const { entityId } = req.query;
    let query = db.select().from(banksWallets);
    
    if (entityId) {
      query = query.where(eq(banksWallets.entityId, entityId as string));
    }
    
    const allBanksWallets = await query;
    res.json(allBanksWallets);
  } catch (error) {
    console.error('Error fetching banks/wallets:', error);
    res.status(500).json({ error: 'Failed to fetch banks/wallets' });
  }
});

// Get bank/wallet by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await db.select().from(banksWallets).where(eq(banksWallets.id, req.params.id));
    if (item.length === 0) {
      return res.status(404).json({ error: 'Bank/Wallet not found' });
    }
    res.json(item[0]);
  } catch (error) {
    console.error('Error fetching bank/wallet:', error);
    res.status(500).json({ error: 'Failed to fetch bank/wallet' });
  }
});

// Create new bank/wallet
router.post('/', async (req, res) => {
  try {
    const newItem = await db.insert(banksWallets).values(req.body).returning();
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating bank/wallet:', error);
    res.status(500).json({ error: 'Failed to create bank/wallet' });
  }
});

// Update bank/wallet
router.put('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(banksWallets)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(banksWallets.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Bank/Wallet not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating bank/wallet:', error);
    res.status(500).json({ error: 'Failed to update bank/wallet' });
  }
});

// Delete bank/wallet
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(banksWallets).where(eq(banksWallets.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Bank/Wallet not found' });
    }
    res.json({ message: 'Bank/Wallet deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank/wallet:', error);
    res.status(500).json({ error: 'Failed to delete bank/wallet' });
  }
});

export default router;
