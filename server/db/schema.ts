import { pgTable, text, timestamp, boolean, integer, json, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ===== دالة مساعدة لتوليد ID تلقائي =====
const generateId = () => nanoid(21);

// ===== جدول الكيانات (الشركة القابضة، الوحدات، الفروع) =====
export const entities = pgTable('entities', {
  id: text('id').primaryKey().$defaultFn(generateId),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'holding' | 'unit' | 'branch'
  parentId: text('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('idx_entities_type').on(table.type),
  parentIdx: index('idx_entities_parent').on(table.parentId),
}));

export const entitiesRelations = relations(entities, ({ many }) => ({
  accounts: many(accounts),
  cashBoxes: many(cashBoxes),
  banksWallets: many(banksWallets),
  journalEntries: many(journalEntries),
  warehouses: many(warehouses),
  paymentVouchers: many(paymentVouchers),
}));

// ===== جدول الحسابات (شجرة الحسابات) =====
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(generateId),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  level: integer('level').notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  parentId: text('parent_id'),
  isGroup: boolean('is_group').default(false).notNull(),
  subtype: text('subtype'),
  currencies: json('currencies').$type<string[]>().default(['YER', 'SAR', 'USD']),
  defaultCurrency: text('default_currency').default('YER'),
  accountGroup: text('account_group'),
  entityId: text('entity_id').references(() => entities.id),
  branchId: text('branch_id').references(() => entities.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_accounts_entity').on(table.entityId),
  branchIdx: index('idx_accounts_branch').on(table.branchId),
  parentIdx: index('idx_accounts_parent').on(table.parentId),
  typeIdx: index('idx_accounts_type').on(table.type),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  entity: one(entities, { fields: [accounts.entityId], references: [entities.id] }),
}));

// ===== جدول الصناديق والعهد =====
export const cashBoxes = pgTable('cash_boxes', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  name: text('name').notNull(),
  accountId: text('account_id').references(() => accounts.id),
  branchId: text('branch_id').references(() => entities.id),
  type: text('type').notNull(), // 'cash_box' | 'employee_custody'
  currencies: json('currencies').$type<string[]>().default(['YER', 'SAR', 'USD']),
  defaultCurrency: text('default_currency').default('YER'),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  responsible: text('responsible'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_cash_boxes_entity').on(table.entityId),
  accountIdx: index('idx_cash_boxes_account').on(table.accountId),
  branchIdx: index('idx_cash_boxes_branch').on(table.branchId),
}));

export const cashBoxesRelations = relations(cashBoxes, ({ one }) => ({
  entity: one(entities, { fields: [cashBoxes.entityId], references: [entities.id] }),
  account: one(accounts, { fields: [cashBoxes.accountId], references: [accounts.id] }),
}));

// ===== جدول البنوك والمحافظ =====
export const banksWallets = pgTable('banks_wallets', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  name: text('name').notNull(),
  chartAccountId: text('chart_account_id').references(() => accounts.id),
  type: text('type').notNull(), // 'bank' | 'wallet' | 'exchange'
  accountType: text('account_type'),
  accountNumber: text('account_number'),
  currencies: json('currencies').$type<string[]>().default(['YER', 'SAR', 'USD']),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_banks_wallets_entity').on(table.entityId),
  chartAccountIdx: index('idx_banks_wallets_chart_account').on(table.chartAccountId),
}));

export const banksWalletsRelations = relations(banksWallets, ({ one }) => ({
  entity: one(entities, { fields: [banksWallets.entityId], references: [entities.id] }),
  chartAccount: one(accounts, { fields: [banksWallets.chartAccountId], references: [accounts.id] }),
}));

// ===== جدول القيود اليومية =====
export const journalEntries = pgTable('journal_entries', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  branchId: text('branch_id').references(() => entities.id),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  reference: text('reference'),
  type: text('type').notNull(), // 'manual' | 'auto'
  status: text('status').default('draft').notNull(), // 'draft' | 'posted' | 'cancelled'
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('idx_journal_entries_date').on(table.date),
  entityIdx: index('idx_journal_entries_entity').on(table.entityId),
  branchIdx: index('idx_journal_entries_branch').on(table.branchId),
  statusIdx: index('idx_journal_entries_status').on(table.status),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  entity: one(entities, { fields: [journalEntries.entityId], references: [entities.id] }),
  lines: many(journalEntryLines),
}));

