import EmoContactStripIndexExport from "./EmoContactStrip.astro";

/**
 * @pTitle as string (Default: "تحتاج تواصل سريع؟")
 * @pDesc as string (Default: "اتصل أو واتساب الآن، ولو الوقت غير مناسب اترك رقمك وسنرد عليك في أقرب وقت.")
 * @pPhone as string (Default: "01014490054")
 * @pCallText as string (Default: "اتصال فوري")
 * @pWhatsappText as string (Default: "واتساب فوري")
 * @pLeadTitle as string (Default: "اترك بياناتك للتواصل في الوقت المناسب لك")
 * @pPhonePlaceHolder as string (Default: "رقم الهاتف")
 * @pLeadButtonText as string (Default: "تسجيل التواصل")
 * @pPrivacyText as string (Default: "لن يتم استخدام رقمك إلا للرد على طلبك فقط")
 * @pSourceName as string (Default: "موقع Emocrete")
 * @pVideoSrc as string (Default: "/Media/PhoneLoop.mp4")
 * @pPosterSrc as string (Default: "")
 */
export const EmoContactStrip = EmoContactStripIndexExport;

import EmoCoverageMapStripIndexExport from "./EmoCoverageMapStrip.astro";

/**
 * @pTitle as string (Default: "خريطة تغطية الخدمة")
 * @pDesc as string (Default: "عرض سريع لنطاق التغطية الحالي للخدمة داخل مصر، مع قراءة مبدئية للمحافظة والمنطقة التي يزور منها العميل.")
 * @pDetectedGovernorate as string (Default: "القاهرة")
 * @pDetectedArea as string (Default: "التجمع الخامس")
 * @pCurrentServiceName as string (Default: "الخدمة الحالية")
 * @pPartnerTargetId as string (Default: "/emochain/partners")
 */
export const EmoCoverageMapStrip = EmoCoverageMapStripIndexExport;

import EmoPartnerStripIndexExport from "./EmoPartnerStrip.astro";

/**
 * @pTitle as string (Default: "انضم إلى شبكة المتعاونين مع Emocrete")
 * @pDesc as string (Default: "لو كنت مهندسًا، استشاريًا، مقاولًا، صنايعيًا، موردًا، أو مندوب خدمات في محافظة مختلفة، اترك بياناتك ومجال تعاونك لفرز الطلبات والتواصل مع المناسبين عند الحاجة.")
 * @pKicker as string (Default: "توسيع شبكة التنفيذ")
 * @pSubmitText as string (Default: "إرسال بيانات التعاون")
 * @pPrivacyText as string (Default: "هذه البيانات مخصصة لدراسة فرص التعاون فقط، وليست طلب توظيف ملزم أو تعاقد مباشر.")
 * @pSourceName as string (Default: "موقع Emocrete")
 * @pTitleTag as "h1" | "h2" (Default: "h2")
 */
export const EmoPartnerStrip = EmoPartnerStripIndexExport;

import EmoPipelineStripIndexExport from "./EmoPipelineStrip.astro";

/**
 * @pTitle as string (Default: "حالة الشغل الحالي")
 * @pDesc as string (Default: "متابعة مختصرة للطلبات المفتوحة والملفات الجاري تجهيزها، لتوضيح ضغط التشغيل وأقرب متابعة متاحة.")
 * @pServiceName as string (Default: "الخدمة الحالية")
 * @pContactTargetId as string (Default: "EmoContactStrip")
 * @pPortfolioTargetId as string (Default: "EmoPortfolioStrip")
 */
export const EmoPipelineStrip = EmoPipelineStripIndexExport;

import EmoRatingStripIndexExport from "./EmoRatingStrip.astro";

/**
 * @pTitle as string (Default: "عبر عن تجربتك مع هذه الصفحة")
 * @pSubmitText as string (Default: "إرسال التقييم")
 * @pCommentPlaceholder as string (Default: "اكتب تعليقك هنا إن أردت...")
 * @pPrivacyText as string (Default: "")
 * @pSourceName as string (Default: "موقع Emocrete")
 * @pNotifyEmail as string (Default: "emocrete@gmail.com")
 * @pEmailSubject as string (Default: "تعليق جديد على صفحة من موقع Emocrete")
 * @pStarEmailSubject as string (Default: "تقييم نجوم جديد على صفحة من موقع Emocrete")
 * @pEmailJsPublicKey as string (Default: "OleHS6UOuh_Wj_5p_")
 * @pEmailJsServiceId as string (Default: "EmoMail")
 * @pEmailJsTemplateId as string (Default: "EmoRating20015161")
 * @pStorageUrl as string (Default: "")
 * @pRequireComment as boolean (Default: false)
 * @pRatingData as PageRatingData | null (Default: null)
 * @pFooterMode as boolean (Default: false)
 */
export const EmoRatingStrip = EmoRatingStripIndexExport;

import EmoStatsStripIndexExport from "./EmoStatsStrip.astro";

/**
 * @pTitle as string (Default: "مؤشرات نشاط الموقع")
 * @pDesc as string (Default: "متابعة مختصرة للصفحة والقسم والموقع، قابلة للربط لاحقًا بسجل إحصائي حقيقي.")
 * @pOfferTitle as string (Default: "فرصة متابعة مبكرة")
 * @pOfferDesc as string (Default: "أنت ضمن مجموعة زوار مؤهلة للحصول على متابعة خاصة عند تفعيل عروض هذا القسم.")
 * @pOfferButtonText as string (Default: "سجّل اهتمامك")
 * @pShowOffer as boolean (Default: true)
 * @pFooterMode as boolean (Default: false)
 * @pCyclEmoSeconds as number (Default: 5)
 */
export const EmoStatsStrip = EmoStatsStripIndexExport;

import EmoStrIndexExport from "./EmoStr.astro";

/**
 * @pBg as ElemBg
 * @pSize as Size
 * @pMinH as NumPer
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pImgF as string (Default: "")
 * @pImgL as string (Default: "")
 * @pImgP as string (Default: "")
 */
export const EmoStr = EmoStrIndexExport;

import IconCardsStripIndexExport from "./IconCardsStrip.astro";

/**
 * @pBg as ElemBg | string
 * @pWidth as Size
 * @pGap as Pixel
 * @pPad as Pixel
 * @pMax as number | string
 * @pMaxP as number | string
 * @pCardTitleFnt as Text
 * @pCardBodyFnt as Text
 * @pCentered as boolean
 * @Centered as boolean | string
 */
export const IconCardsStrip = IconCardsStripIndexExport;
