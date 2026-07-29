/**
 * StoneInfoCard
 *
 * Props:
 * pKind: خامة الكرت: جرانيت مصري / رخام مصري / رخام مستورد ...
 * pName: اسم الخامة المعروضة.
 * pDesc: وصف مختصر للخامة.
 * pImg: رابط صورة العينة. لا توجد صورة عينة مرفقة مع الودجت.
 * pImgAlt: نص بديل لصورة العينة.
 * pBadge: شارة أعلى الصورة. اتركها فارغة لإخفائها.
 * pBadgeIcon: أيقونة الشارة. اسم من الأصول المرفقة أو رابط مباشر.
 * pColor: لون الخامة الظاهر في أسفل الصورة.
 * pTexture: شكل الحبيبات أو العروق الظاهر في أسفل الصورة.
 * pSizes: المقاسات المتاحة.
 * pFeature1: مميزات الخامة.
 * pPrimaryText: زر الطلب الأساسي.
 * pSecondaryText: زر التفاصيل الثانوي.
 * pAssetsBase: مسار أصول الودجت داخل public.
 * pAccentColor: متغيرات شكلية مختصرة.
 * data-own-size: يحافظ على مقاسه داخل Stack بدل تمديده كعنصر صف.
 */
export { default as StoneInfoCard } from "./StoneInfoCard.astro";

export { default as StoneProductStrip } from "./StoneProductStrip.astro";