// ===== جدول تفاصيل القيود اليومية =====
export const journalEntryLines = pgTable('journal_entry_lines', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entryId: text('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id),
  debit: decimal('debit', { precision: 15, scale: 2 }).default('0').notNull(),
  credit: decimal('credit', { precision: 15, scale: 2 }).default('0').notNull(),
  currency: text('currency').default('YER').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  entryIdx: index('idx_journal_entry_lines_entry').on(table.entryId),
  accountIdx: index('idx_journal_entry_lines_account').on(table.accountId),
}));

export const journalEntryLinesRelations = relations(journalEntryLines, ({ one }) => ({
  entry: one(journalEntries, { fields: [journalEntryLines.entryId], references: [journalEntries.id] }),
  account: one(accounts, { fields: [journalEntryLines.accountId], references: [accounts.id] }),
}));

// ===== جدول المستودعات =====
export const warehouses = pgTable('warehouses', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  branchId: text('branch_id').references(() => entities.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  address: text('address'),
  manager: text('manager'),
  phone: text('phone'),
  type: text('type').default('main').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_warehouses_entity').on(table.entityId),
  branchIdx: index('idx_warehouses_branch').on(table.branchId),
}));

export const warehousesRelations = relations(warehouses, ({ one }) => ({
  entity: one(entities, { fields: [warehouses.entityId], references: [entities.id] }),
}));

// ===== جدول وحدات القياس =====
export const units = pgTable('units', {
  id: text('id').primaryKey().$defaultFn(generateId),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  baseUnit: text('base_unit'),
  conversionFactor: decimal('conversion_factor', { precision: 10, scale: 4 }).default('1'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===== جدول فئات الأصناف =====
export const itemCategories = pgTable('item_categories', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_item_categories_entity').on(table.entityId),
}));

// ===== جدول الأصناف =====
export const items = pgTable('items', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  barcode: text('barcode'),
  categoryId: text('category_id').references(() => itemCategories.id),
  unitId: text('unit_id').references(() => units.id),
  type: text('type').default('stock').notNull(),
  purchasePrice: decimal('purchase_price', { precision: 15, scale: 2 }).default('0'),
  salePrice: decimal('sale_price', { precision: 15, scale: 2 }).default('0'),
  minStock: decimal('min_stock', { precision: 15, scale: 3 }).default('0'),
  maxStock: decimal('max_stock', { precision: 15, scale: 3 }),
  reorderPoint: decimal('reorder_point', { precision: 15, scale: 3 }).default('0'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('15'),
  accountId: text('account_id').references(() => accounts.id),
  cogsAccountId: text('cogs_account_id').references(() => accounts.id),
  revenueAccountId: text('revenue_account_id').references(() => accounts.id),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_items_entity').on(table.entityId),
  categoryIdx: index('idx_items_category').on(table.categoryId),
  codeIdx: index('idx_items_code').on(table.code),
}));

// ===== جدول أرصدة المخزون =====
export const itemStock = pgTable('item_stock', {
  id: text('id').primaryKey().$defaultFn(generateId),
  itemId: text('item_id').notNull().references(() => items.id),
  warehouseId: text('warehouse_id').notNull().references(() => warehouses.id),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).default('0').notNull(),
  avgCost: decimal('avg_cost', { precision: 15, scale: 2 }).default('0'),
  lastPurchasePrice: decimal('last_purchase_price', { precision: 15, scale: 2 }),
  lastSalePrice: decimal('last_sale_price', { precision: 15, scale: 2 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  itemIdx: index('idx_item_stock_item').on(table.itemId),
  warehouseIdx: index('idx_item_stock_warehouse').on(table.warehouseId),
}));

// ===== جدول حركات المخزون =====
export const stockMovements = pgTable('stock_movements', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  itemId: text('item_id').notNull().references(() => items.id),
  warehouseId: text('warehouse_id').notNull().references(() => warehouses.id),
  toWarehouseId: text('to_warehouse_id').references(() => warehouses.id),
  type: text('type').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  reference: text('reference'),
  referenceType: text('reference_type'),
  toAccountId: text('to_account_id').references(() => accounts.id),
  journalEntryId: text('journal_entry_id').references(() => journalEntries.id),
  notes: text('notes'),
  date: timestamp('date').notNull(),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  itemWarehouseIdx: index('idx_stock_movements_item_warehouse').on(table.itemId, table.warehouseId),
  entityIdx: index('idx_stock_movements_entity').on(table.entityId),
  dateIdx: index('idx_stock_movements_date').on(table.date),
}));

