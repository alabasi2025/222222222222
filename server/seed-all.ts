import { db } from './db/index';
import {
  entities,
  accounts,
  cashBoxes,
  banksWallets,
  journalEntries,
  journalEntryLines,
  warehouses,
  units,
  itemCategories,
  items,
  itemStock,
  stockMovements,
  interUnitTransfers,
  interUnitAccounts,
} from './db/schema';

// بيانات الكيانات (Entities)
const seedEntities = [
  {
    "id": "BR-001",
    "name": "الفرع الرئيسي (العباسي خاص)",
    "type": "branch",
    "parentId": "UNIT-002",
    "createdAt": "2025-12-28T12:29:02.390Z",
    "updatedAt": "2025-12-28T12:29:02.390Z"
  },
  {
    "id": "BR-002",
    "name": "الفرع الرئيسي (الحديدة)",
    "type": "branch",
    "parentId": "UNIT-001",
    "createdAt": "2025-12-28T12:29:02.419Z",
    "updatedAt": "2025-12-28T12:29:02.419Z"
  },
  {
    "id": "BR-003",
    "name": "فرع الدهمية",
    "type": "branch",
    "parentId": "UNIT-001",
    "createdAt": "2025-12-28T12:29:02.441Z",
    "updatedAt": "2025-12-28T12:29:02.441Z"
  },
  {
    "id": "BR-004",
    "name": "فرع الصبالية",
    "type": "branch",
    "parentId": "UNIT-001",
    "createdAt": "2025-12-28T12:29:02.456Z",
    "updatedAt": "2025-12-28T12:29:02.456Z"
  },
  {
    "id": "BR-005",
    "name": "فرع غليل",
    "type": "branch",
    "parentId": "UNIT-001",
    "createdAt": "2025-12-28T12:29:02.485Z",
    "updatedAt": "2025-12-28T12:29:02.485Z"
  },
  {
    "id": "BR-107",
    "name": "New Branch Test",
    "type": "branch",
    "parentId": "UNIT-002",
    "createdAt": "2025-12-28T19:36:13.749Z",
    "updatedAt": "2025-12-28T19:36:13.749Z"
  },
  {
    "id": "HOLD-001",
    "name": "مجموعة العباسي",
    "type": "holding",
    "parentId": null,
    "createdAt": "2025-12-28T20:26:29.067Z",
    "updatedAt": "2025-12-28T20:26:29.067Z"
  },
  {
    "id": "UNIT-001",
    "name": "وحدة أعمال الحديدة",
    "type": "unit",
    "parentId": "HOLD-001",
    "createdAt": "2025-12-28T12:29:02.340Z",
    "updatedAt": "2025-12-28T12:29:02.340Z"
  },
  {
    "id": "UNIT-002",
    "name": "وحدة العباسي خاص",
    "type": "unit",
    "parentId": "HOLD-001",
    "createdAt": "2025-12-28T12:29:02.371Z",
    "updatedAt": "2025-12-28T12:29:02.371Z"
  },
  {
    "id": "UNIT-003",
    "name": "وحدة أعمال صنعاء",
    "type": "unit",
    "parentId": "HOLD-001",
    "createdAt": "2025-12-28T22:51:28.231Z",
    "updatedAt": "2025-12-28T22:51:28.231Z"
  },
  {
    "id": "UNIT-005",
    "name": "محمّدي والعباسي",
    "type": "unit",
    "parentId": "HOLD-001",
    "createdAt": "2025-12-28T22:53:35.604Z",
    "updatedAt": "2025-12-28T22:53:35.604Z"
  }
];

// بيانات الحسابات (Accounts)
const seedAccounts: any[] = [];

// بيانات الصناديق والعهد (Cash Boxes)
const seedCashBoxes: any[] = [];

// بيانات البنوك والمحافظ (Banks & Wallets)
const seedBanksWallets: any[] = [];

// بيانات القيود اليومية (Journal Entries)
const seedJournalEntries: any[] = [];

// بيانات تفاصيل القيود اليومية (Journal Entry Lines)
const seedJournalEntryLines: any[] = [];

