export { AddCss } from "./FreeHeroMotion";

export { BuildFreeHeroMotionPoints } from "./FreeHeroMotion";

import DivColIndexExport from "./DivCol.astro";

/**
 * @Centered as boolean
 * @centered as boolean
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pGap as Pixel
 * @pPad as Pixel
 * @pBg as ElemBg
 * @pBgColor as ElemBg
 * @pBgOpacity as Percent
 * @pBlur as Pixel
 */
export const DivCol = DivColIndexExport;

import DivStrIndexExport from "./DivStr.astro";

/**
 * Dividing strip that contains columns arranged equally according to how many items of **`DivCol`** are inserted in the slot
 *
 * @pBg as ElemBg — Strip Bg that can be color or image or video according to what passed through **`ElemBg`**
 * @pBox as Size
 * @pMinH as NumPer
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pImgF as string (Default: "")
 * @pImgL as string (Default: "")
 * @pImgP as string (Default: "")
 * @pImgAlt as string (Default: "")
 * @pContentSize as Size
 * @pGap as Pixel (Default: new Pixel(30, 30))
 * @pPad as Pixel (Default: new Pixel(30,5))
 */
export const DivStr = DivStrIndexExport;

import EmoFaqIndexExport from "./EmoFaq.astro";

/**
 * @pGap as Pixel
 * @pPad as Pixel
 * @pMinHeight as Pixel
 */
export const EmoFaq = EmoFaqIndexExport;

import EmoSecIndexExport from "./EmoSec.astro";

/**
 * @pBg as ElemBg
 * @pBox as Size
 * @pMinH as NumPer
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pGap as Pixel (Default: new Pixel(30,30))
 * @pHzPad as Pixel (Default: new Pixel(50,5))
 * @pVrPad as Pixel (Default: new Pixel(50,5))
 * @pImgF as string (Default: "")
 * @pImgL as string (Default: "")
 * @pImgP as string (Default: "")
 * @Service as boolean | string (Default: false)
 * @pImgAlt as string — وصف صورة خلفية السكشن لمحركات البحث وقارئات الشاشة. (Default: "")
 */
export const EmoSec = EmoSecIndexExport;

import FaqItemIndexExport from "./FaqItem.astro";

/**
 * @pQuestion as string
 * @pAnswer as string
 */
export const FaqItem = FaqItemIndexExport;

import FreeHeroIndexExport from "./FreeHero.astro";

/**
 * @pImgF as string (Default: "")
 * @pImgL as string (Default: "")
 * @pImgP as string (Default: "")
 * @pImgAlt as string (Default: "")
 */
export const FreeHero = FreeHeroIndexExport;

export { default as FreeHeroBackInBottom } from "./FreeHeroMotion/FreeHeroBackInBottom.astro";

export { default as FreeHeroBackInLeft } from "./FreeHeroMotion/FreeHeroBackInLeft.astro";

export { default as FreeHeroBackInRight } from "./FreeHeroMotion/FreeHeroBackInRight.astro";

export { default as FreeHeroBackInTop } from "./FreeHeroMotion/FreeHeroBackInTop.astro";

export { default as FreeHeroBounceIn } from "./FreeHeroMotion/FreeHeroBounceIn.astro";

export { default as FreeHeroBounceInBottom } from "./FreeHeroMotion/FreeHeroBounceInBottom.astro";

export { default as FreeHeroBounceInLeft } from "./FreeHeroMotion/FreeHeroBounceInLeft.astro";

export { default as FreeHeroBounceInRight } from "./FreeHeroMotion/FreeHeroBounceInRight.astro";

export { default as FreeHeroBounceInTop } from "./FreeHeroMotion/FreeHeroBounceInTop.astro";

export { default as FreeHeroBreathe } from "./FreeHeroMotion/FreeHeroBreathe.astro";

export { default as FreeHeroDriftBox } from "./FreeHeroMotion/FreeHeroDriftBox.astro";

