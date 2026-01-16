# دليل أدوات المتصفح (Browser Automation Tools)

**التاريخ**: 2026-01-16  
**الغرض**: شرح شامل لجميع أدوات المتصفح المتاحة وكيفية استخدامها

---

## نظرة عامة

أدوات المتصفح تسمح لي بالتفاعل مع واجهة المستخدم في المتصفح - فتح الصفحات، النقر على الأزرار، ملء النماذج، والتقاط الصور. هذه الأدوات مفيدة للاختبار والتنفيذ التلقائي.

---

## قائمة أدوات المتصفح المتاحة

### 1. التنقل (Navigation)

#### `browser_navigate`

**الاستخدام**: الانتقال إلى صفحة جديدة

```javascript
// مثال: فتح صفحة شجرة الحسابات
browser_navigate({
  url: "http://localhost:10002/coa",
});
```

**متى تستخدمه**:

- عند فتح صفحة جديدة للاختبار
- عند الانتقال بين صفحات النظام

---

#### `browser_navigate_back`

**الاستخدام**: الرجوع للصفحة السابقة

```javascript
browser_navigate_back();
```

**متى تستخدمه**:

- للعودة للصفحة السابقة بعد إكمال مهمة

---

### 2. التقاط المعلومات (Snapshots)

#### `browser_snapshot`

**الاستخدام**: التقاط snapshot للصفحة الحالية (رؤية جميع العناصر المتاحة)

```javascript
browser_snapshot();
```

**متى تستخدمه**:

- **بعد كل navigate** - لرؤية ما في الصفحة
- قبل التفاعل مع العناصر - لمعرفة ما متاح
- بعد تغيير في الصفحة - للتأكد من التحديث

**الناتج**: قائمة بجميع العناصر في الصفحة مع:

- النوع (button, textbox, combobox, إلخ)
- النص المرئي
- المرجع (ref) للاستخدام في التفاعلات

**مثال الناتج**:

```yaml
- button "حساب جديد" [ref=e195] [cursor=pointer]
- textbox "ابحث عن حساب..." [ref=e222]
- combobox [ref=e223] [cursor=pointer]
```

---

#### `browser_take_screenshot`

**الاستخدام**: التقاط صورة للصفحة أو عنصر محدد

```javascript
// التقاط صورة للصفحة كاملة
browser_take_screenshot({
  fullPage: true,
  filename: "page-screenshot.png",
});

// التقاط صورة لعنصر محدد
browser_take_screenshot({
  element: "نافذة حساب جديد",
  ref: "e441",
  filename: "dialog.png",
});
```

**متى تستخدمه**:

- لتوثيق الأخطاء (capture errors)
- للتحقق البصري من التغييرات
- لإنشاء دليل بصري

---

### 3. التفاعل مع العناصر (Interactions)

#### `browser_click`

**الاستخدام**: النقر على زر أو رابط

```javascript
browser_click({
  element: "حساب جديد", // وصف العنصر (للعرض)
  ref: "e195", // المرجع من snapshot
});
```

**المعاملات**:

- `element`: وصف العنصر (يظهر لك للتحقق)
- `ref`: المرجع الفريد من snapshot
- `doubleClick`: `true` للنقر المزدوج
- `button`: `"left"` | `"right"` | `"middle"`
- `modifiers`: `["Control", "Shift"]` للضغط مع أزرار أخرى

**متى تستخدمه**:

- فتح النوافذ المنبثقة
- الضغط على أزرار الحفظ/الإلغاء
- اختيار الخيارات من القوائم

**مثال**:

```javascript
// النقر على زر "حفظ"
browser_click({
  element: "زر حفظ",
  ref: "e484",
});

// النقر بالزر الأيمن
browser_click({
  element: "حساب المصاريف",
  ref: "e420",
  button: "right",
});
```

---

#### `browser_type`

**الاستخدام**: كتابة نص في حقل إدخال

```javascript
browser_type({
  element: "حقل اسم الحساب",
  ref: "e448",
  text: "استهلاك الديزل غليل",
});
```

**المعاملات**:

