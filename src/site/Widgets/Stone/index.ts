export { CreateStoneGalleryExcelImageMatcher } from "./StoneGalleryExcel";

export { ReadStoneGalleryExcelFile } from "./StoneGalleryExcel";

import StoneGalleryIndexExport from "./StoneGallery.astro";

/**
 * @pItems as StoneGalleryItemInput[] — بيانات جاهزة مباشرة. عند تمريرها لها أولوية على Excel وJSON ومسح الفولدر.
 * @pFolder as string — فولدر الصور: مسار نسبي داخل _M للصفحة الحالية، أو مسار صريح من public مثل /Media/....
 * @pExcel as string — ملف Excel داخل pFolder. إذا كان موجودًا تكون له أولوية على JSON ومسح الفولدر.
 * @pExcelSheet as string — اسم ورقة بيانات الخامات داخل ملف Excel.
 * @pExcelWarnings as boolean — إظهار تحذيرات المطابقة في طرفية البناء للملفات الناقصة أو الأسماء المكررة.
 * @pJson as string — ملف بيانات اختياري داخل pFolder. يدعم array أو Stones / stones / Products / products.
 * @pRecursive as boolean — يبحث داخل الفولدرات الفرعية أثناء ربط Excel أو عند الاعتماد على الصور فقط.
 * @pExts as string[] — الامتدادات المقبولة عند مسح الفولدر.
 * @pTitle as string
 * @pDesc as string
 * @pSearchPlaceholder as string
 * @pEmptyText as string
 * @pDefaultType as string
 * @pDefaultCountry as string
 * @pDefaultUses as string | string[]
 * @pDefaultFinishes as string | string[]
 * @pDefaultCurrency as string
 * @pColumns as number
 * @pColumnsP as number
 * @pMaxCompare as number
 * @pShowFilters as boolean
 * @pAvailableOnly as boolean
 * @pAllowShare as boolean
 * @pEnableQuote as boolean
 * @pSelectFirst as boolean
 * @pRequestBuilderId as string — معرّف StoneRequestBuilder الذي يستقبل بيانات الخامة بعد حفظ الطلب المبدئي.
 * @pRequestHref as string — رابط احتياطي بعد إطلاق حدث الطلب. يترك فارغًا للبقاء داخل الصفحة.
 * @pStorageKey as string — مفتاح حفظ القائمة المختصرة والمقارنة على جهاز الزائر.
 * @pMaxWidth as CssValue
 * @pPad as CssValue
 * @pGap as CssValue
 * @pRadius as CssValue
 * @pAccent as string
 * @pAccentSoft as string
 * @pBgColor as string
 * @pPanelColor as string
 * @pTextColor as string
 * @pMutedColor as string
 * @pBorderColor as string
 * @data-own-size as boolean | string — يحافظ الودجت على عرضه الداخلي داخل Stack / Strip.
 */
export const StoneGallery = StoneGalleryIndexExport;

export type { StoneGalleryExcelImageMatch } from "./StoneGalleryExcel";

export type { StoneGalleryExcelItem } from "./StoneGalleryExcel";

export type { StoneGalleryExcelResult } from "./StoneGalleryExcel";

import StoneInfoCardIndexExport from "./StoneInfoCard.astro";

/**
 * @pKind as string — خامة الكرت: جرانيت مصري / رخام مصري / رخام مستورد ... (Default: "جرانيت مصري")
 * @pName as string — اسم الخامة المعروضة. (Default: "أسود أسوان")
 * @pDesc as string — وصف مختصر للخامة. (Default: "جرانيت طبيعي مصري بلمعة عالية ولون أسود محبب يناسب الأماكن التي تجمع بين الفخامة والمتانة.")
 * @pImg as string — رابط صورة العينة. لا توجد صورة عينة مرفقة مع الودجت. (Default: "")
 * @pImgAlt as string — نص بديل لصورة العينة.
 * @pBadge as string — شارة أعلى الصورة. اتركها فارغة لإخفائها. (Default: "الأكثر طلبًا")
 * @pBadgeIcon as StoneCardIcon | string — أيقونة الشارة. اسم من الأصول المرفقة أو رابط مباشر. (Default: "diamond")
 * @pColor as string — لون الخامة الظاهر في أسفل الصورة. (Default: "أسود")
 * @pTexture as string — شكل الحبيبات أو العروق الظاهر في أسفل الصورة. (Default: "حبيبات متوسطة")
 * @pSizes as string[] — المقاسات المتاحة. (Default: ["120 × 240", "100 × 300", "60 × 120"])
 * @pFeature1 as StoneCardFeature — مميزات الخامة. (Default: { pIcon: "diamond", pTitle: "صلابة", pText: "عالية" })
 * @pFeature2 as StoneCardFeature (Default: { pIcon: "drop", pTitle: "مقاومة امتصاص", pText: "الماء" })
 * @pFeature3 as StoneCardFeature (Default: { pIcon: "sun", pTitle: "مقاوم للعوامل", pText: "الجوية" })
 * @pFeature4 as StoneCardFeature (Default: { pIcon: "shield", pTitle: "يتحمل الاستخدام", pText: "اليومي" })
 * @pPrimaryText as string — زر الطلب الأساسي. (Default: "اطلب عرض سعر")
 * @pPrimaryHref as string (Default: "#")
 * @pSecondaryText as string — زر التفاصيل الثانوي. (Default: "عرض التفاصيل")
 * @pSecondaryHref as string (Default: "#")
 * @pAssetsBase as string — مسار أصول الودجت داخل public. (Default: "/Media/Widgets/StoneInfoCard/")
 * @pAccentColor as string — متغيرات شكلية مختصرة. (Default: "#C59A5A")
 * @pAccentSoftColor as string (Default: "#E8C878")
 * @pBgColor as string (Default: "#0D0D0C")
 * @pPanelColor as string (Default: "#151412")
 * @pTextColor as string (Default: "#F7F2E8")
 * @pMutedTextColor as string (Default: "#CFC6B8")
 * @pMaxWidth as string (Default: "1180px")
 * @pMinHeight as string (Default: "620px")
 * @pRadius as string (Default: "34px")
 * @data-own-size as boolean | string — يحافظ على مقاسه داخل Stack بدل تمديده كعنصر صف. (Default: true)
 */
