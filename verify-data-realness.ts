
import { db } from './server/db/index';
import { entities, accounts, warehouses, stockMovements, items } from './server/db/schema';

async function verifyData() {
  try {
    console.log('--- DATABASE DATA VERIFICATION ---');
    
    const entityList = await db.select().from(entities);
    console.log('\nEntities:', entityList.map(e => ({ id: e.id, name: e.name, type: e.type })));
    
    const accountList = await db.select().from(accounts).limit(5);
    console.log('\nAccounts Sample:', accountList.map(a => ({ id: a.id, name: a.name, balance: a.balance })));
    
    const warehouseList = await db.select().from(warehouses).limit(5);
    console.log('\nWarehouses Sample:', warehouseList.map(w => ({ id: w.id, name: w.name })));
    
    const itemList = await db.select().from(items).limit(5);
    console.log('\nItems Sample:', itemList.map(i => ({ id: i.id, name: i.name, stock: i.stockQuantity })));

    const movementList = await db.select().from(stockMovements).limit(5);
    console.log('\nStock Movements Sample:', movementList.map(m => ({ id: m.id, type: m.type, quantity: m.quantity })));

  } catch (e) {
    console.error('Error during verification:', e);
  }
  process.exit(0);
}

verifyData();