- `element`: وصف الحقل
- `ref`: المرجع من snapshot
- `text`: النص المراد كتابته
- `submit`: `true` لإرسال النموذج بعد الكتابة
- `slowly`: `true` للكتابة حرفاً بحرف (مفيد للـ handlers)

**متى تستخدمه**:

- ملء حقول النصوص
- البحث في حقول البحث
- إدخال الأرقام

**مثال**:

```javascript
// كتابة الاسم
browser_type({
  element: "اسم الحساب",
  ref: "e448",
  text: "استهلاك الديزل غليل",
});

// كتابة الرمز
browser_type({
  element: "رمز الحساب",
  ref: "e451",
  text: "8550",
});
```

---

#### `browser_select_option`

**الاستخدام**: اختيار خيار من قائمة منسدلة (dropdown)

```javascript
browser_select_option({
  element: "نوع الحساب",
  ref: "e455",
  values: ["expense"], // أو النص المرئي
});
```

**المعاملات**:

- `element`: وصف القائمة
- `ref`: المرجع من snapshot
- `values`: مصفوفة بالقيم المطلوبة

**متى تستخدمه**:

- اختيار من dropdown/combobox
- اختيار عدة خيارات (multi-select)

**ملاحظة**: أحياناً يكون `browser_click` أسهل - انقر على القائمة أولاً ثم اختر الخيار.

---

#### `browser_hover`

**الاستخدام**: تحريك المؤشر فوق عنصر (لإظهار tooltips أو menus)

```javascript
browser_hover({
  element: "زر القائمة",
  ref: "e264",
});
```

**متى تستخدمه**:

- لإظهار القوائم الفرعية
- لعرض tooltips
- لتفعيل hover effects

---

#### `browser_drag`

**الاستخدام**: سحب عنصر وإفلاته في مكان آخر

```javascript
browser_drag({
  startElement: "الحساب الأول",
  startRef: "e234",
  endElement: "المكان المستهدف",
  endRef: "e245",
});
```

**متى تستخدمه**:

- إعادة ترتيب العناصر (drag & drop)
- نقل العناصر بين المجموعات

---

### 4. العمل مع النماذج (Forms)

#### `browser_fill_form`

**الاستخدام**: ملء عدة حقول في نموذج دفعة واحدة

```javascript
browser_fill_form({
  fields: [
    {
      name: "اسم الحساب",
      ref: "e448",
      type: "textbox",
      value: "استهلاك الديزل غليل",
    },
    {
      name: "رمز الحساب",
      ref: "e451",
      type: "textbox",
      value: "8550",
    },
    {
      name: "نوع الحساب",
      ref: "e455",
      type: "combobox",
      value: "مصروفات",
    },
  ],
});
```

**متى تستخدمه**:

- عند ملء نماذج معقدة بعدة حقول
- لتسريع عملية الإدخال

---

### 5. الانتظار (Waiting)

#### `browser_wait_for`

**الاستخدام**: الانتظار حتى يظهر أو يختفي نص معين

```javascript
// الانتظار حتى يظهر نص
browser_wait_for({
  text: "تم إضافة الحساب بنجاح",
  time: 5, // timeout بالثواني
});

// الانتظار حتى يختفي نص
browser_wait_for({
  textGone: "جاري تحميل الحسابات...",
});

// الانتظار لمدة محددة
browser_wait_for({
  time: 2, // انتظر ثانيتين
});
```

**متى تستخدمه**:

- بعد النقر على زر - انتظر ظهور النتيجة
- بعد تحميل صفحة - انتظر حتى يكتمل التحميل
- بعد إرسال نموذج - انتظر رسالة النجاح/الخطأ

**مثال**:

```javascript
browser_click({ element: "حفظ", ref: "e484" });
browser_wait_for({ text: "تم إضافة الحساب بنجاح" });
```

---

### 6. تنفيذ JavaScript

#### `browser_evaluate`

**الاستخدام**: تنفيذ كود JavaScript في الصفحة

```javascript
// تنفيذ دالة في الصفحة
browser_evaluate({
  function: "() => { window.location.reload(); }",
});

// تنفيذ على عنصر محدد
browser_evaluate({
  element: "نافذة الحساب",
  ref: "e441",
  function: "(element) => { element.scrollIntoView(); }",
});
```

