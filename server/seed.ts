import { db } from './db/index';
import { entities, accounts } from './db/schema';

// Initial entities data
const initialEntities = [
  { id: "UNIT-001", name: "وحدة أعمال الحديدة", type: "unit", parentId: null },
  { id: "UNIT-002", name: "وحدة العباسي خاص", type: "unit", parentId: null },
  { id: "BR-001", name: "الفرع الرئيسي (العباسي خاص)", type: "branch", parentId: "UNIT-002" },
  { id: "BR-002", name: "الفرع الرئيسي (الحديدة)", type: "branch", parentId: "UNIT-001" },
  { id: "BR-003", name: "فرع الدهمية", type: "branch", parentId: "UNIT-001" },
  { id: "BR-004", name: "فرع الصبالية", type: "branch", parentId: "UNIT-001" },
  { id: "BR-005", name: "فرع غليل", type: "branch", parentId: "UNIT-001" },
];

// Initial accounts data for UNIT-002 (Al-Abbasi Unit)
const initialAccounts = [
  {
    id: "1.1",
    name: "الأصول المتداولة",
    type: "asset",
    level: 1,
    balance: 0,
    parentId: null,
    isGroup: true,
    subtype: "general",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  {
    id: "1.2",
    name: "الحوشبي للصرافة",
    type: "asset",
    level: 2,
    balance: 0,
    parentId: "1.1",
    isGroup: false,
    subtype: "bank",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  {
    id: "1.3",
    name: "البنوك والمحافظ الإلكترونية",
    type: "asset",
    level: 2,
    balance: 0,
    parentId: "1.1",
    isGroup: true,
    subtype: "bank",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  {
    id: "1.3.1",
    name: "بنك الكريمي",
    type: "asset",
    level: 3,
    balance: 0,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  {
    id: "1.3.2",
    name: "بنك التضامن",
    type: "asset",
    level: 3,
    balance: 0,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  {
    id: "1.3.3",
    name: "محفظة موبي كاش",
    type: "asset",
    level: 3,
    balance: 0,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  {
    id: "1.3.4",
    name: "محفظة ون كاش",
    type: "asset",
    level: 3,
    balance: 0,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-002"
  },
  // Cash Boxes for Hodeidah Unit
  {
    id: "2",
    name: "الصناديق",
    type: "asset",
    level: 1,
    balance: 0,
    parentId: null,
    isGroup: true,
    subtype: "cash",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-001"
  },
  {
    id: "2.1",
    name: "صندوق التحصيل والتوريد الدهمية",
    type: "asset",
    level: 2,
    balance: 0,
    parentId: "2",
    isGroup: false,
    subtype: "cash",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-001",
    branchId: "BR-003"
  },
  {
    id: "2.2",
    name: "صندوق التحصيل والتوريد الصبالية",
    type: "asset",
    level: 2,
    balance: 0,
    parentId: "2",
    isGroup: false,
    subtype: "cash",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-001",
    branchId: "BR-004"
  },
  {
    id: "2.3",
    name: "صندوق التحصيل والتوريد غليل",
    type: "asset",
    level: 2,
    balance: 0,
    parentId: "2",
    isGroup: false,
    subtype: "cash",
    currencies: ["YER", "SAR", "USD"],
    entityId: "UNIT-001",
    branchId: "BR-005"
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(accounts);
    await db.delete(entities);

    // Seed entities
    console.log('📦 Seeding entities...');
    for (const entity of initialEntities) {
      await db.insert(entities).values(entity);
      console.log(`  ✓ Added entity: ${entity.name}`);
    }

    // Seed accounts
    console.log('📊 Seeding accounts...');
    for (const account of initialAccounts) {
      await db.insert(accounts).values({
        ...account,
        defaultCurrency: 'YER',
        accountGroup: null,
        branchId: account.branchId || null
      });
      console.log(`  ✓ Added account: ${account.name}`);
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
