# تعليمات تثبيت أدوات AI - 2026-01-11

## ⚠️ ملاحظة مهمة

معظم أدوات AI هي **Extensions لـ VS Code/Cursor** وليست npm packages، لذا تحتاج تثبيت من داخل المحرر.

---

## 📦 الأدوات التي يمكن تثبيتها عبر CLI

### 1. Aider (AI Coding Assistant)

**إذا كان Python مثبت:**

```bash
pip install aider-chat
```

**الاستخدام:**

```bash
aider
```

---

## 🔌 الأدوات التي تحتاج تثبيت يدوي (Extensions)

### الطريقة العامة لتثبيت Extensions:

1. **افتح Cursor/VS Code**
2. **اضغط `Ctrl+Shift+X`** (أو `Cmd+Shift+X` على Mac)
3. **ابحث عن Extension** وثبت
4. **سجل الدخول** إذا لزم الأمر

---

### 1. GitHub Copilot ⭐⭐⭐⭐⭐

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"GitHub Copilot"**
3. اضغط Install
4. سجل الدخول بحساب GitHub
5. فعّل Copilot

**الرابط:** https://github.com/features/copilot

**التكلفة:**

- مجاني للطلاب
- $10/شهر للأفراد

---

### 2. Codeium ⭐⭐⭐⭐ (مجاني)

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"Codeium"**
3. اضغط Install
4. إنشاء حساب مجاني

**الرابط:** https://codeium.com/

**التكلفة:** مجاني تماماً

---

### 3. Codium AI ⭐⭐⭐⭐ (لإنشاء Tests)

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"Codium AI"**
3. اضغط Install
4. إنشاء حساب

**الرابط:** https://www.codium.ai/

**التكلفة:**

- Free tier متوفر
- Pro: $19/شهر

---

### 4. Continue ⭐⭐⭐⭐ (مفتوح المصدر)

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"Continue"**
3. اضغط Install

**الرابط:** https://continue.dev/

**التكلفة:** مجاني (مفتوح المصدر)

---

### 5. Mintlify Doc Writer ⭐⭐⭐⭐ (للتوثيق)

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"Mintlify Doc Writer"**
3. اضغط Install

**الرابط:** https://mintlify.com/

**التكلفة:** مجاني

---

### 6. Auto Comment Blocks ⭐⭐⭐

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"Auto Comment Blocks"**
3. اضغط Install

---

### 7. Tabnine ⭐⭐⭐⭐

**التثبيت:**

1. Extensions (`Ctrl+Shift+X`)
2. ابحث عن: **"Tabnine"**
3. اضغط Install

**الرابط:** https://www.tabnine.com/

---

## 💻 تطبيقات IDE (تحتاج تحميل منفصل)

### 1. Cursor IDE ⭐⭐⭐⭐⭐ (الأفضل)

**التثبيت:**

1. زيارة: https://cursor.sh/
2. تحميل Cursor
3. تثبيت Cursor
4. فتح المشروع في Cursor

**المميزات:**

- AI Chat مدمج (`Ctrl+L`)
- Code generation (`Ctrl+K`)
- Works مع جميع Extensions

**التكلفة:**

- Free tier متوفر
- Pro: $20/شهر

---

## 🚀 سكريبت تثبيت سريع

تم إنشاء سكريبت PowerShell: `install-ai-tools.ps1`

**لتشغيله:**

```powershell
.\install-ai-tools.ps1
```

**ملاحظة:** قد تحتاج لتغيير ExecutionPolicy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📋 قائمة التحقق (Checklist)

### الخطوة 1: تثبيت Cursor IDE (إذا لم يكن مثبت)

- [ ] تحميل Cursor من https://cursor.sh/
- [ ] تثبيت Cursor
- [ ] فتح المشروع في Cursor

### الخطوة 2: تثبيت Extensions في Cursor

- [ ] GitHub Copilot أو Codeium
- [ ] Codium AI (لإنشاء Tests)
- [ ] Continue (اختياري)
- [ ] Mintlify Doc Writer (اختياري)

### الخطوة 3: تثبيت أدوات CLI (إذا لزم الأمر)

- [ ] Aider (إذا كان Python مثبت)
  ```bash
  pip install aider-chat
  ```

---

## 🎯 ترتيب الأولويات

### الأولوية العالية (يُنصح بشدة):

1. ✅ **Cursor IDE** - محرر كود مع AI مدمج
2. ✅ **GitHub Copilot** أو **Codeium** - للكود completion
3. ✅ **Codium AI** - لإنشاء tests

### الأولوية المتوسطة:

4. ✅ **Continue** - بديل مفتوح المصدر
5. ✅ **Mintlify Doc Writer** - للتوثيق

### الأولوية المنخفضة (اختياري):

6. ✅ **Tabnine**
7. ✅ **Auto Comment Blocks**
8. ✅ **Aider** (إذا كان Python مثبت)

---

## 📝 ملاحظات مهمة

1. **Cursor IDE هو الأفضل:**
   - مبني على VS Code + AI مدمج
   - Works مع جميع Extensions
   - تجربة AI ممتازة

2. **GitHub Copilot vs Codeium:**
   - GitHub Copilot: مدفوع ($10/شهر)
   - Codeium: مجاني تماماً
   - كلاهما ممتاز

3. **Codium AI:**
   - ممتاز لإنشاء tests
   - يعمل مع Vitest (موجود في مشروعك)

4. **Continue:**
   - مفتوح المصدر
   - دعم Claude, GPT-4, وغيرها
   - مجاني تماماً

---

## 🔗 روابط سريعة

- **Cursor IDE:** https://cursor.sh/
- **GitHub Copilot:** https://github.com/features/copilot
- **Codeium:** https://codeium.com/
- **Codium AI:** https://www.codium.ai/
- **Continue:** https://continue.dev/
- **Mintlify:** https://mintlify.com/

---

## ✅ الخطوات التالية

1. **تثبيت Cursor IDE** (إذا لم يكن مثبت)
2. **فتح المشروع في Cursor**
3. **تثبيت Extensions المطلوبة:**
   - GitHub Copilot أو Codeium
   - Codium AI
4. **البدء في استخدام AI Chat** (`Ctrl+L` في Cursor)

---

**النظام الآن جاهز للاستخدام مع AI!** 🚀
