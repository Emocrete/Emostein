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
 * @pFolder as string — فولدر الصور داخل public، مثل /Media/Emostone/ProductStripSample.
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