// بيانات المستودعات (Warehouses)
const seedWarehouses = [
  {
    "id": "WH-HOD-001",
    "entityId": "UNIT-001",
    "branchId": null,
    "name": "مخزن الديزل الدهمية",
    "code": "HOD-DSL-01",
    "address": null,
    "manager": null,
    "phone": null,
    "type": "sub",
    "isActive": true,
    "createdAt": "2025-12-28T22:55:54.105Z",
    "updatedAt": "2025-12-28T22:55:54.105Z"
  },
  {
    "id": "WH-DIESEL-SABALIA",
    "entityId": "UNIT-001",
    "branchId": "BR-004",
    "name": "مخزن الديزل الصبالية",
    "code": "WH-DIESEL-SABALIA",
    "address": null,
    "manager": null,
    "phone": null,
    "type": "sub",
    "isActive": true,
    "createdAt": "2025-12-29T01:14:31.189Z",
    "updatedAt": "2025-12-29T01:14:31.189Z"
  },
  {
    "id": "WH-DIESEL-DAHMIYA",
    "entityId": "UNIT-001",
    "branchId": "BR-003",
    "name": "مخزن الديزل الدهمية",
    "code": "WH-DIESEL-DAHMIYA",
    "address": null,
    "manager": null,
    "phone": null,
    "type": "sub",
    "isActive": true,
    "createdAt": "2025-12-29T01:25:02.791Z",
    "updatedAt": "2025-12-29T01:25:02.791Z"
  }
];

// بيانات وحدات القياس (Units)
const seedUnits = [
  {
    "id": "UNIT-LTR",
    "name": "لتر",
    "symbol": "L",
    "baseUnit": null,
    "conversionFactor": "1.0000",
    "isActive": true,
    "createdAt": "2025-12-28T22:55:54.118Z"
  }
];

// بيانات فئات الأصناف (Item Categories)
const seedItemCategories = [
  {
    "id": "CAT-FUEL",
    "entityId": "UNIT-001",
    "name": "محروقات",
    "parentId": null,
    "description": null,
    "isActive": true,
    "createdAt": "2025-12-28T22:55:54.125Z"
  }
];

// بيانات الأصناف (Items)
const seedItems = [
  {
    "id": "ITM-DSL-001",
    "entityId": "UNIT-001",
    "code": "DSL-001",
    "name": "ديزل",
    "nameEn": null,
    "barcode": null,
    "categoryId": "CAT-FUEL",
    "unitId": "UNIT-LTR",
    "type": "stock",
    "purchasePrice": "0.00",
    "salePrice": "0.00",
    "minStock": "0.000",
    "maxStock": null,
    "reorderPoint": "0.000",
    "taxRate": "15.00",
    "accountId": null,
    "cogsAccountId": null,
    "revenueAccountId": null,
    "description": null,
    "image": null,
    "isActive": true,
    "createdAt": "2025-12-28T22:55:54.130Z",
    "updatedAt": "2025-12-28T22:55:54.130Z"
  }
];

// بيانات أرصدة المخزون (Item Stock)
const seedItemStock = [
  {
    "id": "IS-NYLW8aK_SMJaEuSlmDaN4",
    "itemId": "ITM-DSL-001",
    "warehouseId": "WH-HOD-001",
    "quantity": "50000.000",
    "avgCost": "500.00",
    "lastPurchasePrice": null,
    "lastSalePrice": null,
    "updatedAt": "2025-12-28T22:02:39.324Z"
  },
  {
    "id": "STK-1766961079518",
    "itemId": "ITM-DSL-001",
    "warehouseId": "WH-DIESEL-DAHMIYA",
    "quantity": "5000.000",
    "avgCost": "50.00",
    "lastPurchasePrice": "50.00",
    "lastSalePrice": null,
    "updatedAt": "2025-12-28T22:42:51.242Z"
  }
];

