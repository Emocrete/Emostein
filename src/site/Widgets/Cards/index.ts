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
 */
export { default as CardsGr } from "./CardsGroup.astro";

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
 */
export { default as CardsGroup } from "./CardsGroup.astro";

export { default as DataCard } from "./DataCard.astro";

export { default as FullCard } from "./FullCard.astro";

export { default as IconInfoCard } from "./IconInfoCard.astro";

export { default as IconInfoCard1 } from "./IconInfoCard1.astro";

export { default as IconInfoCard2 } from "./IconInfoCard2.astro";

export { default as IconInfoCard3 } from "./IconInfoCard3.astro";

export { default as IconInfoCard4 } from "./IconInfoCard4.astro";

export { default as IconInfoCard5 } from "./IconInfoCard5.astro";

export { default as SvgBlobCard } from "./SvgBlobCard.astro";

export { default as SvgRadarCard } from "./SvgRadarCard.astro";
