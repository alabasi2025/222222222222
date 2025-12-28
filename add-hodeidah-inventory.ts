
import { db } from './server/db/index';
import { warehouses, items, units, itemCategories } from './server/db/schema';

async function setup() {
  try {
    const hodeidahId = 'UNIT-001';
    
    console.log('1. Adding Warehouse: مخزن الديزل الدهمية...');
    await db.insert(warehouses).values({
      id: 'WH-HOD-001',
      entityId: hodeidahId,
      name: 'مخزن الديزل الدهمية',
      code: 'HOD-DSL-01',
      type: 'sub'
    });

    console.log('2. Adding Unit: لتر...');
    await db.insert(units).values({
      id: 'UNIT-LTR',
      name: 'لتر',
      symbol: 'L'
    }).onConflictDoNothing();

    console.log('3. Adding Category: محروقات...');
    await db.insert(itemCategories).values({
      id: 'CAT-FUEL',
      entityId: hodeidahId,
      name: 'محروقات'
    }).onConflictDoNothing();

    console.log('4. Adding Item: ديزل...');
    await db.insert(items).values({
      id: 'ITM-DSL-001',
      entityId: hodeidahId,
      code: 'DSL-001',
      name: 'ديزل',
      unitId: 'UNIT-LTR',
      categoryId: 'CAT-FUEL',
      type: 'stock'
    });

    console.log('Setup completed successfully!');
  } catch (e) {
    console.error('Error during setup:', e);
  }
  process.exit(0);
}

setup();
