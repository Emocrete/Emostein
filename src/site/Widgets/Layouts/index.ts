import AngleBandIndexExport from "./AngleBand.astro";

/**
 * @pBg as LayoutBackground
 * @pColor as string
 * @pCut as LayoutValue
 * @pDirection as BandDirection
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pOverflow as "visible" | "hidden" | "clip"
 */
export const AngleBand = AngleBandIndexExport;

export { ClampInt } from "./LayoutUtils";

export { GetGridLine } from "./LayoutUtils";

export { GetLayoutBackground } from "./LayoutUtils";

export { GetLayoutPair } from "./LayoutUtils";

export { GetRootAttributes } from "./LayoutUtils";

export { GetStyleText } from "./LayoutUtils";

import LayerDeckIndexExport from "./LayerDeck.astro";

/**
 * @pAspect as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pPad as LayoutValue
 * @pBg as LayoutBackground
 * @pRadius as LayoutValue
 * @pOverflow as "visible" | "hidden" | "clip"
 */
export const LayerDeck = LayerDeckIndexExport;

import LayerItemIndexExport from "./LayerItem.astro";

/**
 * @pWidth as LayoutValue
 * @pHeight as LayoutValue
 * @pOffsetX as LayoutValue
 * @pOffsetY as LayoutValue
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pBg as LayoutBackground
 * @pColor as string
 * @pPad as LayoutValue
 * @pRadius as LayoutValue
 * @pShadow as string
 * @pBlend as string
 * @pOverflow as "visible" | "hidden" | "clip"
 */
export const LayerItem = LayerItemIndexExport;

export type { LayoutBackground } from "./LayoutUtils";

export type { LayoutPair } from "./LayoutUtils";

export type { LayoutValue } from "./LayoutUtils";

import MosaicGridIndexExport from "./MosaicGrid.astro";

/**
 * @pColumns as number
 * @pColumnsP as number
 * @pAutoRows as LayoutValue
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pBg as LayoutBackground
 * @pRadius as LayoutValue
 * @pDense as boolean
 */
export const MosaicGrid = MosaicGridIndexExport;

import MosaicItemIndexExport from "./MosaicItem.astro";

/**
 * @pColumn as number | string
 * @pColumnP as number | string
 * @pRow as number | string
 * @pRowP as number | string
 * @pColSpan as number
 * @pColSpanP as number
 * @pRowSpan as number
 * @pRowSpanP as number
 * @pBg as LayoutBackground
 * @pColor as string
 * @pRadius as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pClip as string
 * @pClipP as string
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pOverflow as "visible" | "hidden" | "clip"
 */
export const MosaicItem = MosaicItemIndexExport;

import RadialItemIndexExport from "./RadialItem.astro";

/**
 * @pTitle as string
 * @pText as string
 * @pBg as LayoutBackground
 * @pColor as string
 * @pAccent as string
 * @pWidth as LayoutValue
 * @pMinHeight as LayoutValue
 * @pRadius as LayoutValue
 * @pPad as LayoutValue
 */
export const RadialItem = RadialItemIndexExport;

import RadialLayoutIndexExport from "./RadialLayout.astro";

/**
 * @pCount as number
 * @pDiameter as LayoutValue
 * @pOrbit as LayoutValue
 * @pCenterSize as LayoutValue
 * @pBg as LayoutBackground
 * @pCenterBg as LayoutBackground
 * @pCenterColor as string
 * @pRingColor as string
 * @pAccent as string
 * @pCenterTitle as string
 * @pCenterText as string
 * @pStackPortrait as boolean
 */
export const RadialLayout = RadialLayoutIndexExport;

import ScrollShelfIndexExport from "./ScrollShelf.astro";

/**
 * @pItemWidth as LayoutValue
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pBg as LayoutBackground
 * @pEdgeFade as boolean
 * @pSnap as "mandatory" | "proximity" | "none"
 */
export const ScrollShelf = ScrollShelfIndexExport;

