import { Router } from 'express';
import { db } from '../db/index';
import { paymentVouchers, paymentVoucherOperations, cashBoxes, banksWallets, accounts, entities } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

// Get all payment vouchers (optionally filtered by entityId and type)
router.get('/', async (req, res) => {
  try {
    const { entityId, type } = req.query;
    
    let query = db.select().from(paymentVouchers);
    
    if (entityId) {
      query = query.where(eq(paymentVouchers.entityId, entityId as string));
    }
    
    if (type) {
      query = query.where(and(
        entityId ? eq(paymentVouchers.entityId, entityId as string) : undefined,
        eq(paymentVouchers.type, type as string)
      ));
    }
    
    const vouchers = await query.orderBy(desc(paymentVouchers.date));
    
    // Get operations and related data for each voucher
    const vouchersWithOperations = await Promise.all(
      vouchers.map(async (voucher: any) => {
        // Get operations
        const operations = await db.select()
          .from(paymentVoucherOperations)
          .where(eq(paymentVoucherOperations.voucherId, voucher.id));
        
        // Get cash box details
        const cashBox = voucher.cashBoxId ? await db.select()
          .from(cashBoxes)
          .where(eq(cashBoxes.id, voucher.cashBoxId))
          .limit(1) : null;
        
        // Get bank/wallet/exchange details
        const bankWallet = voucher.bankWalletId ? await db.select()
          .from(banksWallets)
          .where(eq(banksWallets.id, voucher.bankWalletId))
          .limit(1) : null;
        
        // Get account details for operations
        const operationsWithAccounts = await Promise.all(
          operations.map(async (op: any) => {
            const chartAccount = await db.select()
              .from(accounts)
              .where(eq(accounts.id, op.chartAccountId))
              .limit(1);
            
            const analyticalAccount = op.analyticalAccountId ? await db.select()
              .from(accounts)
              .where(eq(accounts.id, op.analyticalAccountId))
              .limit(1) : null;
            
            return {
              ...op,
              chartAccount: chartAccount[0] || null,
              analyticalAccount: analyticalAccount?.[0] || null,
            };
          })
        );
        
        return {
          ...voucher,
          operations: operationsWithAccounts,
          cashBox: cashBox?.[0] || null,
          bankWallet: bankWallet?.[0] || null,
        };
      })
    );
    
    res.json(vouchersWithOperations);
  } catch (error: any) {
    console.error('Error fetching payment vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch payment vouchers' });
  }
});

// Get payment voucher by ID
router.get('/:id', async (req, res) => {
  try {
    const voucher = await db.select()
      .from(paymentVouchers)
      .where(eq(paymentVouchers.id, req.params.id))
      .limit(1);
    
    if (voucher.length === 0) {
      return res.status(404).json({ error: 'Payment voucher not found' });
    }
    
    // Get operations
    const operations = await db.select()
      .from(paymentVoucherOperations)
      .where(eq(paymentVoucherOperations.voucherId, req.params.id));
    
    // Get cash box
    const cashBox = voucher[0].cashBoxId ? await db.select()
      .from(cashBoxes)
      .where(eq(cashBoxes.id, voucher[0].cashBoxId))
      .limit(1) : null;
    
    // Get bank/wallet/exchange details
    const bankWallet = voucher[0].bankWalletId ? await db.select()
      .from(banksWallets)
      .where(eq(banksWallets.id, voucher[0].bankWalletId))
      .limit(1) : null;
    
    // Get account details
    const operationsWithAccounts = await Promise.all(
      operations.map(async (op: any) => {
        const chartAccount = await db.select()
          .from(accounts)
          .where(eq(accounts.id, op.chartAccountId))
          .limit(1);
        
        const analyticalAccount = op.analyticalAccountId ? await db.select()
          .from(accounts)
          .where(eq(accounts.id, op.analyticalAccountId))
          .limit(1) : null;
        
        return {
          ...op,
          chartAccount: chartAccount[0] || null,
          analyticalAccount: analyticalAccount?.[0] || null,
        };
      })
    );
    
    res.json({
      ...voucher[0],
      operations: operationsWithAccounts,
      cashBox: cashBox?.[0] || null,
      bankWallet: bankWallet?.[0] || null,
    });
  } catch (error: any) {
    console.error('Error fetching payment voucher:', error);
    res.status(500).json({ error: 'Failed to fetch payment voucher' });
  }
});

