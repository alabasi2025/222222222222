# قائمة فحص الأدوات - Windows

## ✅ الأدوات المثبتة

### أساسية:
- [x] Node.js v22.17.1
- [x] pnpm 10.4.1
- [x] Git 2.52.0
- [x] PostgreSQL (مثبت في C:\Program Files\PostgreSQL)

### في المشروع:
- [x] ESLint 9.39.2
- [x] Prettier 3.6.2
- [x] TypeScript 5.6.3
- [x] Husky 9.1.7
- [x] lint-staged 16.2.7

---

## ❌ يحتاج تثبيت/إعداد

### 1. ESLint Config ✅ تم
- [x] ملف `eslint.config.js` تم إنشاؤه

### 2. Husky Init ⚠️ يحتاج
```bash
npx husky init
```

### 3. pgAdmin ❌ يحتاج تثبيت
- رابط: https://www.pgadmin.org/download/pgadmin-4-windows/

### 4. VS Code ⚠️ يحتاج إضافة إلى PATH
- إذا كان مثبت، أضفه إلى PATH:
  - Ctrl+Shift+P > "Shell Command: Install 'code' command"

### 5. Postman ❌ يحتاج تثبيت (اختياري)
- رابط: https://www.postman.com/downloads/
- أو استخدم Thunder Client في VS Code

### 6. DBeaver ❌ يحتاج تثبيت (اختياري)
- رابط: https://dbeaver.io/download/

---

## 🚀 الأوامر السريعة

### تهيئة Husky:
```bash
npx husky init
```

### تثبيت الحزم المفقودة:
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier husky lint-staged concurrently
```

### تشغيل السكريبت:
```powershell
.\install-windows-tools.ps1
```

---

## 📚 روابط التثبيت

- **PostgreSQL**: https://www.postgresql.org/download/windows/
- **pgAdmin**: https://www.pgadmin.org/download/pgadmin-4-windows/
- **VS Code**: https://code.visualstudio.com/
- **Postman**: https://www.postman.com/downloads/
- **DBeaver**: https://dbeaver.io/download/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop

---

## ✅ ملاحظات

1. بعد تثبيت أي أداة، أعد تشغيل Terminal
2. PostgreSQL قد يحتاج إضافة bin إلى PATH يدوياً
3. VS Code يحتاج إضافة إلى PATH من داخل التطبيق