// بيانات حركات المخزون (Stock Movements)
const seedStockMovements = [
  {
    "id": "SM-74gDGIkXnQHAXWUv3vP4-",
    "entityId": "UNIT-001",
    "itemId": "ITM-DSL-001",
    "warehouseId": "WH-HOD-001",
    "toWarehouseId": null,
    "type": "in",
    "quantity": "50000.000",
    "unitCost": "500.00",
    "totalCost": "25000000.00",
    "reference": "رصيد افتتاحي",
    "referenceType": "manual",
    "toAccountId": null,
    "journalEntryId": null,
    "notes": "رفع الكمية الأولية للمستودع",
    "date": "2025-12-28T22:02:38.911Z",
    "createdBy": null,
    "createdAt": "2025-12-29T01:02:39.014Z"
  },
  {
    "id": "PUR-1766960730778",
    "entityId": "UNIT-001",
    "itemId": "ITM-DSL-001",
    "warehouseId": "WH-DIESEL-DAHMIYA",
    "toWarehouseId": null,
    "type": "in",
    "quantity": "5000.000",
    "unitCost": "0.00",
    "totalCost": "0.00",
    "reference": "PUR-INV-1766960730778",
    "referenceType": "purchase",
    "toAccountId": null,
    "journalEntryId": null,
    "notes": "فاتورة مشتريات ديزل لمخزن الدهمية",
    "date": "2025-12-28T22:25:30.778Z",
    "createdBy": null,
    "createdAt": "2025-12-29T01:25:30.961Z"
  },
  {
    "id": "PUR-1766961079480",
    "entityId": "UNIT-001",
    "itemId": "ITM-DSL-001",
    "warehouseId": "WH-DIESEL-DAHMIYA",
    "toWarehouseId": null,
    "type": "in",
    "quantity": "500.000",
    "unitCost": "50.00",
    "totalCost": "25000.00",
    "reference": "213",
    "referenceType": "purchase",
    "toAccountId": null,
    "journalEntryId": null,
    "notes": null,
    "date": "2025-12-28T00:00:00.000Z",
    "createdBy": null,
    "createdAt": "2025-12-29T01:31:19.498Z"
  },
  {
    "id": "ISSUE-1766961618879",
    "entityId": "UNIT-001",
    "itemId": "ITM-DSL-001",
    "warehouseId": "WH-DIESEL-DAHMIYA",
    "toWarehouseId": null,
    "type": "out",
    "quantity": "1000.000",
    "unitCost": "0.00",
    "totalCost": "0.00",
    "reference": "ISSUE-1766961618879",
    "referenceType": "issue",
    "toAccountId": null,
    "journalEntryId": null,
    "notes": "أمر صرف مخزني",
    "date": "2025-12-28T22:40:18.879Z",
    "createdBy": null,
    "createdAt": "2025-12-29T01:40:19.115Z"
  }
];

// بيانات التحويلات بين الوحدات (Inter Unit Transfers)
const seedInterUnitTransfers: any[] = [];

// بيانات حسابات الجاري بين الوحدات (Inter Unit Accounts)
const seedInterUnitAccounts: any[] = [];

