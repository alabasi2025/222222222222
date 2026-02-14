import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// ===== دالة مساعدة لتوليد ID تلقائي =====
const generateId = () => nanoid(21);

// ===== جدول الكيانات (الشركة القابضة، الوحدات، الفروع) =====
export const entities = pgTable(
  "entities",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'holding' | 'unit' | 'branch'
    parentId: text("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    typeIdx: index("idx_entities_type").on(table.type),
    parentIdx: index("idx_entities_parent").on(table.parentId),
  })
);

export const entitiesRelations = relations(entities, ({ many }) => ({
  accounts: many(accounts),
  cashBoxes: many(cashBoxes),
  banksWallets: many(banksWallets),
  journalEntries: many(journalEntries),
  warehouses: many(warehouses),
  paymentVouchers: many(paymentVouchers),
}));

// ===== جدول الحسابات (شجرة الحسابات) =====
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
    level: integer("level").notNull(),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    parentId: text("parent_id"),
    isGroup: boolean("is_group").default(false).notNull(),
    subtype: text("subtype"),
    currencies: json("currencies")
      .$type<string[]>()
      .default(["YER", "SAR", "USD"]),
    defaultCurrency: text("default_currency").default("YER"),
    accountGroup: text("account_group"),
    entityId: text("entity_id").references(() => entities.id),
    branchId: text("branch_id").references(() => entities.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_accounts_entity").on(table.entityId),
    branchIdx: index("idx_accounts_branch").on(table.branchId),
    parentIdx: index("idx_accounts_parent").on(table.parentId),
    typeIdx: index("idx_accounts_type").on(table.type),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  entity: one(entities, {
    fields: [accounts.entityId],
    references: [entities.id],
  }),
}));

// ===== جدول الصناديق والعهد =====
export const cashBoxes = pgTable(
  "cash_boxes",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    accountId: text("account_id").references(() => accounts.id),
    branchId: text("branch_id").references(() => entities.id),
    type: text("type").notNull(), // 'cash_box' | 'employee_custody'
    currencies: json("currencies")
      .$type<string[]>()
      .default(["YER", "SAR", "USD"]),
    defaultCurrency: text("default_currency").default("YER"),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    responsible: text("responsible"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_cash_boxes_entity").on(table.entityId),
    accountIdx: index("idx_cash_boxes_account").on(table.accountId),
    branchIdx: index("idx_cash_boxes_branch").on(table.branchId),
  })
);

export const cashBoxesRelations = relations(cashBoxes, ({ one }) => ({
  entity: one(entities, {
    fields: [cashBoxes.entityId],
    references: [entities.id],
  }),
  account: one(accounts, {
    fields: [cashBoxes.accountId],
    references: [accounts.id],
  }),
}));

// ===== جدول البنوك والمحافظ =====
export const banksWallets = pgTable(
  "banks_wallets",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    chartAccountId: text("chart_account_id").references(() => accounts.id),
    type: text("type").notNull(), // 'bank' | 'wallet' | 'exchange'
    accountType: text("account_type"),
    accountNumber: text("account_number"),
    currencies: json("currencies")
      .$type<string[]>()
      .default(["YER", "SAR", "USD"]),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_banks_wallets_entity").on(table.entityId),
    chartAccountIdx: index("idx_banks_wallets_chart_account").on(
      table.chartAccountId
    ),
  })
);

export const banksWalletsRelations = relations(banksWallets, ({ one }) => ({
  entity: one(entities, {
    fields: [banksWallets.entityId],
    references: [entities.id],
  }),
  chartAccount: one(accounts, {
    fields: [banksWallets.chartAccountId],
    references: [accounts.id],
  }),
}));

// ===== جدول القيود اليومية =====
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    branchId: text("branch_id").references(() => entities.id),
    date: timestamp("date").notNull(),
    description: text("description").notNull(),
    reference: text("reference"),
    type: text("type").notNull(), // 'manual' | 'auto'
    status: text("status").default("draft").notNull(), // 'draft' | 'posted' | 'cancelled'
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    dateIdx: index("idx_journal_entries_date").on(table.date),
    entityIdx: index("idx_journal_entries_entity").on(table.entityId),
    branchIdx: index("idx_journal_entries_branch").on(table.branchId),
    statusIdx: index("idx_journal_entries_status").on(table.status),
  })
);

