import { Router } from "express";
import { db } from "../db/index";
import {
  stockMovements,
  itemStock,
  items,
  journalEntries,
  journalEntryLines,
  accounts,
  paymentVouchers,
  paymentVoucherOperations,
  banksWallets,
  suppliers,
} from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

// Get all stock movements
router.get("/", async (_req, res) => {
  try {
    const allMovements = await db.select().from(stockMovements);
    res.json(allMovements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
});

// Get stock movements by entity
router.get("/entity/:entityId", async (req, res) => {
  try {
    const entityMovements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.entityId, req.params.entityId));
    res.json(entityMovements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
});

// Get stock movements by item
router.get("/item/:itemId", async (req, res) => {
  try {
    const itemMovements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.itemId, req.params.itemId));
    res.json(itemMovements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
});

// Get stock movements by warehouse
router.get("/warehouse/:warehouseId", async (req, res) => {
  try {
    const warehouseMovements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.warehouseId, req.params.warehouseId));
    res.json(warehouseMovements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
});

// Get movement by ID
router.get("/:id", async (req, res) => {
  try {
    const movement = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.id, req.params.id));
    if (movement.length === 0) {
      return res.status(404).json({ error: "Movement not found" });
    }
    res.json(movement[0]);
  } catch (error) {
    console.error("Error fetching movement:", error);
    res.status(500).json({ error: "Failed to fetch movement" });
  }
});