import ShelfItemIndexExport from "./ShelfItem.astro";

/**
 * @pBg as LayoutBackground
 * @pColor as string
 * @pAccent as string
 * @pRadius as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMediaHeight as LayoutValue
 * @pShadow as string
 * @pSnapAlign as "start" | "center" | "end"
 */
export const ShelfItem = ShelfItemIndexExport;

import SideRailIndexExport from "./SideRail.astro";

/**
 * @pRailWidth as LayoutValue
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pBg as LayoutBackground
 * @pRailBg as LayoutBackground
 * @pRailColor as string
 * @pSticky as boolean
 * @pStickyTop as Pixel
 * @pSide as RailSide
 * @pCollapsePortrait as boolean
 */
export const SideRail = SideRailIndexExport;

import SplitPaneIndexExport from "./SplitPane.astro";

/**
 * @pBg as LayoutBackground
 * @pColor as string
 * @pPad as LayoutValue
 * @pGap as LayoutValue
 * @pRadius as LayoutValue
 * @pMinHeight as LayoutValue
 * @pEdge as SplitEdge
 * @pEdgeP as SplitEdge
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pOverflow as "visible" | "hidden" | "clip"
 */
export const SplitPane = SplitPaneIndexExport;

import SplitSceneIndexExport from "./SplitScene.astro";

/**
 * @pColumns as LayoutValue
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pBg as LayoutBackground
 * @pRadius as LayoutValue
 * @pReverse as boolean
 * @pReverseP as boolean
 */
export const SplitScene = SplitSceneIndexExport;

import StickyStoryIndexExport from "./StickyStory.astro";

/**
 * @pVisualShare as number
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pMinHeight as LayoutValue
 * @pBg as LayoutBackground
 * @pVisualBg as LayoutBackground
 * @pStickyTop as Pixel
 * @pSide as StickySide
 * @pCollapsePortrait as boolean
 */
export const StickyStory = StickyStoryIndexExport;

import StickyStoryItemIndexExport from "./StickyStoryItem.astro";

/**
 * @pKicker as string
 * @pTitle as string
 * @pText as string
 * @pBg as LayoutBackground
 * @pColor as string
 * @pAccent as string
 * @pPad as LayoutValue
 * @pRadius as LayoutValue
 * @pMinHeight as LayoutValue
 */
export const StickyStoryItem = StickyStoryItemIndexExport;

import StoryRailIndexExport from "./StoryRail.astro";

/**
 * @pAxis as StoryAxis
 * @pAxisP as StoryAxis
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pBg as LayoutBackground
 * @pTrackColor as string
 * @pAccent as string
 * @pAlternate as boolean
 */
export const StoryRail = StoryRailIndexExport;

import StoryStepIndexExport from "./StoryStep.astro";

/**
 * @pKicker as string
 * @pTitle as string
 * @pText as string
 * @pNumber as string | number
 * @pSide as StorySide
 * @pBg as LayoutBackground
 * @pColor as string
 * @pAccent as string
 * @pRadius as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 */
export const StoryStep = StoryStepIndexExport;

import ZigzagItemIndexExport from "./ZigzagItem.astro";

/**
 * @pMediaShare as number
 * @pSide as MediaSide
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMinHeight as LayoutValue
 * @pMediaMinHeight as LayoutValue
 * @pBg as LayoutBackground
 * @pColor as string
 * @pRadius as LayoutValue
 * @pMediaBg as LayoutBackground
 * @pMediaRadius as LayoutValue
 * @pClip as MediaClip
 * @pClipP as MediaClip
 */
export const ZigzagItem = ZigzagItemIndexExport;

import ZigzagStoryIndexExport from "./ZigzagStory.astro";

/**
 * @pGap as LayoutValue
 * @pPad as LayoutValue
 * @pMaxWidth as LayoutValue
 * @pBg as LayoutBackground
 * @pAlternate as boolean
 * @pOverlap as LayoutValue
 */
export const ZigzagStory = ZigzagStoryIndexExport;