export const journalEntriesRelations = relations(
  journalEntries,
  ({ one, many }) => ({
    entity: one(entities, {
      fields: [journalEntries.entityId],
      references: [entities.id],
    }),
    lines: many(journalEntryLines),
  })
);

// ===== جدول تفاصيل القيود اليومية =====
export const journalEntryLines = pgTable(
  "journal_entry_lines",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entryId: text("entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    debit: decimal("debit", { precision: 15, scale: 2 }).default("0").notNull(),
    credit: decimal("credit", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    currency: text("currency").default("YER").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    entryIdx: index("idx_journal_entry_lines_entry").on(table.entryId),
    accountIdx: index("idx_journal_entry_lines_account").on(table.accountId),
  })
);

export const journalEntryLinesRelations = relations(
  journalEntryLines,
  ({ one }) => ({
    entry: one(journalEntries, {
      fields: [journalEntryLines.entryId],
      references: [journalEntries.id],
    }),
    account: one(accounts, {
      fields: [journalEntryLines.accountId],
      references: [accounts.id],
    }),
  })
);

// ===== جدول المستودعات =====
export const warehouses = pgTable(
  "warehouses",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    branchId: text("branch_id").references(() => entities.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    address: text("address"),
    manager: text("manager"),
    phone: text("phone"),
    type: text("type").default("main").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_warehouses_entity").on(table.entityId),
    branchIdx: index("idx_warehouses_branch").on(table.branchId),
  })
);

export const warehousesRelations = relations(warehouses, ({ one }) => ({
  entity: one(entities, {
    fields: [warehouses.entityId],
    references: [entities.id],
  }),
}));

// ===== جدول وحدات القياس =====
export const units = pgTable("units", {
  id: text("id").primaryKey().$defaultFn(generateId),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  baseUnit: text("base_unit"),
  conversionFactor: decimal("conversion_factor", {
    precision: 10,
    scale: 4,
  }).default("1"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== جدول فئات الأصناف =====
export const itemCategories = pgTable(
  "item_categories",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_item_categories_entity").on(table.entityId),
  })
);

// ===== جدول الأصناف =====
export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    code: text("code").notNull(),
    name: text("name").notNull(),
    nameEn: text("name_en"),
    barcode: text("barcode"),
    categoryId: text("category_id").references(() => itemCategories.id),
    unitId: text("unit_id").references(() => units.id),
    type: text("type").default("stock").notNull(),
    purchasePrice: decimal("purchase_price", {
      precision: 15,
      scale: 2,
    }).default("0"),
    salePrice: decimal("sale_price", { precision: 15, scale: 2 }).default("0"),
    minStock: decimal("min_stock", { precision: 15, scale: 3 }).default("0"),
    maxStock: decimal("max_stock", { precision: 15, scale: 3 }),
    reorderPoint: decimal("reorder_point", { precision: 15, scale: 3 }).default(
      "0"
    ),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15"),
    accountId: text("account_id").references(() => accounts.id),
    cogsAccountId: text("cogs_account_id").references(() => accounts.id),
    revenueAccountId: text("revenue_account_id").references(() => accounts.id),
    description: text("description"),
    image: text("image"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_items_entity").on(table.entityId),
    categoryIdx: index("idx_items_category").on(table.categoryId),
    codeIdx: index("idx_items_code").on(table.code),
    unitIdx: index("idx_items_unit").on(table.unitId),
    accountIdx: index("idx_items_account").on(table.accountId),
    cogsAccountIdx: index("idx_items_cogs_account").on(table.cogsAccountId),
    revenueAccountIdx: index("idx_items_revenue_account").on(
      table.revenueAccountId
    ),
  })
);

export const itemCategoriesRelations = relations(itemCategories, ({ one }) => ({
  entity: one(entities, {
    fields: [itemCategories.entityId],
    references: [entities.id],
  }),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  entity: one(entities, {
    fields: [items.entityId],
    references: [entities.id],
  }),
  category: one(itemCategories, {
    fields: [items.categoryId],
    references: [itemCategories.id],
  }),
  unit: one(units, {
    fields: [items.unitId],
    references: [units.id],
  }),
  account: one(accounts, {
    fields: [items.accountId],
    references: [accounts.id],
  }),
  stock: many(itemStock),
  movements: many(stockMovements),
}));