// Create new stock movement and update stock levels (with database transaction)
router.post("/", async (req, res) => {
  try {
    const {
      itemId,
      warehouseId,
      toWarehouseId,
      type,
      quantity,
      unitCost,
      totalCost,
    } = req.body;

    // === Server-side validation: check available quantity before stock issue ===
    if (type === "out" || type === "transfer") {
      const currentStock = await db
        .select()
        .from(itemStock)
        .where(
          and(
            eq(itemStock.itemId, itemId),
            eq(itemStock.warehouseId, warehouseId)
          )
        );

      const availableQty =
        currentStock.length > 0 ? currentStock[0].quantity : 0;
      if (availableQty < quantity) {
        return res.status(400).json({
          error: `الكمية المطلوبة (${quantity}) أكبر من الكمية المتوفرة (${availableQty}) في المستودع`,
          availableQuantity: availableQty,
          requestedQuantity: quantity,
        });
      }
    }

    // Use database transaction to ensure data integrity
    const result = await db.transaction(async tx => {
      const movementData = {
        ...req.body,
        date: new Date(req.body.date),
      };

      // Create the movement
      const newMovement = await tx
        .insert(stockMovements)
        .values(movementData)
        .returning();

      // Check if item stock record exists
      const existingStock = await tx
        .select()
        .from(itemStock)
        .where(
          and(
            eq(itemStock.itemId, itemId),
            eq(itemStock.warehouseId, warehouseId)
          )
        );

      if (type === "in" || type === "return") {
        // Increase stock
        if (existingStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} + ${quantity}`,
              lastPurchasePrice: unitCost,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId),
                eq(itemStock.warehouseId, warehouseId)
              )
            );
        } else {
          await tx.insert(itemStock).values({
            itemId,
            warehouseId,
            quantity,
            avgCost: unitCost,
            lastPurchasePrice: unitCost,
          });
        }

        // Create accounting entry for purchase invoices (referenceType === 'purchase')
        if (req.body.referenceType === "purchase") {
          const calculatedTotalCost = totalCost || quantity * (unitCost || 0);
          if (calculatedTotalCost > 0) {
            // Extract supplier account ID
            let supplierAccountId: string | null = null;
            if (req.body.notes) {
              const supplierIdMatch =
                req.body.notes.match(/supplierId:([^\s]+)/);
              if (supplierIdMatch) {
                const supplierId = supplierIdMatch[1];
                const supplierRecord = await tx
                  .select()
                  .from(suppliers)
                  .where(eq(suppliers.id, supplierId))
                  .limit(1);

                if (supplierRecord.length > 0 && supplierRecord[0].accountId) {
                  supplierAccountId = supplierRecord[0].accountId;
                  console.log(
                    `[Purchase] Found supplier account ${supplierAccountId} from supplier record ${supplierId}`
                  );
                }
              }

              if (!supplierAccountId) {
                const supplierAccountMatch = req.body.notes.match(
                  /supplierAccountId:([^\s]+)/
                );
                if (supplierAccountMatch) {
                  supplierAccountId = supplierAccountMatch[1];
                  console.log(
                    `[Purchase] Using supplierAccountId from notes: ${supplierAccountId}`
                  );
                }
              }

              if (!supplierAccountId) {
                console.warn(
                  `[Purchase] No supplier account found in notes or supplier record`
                );
              }
            }

            // Create journal entry if item has accountId
            const item = await tx
              .select()
              .from(items)
              .where(eq(items.id, itemId))
              .limit(1);
            if (item.length > 0 && item[0].accountId && supplierAccountId) {
              const stockAccountId = item[0].accountId;

              const supplierAccount = await tx
                .select()
                .from(accounts)
                .where(eq(accounts.id, supplierAccountId))
                .limit(1);

              if (supplierAccount.length > 0) {
                const [newJournal] = await tx
                  .insert(journalEntries)
                  .values({
                    entityId: req.body.entityId,
                    date: new Date(req.body.date),
                    description: `فاتورة مشتريات - ${req.body.reference || newMovement[0].id}`,
                    reference: req.body.reference || newMovement[0].id,
                    type: "auto",
                    status: "posted",
                  })
                  .returning();
                const journalId = newJournal.id;

                // Debit: Stock account
                await tx.insert(journalEntryLines).values({
                  entryId: journalId,
                  accountId: stockAccountId,
                  debit: calculatedTotalCost.toString(),
                  credit: "0",
                  currency:
                    req.body.notes?.match(/currency:([A-Z]+)/)?.[1] || "YER",
                  description: `شراء - ${item[0].name || itemId}`,
                });

                // Credit: Supplier account
                await tx.insert(journalEntryLines).values({
                  entryId: journalId,
                  accountId: supplierAccountId,
                  debit: "0",
                  credit: calculatedTotalCost.toString(),
                  currency:
                    req.body.notes?.match(/currency:([A-Z]+)/)?.[1] || "YER",
                  description: `فاتورة مشتريات - ${req.body.reference || newMovement[0].id}`,
                });

                // Update stock movement with journal entry ID
                await tx
                  .update(stockMovements)
                  .set({ journalEntryId: journalId })
                  .where(eq(stockMovements.id, newMovement[0].id));

                // Update account balances
                await tx
                  .update(accounts)
                  .set({
                    balance: sql`${accounts.balance} + ${calculatedTotalCost}`,
                    updatedAt: new Date(),
                  })
                  .where(eq(accounts.id, stockAccountId));

                await tx
                  .update(accounts)
                  .set({
                    balance: sql`${accounts.balance} + ${calculatedTotalCost}`,
                    updatedAt: new Date(),
                  })
                  .where(eq(accounts.id, supplierAccountId));

                console.log(
                  `[Purchase] Account balances updated: ${stockAccountId} +${calculatedTotalCost} (debit), ${supplierAccountId} +${calculatedTotalCost} (credit)`
                );
              }
            }

            // Create payment voucher automatically for cash purchases from exchange
            const invoiceTypeMatch =
              req.body.notes?.match(/invoiceType:([a-z]+)/);
            const paymentMethodMatch = req.body.notes?.match(
              /paymentMethod:([a-z]+)/
            );
            const paymentAccountIdMatch = req.body.notes?.match(
              /paymentAccountId:([a-zA-Z0-9-]+)/
            );

            const invoiceType = invoiceTypeMatch ? invoiceTypeMatch[1] : null;
            const paymentMethod = paymentMethodMatch
              ? paymentMethodMatch[1]
              : null;
            const paymentAccountId = paymentAccountIdMatch
              ? paymentAccountIdMatch[1]
              : null;

            console.log("[Auto Payment Voucher] Debug info:", {
              invoiceType,
              paymentMethod,
              paymentAccountId,
              supplierAccountId,
              notes: req.body.notes,
            });

            if (
              invoiceType === "cash" &&
              paymentMethod === "exchange" &&
              paymentAccountId &&
              supplierAccountId
            ) {
              try {
                const exchangeAccount = await tx
                  .select()
                  .from(banksWallets)
                  .where(eq(banksWallets.id, paymentAccountId))
                  .limit(1);

                if (
                  exchangeAccount.length > 0 &&
                  exchangeAccount[0].type === "exchange"
                ) {
                  const supplierAccountCheck = await tx
                    .select()
                    .from(accounts)
                    .where(eq(accounts.id, supplierAccountId))
                    .limit(1);

                  if (supplierAccountCheck.length > 0) {
                    const currency =
                      req.body.notes?.match(/currency:([A-Z]+)/)?.[1] || "YER";
                    const exchangeRate = "1";

                    const [newVoucher] = await tx
                      .insert(paymentVouchers)
                      .values({
                        entityId: req.body.entityId,
                        type: "out",
                        bankWalletId: paymentAccountId,
                        date: new Date(req.body.date),
                        currency: currency,
                        exchangeRate: exchangeRate,
                        totalAmount: calculatedTotalCost.toString(),
                        reference: req.body.reference || newMovement[0].id,
                        createdBy: req.body.createdBy || null,
                      })
                      .returning();
                    const voucherId = newVoucher.id;

                    await tx.insert(paymentVoucherOperations).values({
                      voucherId: voucherId,
                      accountType: "liability",
                      accountSubtype: "supplier",
                      chartAccountId: supplierAccountId,
                      analyticalAccountId: null,
                      amount: calculatedTotalCost.toString(),
                      description: `دفع قيمة فاتورة مشتريات - ${req.body.reference || newMovement[0].id}`,
                    });

                    const currentBalance = parseFloat(
                      exchangeAccount[0].balance || "0"
                    );
                    const newBalance = currentBalance - calculatedTotalCost;

                    await tx
                      .update(banksWallets)
                      .set({
                        balance: newBalance.toString(),
                        updatedAt: new Date(),
                      })
                      .where(eq(banksWallets.id, paymentAccountId));

                    console.log(
                      `Payment voucher ${voucherId} created automatically for purchase ${req.body.reference || newMovement[0].id}`
                    );
                  } else {
                    console.warn(
                      `[Auto Payment Voucher] Supplier account ${supplierAccountId} not found in chart of accounts`
                    );
                  }
                } else {
                  console.warn(
                    `[Auto Payment Voucher] Exchange account ${paymentAccountId} not found or not of type 'exchange'`
                  );
                }
              } catch (error: any) {
                console.error(
                  "Error creating automatic payment voucher:",
                  error
                );
              }
            } else {
              console.log("[Auto Payment Voucher] Conditions not met:", {
                invoiceType,
                paymentMethod,
                hasPaymentAccountId: !!paymentAccountId,
                hasSupplierAccountId: !!supplierAccountId,
              });
            }
          }
        }
      } else if (type === "out") {
        // Decrease stock
        if (existingStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} - ${quantity}`,
              lastSalePrice: unitCost,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId),
                eq(itemStock.warehouseId, warehouseId)
              )
            );
        }

        // Create accounting entry for stock issue
        const { toAccountId } = req.body;
        const calculatedTotalCost = totalCost || quantity * (unitCost || 0);
        if (toAccountId && calculatedTotalCost > 0) {
          const item = await tx
            .select()
            .from(items)
            .where(eq(items.id, itemId))
            .limit(1);
          if (item.length > 0) {
            const stockAccountId = item[0].accountId;
            const cogsAccountId = item[0].cogsAccountId || toAccountId;

            if (stockAccountId && cogsAccountId) {
              const [newJournal2] = await tx
                .insert(journalEntries)
                .values({
                  entityId: req.body.entityId,
                  date: new Date(req.body.date),
                  description: `صرف مخزون - ${req.body.reference || newMovement[0].id}`,
                  reference: req.body.reference || newMovement[0].id,
                  type: "auto",
                  status: "posted",
                })
                .returning();
              const journalId = newJournal2.id;

              // Debit: COGS account
              await tx.insert(journalEntryLines).values({
                entryId: journalId,
                accountId: cogsAccountId,
                debit: calculatedTotalCost.toString(),
                credit: "0",
                currency: "YER",
                description: `صرف مخزون - ${item[0].name || itemId}`,
              });

              // Credit: Stock account
              await tx.insert(journalEntryLines).values({
                entryId: journalId,
                accountId: stockAccountId,
                debit: "0",
                credit: calculatedTotalCost.toString(),
                currency: "YER",
                description: `صرف مخزون - ${item[0].name || itemId}`,
              });

              // Update stock movement with journal entry ID
              await tx
                .update(stockMovements)
                .set({ journalEntryId: journalId })
                .where(eq(stockMovements.id, newMovement[0].id));

              // Update account balances
              await tx
                .update(accounts)
                .set({
                  balance: sql`${accounts.balance} + ${calculatedTotalCost}`,
                  updatedAt: new Date(),
                })
                .where(eq(accounts.id, cogsAccountId));

              await tx
                .update(accounts)
                .set({
                  balance: sql`${accounts.balance} - ${calculatedTotalCost}`,
                  updatedAt: new Date(),
                })
                .where(eq(accounts.id, stockAccountId));

              console.log(
                `[Stock Issue] Account balances updated: ${cogsAccountId} +${calculatedTotalCost} (debit), ${stockAccountId} -${calculatedTotalCost} (credit)`
              );
            }
          }
        }
      } else if (type === "transfer" && toWarehouseId) {
        // Decrease from source warehouse
        if (existingStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} - ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId),
                eq(itemStock.warehouseId, warehouseId)
              )
            );
        }

        // Increase in destination warehouse
        const destStock = await tx
          .select()
          .from(itemStock)
          .where(
            and(
              eq(itemStock.itemId, itemId),
              eq(itemStock.warehouseId, toWarehouseId)
            )
          );

        if (destStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} + ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId),
                eq(itemStock.warehouseId, toWarehouseId)
              )
            );
        } else {
          await tx.insert(itemStock).values({
            itemId,
            warehouseId: toWarehouseId,
            quantity,
            avgCost: unitCost,
          });
        }
      } else if (type === "adjustment") {
        // Adjustment can be positive or negative
        if (existingStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} + ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId),
                eq(itemStock.warehouseId, warehouseId)
              )
            );
        } else if (quantity > 0) {
          await tx.insert(itemStock).values({
            itemId,
            warehouseId,
            quantity,
            avgCost: unitCost,
          });
        }
      }

      return newMovement[0];
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating stock movement:", error);
    res.status(500).json({ error: "Failed to create stock movement" });
  }
});