export { default as FreeHeroFadeIn } from "./FreeHeroMotion/FreeHeroFadeIn.astro";

export { default as FreeHeroFlipInBottom } from "./FreeHeroMotion/FreeHeroFlipInBottom.astro";

export { default as FreeHeroFlipInLeft } from "./FreeHeroMotion/FreeHeroFlipInLeft.astro";

export { default as FreeHeroFlipInRight } from "./FreeHeroMotion/FreeHeroFlipInRight.astro";

export { default as FreeHeroFlipInTop } from "./FreeHeroMotion/FreeHeroFlipInTop.astro";

export { default as FreeHeroFlipInX } from "./FreeHeroMotion/FreeHeroFlipInX.astro";

export { default as FreeHeroFlipInY } from "./FreeHeroMotion/FreeHeroFlipInY.astro";

export { default as FreeHeroFloatX } from "./FreeHeroMotion/FreeHeroFloatX.astro";

export { default as FreeHeroFloatY } from "./FreeHeroMotion/FreeHeroFloatY.astro";

import FreeHeroItemIndexExport from "./FreeHeroItem.astro";

/**
 * @pLoc as Loc (Default: new Loc(new NumPer(0, 0), new NumPer(0, 0)))
 * @pSize as Size (Default: new Size())
 * @pRot as string | RespString (Default: "0deg")
 * @pZ as number (Default: 1)
 * @pOrigin as string (Default: "center center")
 * @pFit as boolean (Default: false)
 * @pPointer as boolean (Default: true)
 * @pHideLand as boolean (Default: false)
 * @pHidePort as boolean (Default: false)
 * @pLandOnly as boolean (Default: false)
 * @pPortOnly as boolean (Default: false)
 * @pOpacity as number | RespString (Default: 1)
 */
export const FreeHeroItem = FreeHeroItemIndexExport;

export { default as FreeHeroLightSpeedInLeft } from "./FreeHeroMotion/FreeHeroLightSpeedInLeft.astro";

export { default as FreeHeroLightSpeedInRight } from "./FreeHeroMotion/FreeHeroLightSpeedInRight.astro";

import FreeHeroMoveItemIndexExport from "./FreeHeroMoveItem.astro";

/**
 * @pKeyPoints as MovingKeyPoint[] (Default: [ new MovingKeyPoint( new Loc(new NumPer(0, 0), new NumPer(0, 0)), new Size(), "0deg", 1 ) ])
 * @pIntervals as number[] (Default: [800])
 * @pDelay as number (Default: 0)
 * @pEase as string (Default: "cubic-bezier(.42, 0, .18, 1)")
 * @pLoop as boolean (Default: false)
 * @pLoopFor as number
 * @pLoopInterval as number
 * @pReverse as boolean (Default: false)
 * @pZ as number (Default: 1)
 * @pOrigin as string (Default: "center center")
 * @pFit as boolean (Default: false)
 * @pPointer as boolean (Default: true)
 * @pHideLand as boolean (Default: false)
 * @pHidePort as boolean (Default: false)
 * @pLandOnly as boolean (Default: false)
 * @pPortOnly as boolean (Default: false)
 * @pStartOnView as boolean (Default: true)
 * @pReplayOnView as boolean (Default: false)
 * @pPauseWhenOut as boolean (Default: true)
 * @pViewThreshold as number (Default: 0.15)
 * @pViewMargin as string (Default: "0px 0px -10% 0px")
 * @pViewTarget as "self" | "parent" (Default: "parent")
 */
export const FreeHeroMoveItem = FreeHeroMoveItemIndexExport;

export { default as FreeHeroOrbitSmall } from "./FreeHeroMotion/FreeHeroOrbitSmall.astro";

import FreeHeroPresetItemIndexExport from "./FreeHeroMotion/FreeHeroPresetItem.astro";

