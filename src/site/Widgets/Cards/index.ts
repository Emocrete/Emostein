import CardsGrIndexExport from "./CardsGroup.astro";

/**
 * CardsGr
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
 *
 * @pWidth as Pixel|RespString — Controls the overall width of the cards group. Accepts Pixel or RespString. (Default: new RespString("90%", "100%"))
 * @pBg as ElemBg
 * @pCardBg as ElemBg
 * @pCardRadius as Pixel (Default: 10)
 * @pGrTitle as Text (Default: Text.Body)
 * @pCardTitleFnt as Text (Default: Text.Body)
 * @pCardBodyFnt as Text (Default: Text.Body)
 * @pStackDir as "Row" | "Col" (Default: "Row")
 * @pSpacing as number|Pixel (Default: 20)
 * @pTopic1 as Topic (Default: new Topic("عنوان الكرت","محتوى الكرت"))
 * @pTopic2 as Topic (Default: new Topic("عنوان الكرت","محتوى الكرت"))
 * @pTopic3 as Topic
 * @pTopic4 as Topic
 * @pTopic5 as Topic
 * @pTopic6 as Topic
 * @pTopic7 as Topic
 * @pTopic8 as Topic
 */
export const CardsGr = CardsGrIndexExport;

import CardsGroupIndexExport from "./CardsGroup.astro";

/**
 * CardsGr
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
 *
 * @pWidth as Pixel|RespString — Controls the overall width of the cards group. Accepts Pixel or RespString. (Default: new RespString("90%", "100%"))
 * @pBg as ElemBg
 * @pCardBg as ElemBg
 * @pCardRadius as Pixel (Default: 10)
 * @pGrTitle as Text (Default: Text.Body)
 * @pCardTitleFnt as Text (Default: Text.Body)
 * @pCardBodyFnt as Text (Default: Text.Body)
 * @pStackDir as "Row" | "Col" (Default: "Row")
 * @pSpacing as number|Pixel (Default: 20)
 * @pTopic1 as Topic (Default: new Topic("عنوان الكرت","محتوى الكرت"))
 * @pTopic2 as Topic (Default: new Topic("عنوان الكرت","محتوى الكرت"))
 * @pTopic3 as Topic
 * @pTopic4 as Topic
 * @pTopic5 as Topic
 * @pTopic6 as Topic
 * @pTopic7 as Topic
 * @pTopic8 as Topic
 */
export const CardsGroup = CardsGroupIndexExport;

import DataCardIndexExport from "./DataCard.astro";

/**
 * @TitleTag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6" (Default: "h3")
 * @pTitle as string (Default: "عنوان الكرت")
 * @pBody as string (Default: "محتوى الكرت")
 * @pImg as string (Default: "")
 * @pLink as string (Default: "")
 */
export const DataCard = DataCardIndexExport;

import FullCardIndexExport from "./FullCard.astro";

/**
 * @pTitle as Text (Default: Text.Body.OfText("عنوان الكرت"))
 * @pText as Text (Default: Text.Body.OfText("محتوى الكرت"))
 * @pMedia as EmoMediaData (Default: new EmoMediaData("Img", "/Media/", "ErrorImg.webp"))
 * @pBgMedia as EmoMediaData
 * @pBgClr as string (Default: "rgb(247, 202, 52)")
 */
export const FullCard = FullCardIndexExport;

import IconInfoCardIndexExport from "./IconInfoCard.astro";

/**
 * @pTitle as string
 * @pIcon as string
 * @pIconAlt as string
 * @pDesc as string
 * @pTitleLevel as number | string
 * @pColor as string
 * @pHoverColor as string
 * @pBg as string
 * @pHoverBg as string
 * @pTextColor as string
 * @pHoverTextColor as string
 * @pBodyColor as string
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pIconSize as Pixel
 * @pIconPad as Pixel
 */
export const IconInfoCard = IconInfoCardIndexExport;

import IconInfoCard1IndexExport from "./IconInfoCard1.astro";

