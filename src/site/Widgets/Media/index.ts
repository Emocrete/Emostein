import ActiveImgIndexExport from "./ActiveImg.astro";

/**
 * @pImg as string (Default: "")
 * @pImgHover as string (Default: "")
 * @pImgActive as string (Default: "")
 * @pAlt as string (Default: "")
 * @pLink as string (Default: "")
 * @pTarget as "_self" | "_blank" | "_parent" | "_top" (Default: "_self")
 * @pRel as string (Default: "")
 * @pWidth as string | number (Default: "")
 * @pHeight as string | number (Default: "")
 * @pScale as string | number (Default: "")
 * @pClass as string (Default: "")
 * @pFollowParentHover as boolean (Default: false)
 */
export const ActiveImg = ActiveImgIndexExport;

import BgMediaIndexExport from "./BgMedia.astro";

/**
 * @pImg as EmoMediaData
 * @pVid as EmoMediaData
 */
export const BgMedia = BgMediaIndexExport;

import EGallIndexExport from "./EmoGallery.astro";

/**
 * @pFolder as string — @Required
 * Images folder path inside public.
 * @Requires
 * Existing public folder and must contain images with extensions included in pExts. Otherwise, pEmptyText will be shown. (Default: "")
 * @pSize as Size — Gallery outer size in landscape and portrait.
 * * DefVal = new Box("100%", 600, "100%", 400) , L = ("100%",600) , P = ("100%",400)
 * * Requires: No extra prop is required. The whole internal image layout is calculated inside this size. (Default: new Size(new NumPer("100%", "100%"), new NumPer(600, 400)))
 * @pGap as CssSize — Gap between gallery image items.
 * * DefVal = 5 px
 * * Requires: Its effect is visible only when the gallery contains more than one image. (Default: 5)
 * @pRadius as CssSize — Border radius of the gallery outer frame.
 * * DefVal = 10 px
 * * Requires: No extra prop is required. It affects the outer gallery container. (Default: 10)
 * @pItemRadius as CssSize — Border radius of each image item inside the gallery.
 * @default 10
 * Requires: Its effect is visible only when actual image items are rendered. (Default: 10)
 * @pFramePadding as CssSize — Inner padding between the outer gallery frame and the image layout area.
 * * DefVal = 10 px (Default: 10)
 * @pHoverScale as number — Image scale ratio on hover for non-selected images.
 * * DefVal = 1.25
 * * Requires: The effect appears only when image items exist and the device/state supports hover. (Default: 1.25)
 * @pSelectedFrameShare as number — Selected image frame share after clicking an image.
 * Currently stored as data-selected-frame-share, but it has no active visual effect in the current script.
 * * DefVal = 1 (Default: 1)
 * @pSelectedScale as number — Selected image scale ratio after clicking an image.
 * Currently stored as data-selected-scale, but it has no active visual effect in the current script.
 * * DefVal = 1 (Default: 1)
 * @pCaptionFontSize as CssSize — Caption font size displayed over the image on hover.
 * * DefVal = 9 px
 * * Requires: The effect appears only when image items exist and the caption layer becomes visible on hover. (Default: 14)
 * @pName as string — Hidden input name used to store the selected image index.
 * * DefVal = ""
 * * Requires: Useful only when the gallery is inside a form or when external code reads the hidden input value. (Default: "")
 * @pMinThumb as number — Minimum reference thumbnail size used by the layout algorithm.
 * * DefVal = 30 px
 * * Requires: The effect becomes more visible with many images or when the gallery area is small. (Default: 30)
 * @pMaxCols as number — Maximum requested number of gallery columns.
 * Currently stored as data-max-cols, but it has no active visual effect in the current script.
 * * DefVal = 0 (Default: 0)
 * @pMaxRows as number — Maximum requested number of gallery rows.
 * Currently stored as data-max-rows, but it has no active visual effect in the current script.
 * * DefVal = 0 (Default: 0)
 * @pRecursive as boolean — Defines whether images are loaded only from pFolder or also from all nested subfolders.
 * * DefVal = false
 * * Requires: Needs a valid pFolder. The effect appears only when pFolder contains subfolders with valid images. (Default: false)
 * @pExts as string[] — Allowed image extensions to be loaded from pFolder.
 * * DefVal = [".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif"]
 * * Requires: Needs a valid pFolder. Images with extensions outside this list will be ignored. (Default: [".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif"])
 * @pClearOnOutsideClick as boolean — Clears the selected image when clicking outside the gallery.
 * * DefVal = true
 * * Requires: The effect appears only after selecting an image, then clicking outside the gallery area. (Default: true)
 * @pEmptyText as string — Text displayed when no images are found.
 * * DefVal = "لا توجد صور داخل فولدر الجاليري"
 * * Requires: Appears only when pFolder is empty, invalid, or contains no images matching pExts. (Default: "لا توجد صور داخل فولدر الجاليري")
 */
export const EGall = EGallIndexExport;

import EmoGalleryIndexExport from "./EmoGallery.astro";