/**
 * @pMotion as TFreeHeroMotion
 * @pLoc as Loc (Default: new Loc(new NumPer(0, 0), new NumPer(0, 0)))
 * @pBox as Size (Default: new Size())
 * @pDistance as string | RespString (Default: new RespString("180px", "90px"))
 * @pDuration as number (Default: 900)
 * @pIntervals as number[]
 * @pDelay as number (Default: 0)
 * @pEase as string
 * @pLoop as boolean
 * @pLoopFor as number
 * @pLoopInterval as number
 * @pReverse as boolean (Default: false)
 * @pZ as number (Default: 1)
 * @pOrigin as string (Default: "center center")
 * @pFit as boolean (Default: false)
 * @pPointer as boolean (Default: true)
 * @pHideLand as boolean (Default: false)
 * @pHidePort as boolean (Default: false)
 * @pLandOnly as boolean (Default: false)
 * @pPortOnly as boolean (Default: false)
 */
export const FreeHeroPresetItem = FreeHeroPresetItemIndexExport;

export { default as FreeHeroPulse } from "./FreeHeroMotion/FreeHeroPulse.astro";

export { default as FreeHeroRollInLeft } from "./FreeHeroMotion/FreeHeroRollInLeft.astro";

export { default as FreeHeroRollInRight } from "./FreeHeroMotion/FreeHeroRollInRight.astro";

export { default as FreeHeroRotateIn } from "./FreeHeroMotion/FreeHeroRotateIn.astro";

export { default as FreeHeroRotateInLeft } from "./FreeHeroMotion/FreeHeroRotateInLeft.astro";

export { default as FreeHeroRotateInRight } from "./FreeHeroMotion/FreeHeroRotateInRight.astro";

export { default as FreeHeroSlideInBottom } from "./FreeHeroMotion/FreeHeroSlideInBottom.astro";

export { default as FreeHeroSlideInLeft } from "./FreeHeroMotion/FreeHeroSlideInLeft.astro";

export { default as FreeHeroSlideInRight } from "./FreeHeroMotion/FreeHeroSlideInRight.astro";

export { default as FreeHeroSlideInTop } from "./FreeHeroMotion/FreeHeroSlideInTop.astro";

export { default as FreeHeroSpinReveal } from "./FreeHeroMotion/FreeHeroSpinReveal.astro";

export { default as FreeHeroWiggle } from "./FreeHeroMotion/FreeHeroWiggle.astro";

export { default as FreeHeroZoomIn } from "./FreeHeroMotion/FreeHeroZoomIn.astro";

export { default as FreeHeroZoomInBottom } from "./FreeHeroMotion/FreeHeroZoomInBottom.astro";

export { default as FreeHeroZoomInLeft } from "./FreeHeroMotion/FreeHeroZoomInLeft.astro";

export { default as FreeHeroZoomInRight } from "./FreeHeroMotion/FreeHeroZoomInRight.astro";

export { default as FreeHeroZoomInTop } from "./FreeHeroMotion/FreeHeroZoomInTop.astro";

export { GetDefaultEase } from "./FreeHeroMotion";

export { GetDefaultIntervals } from "./FreeHeroMotion";

export { GetDefaultLoop } from "./FreeHeroMotion";

export { GetDistanceL } from "./FreeHeroMotion";

export { GetDistanceP } from "./FreeHeroMotion";

import HeroIndexExport from "./Hero.astro";

/**
 * @pBg as ElemBg
 * @pBox as Size
 * @pMinH as NumPer
 * @pAlign as Align | "left" | "right" | "center" — MAY BE NEED TO REMOVE OLD STYLE (Default: Align.Center)
 * @pImgF as string (Default: "")
 * @pImgL as string (Default: "")
 * @pImgP as string (Default: "")
 * @pImgAlt as string — وصف صورة خلفية الهيرو لمحركات البحث وقارئات الشاشة. (Default: "")
 */
export const Hero = HeroIndexExport;

import Hero260804IndexExport from "./Hero260804.astro";

