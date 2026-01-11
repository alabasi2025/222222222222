# نظام محاسبي متعدد الكيانات (Multi-Entity Accounting System)

نظام محاسبي شامل يدعم الشركات القابضة والوحدات والفروع مع فصل شجرة الحسابات لكل وحدة.

## المميزات

- ✅ **هيكل متعدد المستويات**: شركة قابضة → وحدات → فروع
- ✅ **شجرة حسابات منفصلة**: كل وحدة لها شجرة حسابات خاصة بها
- ✅ **تصفية ذكية**: الشركة القابضة تعرض جميع الحسابات، الوحدات تعرض حساباتها فقط
- ✅ **ربط الحسابات بالفروع**: إمكانية ربط الحسابات الفرعية بفروع محددة
- ✅ **قاعدة بيانات PostgreSQL**: حفظ دائم للبيانات
- ✅ **API RESTful**: واجهة برمجية كاملة للعمليات CRUD

## التقنيات المستخدمة

### Frontend
- React 19 + TypeScript
- Vite
- Shadcn/ui Components
- TailwindCSS
- React Context API
- Wouter (Routing)

### Backend
- Node.js + Express
- PostgreSQL
- Drizzle ORM
- TypeScript

## التثبيت والتشغيل

### المتطلبات
- Node.js 22+
- PostgreSQL 18
- pnpm

### خطوات التثبيت

1. **تثبيت الحزم:**
```bash
pnpm install
```

2. **إعداد قاعدة البيانات:**
```bash
# إنشاء قاعدة البيانات
sudo -u postgres createdb accounting

# تعيين كلمة مرور لمستخدم postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# إنشاء الجداول
pnpm drizzle-kit push
```

3. **تهجير البيانات الأولية:**
```bash
pnpm seed
```

4. **تشغيل الخادم:**
```bash
# في terminal منفصل
pnpm dev:server
```

5. **تشغيل Frontend:**
```bash
# في terminal آخر
pnpm dev
```

6. **فتح التطبيق:**
افتح المتصفح على `http://localhost:3001`

## الهيكل التنظيمي

```
شركة أعمال العباسي (الشركة القابضة)
├── وحدة أعمال الحديدة (UNIT-001)
│   ├── فرع الدهمية (BR-003)
│   ├── فرع الصبالية (BR-004)
│   └── فرع غليل (BR-005)
└── وحدة العباسي خاص (UNIT-002)
    └── الفرع الرئيسي (BR-001)
```

## نموذج البيانات

### Entities (الكيانات)
- `id`: معرف فريد
- `name`: اسم الكيان
- `type`: نوع الكيان (holding/unit/branch)
- `parentId`: معرف الكيان الأب (للفروع)

### Accounts (الحسابات)
- `id`: رمز الحساب
- `name`: اسم الحساب
- `type`: نوع الحساب (asset/liability/equity/income/expense)
- `level`: مستوى الحساب في الشجرة
- `parentId`: معرف الحساب الأب
- `isGroup`: هل هو حساب رئيسي (مجموعة)
- `subtype`: النوع الفرعي (general/cash/bank/etc.)
- `entityId`: معرف الوحدة التي ينتمي لها الحساب
- `branchId`: معرف الفرع (اختياري)
- `currencies`: العملات المسموح بها
- `defaultCurrency`: العملة الافتراضية

### Cash Boxes (الصناديق)
- `id`: معرف فريد
- `entityId`: معرف الوحدة
- `name`: اسم الصندوق
- `balance`: الرصيد
- `currency`: العملة
- `accountId`: ربط بحساب في دليل الحسابات
- `branchId`: معرف الفرع
- `responsiblePerson`: الشخص المسؤول

### Banks & Wallets (البنوك والمحافظ)
- `id`: معرف فريد
- `entityId`: معرف الوحدة
- `name`: الاسم
- `type`: النوع (bank/exchange/wallet)
- `accountNumber`: رقم الحساب
- `chartAccountId`: ربط بحساب في دليل الحسابات
- `allowedCurrencies`: العملات المسموح بها
- `balances`: الأرصدة بالعملات المختلفة

## API Endpoints

### Entities
- `GET /api/entities` - جلب جميع الكيانات
- `GET /api/entities/:id` - جلب كيان محدد
- `POST /api/entities` - إنشاء كيان جديد
- `PUT /api/entities/:id` - تحديث كيان
- `DELETE /api/entities/:id` - حذف كيان

### Accounts
- `GET /api/accounts` - جلب جميع الحسابات
- `GET /api/accounts/:id` - جلب حساب محدد
- `GET /api/accounts/entity/:entityId` - جلب حسابات وحدة محددة
- `POST /api/accounts` - إنشاء حساب جديد
- `PUT /api/accounts/:id` - تحديث حساب
- `DELETE /api/accounts/:id` - حذف حساب

### Cash Boxes
- `GET /api/cash-boxes` - جلب جميع الصناديق
- `GET /api/cash-boxes/:id` - جلب صندوق محدد
- `GET /api/cash-boxes/entity/:entityId` - جلب صناديق وحدة محددة
- `POST /api/cash-boxes` - إنشاء صندوق جديد
- `PUT /api/cash-boxes/:id` - تحديث صندوق
- `DELETE /api/cash-boxes/:id` - حذف صندوق

### Banks & Wallets
- `GET /api/banks-wallets` - جلب جميع البنوك والمحافظ
- `GET /api/banks-wallets/:id` - جلب بنك/محفظة محددة
- `GET /api/banks-wallets/entity/:entityId` - جلب بنوك/محافظ وحدة محددة
- `POST /api/banks-wallets` - إنشاء بنك/محفظة جديدة
- `PUT /api/banks-wallets/:id` - تحديث بنك/محفظة
- `DELETE /api/banks-wallets/:id` - حذف بنك/محفظة

## متغيرات البيئة

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/accounting
```

### Frontend (client/.env)
```
VITE_API_URL=http://localhost:3000/api
```

## البناء للإنتاج

```bash
pnpm build
pnpm start
```

## الترخيص

MIT License