/**
 * @pFolder as string — @Required
 * Images folder path inside public.
 * @Requires
 * Existing public folder and must contain images with extensions included in pExts. Otherwise, pEmptyText will be shown. (Default: "")
 * @pSize as Size — Gallery outer size in landscape and portrait.
 * * DefVal = new Box("100%", 600, "100%", 400) , L = ("100%",600) , P = ("100%",400)
 * * Requires: No extra prop is required. The whole internal image layout is calculated inside this size. (Default: new Size(new NumPer("100%", "100%"), new NumPer(600, 400)))
 * @pGap as CssSize — Gap between gallery image items.
 * * DefVal = 5 px
 * * Requires: Its effect is visible only when the gallery contains more than one image. (Default: 5)
 * @pRadius as CssSize — Border radius of the gallery outer frame.
 * * DefVal = 10 px
 * * Requires: No extra prop is required. It affects the outer gallery container. (Default: 10)
 * @pItemRadius as CssSize — Border radius of each image item inside the gallery.
 * @default 10
 * Requires: Its effect is visible only when actual image items are rendered. (Default: 10)
 * @pFramePadding as CssSize — Inner padding between the outer gallery frame and the image layout area.
 * * DefVal = 10 px (Default: 10)
 * @pHoverScale as number — Image scale ratio on hover for non-selected images.
 * * DefVal = 1.25
 * * Requires: The effect appears only when image items exist and the device/state supports hover. (Default: 1.25)
 * @pSelectedFrameShare as number — Selected image frame share after clicking an image.
 * Currently stored as data-selected-frame-share, but it has no active visual effect in the current script.
 * * DefVal = 1 (Default: 1)
 * @pSelectedScale as number — Selected image scale ratio after clicking an image.
 * Currently stored as data-selected-scale, but it has no active visual effect in the current script.
 * * DefVal = 1 (Default: 1)
 * @pCaptionFontSize as CssSize — Caption font size displayed over the image on hover.
 * * DefVal = 9 px
 * * Requires: The effect appears only when image items exist and the caption layer becomes visible on hover. (Default: 14)
 * @pName as string — Hidden input name used to store the selected image index.
 * * DefVal = ""
 * * Requires: Useful only when the gallery is inside a form or when external code reads the hidden input value. (Default: "")
 * @pMinThumb as number — Minimum reference thumbnail size used by the layout algorithm.
 * * DefVal = 30 px
 * * Requires: The effect becomes more visible with many images or when the gallery area is small. (Default: 30)
 * @pMaxCols as number — Maximum requested number of gallery columns.
 * Currently stored as data-max-cols, but it has no active visual effect in the current script.
 * * DefVal = 0 (Default: 0)
 * @pMaxRows as number — Maximum requested number of gallery rows.
 * Currently stored as data-max-rows, but it has no active visual effect in the current script.
 * * DefVal = 0 (Default: 0)
 * @pRecursive as boolean — Defines whether images are loaded only from pFolder or also from all nested subfolders.
 * * DefVal = false
 * * Requires: Needs a valid pFolder. The effect appears only when pFolder contains subfolders with valid images. (Default: false)
 * @pExts as string[] — Allowed image extensions to be loaded from pFolder.
 * * DefVal = [".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif"]
 * * Requires: Needs a valid pFolder. Images with extensions outside this list will be ignored. (Default: [".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif"])
 * @pClearOnOutsideClick as boolean — Clears the selected image when clicking outside the gallery.
 * * DefVal = true
 * * Requires: The effect appears only after selecting an image, then clicking outside the gallery area. (Default: true)
 * @pEmptyText as string — Text displayed when no images are found.
 * * DefVal = "لا توجد صور داخل فولدر الجاليري"
 * * Requires: Appears only when pFolder is empty, invalid, or contains no images matching pExts. (Default: "لا توجد صور داخل فولدر الجاليري")
 */
export const EmoGallery = EmoGalleryIndexExport;

export { default as Gallery } from "./Gallery.astro";

import RespImageIndexExport from "./RespImage.astro";

/**
 * @pImg as EmoMediaData
 */
export const RespImage = RespImageIndexExport;

import RespImgIndexExport from "./RespImage.astro";

/**
 * @pImg as EmoMediaData
 */
export const RespImg = RespImgIndexExport;

import ShadowImgIndexExport from "./ShadowImg.astro";

/**
 * @pImg as string (Default: "/Media/ErrorImg.webp")
 */
export const ShadowImg = ShadowImgIndexExport;

import YouTubeIndexExport from "./YouTube.astro";

/**
 * @pVideoId as string
 * @pTitle as string (Default: "YouTube Video Player")
 * @pWidth as number (Default: 800)
 */
export const YouTube = YouTubeIndexExport;

import YTPlayerIndexExport from "./YouTube.astro";

/**
 * @pVideoId as string
 * @pTitle as string (Default: "YouTube Video Player")
 * @pWidth as number (Default: 800)
 */
export const YTPlayer = YTPlayerIndexExport;