/**
 * @pBg as ElemBg
 * @pBox as Size
 * @pMinH as NumPer
 * @pAlign as Align | "left" | "right" | "center" — MAY BE NEED TO REMOVE OLD STYLE (Default: Align.Center)
 * @pImgF as string (Default: "")
 * @pImgL as string (Default: "")
 * @pImgP as string (Default: "")
 * @pImgAlt as string — وصف صورة خلفية الهيرو لمحركات البحث وقارئات الشاشة. (Default: "")
 */
export const Hero260804 = Hero260804IndexExport;

import IndexSecIndexExport from "./IndexSec.astro";

/**
 * @pMedia as EmoMediaData (Default: new EmoMediaData("Vid", "/Media/", "IndexBgVid.mp4"))
 * @pTitleClr as string (Default: "white")
 * @pBlurL as "auto" | "on" | "off" (Default: "off")
 * @pBlurP as "auto" | "on" | "off" (Default: "off")
 */
export const IndexSec = IndexSecIndexExport;

export { MovingKeyPoint } from "./FreeHeroMotion";

export { NegCss } from "./FreeHeroMotion";

export { OffsetLocation } from "./FreeHeroMotion";

import ReadAlsoIndexExport from "./ReadAlso.astro";

/**
 * @pTitle as Text
 * @pDesc as Text
 * @pHeadBg as ElemBg
 * @pBodyBg as ElemBg
 * @pCardBg as ElemBg
 * @pTitleFnt as Text
 * @pDescFnt as Text
 * @pCardTitleFnt as Text
 * @pCardDescFnt as Text
 * @pWidth as Size
 * @pGap as Pixel
 * @pMax as number | string
 * @pMaxP as number | string
 * @pCardRadius as Pixel
 * @pImgHeight as Pixel
 * @pCentered as boolean
 * @Centered as boolean | string
 */
export const ReadAlso = ReadAlsoIndexExport;

import ReadAlsoItemIndexExport from "./ReadAlsoItem.astro";

/**
 * @pTitle as string
 * @pDesc as string
 * @pHref as string
 * @pImg as string
 * @pExternal as boolean (Default: false)
 */
export const ReadAlsoItem = ReadAlsoItemIndexExport;

import RelatedServicesIndexExport from "./RelatedServices.astro";

/**
 * @pTitle as Text
 * @pDesc as Text
 * @pHeadBg as ElemBg
 * @pBodyBg as ElemBg
 * @pCardBg as ElemBg
 * @pTitleFnt as Text
 * @pDescFnt as Text
 * @pCardTitleFnt as Text
 * @pCardDescFnt as Text
 * @pWidth as Size
 * @pGap as Pixel
 * @pMax as number | string
 * @pMaxP as number | string
 * @pCardRadius as Pixel
 * @pImgHeight as Pixel
 * @pCentered as boolean
 * @Centered as boolean | string
 */
export const RelatedServices = RelatedServicesIndexExport;

import RelServiceItemIndexExport from "./RelServiceItem.astro";

/**
 * @pTitle as string
 * @pDesc as string
 * @pHref as string
 * @pImg as string
 * @pBtnText as string (Default: "التفاصيل")
 * @pExternal as boolean (Default: false)
 */
export const RelServiceItem = RelServiceItemIndexExport;

import RelServicesIndexExport from "./RelatedServices.astro";

/**
 * @pTitle as Text
 * @pDesc as Text
 * @pHeadBg as ElemBg
 * @pBodyBg as ElemBg
 * @pCardBg as ElemBg
 * @pTitleFnt as Text
 * @pDescFnt as Text
 * @pCardTitleFnt as Text
 * @pCardDescFnt as Text
 * @pWidth as Size
 * @pGap as Pixel
 * @pMax as number | string
 * @pMaxP as number | string
 * @pCardRadius as Pixel
 * @pImgHeight as Pixel
 * @pCentered as boolean
 * @Centered as boolean | string
 */
export const RelServices = RelServicesIndexExport;

export type { TFreeHeroMotion } from "./FreeHeroMotion";
