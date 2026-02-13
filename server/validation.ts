import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// ===== دالة تنظيف النصوص من XSS =====
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// تنظيف كائن كامل بشكل عميق
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

// ===== Middleware للتحقق من المدخلات =====
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // تنظيف المدخلات من XSS أولاً
      req.body = sanitizeObject(req.body);
      // التحقق من المدخلات
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "بيانات غير صالحة",
          details: result.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      req.body = result.data;
      next();
    } catch {
      return res.status(400).json({ error: "خطأ في التحقق من المدخلات" });
    }
  };
}

// ===== Middleware عام لتنظيف XSS في جميع الطلبات =====
export function xssMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// ===== مخططات التحقق (Zod Schemas) =====

// الكيانات
export const entitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "اسم الكيان مطلوب").max(200),
  type: z.enum(["holding", "unit", "branch"], { message: "نوع الكيان مطلوب" }),
  parentId: z.string().nullable().optional(),
});

// الحسابات
export const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "اسم الحساب مطلوب").max(200),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"], {
    message: "نوع الحساب مطلوب",
  }),
  level: z.number().int().min(1).max(10),
  balance: z.union([z.string(), z.number()]).optional(),
  parentId: z.string().nullable().optional(),
  isGroup: z.boolean().optional(),
  subtype: z.string().nullable().optional(),
  currencies: z.array(z.string()).optional(),
  allowedCurrencies: z.array(z.string()).optional(),
  defaultCurrency: z.string().optional(),
  accountGroup: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
});

// الصناديق
export const cashBoxSchema = z.object({
  id: z.string().optional(),
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  name: z.string().min(1, "اسم الصندوق مطلوب").max(200),
  accountId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  type: z.enum(["cash_box", "employee_custody"], {
    message: "نوع الصندوق مطلوب",
  }),
  currencies: z.array(z.string()).optional(),
  defaultCurrency: z.string().optional(),
  balance: z.union([z.string(), z.number()]).optional(),
  responsible: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// البنوك والمحافظ
export const bankWalletSchema = z.object({
  id: z.string().optional(),
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  name: z.string().min(1, "اسم البنك/المحفظة مطلوب").max(200),
  chartAccountId: z.string().nullable().optional(),
  type: z.enum(["bank", "wallet", "exchange"], { message: "النوع مطلوب" }),
  accountType: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  currencies: z.array(z.string()).optional(),
  balance: z.union([z.string(), z.number()]).optional(),
  isActive: z.boolean().optional(),
});

// القيود اليومية
export const journalEntrySchema = z.object({
  id: z.string().optional(),
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  branchId: z.string().nullable().optional(),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().min(1, "الوصف مطلوب").max(500),
  reference: z.string().nullable().optional(),
  type: z.enum(["manual", "auto"]).optional().default("manual"),
  status: z.enum(["draft", "posted", "cancelled"]).optional().default("draft"),
  createdBy: z.string().nullable().optional(),
  lines: z
    .array(
      z.object({
        id: z.string().optional(),
        accountId: z.string().min(1, "معرف الحساب مطلوب"),
        debit: z.union([z.string(), z.number()]).optional().default(0),
        credit: z.union([z.string(), z.number()]).optional().default(0),
        currency: z.string().optional().default("YER"),
        description: z.string().nullable().optional(),
      })
    )
    .min(2, "يجب أن يحتوي القيد على سطرين على الأقل"),
});

// سندات الصرف/القبض
export const paymentVoucherSchema = z.object({
  id: z.string().optional(),
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  type: z.enum(["in", "out"], { message: "نوع السند مطلوب" }),
  cashBoxId: z.string().nullable().optional(),
  bankWalletId: z.string().nullable().optional(),
  date: z.string().min(1, "التاريخ مطلوب"),
  currency: z.string().optional().default("YER"),
  exchangeRate: z.union([z.string(), z.number()]).optional().default("1"),
  totalAmount: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, "المبلغ يجب أن يكون أكبر من صفر"),
  reference: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  operations: z
    .array(
      z.object({
        id: z.string().optional(),
        accountType: z.string().min(1),
        accountSubtype: z.string().min(1),
        chartAccountId: z.string().min(1),
        analyticalAccountId: z.string().nullable().optional(),
        amount: z.union([z.string(), z.number()]),
        description: z.string().nullable().optional(),
      })
    )
    .min(1, "يجب أن يحتوي السند على عملية واحدة على الأقل"),
});

// المستودعات
export const warehouseSchema = z.object({
  id: z.string().optional(),
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  branchId: z.string().nullable().optional(),
  name: z.string().min(1, "اسم المستودع مطلوب").max(200),
  code: z.string().min(1, "كود المستودع مطلوب"),
  address: z.string().nullable().optional(),
  manager: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  type: z.enum(["main", "sub", "transit"]).optional().default("main"),
  isActive: z.boolean().optional(),
});

// فئات الأصناف
export const itemCategorySchema = z.object({
  id: z.string().optional(),
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  name: z.string().min(1, "اسم الفئة مطلوب").max(200),
  parentId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ===== مخطط العملاء =====
export const customerSchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  name: z.string().min(1, { message: "اسم العميل مطلوب" }).max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email({ message: "البريد الإلكتروني غير صالح" })
    .optional()
    .nullable(),
  address: z.string().max(500).optional().nullable(),
  taxNumber: z.string().max(50).optional().nullable(),
  contactPerson: z.string().max(200).optional().nullable(),
  accountId: z.string().optional().nullable(),
  creditLimit: z.string().optional().nullable(),
  balance: z.string().optional().nullable(),
  currency: z.string().default("YER"),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
});

// ===== مخطط الموردين =====
export const supplierSchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  name: z.string().min(1, { message: "اسم المورد مطلوب" }).max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email({ message: "البريد الإلكتروني غير صالح" })
    .optional()
    .nullable(),
  address: z.string().max(500).optional().nullable(),
  taxNumber: z.string().max(50).optional().nullable(),
  contactPerson: z.string().max(200).optional().nullable(),
  accountId: z.string().optional().nullable(),
  creditLimit: z.string().optional().nullable(),
  balance: z.string().optional().nullable(),
  currency: z.string().default("YER"),
  paymentTerms: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
});

