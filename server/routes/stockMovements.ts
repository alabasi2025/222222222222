import { Router } from 'express';
import { db } from '../db/index';
import { stockMovements, itemStock, items, journalEntries, journalEntryLines, accounts, paymentVouchers, paymentVoucherOperations, banksWallets } from '../db/schema';
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
    const { itemId, warehouseId, toWarehouseId, type, quantity, unitCost, totalCost } = req.body;

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

      // Create accounting entry for purchase invoices (referenceType === 'purchase')
      if (req.body.referenceType === 'purchase') {
        const calculatedTotalCost = totalCost || (quantity * (unitCost || 0));
        if (calculatedTotalCost > 0) {
          // Extract supplier account ID from notes (needed for both journal entry and payment voucher)
          // Format: "supplierId:SUP-xxx" or "supplierAccountId:ACC-xxx"
          let supplierAccountId: string | null = null;
          if (req.body.notes) {
            const supplierAccountMatch = req.body.notes.match(/supplierAccountId:([A-Z0-9-]+)/);
            if (supplierAccountMatch) {
              supplierAccountId = supplierAccountMatch[1];
            } else {
              // Try to get supplier ID and find its account from chart of accounts
              const supplierIdMatch = req.body.notes.match(/supplierId:([A-Z0-9-]+)/);
              if (supplierIdMatch) {
                const supplierId = supplierIdMatch[1];
                // Try to find a supplier account in chart of accounts for this entity
                // This is a fallback if supplierAccountId is not provided in notes
                const supplierAccounts = await db.select()
                  .from(accounts)
                  .where(and(
                    eq(accounts.subtype, 'supplier'),
                    eq(accounts.entityId, req.body.entityId),
                    eq(accounts.isGroup, false)
                  ))
                  .limit(1);
                
                if (supplierAccounts.length > 0) {
                  supplierAccountId = supplierAccounts[0].id;
                  console.log(`[Purchase] Using fallback supplier account ${supplierAccountId} for supplier ${supplierId}`);
                } else {
                  console.warn(`[Purchase] No supplier account found for supplier ${supplierId}`);
                }
              }
            }
          }

          // Create journal entry if item has accountId (optional)
          const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
          if (item.length > 0 && item[0].accountId && supplierAccountId) {
            const stockAccountId = item[0].accountId; // حساب المخزون
            
            // Verify supplier account exists
            const supplierAccount = await db.select().from(accounts).where(eq(accounts.id, supplierAccountId)).limit(1);
            
            if (supplierAccount.length > 0) {
              const journalId = `JE-PURCHASE-${Date.now()}`;
              
              // Create journal entry
              await db.insert(journalEntries).values({
                id: journalId,
                entityId: req.body.entityId,
                date: new Date(req.body.date),
                description: `فاتورة مشتريات - ${req.body.reference || newMovement[0].id}`,
                reference: req.body.reference || newMovement[0].id,
                type: 'auto',
                status: 'posted',
              });

              // Debit: Stock account (حساب المخزون)
              await db.insert(journalEntryLines).values({
                id: `JVL-${Date.now()}-1`,
                entryId: journalId,
                accountId: stockAccountId,
                debit: calculatedTotalCost.toString(),
                credit: '0',
                currency: req.body.notes?.match(/currency:([A-Z]+)/)?.[1] || 'YER',
                description: `شراء - ${item[0].name || itemId}`,
              });

              // Credit: Supplier account (حساب المورد)
              await db.insert(journalEntryLines).values({
                id: `JVL-${Date.now()}-2`,
                entryId: journalId,
                accountId: supplierAccountId,
                debit: '0',
                credit: calculatedTotalCost.toString(),
                currency: req.body.notes?.match(/currency:([A-Z]+)/)?.[1] || 'YER',
                description: `فاتورة مشتريات - ${req.body.reference || newMovement[0].id}`,
              });

              // Update stock movement with journal entry ID
              await db.update(stockMovements)
                .set({ journalEntryId: journalId })
                .where(eq(stockMovements.id, newMovement[0].id));
            }
          }

          // Create payment voucher automatically for cash purchases from exchange (independent of journal entry)
          // Extract payment info from notes
          const invoiceTypeMatch = req.body.notes?.match(/invoiceType:([a-z]+)/);
          const paymentMethodMatch = req.body.notes?.match(/paymentMethod:([a-z]+)/);
          const paymentAccountIdMatch = req.body.notes?.match(/paymentAccountId:([A-Z0-9-]+)/);
          
          const invoiceType = invoiceTypeMatch ? invoiceTypeMatch[1] : null;
          const paymentMethod = paymentMethodMatch ? paymentMethodMatch[1] : null;
          const paymentAccountId = paymentAccountIdMatch ? paymentAccountIdMatch[1] : null;

          console.log('[Auto Payment Voucher] Debug info:', {
            invoiceType,
            paymentMethod,
            paymentAccountId,
            supplierAccountId,
            notes: req.body.notes
          });

          // If cash purchase from exchange, create payment voucher
          if (invoiceType === 'cash' && paymentMethod === 'exchange' && paymentAccountId && supplierAccountId) {
            try {
              // Verify the exchange account exists
              const exchangeAccount = await db.select()
                .from(banksWallets)
                .where(eq(banksWallets.id, paymentAccountId))
                .limit(1);
              
              if (exchangeAccount.length > 0 && exchangeAccount[0].type === 'exchange') {
                // Verify supplier account exists
                const supplierAccount = await db.select().from(accounts).where(eq(accounts.id, supplierAccountId)).limit(1);
                
                if (supplierAccount.length > 0) {
                  const voucherId = `PAY-OUT-${Date.now()}`;
                  const currency = req.body.notes?.match(/currency:([A-Z]+)/)?.[1] || 'YER';
                  const exchangeRate = '1'; // Default, can be extracted from notes if needed

                  // Create payment voucher
                  await db.insert(paymentVouchers).values({
                    id: voucherId,
                    entityId: req.body.entityId,
                    type: 'out',
                    bankWalletId: paymentAccountId,
                    date: new Date(req.body.date),
                    currency: currency,
                    exchangeRate: exchangeRate,
                    totalAmount: calculatedTotalCost.toString(),
                    reference: req.body.reference || newMovement[0].id,
                    createdBy: req.body.createdBy || null,
                  });

                  // Create payment voucher operation (supplier payment)
                  await db.insert(paymentVoucherOperations).values({
                    id: `PVO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    voucherId: voucherId,
                    accountType: 'liability',
                    accountSubtype: 'supplier',
                    chartAccountId: supplierAccountId,
                    analyticalAccountId: null,
                    amount: calculatedTotalCost.toString(),
                    description: `دفع قيمة فاتورة مشتريات - ${req.body.reference || newMovement[0].id}`,
                  });

                  // Update exchange balance (decrease for payment)
                  const currentBalance = parseFloat(exchangeAccount[0].balance || '0');
                  const newBalance = currentBalance - calculatedTotalCost;
                  
                  await db.update(banksWallets)
                    .set({
                      balance: newBalance.toString(),
                      updatedAt: new Date(),
                    })
                    .where(eq(banksWallets.id, paymentAccountId));

                  console.log(`Payment voucher ${voucherId} created automatically for purchase ${req.body.reference || newMovement[0].id}`);
                } else {
                  console.warn(`[Auto Payment Voucher] Supplier account ${supplierAccountId} not found in chart of accounts`);
                }
              } else {
                console.warn(`[Auto Payment Voucher] Exchange account ${paymentAccountId} not found or not of type 'exchange'`);
              }
            } catch (error: any) {
              // Log error but don't fail the purchase - payment voucher creation is secondary
              console.error('Error creating automatic payment voucher:', error);
            }
          } else {
            console.log('[Auto Payment Voucher] Conditions not met:', {
              invoiceType,
              paymentMethod,
              hasPaymentAccountId: !!paymentAccountId,
              hasSupplierAccountId: !!supplierAccountId
            });
          }
        }
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

      // Create accounting entry for stock issue (if toAccountId is provided)
      const { toAccountId } = req.body;
      const calculatedTotalCost = totalCost || (quantity * (unitCost || 0));
      if (toAccountId && calculatedTotalCost > 0) {
        // Get item to find its accounts
        const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
        if (item.length > 0) {
          const stockAccountId = item[0].accountId; // حساب المخزون
          const cogsAccountId = item[0].cogsAccountId || toAccountId; // حساب تكلفة البضاعة المباعة أو الحساب المحدد

          if (stockAccountId && cogsAccountId) {
            const journalId = `JE-STOCK-${Date.now()}`;
            
            // Create journal entry
            await db.insert(journalEntries).values({
              id: journalId,
              entityId: req.body.entityId,
              date: new Date(req.body.date),
              description: `صرف مخزون - ${req.body.reference || newMovement[0].id}`,
              reference: req.body.reference || newMovement[0].id,
              type: 'auto',
              status: 'posted',
            });

            // Debit: COGS account (تكلفة البضاعة المباعة)
            await db.insert(journalEntryLines).values({
              id: `JVL-${Date.now()}-1`,
              entryId: journalId,
              accountId: cogsAccountId,
              debit: calculatedTotalCost.toString(),
              credit: '0',
              currency: 'YER',
              description: `صرف مخزون - ${item[0].name || itemId}`,
            });

            // Credit: Stock account (حساب المخزون)
            await db.insert(journalEntryLines).values({
              id: `JVL-${Date.now()}-2`,
              entryId: journalId,
              accountId: stockAccountId,
              debit: '0',
              credit: calculatedTotalCost.toString(),
              currency: 'YER',
              description: `صرف مخزون - ${item[0].name || itemId}`,
            });

            // Update stock movement with journal entry ID
            await db.update(stockMovements)
              .set({ journalEntryId: journalId })
              .where(eq(stockMovements.id, newMovement[0].id));
          }
        }
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

// Update stock movement
router.put('/:id', async (req, res) => {
  try {
    const movementId = req.params.id;
    
    // Get existing movement
    const existingMovements = await db.select().from(stockMovements).where(eq(stockMovements.id, movementId));
    if (existingMovements.length === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }
    
    const existingMovement = existingMovements[0];
    
    // Update the movement
    const updatedData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : existingMovement.date,
    };
    
    await db.update(stockMovements)
      .set(updatedData)
      .where(eq(stockMovements.id, movementId));
    
    res.json({ ...existingMovement, ...updatedData });
  } catch (error) {
    console.error('Error updating stock movement:', error);
    res.status(500).json({ error: 'Failed to update stock movement' });
  }
});

// Delete stock movement and reverse stock levels
router.delete('/:id', async (req, res) => {
  try {
    const movementId = req.params.id;
    
    // Get existing movement
    const existingMovements = await db.select().from(stockMovements).where(eq(stockMovements.id, movementId));
    if (existingMovements.length === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }
    
    const movement = existingMovements[0];
    const { itemId, warehouseId, toWarehouseId, type, quantity, unitCost } = movement;
    
    // Reverse stock levels based on movement type
    if (type === 'in' || type === 'return') {
      // Decrease stock (reverse the increase)
      const existingStock = await db.select().from(itemStock)
        .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      
      if (existingStock.length > 0 && existingStock[0].quantity >= quantity!) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} - ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      }
    } else if (type === 'out') {
      // Increase stock (reverse the decrease)
      const existingStock = await db.select().from(itemStock)
        .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      
      if (existingStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} + ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      } else {
        await db.insert(itemStock).values({
          id: `STK-${Date.now()}`,
          itemId: itemId!,
          warehouseId: warehouseId!,
          quantity: quantity!,
          avgCost: unitCost || 0,
        });
      }
    } else if (type === 'transfer' && toWarehouseId) {
      // Reverse transfer: decrease from destination, increase in source
      const destStock = await db.select().from(itemStock)
        .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, toWarehouseId)));
      
      if (destStock.length > 0 && destStock[0].quantity >= quantity!) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} - ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, toWarehouseId)));
      }
      
      const sourceStock = await db.select().from(itemStock)
        .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      
      if (sourceStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} + ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      } else {
        await db.insert(itemStock).values({
          id: `STK-${Date.now()}`,
          itemId: itemId!,
          warehouseId: warehouseId!,
          quantity: quantity!,
          avgCost: unitCost || 0,
        });
      }
    } else if (type === 'adjustment') {
      // Reverse adjustment
      const existingStock = await db.select().from(itemStock)
        .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      
      if (existingStock.length > 0) {
        await db.update(itemStock)
          .set({ 
            quantity: sql`${itemStock.quantity} - ${quantity}`,
            updatedAt: new Date()
          })
          .where(and(eq(itemStock.itemId, itemId!), eq(itemStock.warehouseId, warehouseId!)));
      }
    }
    
    // Delete the movement
    await db.delete(stockMovements).where(eq(stockMovements.id, movementId));
    
    res.json({ message: 'Stock movement deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock movement:', error);
    res.status(500).json({ error: 'Failed to delete stock movement' });
  }
});

export default router;