async function seed() {
  try {
    console.log('🌱 بدء تهجير قاعدة البيانات...\n');

    // مسح البيانات الموجودة (بحذر - حسب الترتيب للاعتمادية)
    console.log('🗑️  مسح البيانات الموجودة...');
    await db.delete(journalEntryLines);
    await db.delete(journalEntries);
    await db.delete(stockMovements);
    await db.delete(itemStock);
    await db.delete(items);
    await db.delete(itemCategories);
    await db.delete(warehouses);
    await db.delete(interUnitAccounts);
    await db.delete(interUnitTransfers);
    await db.delete(cashBoxes);
    await db.delete(banksWallets);
    await db.delete(accounts);
    await db.delete(entities);
    await db.delete(units);

    // تهجير الكيانات (Entities)
    console.log('📦 تهجير الكيانات...');
    for (const entity of seedEntities) {
      await db.insert(entities).values({
        ...entity,
        createdAt: new Date(entity.createdAt),
        updatedAt: new Date(entity.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedEntities.length} كيان`);

    // تهجير الحسابات (Accounts)
    console.log('\n📊 تهجير الحسابات...');
    for (const account of seedAccounts) {
      await db.insert(accounts).values({
        ...account,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedAccounts.length} حساب`);

    // تهجير الصناديق والعهد (Cash Boxes)
    console.log('\n💰 تهجير الصناديق والعهد...');
    for (const cashBox of seedCashBoxes) {
      await db.insert(cashBoxes).values({
        ...cashBox,
        createdAt: new Date(cashBox.createdAt),
        updatedAt: new Date(cashBox.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedCashBoxes.length} صندوق`);

    // تهجير البنوك والمحافظ (Banks & Wallets)
    console.log('\n🏦 تهجير البنوك والمحافظ...');
    for (const bankWallet of seedBanksWallets) {
      await db.insert(banksWallets).values({
        ...bankWallet,
        createdAt: new Date(bankWallet.createdAt),
        updatedAt: new Date(bankWallet.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedBanksWallets.length} بنك/محفظة`);

    // تهجير المستودعات (Warehouses)
    console.log('\n📦 تهجير المستودعات...');
    for (const warehouse of seedWarehouses) {
      await db.insert(warehouses).values({
        ...warehouse,
        createdAt: new Date(warehouse.createdAt),
        updatedAt: new Date(warehouse.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedWarehouses.length} مستودع`);

    // تهجير وحدات القياس (Units)
    console.log('\n📏 تهجير وحدات القياس...');
    for (const unit of seedUnits) {
      await db.insert(units).values({
        ...unit,
        createdAt: new Date(unit.createdAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedUnits.length} وحدة قياس`);

    // تهجير فئات الأصناف (Item Categories)
    console.log('\n📁 تهجير فئات الأصناف...');
    for (const category of seedItemCategories) {
      await db.insert(itemCategories).values({
        ...category,
        createdAt: new Date(category.createdAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedItemCategories.length} فئة`);

    // تهجير الأصناف (Items)
    console.log('\n📦 تهجير الأصناف...');
    for (const item of seedItems) {
      await db.insert(items).values({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedItems.length} صنف`);

    // تهجير أرصدة المخزون (Item Stock)
    console.log('\n📊 تهجير أرصدة المخزون...');
    for (const stock of seedItemStock) {
      await db.insert(itemStock).values({
        ...stock,
        updatedAt: new Date(stock.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedItemStock.length} رصيد مخزون`);

    // تهجير حركات المخزون (Stock Movements)
    console.log('\n🔄 تهجير حركات المخزون...');
    for (const movement of seedStockMovements) {
      await db.insert(stockMovements).values({
        ...movement,
        date: new Date(movement.date),
        createdAt: new Date(movement.createdAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedStockMovements.length} حركة مخزون`);

    // تهجير القيود اليومية (Journal Entries)
    console.log('\n📝 تهجير القيود اليومية...');
    for (const entry of seedJournalEntries) {
      await db.insert(journalEntries).values({
        ...entry,
        date: new Date(entry.date),
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedJournalEntries.length} قيد يومي`);

    // تهجير تفاصيل القيود اليومية (Journal Entry Lines)
    console.log('\n📋 تهجير تفاصيل القيود اليومية...');
    for (const line of seedJournalEntryLines) {
      await db.insert(journalEntryLines).values({
        ...line,
        createdAt: new Date(line.createdAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedJournalEntryLines.length} سطر قيد`);

    // تهجير التحويلات بين الوحدات (Inter Unit Transfers)
    console.log('\n🔄 تهجير التحويلات بين الوحدات...');
    for (const transfer of seedInterUnitTransfers) {
      await db.insert(interUnitTransfers).values({
        ...transfer,
        date: new Date(transfer.date),
        createdAt: new Date(transfer.createdAt),
        updatedAt: new Date(transfer.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedInterUnitTransfers.length} تحويل`);

    // تهجير حسابات الجاري بين الوحدات (Inter Unit Accounts)
    console.log('\n📊 تهجير حسابات الجاري بين الوحدات...');
    for (const account of seedInterUnitAccounts) {
      await db.insert(interUnitAccounts).values({
        ...account,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt),
      });
    }
    console.log(`   ✅ تم إضافة ${seedInterUnitAccounts.length} حساب جاري`);

    console.log('\n✅ تم تهجير قاعدة البيانات بنجاح!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في تهجير قاعدة البيانات:', error);
    process.exit(1);
  }
}

seed();
