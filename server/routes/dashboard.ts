import { Router } from 'express';
import { db } from '../db';
import { accounts, journalEntries, stockMovements, banksWallets, items, warehouses } from '../db/schema';
import { eq, desc, sql, sum } from 'drizzle-orm';

const router = Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Items
    const itemsCountResult = await db.select({ count: sql<number>`count(*)` }).from(items);
    const itemsCount = itemsCountResult[0]?.count || 0;

    // 2. Total Warehouses
    const warehousesCountResult = await db.select({ count: sql<number>`count(*)` }).from(warehouses);
    const warehousesCount = warehousesCountResult[0]?.count || 0;

    // 3. Bank Balances (Aggregated)
    const bankAccounts = await db.select().from(banksWallets);
    const totalBankBalance = bankAccounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    // 4. Recent Stock Movements
    const recentMovements = await db.select()
      .from(stockMovements)
      .orderBy(desc(stockMovements.createdAt))
      .limit(5);

    // 5. Total Inventory Value (Estimating from stock movements or items)
    // For simplicity, we'll fetch sum of stock movements where type='in' minus 'out'
    // Or better, querying item_stock if available, otherwise approximation
    
    res.json({
      itemsCount,
      warehousesCount,
      bankAccountsCount: bankAccounts.length,
      totalBankBalance,
      recentActivity: recentMovements
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get revenue charts data
router.get('/charts/revenue', async (req, res) => {
  try {
    // Dummy implementation for chart data - in production this would aggregate actual journal entries
    // Mocking structure based on DB availability to prevent errors on empty DB
    const data = [
      { name: 'يناير', income: 0, expense: 0 },
      { name: 'فبراير', income: 0, expense: 0 },
      { name: 'مارس', income: 0, expense: 0 },
    ];
    
    // Attempt to get real data if available from journal entries
    // const entries = ...
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    res.status(500).json({ error: 'Failed to fetch revenue chart' });
  }
});

export default router;
