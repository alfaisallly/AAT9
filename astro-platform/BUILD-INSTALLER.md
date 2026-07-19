# AstroLab — ملف التثبيت لـ Windows

**الإصدار:** v1.0.0-trial  
**Eng. Ahmed alfaisal**

---

## ملفات التثبيت

| Windows | الملف |
|---------|-------|
| **64-bit** (معظم الحاسبات) | `AstroLab-1.0.0-trial-x64-Setup.exe` |
| **32-bit** (حاسبات قديمة) | `AstroLab-1.0.0-trial-ia32-Setup.exe` |

---

## بناء ملف التثبيت على Windows

### الطريقة السريعة

```bat
cd astro-platform
scripts\build-installer-windows.bat
```

الملفات تظهر في مجلد `dist\`

### يدوياً

```bat
npm install
npm run build:installer:x64    rem 64-bit
npm run build:installer:x86    rem 32-bit
npm run build:installer        rem كلاهما
```

---

## التثبيت للمستخدم

1. حمّل الملف المناسب (x64 أو ia32)
2. شغّل **Setup.exe**
3. اتبع خطوات التثبيت
4. افتح **AstroLab** من سطح المكتب
5. وصّل معدات USB → **Equipment → USB → Scan**

---

## GitHub Actions (بناء تلقائي)

عند الدفع للفرع `cursor/windows-trial-v1-6241`:
- Actions → **Build AstroLab Windows Installer**
- حمّل الـ `.exe` من **Artifacts**

---

## المتطلبات

- Windows 10 / 11
- لا يحتاج Node.js بعد التثبيت (مدمج داخل التطبيق)
- تعريفات ZWO ASI للكامeras ZWO

---

© Eng. Ahmed alfaisal
