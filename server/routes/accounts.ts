import { Router } from 'express';
import { db } from '../db/index';
import { accounts } from '../db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';

const router = Router();

// Simple in-memory cache
let accountsCache: any[] | null = null;

const invalidateCache = () => {
  accountsCache = null;
};

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const { entityId, branchId } = req.query;
    
    // Return cached data if available and no filters
    if (!entityId && !branchId && accountsCache) {
      return res.json(accountsCache);
    }
    
    let query = db.select().from(accounts);
    
    // Filter by entity and branch if provided
    if (entityId || branchId) {
      const conditions = [];
      if (entityId) {
        conditions.push(
          or(
            eq(accounts.entityId, entityId as string),
            isNull(accounts.entityId)
          )
        );
      }
      if (branchId) {
        conditions.push(
          or(
            eq(accounts.branchId, branchId as string),
            isNull(accounts.branchId)
          )
        );
      }
      query = query.where(and(...conditions));
    }
    
    const allAccounts = await query;
    
    // Cache the result if no filters
    if (!entityId && !branchId) {
      accountsCache = allAccounts;
    }
    
    res.json(allAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await db.select().from(accounts).where(eq(accounts.id, req.params.id));
    if (account.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account[0]);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// Create new account
router.post('/', async (req, res) => {
  try {
    // Map allowedCurrencies to currencies if needed
    const accountData = { ...req.body };
    if (accountData.allowedCurrencies && !accountData.currencies) {
      accountData.currencies = accountData.allowedCurrencies;
      delete accountData.allowedCurrencies;
    }
    
    console.log('Creating account with data:', accountData);
    const newAccount = await db.insert(accounts).values(accountData).returning();
    invalidateCache();
    res.status(201).json(newAccount[0]);
  } catch (error: any) {
    console.error('Error creating account:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

// Update account
router.put('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(accounts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(accounts.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    invalidateCache();
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Partial update account (PATCH)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(accounts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(accounts.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    invalidateCache();
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(accounts).where(eq(accounts.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    invalidateCache();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
