# إعداد نظام EmoLive Replay الموازي

## ما تم تغييره

- أُلغي نظام `snapshotHtml` ونسخ الـDOM والـComputed Styles والخطوط بصيغة Base64 نهائيًا.
- أحداث الريبلاي أصبحت أكشنات خفيفة فقط: حركة المؤشر، النقر، السكرول، الإدخال المسموح، تغيير الحالة، تغيير المقاس، وحالة الصفحة.
- الأحداث العادية وأحداث الريبلاي أصبحت مسارين منفصلين داخل `ops_events` عبر العمود `event_stream`.
- `/api/ops/events` يعيد الأحداث العادية المختصرة فقط ولا يعيد `payload` كاملًا.
- `/api/ops/replay` يحمل أحداث جلسة كاملة عند طلب المشاهدة فقط.
- نسخة Replay من Astro تعرض الصفحات نفسها و`SiteIntro` نفسه، لكنها لا تضم Analytics أو Clarity أو OpsVisitTracker أو EmoReplayRecorder أو Speed Insights.
- نسخة Replay تمنع الإرسال الحقيقي للنماذج، روابط الاتصال وواتساب، الانتقال الخارجي، والطلبات المعدلة للبيانات أثناء إعادة التشغيل.

## 1. تنفيذ ترحيل Supabase قبل نشر الكود

افتح Supabase.

افتح SQL Editor.

شغّل الملف:

```text
supabase/2026-07-24_replay_stream.sql
```

الملف يضيف `event_stream`، يصنف السجلات الموجودة، يحذف Snapshots القديمة، وينشئ الفهارس المطلوبة.

## 2. متغيرات مشروع Vercel الرئيسي

اضبط المتغيرات التالية في مشروع الموقع الرسمي:

```text
EMO_DEPLOY_MODE=production
EMO_REPLAY_ORIGIN=https://اسم-مشروع-الريبلاي.vercel.app
PUBLIC_EMO_OPS_ENABLED=true
```

وتظل المتغيرات الحالية موجودة كما هي:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPS_API_KEY
```

متغيرات الضبط الاختيارية للريبلاي المسجل من الموقع:

```text
PUBLIC_EMO_REPLAY_POINTER_EVERY_MS=250
PUBLIC_EMO_REPLAY_SCROLL_EVERY_MS=200
PUBLIC_EMO_REPLAY_FLUSH_EVERY_MS=1500
PUBLIC_EMO_REPLAY_NETWORK_BATCH=160
```

`EMO_REPLAY_ORIGIN` يجب أن يحتوي أصل الدومين فقط، من غير مسار صفحة.

## 3. إنشاء مشروع Vercel الموازي

أنشئ مشروعًا جديدًا في Vercel من نفس Git Repository ونفس الفرع ونفس Root Directory.

اسم مقترح:

```text
emocrete-replay
```

اترك Build Command الافتراضي أو استخدم:

```text
npm run build
```

اضبط في مشروع Replay:

```text
EMO_DEPLOY_MODE=replay
PUBLIC_EMO_OPS_ENABLED=false
```

اضبط المتغيرين في بيئات Production وPreview وDevelopment داخل مشروع Replay حتى لا يتحول أي Preview Build إلى نسخة تتبع.

لا تضف إلى مشروع Replay:

```text
SUPABASE_SERVICE_ROLE_KEY
OPS_API_KEY
```

انسخ فقط أي متغيرات Build عامة تؤثر في محتوى الصفحات أو صورها أو تنسيقها، إن كان المشروع يستخدم متغيرات من هذا النوع، حتى تظل الصفحات مطابقة بصريًا.

## 4. ربط الدومين الموازي بالمشروع الرئيسي

بعد أول Deployment لمشروع Replay، انسخ الدومين المجاني الذي أعطته Vercel، مثل:

```text
https://emocrete-replay.vercel.app
```

ضعه في مشروع الموقع الرئيسي داخل:

```text
EMO_REPLAY_ORIGIN
```

ثم أعد نشر المشروع الرئيسي.

لا يحتاج التطبيق إلى تخزين الدومين في إعداداته؛ يحصل عليه من `/api/ops/replay` عند طلب الجلسة.

## 5. نتيجة أمر الرفع الحالي

طالما المشروعان مربوطان بنفس Repository ونفس Production Branch، فإن Push واحد من أمر `l` يشغّل Build للمشروع الرئيسي وBuild آخر لمشروع Replay.

## 6. اختبار ما بعد النشر

افتح صفحة من دومين Replay مباشرة.

تأكد أن الصفحة تحمل الشكل نفسه و`SiteIntro` نفسه.

افتح مصدر الصفحة وتأكد من عدم وجود Google Analytics أو Clarity أو OpsVisitTracker.

افتح:

```text
https://اسم-مشروع-الريبلاي.vercel.app/robots.txt
```

يجب أن يعرض:

```text
User-agent: *
Disallow: /
```

افتح الموقع الرسمي، أنشئ جلسة تجريبية، ثم افتح كرت الجلسة في EmoLive واضغط Replay.

تأكد أن فريم العرض يحافظ على نسبة شاشة الزائر، وأن جلسة Desktop لا تتحول إلى Mobile Layout.

أعد تشغيل نفس الجلسة مرة ثانية للتأكد أن الأكشنات أصبحت من الكاش المحلي، بينما الصفحة تُفتح Live من دومين Replay.

## 7. اختبارات المصدر

اختبار مسارات API الخفيف:

```text
npm run test:ops
```

اختبار Build الكامل:

```text
npm ci
npm run build
```