// ===== جدول أرصدة المخزون =====
export const itemStock = pgTable(
  "item_stock",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
    quantity: decimal("quantity", { precision: 15, scale: 3 })
      .default("0")
      .notNull(),
    avgCost: decimal("avg_cost", { precision: 15, scale: 2 }).default("0"),
    lastPurchasePrice: decimal("last_purchase_price", {
      precision: 15,
      scale: 2,
    }),
    lastSalePrice: decimal("last_sale_price", { precision: 15, scale: 2 }),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    itemIdx: index("idx_item_stock_item").on(table.itemId),
    warehouseIdx: index("idx_item_stock_warehouse").on(table.warehouseId),
  })
);

export const itemStockRelations = relations(itemStock, ({ one }) => ({
  item: one(items, {
    fields: [itemStock.itemId],
    references: [items.id],
  }),
  warehouse: one(warehouses, {
    fields: [itemStock.warehouseId],
    references: [warehouses.id],
  }),
}));

// ===== جدول حركات المخزون =====
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
    toWarehouseId: text("to_warehouse_id").references(() => warehouses.id),
    type: text("type").notNull(),
    quantity: decimal("quantity", { precision: 15, scale: 3 }).notNull(),
    unitCost: decimal("unit_cost", { precision: 15, scale: 2 }),
    totalCost: decimal("total_cost", { precision: 15, scale: 2 }),
    reference: text("reference"),
    referenceType: text("reference_type"),
    toAccountId: text("to_account_id").references(() => accounts.id),
    journalEntryId: text("journal_entry_id").references(
      () => journalEntries.id
    ),
    notes: text("notes"),
    date: timestamp("date").notNull(),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    itemWarehouseIdx: index("idx_stock_movements_item_warehouse").on(
      table.itemId,
      table.warehouseId
    ),
    entityIdx: index("idx_stock_movements_entity").on(table.entityId),
    dateIdx: index("idx_stock_movements_date").on(table.date),
    toWarehouseIdx: index("idx_stock_movements_to_warehouse").on(
      table.toWarehouseId
    ),
    toAccountIdx: index("idx_stock_movements_to_account").on(table.toAccountId),
    journalEntryIdx: index("idx_stock_movements_journal_entry").on(
      table.journalEntryId
    ),
  })
);

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  entity: one(entities, {
    fields: [stockMovements.entityId],
    references: [entities.id],
  }),
  item: one(items, {
    fields: [stockMovements.itemId],
    references: [items.id],
  }),
  warehouse: one(warehouses, {
    fields: [stockMovements.warehouseId],
    references: [warehouses.id],
  }),
  journalEntry: one(journalEntries, {
    fields: [stockMovements.journalEntryId],
    references: [journalEntries.id],
  }),
}));

// ===== جدول التحويلات بين الوحدات =====
export const interUnitTransfers = pgTable(
  "inter_unit_transfers",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    transferNumber: text("transfer_number").notNull().unique(),
    fromEntityId: text("from_entity_id")
      .notNull()
      .references(() => entities.id),
    toEntityId: text("to_entity_id")
      .notNull()
      .references(() => entities.id),
    fromAccountId: text("from_account_id")
      .notNull()
      .references(() => accounts.id),
    toAccountId: text("to_account_id")
      .notNull()
      .references(() => accounts.id),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").default("YER").notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    status: text("status").default("completed").notNull(),
    fromJournalEntryId: text("from_journal_entry_id").references(
      () => journalEntries.id
    ),
    toJournalEntryId: text("to_journal_entry_id").references(
      () => journalEntries.id
    ),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    fromEntityIdx: index("idx_inter_unit_transfers_from_entity").on(
      table.fromEntityId
    ),
    toEntityIdx: index("idx_inter_unit_transfers_to_entity").on(
      table.toEntityId
    ),
    fromAccountIdx: index("idx_inter_unit_transfers_from_account").on(
      table.fromAccountId
    ),
    toAccountIdx: index("idx_inter_unit_transfers_to_account").on(
      table.toAccountId
    ),
    fromJournalEntryIdx: index("idx_inter_unit_transfers_from_journal").on(
      table.fromJournalEntryId
    ),
    toJournalEntryIdx: index("idx_inter_unit_transfers_to_journal").on(
      table.toJournalEntryId
    ),
  })
);

