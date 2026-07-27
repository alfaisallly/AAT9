# Animation Chart

أداة لإنشاء **مخططات تقنية متحركة** لمراكز البيانات خلال دقائق — بدون أدوات معقدة وبدون مهارات تصميم.

## الميزات (النسخة الأولية)

- **قالب مركز بيانات مؤسسي** جاهز: رفوف، خوادم، مبدّلات، موجّهات، جدار ناري، موازن حمل، تخزين SAN، PDU، وتبريد
- **مكوّنات قابلة للسحب والإضافة** مع خصائص تقنية (IP، طراز، مقاييس CPU/RAM/حرارة/طاقة)
- **روابط متحركة** تمثل تدفق البيانات (Ethernet، Fiber، Power، Management)
- **اختبار الربط** ي simulates ping/latency/packet loss/bandwidth لكل رابط شبكي
- **واجهة عربية/إنجليزية**

## التشغيل

```bash
cd animation-chart
npm install
npm run dev
```

افتح `http://localhost:5173`

## البناء للإنتاج

```bash
npm run build
npm run preview
```

## الاستخدام السريع

1. يُحمّل تلقائياً قالب **Enterprise Data Center**
2. انقر **تشغيل** لمشاهدة حزم البيانات المتحركة على الروابط
3. انقر **تشغيل الاختبار** للتحقق من جميع روابط Ethernet/Fiber
4. أضف مكوّنات من الشريط الجانبي واربطها بسحب المقابض بين العقد
5. انقر أي مكوّن لتعديل IP والحالة (Online/Offline/Testing)

## التقنيات

- React 19 + TypeScript + Vite
- [@xyflow/react](https://reactflow.dev/) للمخططات التفاعلية
- Lucide React للأيقونات

## الخطوات القادمة المقترحة

- تصدير SVG/MP4 للمخططات
- قوالب إضافية (Colocation، Edge DC، DR Site)
- محاكاة failover ومسارات redundancy
- استيراد/تصدير JSON للمخططات
