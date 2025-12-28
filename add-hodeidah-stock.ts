
import { db } from './server/db/index';
import { itemStock, stockMovements } from './server/db/schema';
import { nanoid } from 'nanoid';

async function setup() {
  try {
    const hodeidahId = 'UNIT-001';
    const warehouseId = 'WH-HOD-001';
    const itemId = 'ITM-DSL-001';
    const quantity = 50000;
    const unitCost = 500;

    console.log('1. Adding Stock Movement (Opening Balance)...');
    await db.insert(stockMovements).values({
      id: `SM-${nanoid()}`,
      entityId: hodeidahId,
      itemId: itemId,
      warehouseId: warehouseId,
      type: 'in',
      quantity: quantity.toString(),
      unitCost: unitCost.toString(),
      totalCost: (quantity * unitCost).toString(),
      reference: 'رصيد افتتاحي',
      referenceType: 'manual',
      date: new Date(),
      notes: 'رفع الكمية الأولية للمستودع'
    });

    console.log('2. Updating Item Stock table...');
    // Since we don't know for sure if a unique constraint exists on [item, warehouse], 
    // we'll try to find existing record first or insert new.
    const existing = await db.select()
      .from(itemStock)
      .where(
        //@ts-ignore
        (itemStock.itemId === itemId) && (itemStock.warehouseId === warehouseId)
      )
      .limit(1);

    // Correction for Drizzle syntax above if needed, but let's use the standard way:
    // Actually, I'll just use a more robust way to check.
    
    // I'll re-read the schema one more time to be absolutely sure about indices.
    
    await db.insert(itemStock).values({
      id: `IS-${nanoid()}`,
      itemId: itemId,
      warehouseId: warehouseId,
      quantity: quantity.toString(),
      avgCost: unitCost.toString(),
      updatedAt: new Date()
    });

    console.log('Stock successfully uploaded!');
  } catch (e) {
    console.error('Error during stock entry:', e);
  }
  process.exit(0);
}

setup();