export const interUnitTransfersRelations = relations(
  interUnitTransfers,
  ({ one }) => ({
    fromEntity: one(entities, {
      fields: [interUnitTransfers.fromEntityId],
      references: [entities.id],
      relationName: "transferFromEntity",
    }),
    toEntity: one(entities, {
      fields: [interUnitTransfers.toEntityId],
      references: [entities.id],
      relationName: "transferToEntity",
    }),
    fromAccount: one(accounts, {
      fields: [interUnitTransfers.fromAccountId],
      references: [accounts.id],
      relationName: "transferFromAccount",
    }),
    toAccount: one(accounts, {
      fields: [interUnitTransfers.toAccountId],
      references: [accounts.id],
      relationName: "transferToAccount",
    }),
  })
);

// ===== جدول حسابات الجاري بين الوحدات =====
export const interUnitAccounts = pgTable(
  "inter_unit_accounts",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    relatedEntityId: text("related_entity_id")
      .notNull()
      .references(() => entities.id),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    currency: text("currency").default("YER").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_inter_unit_accounts_entity").on(table.entityId),
    relatedEntityIdx: index("idx_inter_unit_accounts_related_entity").on(
      table.relatedEntityId
    ),
  })
);

export const interUnitAccountsRelations = relations(
  interUnitAccounts,
  ({ one }) => ({
    entity: one(entities, {
      fields: [interUnitAccounts.entityId],
      references: [entities.id],
      relationName: "iuaEntity",
    }),
    relatedEntity: one(entities, {
      fields: [interUnitAccounts.relatedEntityId],
      references: [entities.id],
      relationName: "iuaRelatedEntity",
    }),
    account: one(accounts, {
      fields: [interUnitAccounts.accountId],
      references: [accounts.id],
    }),
  })
);

// ===== جدول سندات الصرف/القبض =====
export const paymentVouchers = pgTable(
  "payment_vouchers",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    type: text("type").notNull(), // 'in' | 'out'
    cashBoxId: text("cash_box_id").references(() => cashBoxes.id),
    bankWalletId: text("bank_wallet_id").references(() => banksWallets.id),
    date: timestamp("date").notNull(),
    currency: text("currency").default("YER").notNull(),
    exchangeRate: decimal("exchange_rate", { precision: 15, scale: 4 })
      .default("1")
      .notNull(),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
    reference: text("reference"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    dateIdx: index("idx_payment_vouchers_date").on(table.date),
    entityIdx: index("idx_payment_vouchers_entity").on(table.entityId),
    cashBoxIdx: index("idx_payment_vouchers_cash_box").on(table.cashBoxId),
    bankWalletIdx: index("idx_payment_vouchers_bank_wallet").on(
      table.bankWalletId
    ),
  })
);

export const paymentVouchersRelations = relations(
  paymentVouchers,
  ({ one, many }) => ({
    entity: one(entities, {
      fields: [paymentVouchers.entityId],
      references: [entities.id],
    }),
    cashBox: one(cashBoxes, {
      fields: [paymentVouchers.cashBoxId],
      references: [cashBoxes.id],
    }),
    bankWallet: one(banksWallets, {
      fields: [paymentVouchers.bankWalletId],
      references: [banksWallets.id],
    }),
    operations: many(paymentVoucherOperations),
  })
);

// ===== جدول عمليات سندات الصرف/القبض =====
export const paymentVoucherOperations = pgTable(
  "payment_voucher_operations",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    voucherId: text("voucher_id")
      .notNull()
      .references(() => paymentVouchers.id, { onDelete: "cascade" }),
    accountType: text("account_type").notNull(),
    accountSubtype: text("account_subtype").notNull(),
    chartAccountId: text("chart_account_id")
      .notNull()
      .references(() => accounts.id),
    analyticalAccountId: text("analytical_account_id").references(
      () => accounts.id
    ),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    voucherIdx: index("idx_payment_voucher_operations_voucher").on(
      table.voucherId
    ),
    chartAccountIdx: index("idx_payment_voucher_operations_chart_account").on(
      table.chartAccountId
    ),
  })
);

export const paymentVoucherOperationsRelations = relations(
  paymentVoucherOperations,
  ({ one }) => ({
    voucher: one(paymentVouchers, {
      fields: [paymentVoucherOperations.voucherId],
      references: [paymentVouchers.id],
    }),
    chartAccount: one(accounts, {
      fields: [paymentVoucherOperations.chartAccountId],
      references: [accounts.id],
    }),
  })
);