/**
 * @pTitle as string
 * @pIcon as string
 * @pIconAlt as string
 * @pDesc as string
 * @pTitleLevel as number | string
 * @pBg as string
 * @pColor as string
 * @pHoverBg as string
 * @pHoverColor as string
 * @pIconBg as string
 * @pIconHoverBg as string
 * @pTitleColor as string
 * @pBodyColor as string
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pIconHoverTransform as string
 * @pIconHoverFilter as string
 * @pReveal as boolean
 */
export const IconInfoCard1 = IconInfoCard1IndexExport;

import IconInfoCard2IndexExport from "./IconInfoCard2.astro";

/**
 * @pTitle as string
 * @pIcon as string
 * @pIconAlt as string
 * @pDesc as string
 * @pTitleLevel as number | string
 * @pBg as string
 * @pColor as string
 * @pHoverBg as string
 * @pHoverColor as string
 * @pIconBg as string
 * @pIconHoverBg as string
 * @pTitleColor as string
 * @pBodyColor as string
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pIconHoverTransform as string
 * @pIconHoverFilter as string
 * @pHoverDuration as string
 * @pIconFlipDuration as string
 * @pRevealDuration as string
 * @pReveal as boolean
 */
export const IconInfoCard2 = IconInfoCard2IndexExport;

import IconInfoCard3IndexExport from "./IconInfoCard3.astro";

/**
 * @pTitle as string
 * @pIcon as string
 * @pIconAlt as string
 * @pDesc as string
 * @pTitleLevel as number | string
 * @pBg as string
 * @pColor as string
 * @pHoverBg as string
 * @pHoverColor as string
 * @pIconBg as string
 * @pIconHoverBg as string
 * @pTitleColor as string
 * @pBodyColor as string
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pIconHoverTransform as string
 * @pIconHoverFilter as string
 * @pHoverDuration as string
 * @pIconFlipDuration as string
 * @pIconHoverDelay as string
 * @pRevealDuration as string
 * @pReveal as boolean
 */
export const IconInfoCard3 = IconInfoCard3IndexExport;

import IconInfoCard4IndexExport from "./IconInfoCard4.astro";

/**
 * @pTitle as string
 * @pIcon as string
 * @pIconAlt as string
 * @pDesc as string
 * @pTitleLevel as number | string
 * @pBg as string
 * @pColor as string
 * @pHoverBg as string
 * @pHoverColor as string
 * @pIconBg as string
 * @pIconHoverBg as string
 * @pTitleColor as string
 * @pBodyColor as string
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pIconHoverTransform as string
 * @pIconHoverFilter as string
 * @pCardFadeDuration as string
 * @pIconDelay as string
 * @pIconFlipDuration as string
 * @pIconColorDuration as string
 * @pReveal as boolean
 * @pRevealDuration as string
 */
export const IconInfoCard4 = IconInfoCard4IndexExport;

import IconInfoCard5IndexExport from "./IconInfoCard5.astro";

/**
 * @pTitle as string
 * @pIcon as string
 * @pIconAlt as string
 * @pDesc as string
 * @pTitleLevel as number | string
 * @pBg as string
 * @pColor as string
 * @pHoverBg as string
 * @pHoverColor as string
 * @pIconBg as string
 * @pIconHoverBg as string
 * @pTitleColor as string
 * @pBodyColor as string
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pIconHoverTransform as string
 * @pIconHoverFilter as string
 * @pCardEnterDuration as string
 * @pCardExitDuration as string
 * @pIconStartDelay as string
 * @pIconFlipDuration as string
 * @pIconBgDuration as string
 * @pIconFilterDuration as string
 * @pReveal as boolean
 * @pRevealDuration as string
 */
export const IconInfoCard5 = IconInfoCard5IndexExport;

export { default as SvgBlobCard } from "./SvgBlobCard.astro";

export { default as SvgRadarCard } from "./SvgRadarCard.astro";