// Create payment voucher
router.post('/', async (req, res) => {
  try {
    const {
      entityId,
      type,
      cashBoxId,
      bankWalletId,
      date,
      currency,
      exchangeRate,
      totalAmount,
      reference,
      operations,
      createdBy,
    } = req.body;
    
    if (!entityId || !type || !date || !currency || !totalAmount || !operations || !Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const voucherId = req.body.id || `PAY-${type.toUpperCase()}-${Date.now()}`;
    
    await db.transaction(async (tx) => {
      // Create voucher
      await tx.insert(paymentVouchers).values({
        id: voucherId,
        entityId,
        type,
        cashBoxId: cashBoxId || null,
        bankWalletId: bankWalletId || null,
        date: new Date(date),
        currency: currency || 'YER',
        exchangeRate: exchangeRate || '1',
        totalAmount,
        reference: reference || null,
        createdBy: createdBy || null,
      });
      
      // Create operations
      for (const op of operations) {
        await tx.insert(paymentVoucherOperations).values({
          id: `PVO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          voucherId,
          accountType: op.accountType,
          accountSubtype: op.accountSubtype,
          chartAccountId: op.chartAccountId,
          analyticalAccountId: op.analyticalAccountId || null,
          amount: op.amount,
          description: op.description || null,
        });
      }
      
      // Update cash box balance
      if (cashBoxId) {
        const cashBox = await tx.select()
          .from(cashBoxes)
          .where(eq(cashBoxes.id, cashBoxId))
          .limit(1);
        
        if (cashBox.length > 0) {
          const currentBalance = parseFloat(cashBox[0].balance || '0');
          const amount = parseFloat(totalAmount);
          const newBalance = type === 'in' 
            ? currentBalance + amount 
            : currentBalance - amount;
          
          await tx.update(cashBoxes)
            .set({
              balance: newBalance.toString(),
              updatedAt: new Date(),
            })
            .where(eq(cashBoxes.id, cashBoxId));
        }
      }

      // Update bank/wallet/exchange balance
      if (bankWalletId) {
        const bankWallet = await tx.select()
          .from(banksWallets)
          .where(eq(banksWallets.id, bankWalletId))
          .limit(1);
        
        if (bankWallet.length > 0) {
          const currentBalance = parseFloat(bankWallet[0].balance || '0');
          const amount = parseFloat(totalAmount);
          const newBalance = type === 'in' 
            ? currentBalance + amount 
            : currentBalance - amount;
          
          await tx.update(banksWallets)
            .set({
              balance: newBalance.toString(),
              updatedAt: new Date(),
            })
            .where(eq(banksWallets.id, bankWalletId));
        }
      }
    });
    
    // Get created voucher with operations
    const voucher = await db.select()
      .from(paymentVouchers)
      .where(eq(paymentVouchers.id, voucherId))
      .limit(1);
    
    const voucherOperations = await db.select()
      .from(paymentVoucherOperations)
      .where(eq(paymentVoucherOperations.voucherId, voucherId));
    
    const operationsWithAccounts = await Promise.all(
      voucherOperations.map(async (op: any) => {
        const chartAccount = await db.select()
          .from(accounts)
          .where(eq(accounts.id, op.chartAccountId))
          .limit(1);
        
        const analyticalAccount = op.analyticalAccountId ? await db.select()
          .from(accounts)
          .where(eq(accounts.id, op.analyticalAccountId))
          .limit(1) : null;
        
        return {
          ...op,
          chartAccount: chartAccount[0] || null,
          analyticalAccount: analyticalAccount?.[0] || null,
        };
      })
    );
    
    res.status(201).json({
      ...voucher[0],
      operations: operationsWithAccounts,
    });
  } catch (error: any) {
    console.error('Error creating payment voucher:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment voucher' });
  }
});

// Update payment voucher
router.put('/:id', async (req, res) => {
  try {
    const voucherId = req.params.id;
    const {
      date,
      currency,
      exchangeRate,
      totalAmount,
      reference,
      operations,
    } = req.body;
    
    const existingVoucher = await db.select()
      .from(paymentVouchers)
      .where(eq(paymentVouchers.id, voucherId))
      .limit(1);
    
    if (existingVoucher.length === 0) {
      return res.status(404).json({ error: 'Payment voucher not found' });
    }
    
    await db.transaction(async (tx) => {
      // Update voucher
      if (date || currency || exchangeRate || totalAmount !== undefined || reference !== undefined) {
        await tx.update(paymentVouchers)
          .set({
            ...(date && { date: new Date(date) }),
            ...(currency && { currency }),
            ...(exchangeRate !== undefined && { exchangeRate }),
            ...(totalAmount !== undefined && { totalAmount }),
            ...(reference !== undefined && { reference }),
            updatedAt: new Date(),
          })
          .where(eq(paymentVouchers.id, voucherId));
      }
      
      // Update operations if provided
      if (operations && Array.isArray(operations)) {
        // Delete existing operations
        await tx.delete(paymentVoucherOperations)
          .where(eq(paymentVoucherOperations.voucherId, voucherId));
        
        // Insert new operations
        for (const op of operations) {
          await tx.insert(paymentVoucherOperations).values({
            id: op.id || `PVO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            voucherId,
            accountType: op.accountType,
            accountSubtype: op.accountSubtype,
            chartAccountId: op.chartAccountId,
            analyticalAccountId: op.analyticalAccountId || null,
            amount: op.amount,
            description: op.description || null,
          });
        }
      }
    });
    
    // Get updated voucher
    const voucher = await db.select()
      .from(paymentVouchers)
      .where(eq(paymentVouchers.id, voucherId))
      .limit(1);
    
    const updatedOperations = await db.select()
      .from(paymentVoucherOperations)
      .where(eq(paymentVoucherOperations.voucherId, voucherId));
    
    res.json({
      ...voucher[0],
      operations: updatedOperations,
    });
  } catch (error: any) {
    console.error('Error updating payment voucher:', error);
    res.status(500).json({ error: error.message || 'Failed to update payment voucher' });
  }
});