// Update stock movement
router.put("/:id", async (req, res) => {
  try {
    const movementId = req.params.id;

    // Get existing movement
    const existingMovements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.id, movementId));
    if (existingMovements.length === 0) {
      return res.status(404).json({ error: "Movement not found" });
    }

    const existingMovement = existingMovements[0];

    // Update the movement
    const updatedData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : existingMovement.date,
    };

    await db
      .update(stockMovements)
      .set(updatedData)
      .where(eq(stockMovements.id, movementId));

    res.json({ ...existingMovement, ...updatedData });
  } catch (error) {
    console.error("Error updating stock movement:", error);
    res.status(500).json({ error: "Failed to update stock movement" });
  }
});

// Delete stock movement and reverse stock levels (with database transaction)
router.delete("/:id", async (req, res) => {
  try {
    const movementId = req.params.id;

    // Get existing movement
    const existingMovements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.id, movementId));
    if (existingMovements.length === 0) {
      return res.status(404).json({ error: "Movement not found" });
    }

    const movement = existingMovements[0];
    const { itemId, warehouseId, toWarehouseId, type, quantity, unitCost } =
      movement;

    // Use database transaction for atomic delete + reverse
    await db.transaction(async tx => {
      // Reverse stock levels based on movement type
      if (type === "in" || type === "return") {
        const existingStock = await tx
          .select()
          .from(itemStock)
          .where(
            and(
              eq(itemStock.itemId, itemId!),
              eq(itemStock.warehouseId, warehouseId!)
            )
          );

        if (
          existingStock.length > 0 &&
          existingStock[0].quantity >= quantity!
        ) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} - ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId!),
                eq(itemStock.warehouseId, warehouseId!)
              )
            );
        }
      } else if (type === "out") {
        const existingStock = await tx
          .select()
          .from(itemStock)
          .where(
            and(
              eq(itemStock.itemId, itemId!),
              eq(itemStock.warehouseId, warehouseId!)
            )
          );

        if (existingStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} + ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId!),
                eq(itemStock.warehouseId, warehouseId!)
              )
            );
        } else {
          await tx.insert(itemStock).values({
            itemId: itemId!,
            warehouseId: warehouseId!,
            quantity: quantity!,
            avgCost: String(unitCost || 0),
          });
        }
      } else if (type === "transfer" && toWarehouseId) {
        const destStock = await tx
          .select()
          .from(itemStock)
          .where(
            and(
              eq(itemStock.itemId, itemId!),
              eq(itemStock.warehouseId, toWarehouseId)
            )
          );

        if (destStock.length > 0 && destStock[0].quantity >= quantity!) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} - ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId!),
                eq(itemStock.warehouseId, toWarehouseId)
              )
            );
        }

        const sourceStock = await tx
          .select()
          .from(itemStock)
          .where(
            and(
              eq(itemStock.itemId, itemId!),
              eq(itemStock.warehouseId, warehouseId!)
            )
          );

        if (sourceStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} + ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId!),
                eq(itemStock.warehouseId, warehouseId!)
              )
            );
        } else {
          await tx.insert(itemStock).values({
            itemId: itemId!,
            warehouseId: warehouseId!,
            quantity: quantity!,
            avgCost: String(unitCost || 0),
          });
        }
      } else if (type === "adjustment") {
        const existingStock = await tx
          .select()
          .from(itemStock)
          .where(
            and(
              eq(itemStock.itemId, itemId!),
              eq(itemStock.warehouseId, warehouseId!)
            )
          );

        if (existingStock.length > 0) {
          await tx
            .update(itemStock)
            .set({
              quantity: sql`${itemStock.quantity} - ${quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(itemStock.itemId, itemId!),
                eq(itemStock.warehouseId, warehouseId!)
              )
            );
        }
      }

      // Reverse journal entry and update account balances if exists
      if (movement.journalEntryId) {
        const entryLines = await tx
          .select()
          .from(journalEntryLines)
          .where(eq(journalEntryLines.entryId, movement.journalEntryId));

        for (const line of entryLines) {
          const debitAmount = parseFloat(String(line.debit || "0"));
          const creditAmount = parseFloat(String(line.credit || "0"));

          if (debitAmount > 0) {
            await tx
              .update(accounts)
              .set({
                balance: sql`${accounts.balance} - ${debitAmount}`,
                updatedAt: new Date(),
              })
              .where(eq(accounts.id, line.accountId));
          }
          if (creditAmount > 0) {
            await tx
              .update(accounts)
              .set({
                balance: sql`${accounts.balance} + ${creditAmount}`,
                updatedAt: new Date(),
              })
              .where(eq(accounts.id, line.accountId));
          }
        }

        await tx
          .delete(journalEntryLines)
          .where(eq(journalEntryLines.entryId, movement.journalEntryId));

        await tx
          .delete(journalEntries)
          .where(eq(journalEntries.id, movement.journalEntryId));

        console.log(
          `[Delete Movement] Reversed journal entry ${movement.journalEntryId} and updated account balances`
        );
      }

      // Delete the movement
      await tx.delete(stockMovements).where(eq(stockMovements.id, movementId));
    });

    res.json({
      message: "Stock movement deleted and journal entry reversed successfully",
    });
  } catch (error) {
    console.error("Error deleting stock movement:", error);
    res.status(500).json({ error: "Failed to delete stock movement" });
  }
});

export default router;
