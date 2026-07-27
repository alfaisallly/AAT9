# Animation Chart

أداة لإنشاء **مخططات تقنية متحركة** لمراكز البيانات — مع إدارة المخططات، ربط بالبيئة الحقيقية، وتحليل AI.

## الميزات

- **إدارة المخططات**: إنشاء · حذف · إعادة تسمية · نسخ · حفظ تلقائي (localStorage)
- **إضافة/حذف مكوّنات وروابط** من اللوحة أو بمفتاح Delete
- **9 أنواع مكوّنات** + قالب مركز بيانات مؤسسي
- **وضع محاكاة** أو **بيئة حقيقية** (ping + HTTP health check)
- **تحليل AI** (OpenAI) + **تحليل محلي** ذكي بدون API
- **واجهة عربية/إنجليزية**

## التشغيل

```bash
cd animation-chart
npm install

# واجهة فقط (محاكاة)
npm run dev

# واجهة + API للبيئة الحقيقية و AI
npm run dev:full
```

افتح `http://localhost:5173`

## البيئة الحقيقية

1. شغّل `npm run dev:full`
2. من تبويب **البيئة**: اختر **بيئة حقيقية**
3. أدخل **IP** أو **Real host** و **Health URL** لكل مكوّن
4. اضغط **مزامنة الآن** أو **تشغيل الاختبار**

## تحليل AI

1. من تبويب **البيئة**: أدخل مفتاح OpenAI (اختياري)
2. من تبويب **AI**: **تحليل محلي** (فوري) أو **تحليل AI** (GPT)

## API

| Endpoint | الوصف |
|----------|--------|
| `GET /api/health` | حالة الخادم |
| `POST /api/probe/host` | فحص host/ping/HTTP |
| `POST /api/probe/batch` | فحص مجموعة مكوّنات |
| `POST /api/probe/link` | فحص رابط بين مضيفين |
| `POST /api/ai/analyze` | تحليل AI عبر OpenAI |

## التقنيات

React 19 · TypeScript · Vite · @xyflow/react · Express