// ===== جدول التحويلات بين الوحدات =====
export const interUnitTransfers = pgTable('inter_unit_transfers', {
  id: text('id').primaryKey().$defaultFn(generateId),
  transferNumber: text('transfer_number').notNull().unique(),
  fromEntityId: text('from_entity_id').notNull().references(() => entities.id),
  toEntityId: text('to_entity_id').notNull().references(() => entities.id),
  fromAccountId: text('from_account_id').notNull().references(() => accounts.id),
  toAccountId: text('to_account_id').notNull().references(() => accounts.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('YER').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  status: text('status').default('completed').notNull(),
  fromJournalEntryId: text('from_journal_entry_id').references(() => journalEntries.id),
  toJournalEntryId: text('to_journal_entry_id').references(() => journalEntries.id),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fromEntityIdx: index('idx_inter_unit_transfers_from_entity').on(table.fromEntityId),
  toEntityIdx: index('idx_inter_unit_transfers_to_entity').on(table.toEntityId),
}));

// ===== جدول حسابات الجاري بين الوحدات =====
export const interUnitAccounts = pgTable('inter_unit_accounts', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  relatedEntityId: text('related_entity_id').notNull().references(() => entities.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  currency: text('currency').default('YER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('idx_inter_unit_accounts_entity').on(table.entityId),
  relatedEntityIdx: index('idx_inter_unit_accounts_related_entity').on(table.relatedEntityId),
}));

// ===== جدول سندات الصرف/القبض =====
export const paymentVouchers = pgTable('payment_vouchers', {
  id: text('id').primaryKey().$defaultFn(generateId),
  entityId: text('entity_id').notNull().references(() => entities.id),
  type: text('type').notNull(), // 'in' | 'out'
  cashBoxId: text('cash_box_id').references(() => cashBoxes.id),
  bankWalletId: text('bank_wallet_id').references(() => banksWallets.id),
  date: timestamp('date').notNull(),
  currency: text('currency').default('YER').notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 15, scale: 4 }).default('1').notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  reference: text('reference'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('idx_payment_vouchers_date').on(table.date),
  entityIdx: index('idx_payment_vouchers_entity').on(table.entityId),
  cashBoxIdx: index('idx_payment_vouchers_cash_box').on(table.cashBoxId),
  bankWalletIdx: index('idx_payment_vouchers_bank_wallet').on(table.bankWalletId),
}));

export const paymentVouchersRelations = relations(paymentVouchers, ({ one, many }) => ({
  entity: one(entities, { fields: [paymentVouchers.entityId], references: [entities.id] }),
  cashBox: one(cashBoxes, { fields: [paymentVouchers.cashBoxId], references: [cashBoxes.id] }),
  bankWallet: one(banksWallets, { fields: [paymentVouchers.bankWalletId], references: [banksWallets.id] }),
  operations: many(paymentVoucherOperations),
}));

// ===== جدول عمليات سندات الصرف/القبض =====
export const paymentVoucherOperations = pgTable('payment_voucher_operations', {
  id: text('id').primaryKey().$defaultFn(generateId),
  voucherId: text('voucher_id').notNull().references(() => paymentVouchers.id, { onDelete: 'cascade' }),
  accountType: text('account_type').notNull(),
  accountSubtype: text('account_subtype').notNull(),
  chartAccountId: text('chart_account_id').notNull().references(() => accounts.id),
  analyticalAccountId: text('analytical_account_id').references(() => accounts.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  voucherIdx: index('idx_payment_voucher_operations_voucher').on(table.voucherId),
  chartAccountIdx: index('idx_payment_voucher_operations_chart_account').on(table.chartAccountId),
}));

export const paymentVoucherOperationsRelations = relations(paymentVoucherOperations, ({ one }) => ({
  voucher: one(paymentVouchers, { fields: [paymentVoucherOperations.voucherId], references: [paymentVouchers.id] }),
  chartAccount: one(accounts, { fields: [paymentVoucherOperations.chartAccountId], references: [accounts.id] }),
}));
