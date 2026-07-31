# Emo Shape Library

مكتبة أشكال أولية لمشروع Emostein/Astro، مقسمة إلى ثلاثة أنواع:

1. `Edges`: أشكال حدود وفواصل السكاشن.
2. `Decor`: عناصر زخرفية داخلية توضع داخل السكشن أو على أطرافه.
3. `Frames`: إطارات وصناديق محتوى زخرفية تقبل `slot`.

كل الودجات تقبل خصائص `PlaceProps` الموجودة في `TypesLib`:

`pLoc`, `pSize`, `pRotate`, `pZ`, `pOrigin`, `pOpacity`, `pClickable`, `pLandOnly`, `pPortOnly`.

صفحات الاختبار موجودة في:

- `src/pages/Tests/Shapes/ShapeEdgesTest.astro`
- `src/pages/Tests/Shapes/ShapeDecorTest.astro`
- `src/pages/Tests/Shapes/ShapeFramesTest.astro`

الاستخدام المقصود: ضع ودجت الشكل كابن مباشر داخل `EmoSec` أو أي سكشن/مشهد positioned، ولا تغلفه بـ `div` خارجي.
