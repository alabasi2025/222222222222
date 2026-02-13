import { Router } from 'express';
import { db } from '../db';
import {
  accounts, journalEntries, journalEntryLines, stockMovements,
  banksWallets, cashBoxes, items, warehouses, paymentVouchers, entities
} from '../db/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';

const router = Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // TODO: filter by entityId from req.query

    // 1. Total Items
    const itemsCountResult = await db.select({ count: sql<number>`count(*)` }).from(items);
    const itemsCount = Number(itemsCountResult[0]?.count || 0);

    // 2. Total Warehouses
    const warehousesCountResult = await db.select({ count: sql<number>`count(*)` }).from(warehouses);
    const warehousesCount = Number(warehousesCountResult[0]?.count || 0);

    // 3. Bank Balances (Aggregated)
    const bankAccounts = await db.select().from(banksWallets);
    const totalBankBalance = bankAccounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

    // 4. Cash Box Balances (Aggregated)
    const allCashBoxes = await db.select().from(cashBoxes);
    const totalCashBalance = allCashBoxes.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

    // 5. Total Accounts
    const accountsCountResult = await db.select({ count: sql<number>`count(*)` }).from(accounts);
    const accountsCount = Number(accountsCountResult[0]?.count || 0);

    // 6. Total Journal Entries
    const journalCountResult = await db.select({ count: sql<number>`count(*)` }).from(journalEntries);
    const journalCount = Number(journalCountResult[0]?.count || 0);

    // 7. Total Payment Vouchers
    const paymentsCountResult = await db.select({ count: sql<number>`count(*)` }).from(paymentVouchers);
    const paymentsCount = Number(paymentsCountResult[0]?.count || 0);

    // 8. Total Entities
    const entitiesCountResult = await db.select({ count: sql<number>`count(*)` }).from(entities);
    const entitiesCount = Number(entitiesCountResult[0]?.count || 0);

    // 9. Recent Stock Movements
    const recentMovements = await db.select()
      .from(stockMovements)
      .orderBy(desc(stockMovements.createdAt))
      .limit(5);

    // 10. Recent Journal Entries
    const recentJournalEntries = await db.select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(5);

    // 11. Recent Payment Vouchers
    const recentPayments = await db.select()
      .from(paymentVouchers)
      .orderBy(desc(paymentVouchers.createdAt))
      .limit(5);

    res.json({
      itemsCount,
      warehousesCount,
      bankAccountsCount: bankAccounts.length,
      totalBankBalance,
      cashBoxesCount: allCashBoxes.length,
      totalCashBalance,
      accountsCount,
      journalCount,
      paymentsCount,
      entitiesCount,
      recentActivity: recentMovements,
      recentJournalEntries,
      recentPayments,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get revenue charts data from actual journal entries
router.get('/charts/revenue', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    // Get monthly debit/credit totals from journal entry lines
    const monthlyData = await db.select({
      month: sql<number>`EXTRACT(MONTH FROM ${journalEntries.date})`,
      totalDebit: sql<string>`COALESCE(SUM(CAST(${journalEntryLines.debit} AS DECIMAL(15,2))), 0)`,
      totalCredit: sql<string>`COALESCE(SUM(CAST(${journalEntryLines.credit} AS DECIMAL(15,2))), 0)`,
    })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.entryId, journalEntries.id))
      .where(
        and(
          gte(journalEntries.date, new Date(`${currentYear}-01-01`)),
          lte(journalEntries.date, new Date(`${currentYear}-12-31`))
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${journalEntries.date})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${journalEntries.date})`);

    const monthlyMap = new Map(monthlyData.map(d => [Number(d.month), d]));

    const data = months.map((name, i) => {
      const monthData = monthlyMap.get(i + 1);
      return {
        name,
        income: parseFloat(monthData?.totalCredit || '0'),
        expense: parseFloat(monthData?.totalDebit || '0'),
      };
    });

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching revenue chart:', error);
    res.status(500).json({ error: 'Failed to fetch revenue chart' });
  }
});

export default router;