// ===== جدول المستخدمين =====
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    username: text("username").notNull().unique(),
    email: text("email").unique(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    role: text("role").default("user").notNull(), // 'admin' | 'manager' | 'accountant' | 'user'
    entityId: text("entity_id").references(() => entities.id),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    usernameIdx: index("idx_users_username").on(table.username),
    emailIdx: index("idx_users_email").on(table.email),
    entityIdx: index("idx_users_entity").on(table.entityId),
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  entity: one(entities, {
    fields: [users.entityId],
    references: [entities.id],
  }),
}));

// ===== جدول جلسات المصادقة =====
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("idx_sessions_user").on(table.userId),
    tokenIdx: index("idx_sessions_token").on(table.token),
    expiresIdx: index("idx_sessions_expires").on(table.expiresAt),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ===== جدول العملاء =====
export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    taxNumber: text("tax_number"),
    contactPerson: text("contact_person"),
    accountId: text("account_id").references(() => accounts.id),
    creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).default(
      "0"
    ),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    currency: text("currency").default("YER").notNull(),
    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_customers_entity").on(table.entityId),
    accountIdx: index("idx_customers_account").on(table.accountId),
    nameIdx: index("idx_customers_name").on(table.name),
  })
);

export const customersRelations = relations(customers, ({ one }) => ({
  entity: one(entities, {
    fields: [customers.entityId],
    references: [entities.id],
  }),
  account: one(accounts, {
    fields: [customers.accountId],
    references: [accounts.id],
  }),
}));

// ===== جدول الموردين =====
export const suppliers = pgTable(
  "suppliers",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    taxNumber: text("tax_number"),
    contactPerson: text("contact_person"),
    accountId: text("account_id").references(() => accounts.id),
    creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).default(
      "0"
    ),
    balance: decimal("balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    currency: text("currency").default("YER").notNull(),
    paymentTerms: text("payment_terms"),
    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_suppliers_entity").on(table.entityId),
    accountIdx: index("idx_suppliers_account").on(table.accountId),
    nameIdx: index("idx_suppliers_name").on(table.name),
  })
);

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  entity: one(entities, {
    fields: [suppliers.entityId],
    references: [entities.id],
  }),
  account: one(accounts, {
    fields: [suppliers.accountId],
    references: [accounts.id],
  }),
}));

// ===== جدول جهات الاتصال =====
export const contacts = pgTable(
  "contacts",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'customer' | 'supplier' | 'employee' | 'other'
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    company: text("company"),
    position: text("position"),
    notes: text("notes"),
    customerId: text("customer_id").references(() => customers.id),
    supplierId: text("supplier_id").references(() => suppliers.id),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_contacts_entity").on(table.entityId),
    typeIdx: index("idx_contacts_type").on(table.type),
    customerIdx: index("idx_contacts_customer").on(table.customerId),
    supplierIdx: index("idx_contacts_supplier").on(table.supplierId),
  })
);

export const contactsRelations = relations(contacts, ({ one }) => ({
  entity: one(entities, {
    fields: [contacts.entityId],
    references: [entities.id],
  }),
  customer: one(customers, {
    fields: [contacts.customerId],
    references: [customers.id],
  }),
  supplier: one(suppliers, {
    fields: [contacts.supplierId],
    references: [suppliers.id],
  }),
}));

// ===== جدول العملات =====
export const currencies = pgTable(
  "currencies",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    code: text("code").notNull(), // 'YER', 'SAR', 'USD', etc.
    name: text("name").notNull(),
    nameEn: text("name_en"),
    symbol: text("symbol").notNull(),
    exchangeRate: decimal("exchange_rate", { precision: 15, scale: 6 })
      .default("1")
      .notNull(),
    isBase: boolean("is_base").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    decimalPlaces: integer("decimal_places").default(2).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_currencies_entity").on(table.entityId),
    codeIdx: index("idx_currencies_code").on(table.code),
  })
);

export const currenciesRelations = relations(currencies, ({ one }) => ({
  entity: one(entities, {
    fields: [currencies.entityId],
    references: [entities.id],
  }),
}));

