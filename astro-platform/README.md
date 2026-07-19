# AstroLab — منصة إدارة التصوير الفلكي

منصة ويب احترافية مخصصة لمعداتك الفلكية، مع دليل مرجعي شامل و176 هدفاً سماوياً.

## معداتك المسجّلة

| النوع | المعدات |
|--------|---------|
| **حوامل** | Sky-Watcher EQ6-R Pro, EQ350 Pro |
| **تلسكopes** | Askar V (V60/V80), SharpStar SCA260, Celestron C11, WO MiniCat 51, Acuter Phoenix H-alpha |
| **كameras** | ZWO ASI2600MM Pro, ASI178MM, ASI678MM |
| **توجيه** | ASI120MM Mini + ZWO Mini Guide Scope 30mm |
| **فلاتر** | ZWO 7× Wheel, LRGB, Ha, OIII, SII, Antlia |
| **برامج** | ASIAIR, PixInsight, AutoStakkert!, AstroSurface |

## الأقسام

| الصفحة | الوصف |
|--------|-------|
| `/` | لوحة التحكم |
| `/equipment` | إدارة المعدات (حوامل، كameras، تلسكopes، توجيه، برامج) |
| `/gallery` | معرض صور — واجهة شبيه ASIAIR/NINA |
| `/guide` | **15 فصلاً** — دليل مرجعي احترافي |
| `/quick-ref` | بطاقات سريعة للهاتف أثناء الرصد |
| `/sky-map` | خريطة السماء الموسمية من العراق |
| `/calculator` | Pixel Scale + FOV لكل تركيبة |
| `/targets` | **176 هدفاً** مع توصيات كاملة |
| `/checklist` | قوائم فحص قبل/بعد الجلسة |

## الدليل المرجعي (15 فصلاً)

1. جرد المعدات
2. أفضل تركيبة لكل هدف
3. إعدادات ASIAIR لكل تلسكوب
4. إعدادات Guiding لكل بعد بؤري
5. إعدادات كameras ZWO
6. Pixel Scale / FOV (حاسبة تفاعلية)
7. تصوير الشمس (Phoenix H-alpha)
8. تصوير القمر
9. تصوير الكواكب (C11)
10. تصوير السدم (SHO/NB)
11. تصوير المجرات (LRGB)
12. المعالجة في PixInsight
13. 176 هدفاً سماوياً
14. حل مشاكل ASIAIR/Guiding
15. قوائم الفحص

## التشغيل

```bash
cd astro-platform
npm install
npm run dev
```

افتح http://localhost:3000

## التقنيات

- Next.js 14 + TypeScript + Tailwind CSS
- SQLite (better-sqlite3)
- بيانات مرجعية: 176 هدف، 30 تركibة FOV، 15 فصل دليل
