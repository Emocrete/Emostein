export { default as Hero } from "./Sections/Hero.astro";
export { default as IndexSec } from "./Sections/IndexSection.astro";
export { default as ESec } from "./Sections/EmoSection.astro";
export { default as EmoStrip } from "./Strips/EmoStrip.astro";
export { default as IncLineSep } from "./Separators/IncLineSep.astro";
export { default as BottTriSep } from "./Separators/BottomTriangleSep.astro";
export { default as EmoBtn } from "./Comp/EmoButton.astro";
export { default as YTPlayer } from "./Media/YouTube.astro";
export { default as DataCard } from "./Cards/Card.astro";

import CardsGroupBase from "./Cards/CardsGroup.astro";
/**
 * CardsGr
 * 
 *
 * A reusable widget for displaying a group of information cards.
 * Each card is generated from a Topic object and rendered internally through the Emograph widget.
 *
 * This widget is suitable for service highlights, feature lists, process steps,
 * short comparisons, benefits sections, or any repeated content blocks that share
 * the same title/body structure.
 *
 * The cards are arranged using the Stack widget, so the group can be displayed
 * either horizontally or vertically depending on pStackDir.
 *
 * The widget also includes a client-side sync script that measures card titles
 * and card heights after load, resize, and font loading, then applies shared CSS
 * variables to help keep the cards visually aligned.
 *
 * Props:
 *
 * pWidth:
 * Controls the overall width of the cards group.
 * Accepts Pixel or RespString.
 *
 * pBg:
 * Optional background data for the group.
 * Currently available as a prop for background configuration.
 *
 * pCardBg:
 * Background data for each individual card.
 * Accepts ElemBg.
 *
 * pCardRadius:
 * Controls the border radius of each card in pixels.
 * Default value: 10.
 *
 * pGrTitle:
 * Text settings for the group title displayed above the cards.
 * Accepts Text.
 * Default value: Text.Body.
 *
 * pCardTitleFnt:
 * Text settings used for each card title.
 * The actual title text is taken from Topic.Title.
 * Accepts Text.
 * Default value: Text.Body.
 *
 * pCardBodyFnt:
 * Text settings used for each card body.
 * The actual body text is taken from Topic.Body.
 * Accepts Text.
 * Default value: Text.Body.
 *
 * pStackDir:
 * Controls the Stack direction used to arrange the cards.
 * Accepted values: "Row" or "Col".
 * Default value: "Row".
 *
 * pSpacing:
 * Spacing value used by the widget CSS variables.
 * Accepts number or Pixel.
 * Default value: 10.
 *
 * pTopic1 to pTopic8:
 * Card content items.
 * Each item accepts a Topic object with Title and Body values.
 * Empty topics are ignored automatically.
 *
 * id:
 * Optional custom widget ID.
 * If not provided, the widget generates an ID using GetWidgetId("CardsGr").
 *
 * class / style / remaining HTML attributes:
 * Passed through from HTMLAttributes and forwarded to the root element.
 */
export const CardsGr = CardsGroupBase;

export { default as EmoList } from "./Comp/EmoList.astro";
export { default as BgMedia } from "./Media/BgMedia.astro";
export { default as RespImg } from "./Media/RespImage.astro";
export { default as Emograph } from "./Comp/Emograph.astro";
export { default as Card } from "./Cards/Card.astro";
export { default as FullCard } from "./Cards/FullCard.astro";
export { default as Stack } from "./Comp/Stack.astro";
export { default as Tree } from "./Comp/Tree.astro";
export { default as EGall } from "./Media/EmoGallery.astro";
export { default as IndexBtn } from "./Comp/IndexLinkButton.astro";


import EmoCallBase from "./Comp/EmoCall.astro";

/**
 * EmoCall
 *
 * زر اتصال مباشر خاص بالموقع.
 *
 * يعرض نصًا اختياريًا مثل "للطلب والاستفسار"، وعند الضغط عليه يفتح الاتصال الهاتفي
 * على الرقم الأساسي للموقع. في الأجهزة التي لا تدعم الاتصال المباشر يظهر كود QR
 * يمكن مسحه من الهاتف لإجراء الاتصال.
 *
 * أهم الخصائص:
 *
 * pText:
 * النص الظاهر داخل الزر.
 *
 * pSize:
 * مقاس الزر باستخدام Size.
 *
 * pWidth / pHeight:
 * عرض وارتفاع الزر كقيم CSS مباشرة مثل "200px" أو "fit-content".
 *
 * pBgColor:
 * لون خلفية الزر في الحالة العادية.
 *
 * pBgColorHover:
 * لون الخلفية عند المرور بالماوس.
 *
 * pBgColorActive:
 * لون الخلفية أثناء الضغط.
 *
 * pTextColor:
 * لون النص في الحالة العادية.
 *
 * pTextColorHover:
 * لون النص عند المرور بالماوس.
 *
 * pTextColorActive:
 * لون النص أثناء الضغط.
 *
 * pIcon:
 * صورة أو أيقونة داخل الزر.
 *
 * pIconHover / pIconActive:
 * صورة الأيقونة في حالتي hover و active.
 *
 * pIconPos:
 * مكان الأيقونة داخل الزر.
 * القيم المتاحة: "right" | "left" | "top" | "bottom".
 *
 * pRadius:
 * نصف قطر حواف الزر.
 *
 * كما يدعم خصائص Place:
 * pLoc, pRotate, pZ, pOrigin, pOpacity, pClickable, pLandOnly, pPortOnly.
 */