export const StoneInfoCard = StoneInfoCardIndexExport;

import StoneProductStripIndexExport from "./StoneProductStrip.astro";

/**
 * @pStoneType as StoneProductType — Marble / Granite / رخام / جرانيت. يغير زخرفة الخلفية تلقائيًا.
 * @pFolder as string — فولدر الصور: نسبي داخل _M للصفحة الحالية، أو صريح من public مثل /Media/Emostone/ProductStripSample.
 * @pImages as GalleryJsonItem[] — صور جاهزة مباشرة. لها أولوية على pFolder وملف JSON.
 * @pJson as string — اسم ملف الجسون داخل نفس فولدر الصور.
 * @pName as string — بيانات الخامة.
 * @pKind as string
 * @pColor as string
 * @pCountry as string
 * @pUses as string | string[]
 * @pSizes as string | string[]
 * @pBody as string | string[]
 * @pCtaText as string
 * @pCtaHref as string
 * @pCtaAria as string
 * @pMaxWidth as CssValue
 * @pPad as CssValue
 * @pGap as CssValue
 * @pRadius as CssValue
 * @pAccent as string
 * @pAccentSoft as string
 * @pTextColor as string
 * @pMutedColor as string
 * @pCardColor as string
 * @pGalleryHeight as CssValue
 * @pDesktopVisibleColumns as number
 * @pMobileInitialCount as number
 * @pAutoSlide as boolean
 * @pDwellMs as number
 * @pMoveMs as number
 * @pColorizeMs as number
 */
export const StoneProductStrip = StoneProductStripIndexExport;

import StoneRequestBuilderIndexExport from "./StoneRequest/StoneRequestBuilder.astro";

/**
 * @pApiUrl as string — API used to save, resume and submit StoneReq drafts. DefVal = "/api/stone-req"
 * @pSourcePage as string — Logical source page stored with the request. DefVal = "صفحة الرخام والجرانيت"
 * @pTitle as string — Main widget title.
 * @pDesc as string — Short explanation below the title.
 * @pStorageKey as string — IndexedDB record key. Change it only when separate drafts are required on the same site.
 * @pMaxAttachments as number — Maximum compressed images stored inside one item. DefVal = 5
 * @pMaxImageKb as number — Approximate maximum size of each compressed image in KB. DefVal = 300
 * @pMaxRequestImageMb as number — Maximum decoded image payload across the whole request in MB. Capped at 2.5 for Vercel payload safety. DefVal = 2.5
 */
export const StoneRequestBuilder = StoneRequestBuilderIndexExport;

import StoneRequestHeaderIndexExport from "./StoneRequest/StoneRequestHeader.astro";

/**
 * @pTitle as string (Default: "كوّن طلبية الرخام أو الجرانيت")
 * @pDesc as string (Default: "أضف كل صنف ومقاس على حدة. بياناتك تُحفظ تلقائيًا ويمكنك استكمال الطلب لاحقًا.")
 */
export const StoneRequestHeader = StoneRequestHeaderIndexExport;

export { default as StoneRequestItemOverlay } from "./StoneRequest/StoneRequestItemOverlay.astro";

export { default as StoneRequestItemsTable } from "./StoneRequest/StoneRequestItemsTable.astro";

export { default as StoneRequestProjectOverlay } from "./StoneRequest/StoneRequestProjectOverlay.astro";

export { default as StoneRequestResume } from "./StoneRequest/StoneRequestResume.astro";

export { default as StoneRequestReviewOverlay } from "./StoneRequest/StoneRequestReviewOverlay.astro";
