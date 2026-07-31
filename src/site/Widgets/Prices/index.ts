import PriceIndexExport from "./Price.astro";

/**
 * @pTitle as Text — Service title that priced
 * DefVal = العنوان (Default: Text.Body.OfText("العنوان"))
 * @pTitlePlace as "side" | "top" (Default: "side")
 * @pPrice as string | number (Default: "0000")
 * @pPriceLabel as string (Default: "")
 */
export const Price = PriceIndexExport;

import PriceCardIndexExport from "./PriceCard.astro";

/**
 * @pCaption as Text — Caption shown in the blue top band.
 * DefVal = تقرير معتمد من مهندس استشاري فقط (Default: Text.H6.OfSize(17, 12).White.Bold.OfText("تقرير معتمد من مهندس استشاري فقط"))
 * @pStart as Text — Text before the price.
 * DefVal = يبدأ من (Default: Text.H3.OfSize(29, 20).Bold.OfText("يبدأ من"))
 * @pPrice as string | number — Price value.
 * DefVal = 3000 (Default: 3000)
 * @pPriceFnt as Text — Price text style.
 * DefVal = Text.H3.OfSize(30, 22).Bold.WithColor("#3797F5") (Default: Text.H3.OfSize(30, 22).Bold.WithColor("#3797F5"))
 * @pCurrency as Text — Currency text.
 * DefVal = جنيه (Default: Text.H3.OfSize(25, 18).Bold.OfText("جنيه"))
 * @data-own-size as boolean | string — Lets the widget keep its own size instead of being stretched by parent Stack row sizing.
 * DefVal = false (Default: false)
 */
export const PriceCard = PriceCardIndexExport;

import ThemedPriceCardHzIndexExport from "./ThemedPriceCardHz.astro";

/**
 * @pThemeColor as string
 * @pImage as string
 * @pImageAlt as string
 * @pImageMoveAxis as "x" | "y" | "xy" | "none"
 * @pImageDuration as string
 * @pImageScale as number | string
 * @pImagePan as string
 * @pImagePosition as string
 * @pIcon as string
 * @pIconAlt as string
 * @pIconMask as boolean | string
 * @pIconColor as string
 * @pIconMotion as "launch" | "fly" | "spin" | "pulse" | "float" | "none"
 * @pActionTitle as string
 * @pActionText as string
 * @pActionLink as string
 * @pActionHref as string
 * @pActionColor as string
 * @pActionTarget as string
 * @ForcedHz as boolean | string
 * @pForcedHz as boolean | string
 * @pMediaWidth as NumPer
 * @pMediaHeight as Pixel
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pIntroDelay as string
 * @pIntro as boolean | string
 * @data-own-size as boolean | string
 */
export const ThemedPriceCardHz = ThemedPriceCardHzIndexExport;

import ThemedPriceCardVrIndexExport from "./ThemedPriceCardVr.astro";

/**
 * @pThemeColor as string
 * @pImage as string
 * @pImageAlt as string
 * @pImageMoveAxis as "x" | "y" | "xy" | "none"
 * @pImageDuration as string
 * @pImageScale as number | string
 * @pImagePan as string
 * @pImagePosition as string
 * @pIcon as string
 * @pIconAlt as string
 * @pIconMask as boolean | string
 * @pIconColor as string
 * @pIconMotion as "launch" | "fly" | "spin" | "pulse" | "float" | "none"
 * @pActionTitle as string
 * @pActionText as string
 * @pActionLink as string
 * @pActionHref as string
 * @pActionColor as string
 * @pActionTarget as string
 * @pTopHeight as Pixel
 * @pRadius as Pixel
 * @pPad as Pixel
 * @pGap as Pixel
 * @pIconSize as Pixel
 * @pRestOpacity as number | string
 * @pIntroDelay as string
 * @pIntro as boolean | string
 * @data-own-size as boolean | string
 */
export const ThemedPriceCardVr = ThemedPriceCardVrIndexExport;