export const EmoCall = EmoCallBase;



export { default as EmoContactStrip } from "./Strips/EmoContactStrip.astro";
export { default as EmoFaq } from "./Sections/EmoFaq.astro";
export { default as FaqItem } from "./Sections/FaqItem.astro";
export { default as ReadAlso } from "./Sections/ReadAlso.astro";
export { default as RelServices } from "./Sections/RelatedServices.astro";
export { default as RelServiceItem } from "./Sections/RelServiceItem.astro";
export { default as EmoRatingStrip } from "./Strips/EmoRatingStrip.astro";
export { default as EmoStatsStrip } from "./Strips/EmoStatsStrip.astro";
export { default as EmoPartnerStrip } from "./Strips/EmoPartnerStrip.astro";
export { default as EmoCoverageMapStrip } from "./Strips/EmoCoverageMapStrip.astro";
export { default as EmoPipelineStrip } from "./Strips/EmoPipelineStrip.astro";
export { default as ApartmentSaleForm } from "./Forms/ApartmentSaleForm.astro";
export { default as PhDwgMonthlyOffer } from "./Offers/PhDwgMonthlyOffer.astro";
export { default as RetailDwgMonthlyOffer } from "./Offers/RetailDwgMonthlyOffer.astro";
export { default as Badge } from "./Comp/Badge.astro";
export { default as Price } from "./Prices/Price.astro";
export { default as FreeHero } from "./Sections/FreeHero.astro";
export { Moving, MovingKeyPoint, BuildMovingMotionPoints, GetMovingDefaultIntervals, GetMovingDefaultLoop, GetMovingDefaultEase, type MovingMotion } from "../TypesLib";

export { default as SiteIntro } from "./Intro/SiteIntro.astro";
export { default as SiteSearch404 } from "./Comp/SiteSearch404.astro";

export { default as PriceCard } from "./Prices/PriceCard.astro";

export { default as HzStack } from "./Comp/HzStack.astro";
export { default as VrStack } from "./Comp/VrStack.astro";
export { default as SecTitle } from "./Comp/SecTitle.astro";
export { default as DuoStr } from "./Sections/DuoStrip.astro";
export { default as DuoCol } from "./Sections/DuoCol.astro";

export { default as Grid } from "./Comp/Grid.astro";
export { default as ReadAlsoItem } from "./Sections/ReadAlsoItem.astro";
export { default as EmoCountdown } from "./Comp/EmoCountdown.astro";
export { default as BlurBlob } from "./Shapes/Decor/BlurBlob.astro";
export { default as CircleGlow } from "./Shapes/Decor/CircleGlow.astro";
export { default as SvgDots } from "./Shapes/Decor/SvgDots.astro";
export { default as LinePath } from "./Shapes/Decor/LinePath.astro";
export { default as FloatingIcon } from "./Shapes/Decor/FloatingIcon.astro";
export { default as Ribbon } from "./Shapes/Decor/Ribbon.astro";
export { default as GlassCard } from "./Shapes/Frames/GlassCard.astro";
export { default as FloatingPanel } from "./Shapes/Frames/FloatingPanel.astro";
export { default as BadgeFrame } from "./Shapes/Frames/BadgeFrame.astro";
export { default as TiltCard } from "./Shapes/Frames/TiltCard.astro";
export { default as TornPaper } from "./Shapes/Edges/TornPaper.astro";

export { default as ThemedPriceCardVr } from "./Prices/ThemedPriceCardVr.astro";
export { default as ThemedPriceCardHz } from "./Prices/ThemedPriceCardHz.astro";

export { default as EmoWhats } from "./Comp/EmoWhats.astro";
export { default as EmoDet } from "./Comp/EmoDet.astro";
export { default as PharmacyWorkCard } from "./Pharmacy/PharmacyWorkCard.astro";
export { default as IconCardsStrip } from "./Strips/IconCardsStrip.astro";
export { default as IconInfoCard } from "./Strips/IconInfoCard.astro";
export { default as IconInfoCard1 } from "./Strips/IconInfoCard1.astro";
export { default as IconInfoCard2 } from "./Strips/IconInfoCard2.astro";
export { default as IconInfoCard3 } from "./Strips/IconInfoCard3.astro";
export { default as IconInfoCard4 } from "./Strips/IconInfoCard4.astro";
export { default as IconInfoCard5 } from "./Strips/IconInfoCard5.astro";

export { default as StoneProductStrip } from "./Stone/StoneProductStrip.astro";
export { default as StonePricingCalc } from "./Calc/StonePricingCalc.astro";


