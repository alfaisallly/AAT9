# AstroLab v1.0.0-trial — Windows

نسخة تجريبية أولى للعمل على **Windows** مع قراءة الأجهزة عبر **USB/COM**.

**Eng. Ahmed alfaisal**

---

## المتطلبات

| البرنامج | الإصدار |
|----------|---------|
| Windows | 10 / 11 (64-bit) |
| Node.js | 18 أو أحدث |
| USB Drivers | ZWO ASI / FTDI / CH340 حسب معداتك |

---

## التثبيت (مرة واحدة)

1. ثبّت Node.js من https://nodejs.org
2. ثبّت تعريفات ZWO ASI Camera (للكامeras ZWO)
3. افتح **Command Prompt** في مجلد `astro-platform`
4. شغّل:

```bat
scripts\install-trial-windows.bat
```

---

## التشغيل

```bat
scripts\start-trial-windows.bat
```

يفتح:
- **USB Bridge** على `http://127.0.0.1:18881`
- **AstroLab** على `http://localhost:3000`

---

## ربط المعدات USB

1. وصّل الكاميرا / الحامل / Guider بكابل USB
2. افتح التطبيق → **Equipment → USB**
3. اضغط **Scan USB**
4. ستظهر الأجهزة مع نوعها (ZWO Camera, COM Port, Mount...)

### أجهزة مدعومة في v1.0.0-trial

| النوع | الطريقة |
|-------|---------|
| ZWO Cameras (ASI) | USB VID detection |
| Mount EQMOD/SynScan | COM port (USB-Serial) |
| Guiders | COM / USB |
| Filter Wheel EFW | USB ZWO |
| FTDI / CH340 adapters | COM port listing |

---

## تسجيل الدخول

| المستخدم | كلمة المرور |
|----------|-------------|
| `ahmed.alfaisal` | `AstroLab2026` |
| `astro` | `Astro2026` |

---

## الإصدار

**v1.0.0-trial** — قراءة USB/COM، ASIAIR simulation، إدارة Equipment

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| USB Bridge غير متصل | شغّل `start-trial-windows.bat` |
| لا تظهر أجهزة | Run as Administrator + Scan USB |
| COM port missing | ثبّت FTDI/CH340 drivers |
| ZWO camera not read | ثبّت ZWO ASI SDK |

---

© Eng. Ahmed alfaisal — AstroLab