// Delete payment voucher
router.delete('/:id', async (req, res) => {
  try {
    const voucherId = req.params.id;
    
    const voucher = await db.select()
      .from(paymentVouchers)
      .where(eq(paymentVouchers.id, voucherId))
      .limit(1);
    
    if (voucher.length === 0) {
      return res.status(404).json({ error: 'Payment voucher not found' });
    }
    
    await db.transaction(async (tx) => {
      // Update cash box balance (reverse)
      if (voucher[0].cashBoxId) {
        const cashBox = await tx.select()
          .from(cashBoxes)
          .where(eq(cashBoxes.id, voucher[0].cashBoxId))
          .limit(1);
        
        if (cashBox.length > 0) {
          const currentBalance = parseFloat(cashBox[0].balance || '0');
          const amount = parseFloat(voucher[0].totalAmount);
          const newBalance = voucher[0].type === 'in'
            ? currentBalance - amount
            : currentBalance + amount;
          
          await tx.update(cashBoxes)
            .set({
              balance: newBalance.toString(),
              updatedAt: new Date(),
            })
            .where(eq(cashBoxes.id, voucher[0].cashBoxId));
        }
      }

      // Update bank/wallet/exchange balance (reverse)
      if (voucher[0].bankWalletId) {
        const bankWallet = await tx.select()
          .from(banksWallets)
          .where(eq(banksWallets.id, voucher[0].bankWalletId))
          .limit(1);
        
        if (bankWallet.length > 0) {
          const currentBalance = parseFloat(bankWallet[0].balance || '0');
          const amount = parseFloat(voucher[0].totalAmount);
          const newBalance = voucher[0].type === 'in'
            ? currentBalance - amount
            : currentBalance + amount;
          
          await tx.update(banksWallets)
            .set({
              balance: newBalance.toString(),
              updatedAt: new Date(),
            })
            .where(eq(banksWallets.id, voucher[0].bankWalletId));
        }
      }
      
      // Delete voucher (operations will be deleted by cascade)
      await tx.delete(paymentVouchers)
        .where(eq(paymentVouchers.id, voucherId));
    });
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting payment voucher:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payment voucher' });
  }
});

export default router;