// ===== مخطط جهات الاتصال =====
export const contactSchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  name: z.string().min(1, { message: "اسم جهة الاتصال مطلوب" }).max(200),
  type: z.string().min(1, { message: "نوع جهة الاتصال مطلوب" }),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email({ message: "البريد الإلكتروني غير صالح" })
    .optional()
    .nullable(),
  address: z.string().max(500).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  position: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  customerId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// ===== مخطط العملات =====
export const currencySchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  code: z.string().min(1, { message: "رمز العملة مطلوب" }).max(10),
  name: z.string().min(1, { message: "اسم العملة مطلوب" }).max(100),
  nameEn: z.string().max(100).optional().nullable(),
  symbol: z.string().min(1, { message: "رمز العملة مطلوب" }).max(10),
  exchangeRate: z.string().default("1"),
  isBase: z.boolean().default(false),
  isActive: z.boolean().default(true),
  decimalPlaces: z.number().int().min(0).max(6).default(2),
});

// ===== مخطط مراكز التكلفة =====
export const costCenterSchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  name: z.string().min(1, { message: "اسم مركز التكلفة مطلوب" }).max(200),
  code: z.string().min(1, { message: "رمز مركز التكلفة مطلوب" }).max(50),
  type: z.string().default("operational"),
  parentId: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  budget: z.string().optional().nullable(),
  actualSpending: z.string().optional().nullable(),
  status: z.string().default("active"),
  isActive: z.boolean().default(true),
});

// ===== مخطط الأصول الثابتة =====
export const fixedAssetSchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  name: z.string().min(1, { message: "اسم الأصل مطلوب" }).max(200),
  code: z.string().min(1, { message: "رمز الأصل مطلوب" }).max(50),
  category: z.string().min(1, { message: "فئة الأصل مطلوبة" }),
  purchaseDate: z.string().min(1, { message: "تاريخ الشراء مطلوب" }),
  purchasePrice: z.string().min(1, { message: "سعر الشراء مطلوب" }),
  currentValue: z.string().min(1, { message: "القيمة الحالية مطلوبة" }),
  depreciationRate: z.string().optional().nullable(),
  depreciationMethod: z.string().default("straight_line"),
  usefulLife: z.number().int().optional().nullable(),
  salvageValue: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  depreciationAccountId: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  status: z.string().default("active"),
  notes: z.string().max(1000).optional().nullable(),
});

// ===== مخطط الموازنات =====
export const budgetSchema = z.object({
  entityId: z.string().min(1, { message: "معرف الكيان مطلوب" }),
  name: z.string().min(1, { message: "اسم الموازنة مطلوب" }).max(200),
  accountId: z.string().optional().nullable(),
  costCenterId: z.string().optional().nullable(),
  period: z.string().min(1, { message: "الفترة مطلوبة" }),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional().nullable(),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  budgetAmount: z.string().min(1, { message: "مبلغ الموازنة مطلوب" }),
  actualAmount: z.string().optional().nullable(),
  variance: z.string().optional().nullable(),
  currency: z.string().default("YER"),
  notes: z.string().max(1000).optional().nullable(),
  status: z.string().default("active"),
});