**متى تستخدمه**:

- لتحديث الصفحة (`location.reload()`)
- للتلاعب بـ DOM مباشرة
- لاستخراج بيانات من الصفحة
- للحصول على قيم JavaScript

**أمثلة**:

```javascript
// تحديث الصفحة
browser_evaluate({
  function: "() => { window.location.reload(); }",
});

// الحصول على عنوان URL الحالي
browser_evaluate({
  function: "() => { return window.location.href; }",
});

// الحصول على قيمة حقل
browser_evaluate({
  ref: "e448",
  function: "(element) => { return element.value; }",
});
```

---

### 7. التعامل مع الحوارات (Dialogs)

#### `browser_handle_dialog`

**الاستخدام**: التعامل مع نافذة منبثقة (alert, confirm, prompt)

```javascript
// قبول alert أو confirm
browser_handle_dialog({
  accept: true,
});

// رفض confirm
browser_handle_dialog({
  accept: false,
});

// قبول prompt مع نص
browser_handle_dialog({
  accept: true,
  promptText: "النص المراد إدخاله",
});
```

**متى تستخدمه**:

- مع `window.alert()`
- مع `window.confirm()`
- مع `window.prompt()`

---

### 8. معلومات إضافية

#### `browser_console_messages`

**الاستخدام**: الحصول على رسائل console في المتصفح

```javascript
browser_console_messages();
```

**متى تستخدمه**:

- للتحقق من أخطاء JavaScript
- لرؤية console.log messages
- لتصحيح المشاكل

---

#### `browser_network_requests`

**الاستخدام**: الحصول على طلبات الشبكة (API calls)

```javascript
browser_network_requests();
```

**متى تستخدمه**:

- لرؤية API calls التي تمت
- للتحقق من الأخطاء في الشبكة
- لرؤية headers و responses

---

### 9. إدارة التبويبات (Tabs)

#### `browser_tabs`

**الاستخدام**: إدارة تبويبات المتصفح

```javascript
// فتح تبويب جديد
browser_tabs({
  action: "new",
});

// إغلاق تبويب
browser_tabs({
  action: "close",
  index: 1,
});

// التبديل لتبويب
browser_tabs({
  action: "select",
  index: 0,
});

// عرض جميع التبويبات
browser_tabs({
  action: "list",
});
```

---

#### `browser_resize`

**الاستخدام**: تغيير حجم نافذة المتصفح

```javascript
browser_resize({
  width: 1920,
  height: 1080,
});
```

**متى تستخدمه**:

- لاختبار responsive design
- لتغيير حجم النافذة للاختبار

---

## سير العمل النموذجي (Workflow)

### مثال: إنشاء حساب جديد من المتصفح

```javascript
// 1. فتح الصفحة
browser_navigate({ url: "http://localhost:10002/coa" });

// 2. الانتظار حتى التحميل
browser_wait_for({ time: 2 });

// 3. التقاط snapshot لرؤية العناصر
browser_snapshot();

// 4. النقر على "حساب جديد"
browser_click({
  element: "حساب جديد",
  ref: "e195", // من snapshot
});

// 5. الانتظار قليلاً
browser_wait_for({ time: 0.5 });

// 6. التقاط snapshot للنافذة المنبثقة
browser_snapshot();

// 7. ملء الحقول
browser_type({
  element: "اسم الحساب",
  ref: "e448",
  text: "استهلاك الديزل غليل",
});

browser_type({
  element: "رمز الحساب",
  ref: "e451",
  text: "8550",
});

// 8. اختيار نوع الحساب
browser_click({
  element: "نوع الحساب",
  ref: "e455",
});
browser_wait_for({ time: 0.5 });
browser_click({
  element: "مصروفات",
  ref: "e501",
});

// 9. اختيار حساب فرعي
browser_click({
  element: "حساب فرعي",
  ref: "e468",
});

// 10. حفظ
browser_click({
  element: "حفظ",
  ref: "e484",
});

// 11. الانتظار لرسالة النجاح
browser_wait_for({
  text: "تم إضافة الحساب بنجاح",
});

// 12. التحقق - التقاط snapshot آخر
browser_snapshot();
```

