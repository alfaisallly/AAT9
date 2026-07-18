# AstroLab — منصة إدارة التصوير الفلكي

منصة ويب احترافية لإدارة صور التصوير الفلكي، مع دعم عدة حوامل وكاميرات وتلسكopes.

## المميزات

- **إدارة المعدات**: حوامل (Mounts)، كاميرات، وتلسكopes
- **جلسات المراقبة**: تسجيل ليالي المراقبة وربط المعدات المستخدمة
- **مكتبة الصور**: إدارة إطارات Light / Dark / Flat / Bias مع بيانات التعريض
- **الأهداف السماوية**: كatalog للمجرات والسدم والأهداف
- **لوحة تحكم**: إحصائيات شاملة عن معداتك وصورك
- **واجهة عربية**: دعم RTL كامل

## التشغيل

```bash
cd astro-platform
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## البنية التقنية

- **Next.js 14** — إطار React مع App Router
- **SQLite** — قاعدة بيانات محلية (better-sqlite3)
- **Tailwind CSS** — تصميم داكن بموضوع فلكي
- **TypeScript** — أنواع آمنة

## API

| Endpoint | الوصف |
|----------|-------|
| `GET /api/dashboard` | إحصائيات لوحة التحكم |
| `GET/POST/DELETE /api/mounts` | إدارة الحوامل |
| `GET/POST/DELETE /api/cameras` | إدارة الكاميرات |
| `GET/POST/DELETE /api/telescopes` | إدارة التلسكopes |
| `GET/POST/DELETE /api/sessions` | جلسات المراقبة |
| `GET/POST/PATCH/DELETE /api/images` | مكتبة الصور |
| `GET/POST/DELETE /api/targets` | الأهداف السماوية |
| `GET /api/filters` | قائمة الفلاتر |

## البيانات التجريبية

عند أول تشغيل، تُنشأ قاعدة بيانات مع بيانات تجريبية:
- 3 حوامل (EQ6-R, AM5, CEM70)
- 3 كاميرات (ASI2600MC, ASI6200MM, ASI678MC)
- 3 تلسكopes
- جلسات وصور نموذجية

## التطوير المستقبلي

- رفع ملفات FITS/RAW فعلية
- معاينة الصور
- تكامل مع NINA / SGP / Ekos
- تصدير بيانات FITS headers
- دعم متعدد المستخدمين
