import { pgTable, text, timestamp, boolean, integer, json, decimal } from 'drizzle-orm/pg-core';

// جدول الكيانات (الشركة القابضة، الوحدات، الفروع)
export const entities = pgTable('entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'holding' | 'unit' | 'branch'
  parentId: text('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// جدول الحسابات (شجرة الحسابات)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  level: integer('level').notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  parentId: text('parent_id'),
  isGroup: boolean('is_group').default(false).notNull(),
  subtype: text('subtype'), // 'cash' | 'bank' | 'customer' | 'supplier' | etc.
  currencies: json('currencies').$type<string[]>().default(['YER', 'SAR', 'USD']),
  defaultCurrency: text('default_currency').default('YER'),
  accountGroup: text('account_group'),
  entityId: text('entity_id').references(() => entities.id),
  branchId: text('branch_id').references(() => entities.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// جدول الصناديق والعهد
export const cashBoxes = pgTable('cash_boxes', {
  id: text('id').primaryKey(),
  entityId: text('entity_id').notNull().references(() => entities.id),
  name: text('name').notNull(),
  accountId: text('account_id').references(() => accounts.id),
  branchId: text('branch_id').references(() => entities.id),
  type: text('type').notNull(), // 'cash_box' | 'employee_custody'
  currency: text('currency').default('YER').notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  responsible: text('responsible'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// جدول البنوك والمحافظ
export const banksWallets = pgTable('banks_wallets', {
  id: text('id').primaryKey(),
  entityId: text('entity_id').notNull().references(() => entities.id),
  name: text('name').notNull(),
  chartAccountId: text('chart_account_id').references(() => accounts.id),
  type: text('type').notNull(), // 'bank' | 'wallet' | 'exchange'
  accountType: text('account_type'), // 'current' | 'savings' | 'wallet'
  accountNumber: text('account_number'),
  currencies: json('currencies').$type<string[]>().default(['YER', 'SAR', 'USD']),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// جدول القيود اليومية
export const journalEntries = pgTable('journal_entries', {
  id: text('id').primaryKey(),
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
});

// جدول تفاصيل القيود اليومية
export const journalEntryLines = pgTable('journal_entry_lines', {
  id: text('id').primaryKey(),
  entryId: text('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id),
  debit: decimal('debit', { precision: 15, scale: 2 }).default('0').notNull(),
  credit: decimal('credit', { precision: 15, scale: 2 }).default('0').notNull(),
  currency: text('currency').default('YER').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