---

## نصائح واستراتيجيات

### 1. استخدم Snapshot كثيراً

- بعد كل `navigate` → `snapshot`
- بعد كل تغيير في الصفحة → `snapshot`
- قبل التفاعل مع العناصر → `snapshot`

### 2. استخدم Wait بعد التفاعلات

- بعد `click` → انتظر التغيير
- بعد `type` → قد تحتاج wait للـ validation

### 3. استخدم refs من Snapshot

- لا تستخدم refs عشوائية
- دائماً خذ refs من snapshot حديث

### 4. معالجة الأخطاء

```javascript
// إذا فشل click، جرب مرة أخرى
try {
  browser_click({ ... })
} catch {
  browser_wait_for({ time: 1 })
  browser_snapshot()  // لرؤية ما تغير
  browser_click({ ... })  // المحاولة مرة أخرى
}
```

### 5. التوقيت مهم

- بعض العناصر تحتاج وقت للظهور
- استخدم `wait_for` مع `text` بدلاً من `time` ثابت

---

## حالات الاستخدام الشائعة

### 1. ملء نموذج كامل

```
navigate → snapshot → click (فتح النموذج) → wait → snapshot
→ type (الحقل 1) → type (الحقل 2) → click (dropdown)
→ wait → click (الخيار) → click (حفظ) → wait (رسالة)
```

### 2. البحث والتصفية

```
navigate → snapshot → type (في حقل البحث) → wait → snapshot
```

### 3. التنقل بين الصفحات

```
navigate (صفحة 1) → snapshot → click (رابط)
→ wait → snapshot → navigate_back → snapshot
```

### 4. الاختبار التفاعلي

```
navigate → snapshot → click → wait → snapshot
→ click → wait → evaluate (للتحقق من النتيجة)
```

---

## أمثلة عملية

### مثال 1: إنشاء حساب من الواجهة

راجع الملف: `GUIDE_CREATE_ACCOUNT_BROWSER.md`

### مثال 2: البحث عن حساب

```javascript
// فتح صفحة الحسابات
browser_navigate({ url: "http://localhost:10002/coa" });
browser_wait_for({ time: 2 });
browser_snapshot();

// البحث عن "غليل"
browser_type({
  element: "حقل البحث",
  ref: "e222",
  text: "غليل",
});

browser_wait_for({ time: 1 });
browser_snapshot(); // لرؤية النتائج
```

### مثال 3: فتح وتوسيع حساب

```javascript
// فتح "المصاريف التشغيلية"
browser_click({
  element: "فتح المصاريف التشغيلية",
  ref: "e421",
});

browser_wait_for({ time: 1 });
browser_snapshot(); // لرؤية الحسابات الفرعية
```

---

## الأخطاء الشائعة

### ❌ خطأ: "Element not found"

**السبب**: استخدام ref قديم أو غير صحيح

**الحل**:

- خذ snapshot جديد
- استخدم ref من آخر snapshot

### ❌ خطأ: "Timeout"

**السبب**: العنصر لم يظهر في الوقت المحدد

**الحل**:

- زد وقت الانتظار
- استخدم `wait_for` مع `text` بدلاً من `time`

### ❌ خطأ: "Element not clickable"

**السبب**: العنصر مخفي أو مغطى بعنصر آخر

**الحل**:

- استخدم `wait_for` قبل click
- جرب `evaluate` لـ `scrollIntoView()`

---

## الخلاصة

### الأدوات الأساسية التي تحتاجها دائماً:

1. ✅ `browser_navigate` - للانتقال
2. ✅ `browser_snapshot` - لرؤية الصفحة
3. ✅ `browser_click` - للنقر
4. ✅ `browser_type` - للكتابة
5. ✅ `browser_wait_for` - للانتظار

### الأدوات المتقدمة:

- `browser_evaluate` - للـ JavaScript
- `browser_fill_form` - لملء النماذج
- `browser_take_screenshot` - للتوثيق

---

**تاريخ الإنشاء**: 2026-01-16  
**آخر تحديث**: 2026-01-16