// ===== جدول مراكز التكلفة =====
export const costCenters = pgTable(
  "cost_centers",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    type: text("type").default("operational").notNull(), // 'operational' | 'administrative' | 'marketing' | 'production'
    parentId: text("parent_id"),
    description: text("description"),
    budget: decimal("budget", { precision: 15, scale: 2 }).default("0"),
    actualSpending: decimal("actual_spending", {
      precision: 15,
      scale: 2,
    }).default("0"),
    status: text("status").default("active").notNull(), // 'active' | 'inactive' | 'closed'
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_cost_centers_entity").on(table.entityId),
    codeIdx: index("idx_cost_centers_code").on(table.code),
    parentIdx: index("idx_cost_centers_parent").on(table.parentId),
  })
);

export const costCentersRelations = relations(costCenters, ({ one }) => ({
  entity: one(entities, {
    fields: [costCenters.entityId],
    references: [entities.id],
  }),
}));

// ===== جدول الأصول الثابتة =====
export const fixedAssets = pgTable(
  "fixed_assets",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    category: text("category").notNull(), // 'buildings' | 'vehicles' | 'equipment' | 'furniture' | 'computers' | 'other'
    purchaseDate: timestamp("purchase_date").notNull(),
    purchasePrice: decimal("purchase_price", {
      precision: 15,
      scale: 2,
    }).notNull(),
    currentValue: decimal("current_value", {
      precision: 15,
      scale: 2,
    }).notNull(),
    depreciationRate: decimal("depreciation_rate", {
      precision: 5,
      scale: 2,
    }).default("0"),
    depreciationMethod: text("depreciation_method").default("straight_line"), // 'straight_line' | 'declining_balance'
    usefulLife: integer("useful_life"), // in months
    salvageValue: decimal("salvage_value", { precision: 15, scale: 2 }).default(
      "0"
    ),
    accountId: text("account_id").references(() => accounts.id),
    depreciationAccountId: text("depreciation_account_id").references(
      () => accounts.id
    ),
    location: text("location"),
    serialNumber: text("serial_number"),
    status: text("status").default("active").notNull(), // 'active' | 'disposed' | 'maintenance'
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_fixed_assets_entity").on(table.entityId),
    categoryIdx: index("idx_fixed_assets_category").on(table.category),
    accountIdx: index("idx_fixed_assets_account").on(table.accountId),
    depreciationAccountIdx: index("idx_fixed_assets_depreciation_account").on(
      table.depreciationAccountId
    ),
    statusIdx: index("idx_fixed_assets_status").on(table.status),
  })
);

export const fixedAssetsRelations = relations(fixedAssets, ({ one }) => ({
  entity: one(entities, {
    fields: [fixedAssets.entityId],
    references: [entities.id],
  }),
  account: one(accounts, {
    fields: [fixedAssets.accountId],
    references: [accounts.id],
  }),
  depreciationAccount: one(accounts, {
    fields: [fixedAssets.depreciationAccountId],
    references: [accounts.id],
  }),
}));

// ===== جدول الموازنات =====
export const budgets = pgTable(
  "budgets",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    name: text("name").notNull(),
    accountId: text("account_id").references(() => accounts.id),
    costCenterId: text("cost_center_id").references(() => costCenters.id),
    period: text("period").notNull(), // 'monthly' | 'quarterly' | 'yearly'
    year: integer("year").notNull(),
    month: integer("month"), // 1-12 for monthly, null for yearly
    quarter: integer("quarter"), // 1-4 for quarterly
    budgetAmount: decimal("budget_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    actualAmount: decimal("actual_amount", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    variance: decimal("variance", { precision: 15, scale: 2 }).default("0"),
    currency: text("currency").default("YER").notNull(),
    notes: text("notes"),
    status: text("status").default("active").notNull(), // 'active' | 'closed' | 'draft'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    entityIdx: index("idx_budgets_entity").on(table.entityId),
    accountIdx: index("idx_budgets_account").on(table.accountId),
    costCenterIdx: index("idx_budgets_cost_center").on(table.costCenterId),
    yearIdx: index("idx_budgets_year").on(table.year),
  })
);

export const budgetsRelations = relations(budgets, ({ one }) => ({
  entity: one(entities, {
    fields: [budgets.entityId],
    references: [entities.id],
  }),
  account: one(accounts, {
    fields: [budgets.accountId],
    references: [accounts.id],
  }),
  costCenter: one(costCenters, {
    fields: [budgets.costCenterId],
    references: [costCenters.id],
  }),
}));
