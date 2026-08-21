import BadgeIndexExport from "./Badge.astro";

/**
 * @pYears as string | number
 * @pYearsText as string
 * @pYearsImg as TBadgeImg
 * @pWorks as string | number
 * @pWorksText as string
 * @pWorksImg as TBadgeImg
 * @pDuration as string | number
 * @pDurationText as string
 * @pDurationImg as TBadgeImg
 * @pQualityText as string
 * @pQualityImg as TBadgeImg
 * @pScopeText as string
 * @pScopeImg as TBadgeImg
 * @pTextPos as TBadgeTextPos
 * @pNumberView as TBadgeNumberView
 * @pNumSize as Pixel
 * @pTextSize as Pixel
 * @pImgTextGap as Pixel
 * @pNumTextGap as Pixel
 * @pItemGap as Pixel
 * @pImgSize as Size
 * @pUseBg as boolean
 * @pBgColor as string
 * @pPad as Pixel
 * @pWidth as Pixel
 * @pColor as string
 * @pMobMaxCols as number
 */
export const Badge = BadgeIndexExport;

export type { ButtonColorPreset } from "./Btn/ButtonPresets";

export { ButtonColorPresets } from "./Btn/ButtonPresets";

/**
 * ButtonPresetProps
 *
 * Properties:
 * Black: Preset: خلفية سوداء وهوفر داكن.
 * BlackOrange: Preset: خلفية سوداء مع هوفر برتقالي.
 * BlackSky: Preset: خلفية سوداء مع هوفر سماوي.
 * BlackGreen: Preset: خلفية سوداء مع هوفر أخضر.
 * BlackBistage: Preset: خلفية سوداء مع هوفر بيستاج.
 * BlackRed: Preset: خلفية سوداء مع هوفر أحمر.
 * SkyBlack: Preset: خلفية سماوية مع هوفر أسود.
 * SkyBistage: Preset: خلفية سماوية مع هوفر بيستاج.
 * BistageBlack: Preset: خلفية بيستاج مع هوفر أسود.
 * BistageSky: Preset: خلفية بيستاج مع هوفر سماوي.
 * BistageOrange: Preset: خلفية بيستاج مع هوفر برتقالي.
 * OrangeBlack: Preset: خلفية برتقالية مع هوفر أسود.
 * OrangeSky: Preset: خلفية برتقالية فاتحة مع هوفر سماوي داكن.
 * GreenBlack: Preset: خلفية خضراء فاتحة مع هوفر أسود.
 * GreenSky: Preset: خلفية خضراء فاتحة مع هوفر سماوي داكن.
 * GrayBlack: Preset: خلفية رمادية فاتحة مع هوفر أسود.
 * GrayOrange: Preset: خلفية رمادية فاتحة مع هوفر برتقالي.
 * CreamyBlack: Preset: خلفية كريمي مع هوفر أسود.
 * YellowBlack: Preset: خلفية صفراء مع هوفر أسود.
 * RedBlack: Preset: خلفية حمراء مع هوفر أسود.
 * WhiteBlack: Preset: خلفية بيضاء مع هوفر أسود.
 */
export type { ButtonPresetProps } from "./Btn/ButtonPresets";

export { CreateButtonPreset } from "./Btn/ButtonPresets";

import EmoBtnIndexExport from "./Btn/EmoBtn.astro";

/**
 * @pText as string (Default: "")
 * @pIcon as string (Default: "")
 * @pIconHover as string
 * @pIconActive as string
 * @pIconPos as "right" | "left" | "top" | "bottom" (Default: "right")
 * @pWidth as string (Default: "fit-content")
 * @pHeight as string (Default: "auto")
 * @pRadius as string (Default: "5px")
 * @pBgColor as string
 * @pBgColorHover as string
 * @pBgColorActive as string
 * @pBgImg as string (Default: "")
 * @pBgImgHover as string
 * @pBgImgActive as string
 * @pTextColor as string
 * @pTextColorHover as string
 * @pTextColorActive as string
 * @pFontSize as string (Default: "16px")
 * @data-own-size as boolean | string — Lets button keep its internal width inside Stack / Strip instead of being stretched. (Default: true)
 */
export const EmoBtn = EmoBtnIndexExport;

import EmoCallIndexExport from "./Btn/EmoCall.astro";

/**
 * @pText as string — النص الظاهر داخل زر الاتصال.
 * @pIconImgs as HoverImg — صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * @pIconPos as "right" | "left" | "top" | "bottom" — مكان الأيقونة داخل الزر. (Default: "right")
 * @pWidth as string (Default: "250px")
 * @pHeight as string (Default: "50px")
 * @pRadius as string (Default: "5px")
 * @pBgColors as HoverColors — ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pBgImgs as HoverImg — صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pTitleColors as HoverColors — ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pFontSize as string (Default: "18px")
 * @data-own-size as boolean | string — Lets button keep its internal width inside Stack / Strip instead of being stretched. (Default: true)
 */
export const EmoCall = EmoCallIndexExport;

import EmoCallIconIndexExport from "./Btn/EmoCallIcon.astro";

/**
 * @pText as string — النص الظاهر داخل زر الاتصال.
 * @pIconImgs as HoverImg — صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * @pIconPos as "right" | "left" | "top" | "bottom" — مكان الأيقونة داخل الزر. (Default: "left")
 * @pWidth as string (Default: "260px")
 * @pHeight as string (Default: "58px")
 * @pRadius as string (Default: "999px")
 * @pBgColors as HoverColors — ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pBgImgs as HoverImg — صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pTitleColors as HoverColors — ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pFontSize as string (Default: "18px")
 * @data-own-size as boolean | string — Lets button keep its internal width inside Stack / Strip instead of being stretched. (Default: true)
 */
export const EmoCallIcon = EmoCallIconIndexExport;

import EmoCountdownIndexExport from "./EmoCountdown.astro";

/**
 * @pDeadline as string | Date — Final deadline used by the client countdown.
 * Use a full ISO value whenever possible, e.g. 2026-11-05T23:59:59+02:00.
 * @pSize as Size — Responsive width/height box for the widget.
 * * DefVal = new Size(new NumPer("1120px", "94%")) (Default: new Size(new NumPer("1120px", "94%")))
 * @pAccent as string — Accent color used for the first card, separators, and live glow.
 * * DefVal = Colors.Yellow (Default: Colors.Yellow)
 * @pTextColor as string — Main text color.
 * * DefVal = Colors.WhiteOff (Default: Colors.WhiteOff)
 * @pExpiredText as string — Optional text shown only after the countdown reaches zero.
 * * DefVal = "" (Default: "")
 */
export const EmoCountdown = EmoCountdownIndexExport;

import EmoDetIndexExport from "./Btn/EmoDet.astro";

/**
 * @pText as string — نص زر التفاصيل.
 * @pHref as string — رابط التفاصيل. يمكن استخدام href مباشرة كذلك.
 * @pBlank as boolean — فتح الرابط في تبويب جديد مع rel آمن. (Default: false)
 * @Sky as boolean — Preset سماوي قديم للتوافق. (Default: false)
 * @Bistage as boolean — Preset بيستاج قديم للتوافق. (Default: false)
 * @Gold as boolean — Preset ذهبي قديم للتوافق. (Default: false)
 * @Green as boolean — Preset أخضر داكن قديم للتوافق. (Default: false)
 * @Ghost as boolean — Preset شفاف قديم للتوافق. (Default: false)
 * @Light as boolean — Preset فاتح قديم للتوافق. (Default: false)
 * @pIconImgs as HoverImg — صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * @pIconPos as "right" | "left" | "top" | "bottom" — مكان الأيقونة داخل الزر. (Default: "right")
 * @pWidth as string (Default: "170px")
 * @pHeight as string (Default: "48px")
 * @pRadius as string (Default: "999px")
 * @pBgColors as HoverColors — ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pBgImgs as HoverImg — صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pTitleColors as HoverColors — ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pFontSize as string (Default: "18px")
 * @data-own-size as boolean | string — Lets button keep its internal width inside Stack / Strip instead of being stretched. (Default: true)
 */
export const EmoDet = EmoDetIndexExport;

import EmographIndexExport from "./Content/Emograph.astro";

/**
 * @pTitle as Text — Main title text displayed at the top of the Emograph widget.
 * * DefVal = Text.Body.WithText("العنوان") only when both pTitle and pText are not provided.
 * @pText as Text — Body text displayed below the title.
 * * DefVal = Text.Body.WithText("الوصف") only when both pTitle and pText are not provided.
 * * Requires: Default slot content is rendered only when pText exists.
 * @pSize as Size — Responsive width box used to control the widget width in landscape and portrait orientations.
 * * DefVal = new Box() (Default: new Size())
 * @data-own-size as boolean — Lets the widget keep its own size instead of being stretched by parent Stack row sizing.
 * * DefVal = false
 * * Requires: Effective only when this widget is a direct child of Stack with pDir="Row".
 */
export const Emograph = EmographIndexExport;

export { default as EmoLine } from "./Content/EmoLine.astro";

import EmoListIndexExport from "./Content/EmoList.astro";

/**
 * @pWidth as RespString (Default: new RespString("50%", "100%"))
 * @pTitle as Text
 * @pDesc as Text
 * @pHeadBg as ElemBg (Default: new ElemBg("transparent"))
 * @pItems as TItem[] — Legacy item source kept only for pages that have not yet moved to the default slot.
 * New usage should place ListItem, Emograph, or TotalGraph as direct slot children. (Default: [])
 * @pItemFnt as Text — Default text format used only by direct ListItem children and legacy pItems content. (Default: Text.Body)
 * @pItemsBg as ElemBg (Default: new ElemBg("transparent"))
 * @pNumbered as boolean (Default: true)
 * @pBulletIcon as string (Default: "")
 */
export const EmoList = EmoListIndexExport;

import EmoTableIndexExport from "./Layout/EmoTable.astro";

/**
 * @pBorderColor as string — Border color shared by all table cells. (Default: Colors.Gray2)
 * @pBorderWidth as Pixel — Responsive border width shared by all table cells. (Default: new Pixel(1))
 * @pCellPad as Pixel — Responsive default padding inherited by EmoTableCell children. (Default: new Pixel(12, 8))
 */
export const EmoTable = EmoTableIndexExport;

import EmoTableCellIndexExport from "./Layout/EmoTableCell.astro";

/**
 * @pText as Text — Text format and optional text value rendered by the cell. Default slot content, when supplied, uses the same format. (Default: Text.Body)
 * @pBg as string — Cell-specific background color. Takes priority over the parent EmoTableRow pBg.
 */
export const EmoTableCell = EmoTableCellIndexExport;

import EmoTableRowIndexExport from "./Layout/EmoTableRow.astro";

/**
 * @pBg as string — Background color inherited by every EmoTableCell in this row unless the cell defines its own pBg.
 */
export const EmoTableRow = EmoTableRowIndexExport;

import EmoWhatsIndexExport from "./Btn/EmoWhats.astro";

/**
 * @pText as string — النص الظاهر داخل زر الواتساب.
 * @pPhone as string — رقم الواتساب بصيغة محلية أو دولية. (Default: cDefaultPhoneText)
 * @pMessage as string — رسالة جاهزة اختيارية تفتح داخل محادثة واتساب. (Default: "")
 * @pQrImg as string — صورة QR مخصصة عند الحاجة. الافتراضي مدمج للرقم الأساسي.
 * @Green as boolean — Preset واتساب أخضر. (Default: false)
 * @GreenDark as boolean — Preset واتساب أخضر داكن. (Default: false)
 * @Sky as boolean — Preset سماوي قديم للتوافق. (Default: false)
 * @Bistage as boolean — Preset بيستاج قديم للتوافق. (Default: false)
 * @pIconImgs as HoverImg — صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * @pIconPos as "right" | "left" | "top" | "bottom" — مكان الأيقونة داخل الزر. (Default: "right")
 * @pWidth as string (Default: "250px")
 * @pHeight as string (Default: "50px")
 * @pRadius as string (Default: "5px")
 * @pBgColors as HoverColors — ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pBgImgs as HoverImg — صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pTitleColors as HoverColors — ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pFontSize as string (Default: "18px")
 * @data-own-size as boolean | string — Lets button keep its internal width inside Stack / Strip instead of being stretched. (Default: true)
 */
export const EmoWhats = EmoWhatsIndexExport;

import EmoWhatsIconIndexExport from "./Btn/EmoWhatsIcon.astro";

/**
 * @pText as string — النص الظاهر داخل زر الواتساب.
 * @pPhone as string — رقم الواتساب بصيغة محلية أو دولية. (Default: cDefaultPhoneText)
 * @pMessage as string — رسالة جاهزة اختيارية تفتح داخل محادثة واتساب. (Default: "")
 * @pQrImg as string — صورة QR مخصصة عند الحاجة. الافتراضي مدمج للرقم الأساسي.
 * @Green as boolean — Preset واتساب أخضر. (Default: false)
 * @GreenDark as boolean — Preset واتساب أخضر داكن. (Default: false)
 * @Sky as boolean — Preset سماوي قديم للتوافق. (Default: false)
 * @Bistage as boolean — Preset بيستاج قديم للتوافق. (Default: false)
 * @pIconImgs as HoverImg — صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * @pIconPos as "right" | "left" | "top" | "bottom" — مكان الأيقونة داخل الزر. (Default: "left")
 * @pWidth as string (Default: "260px")
 * @pHeight as string (Default: "58px")
 * @pRadius as string (Default: "999px")
 * @pBgColors as HoverColors — ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pBgImgs as HoverImg — صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pTitleColors as HoverColors — ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * @pFontSize as string (Default: "18px")
 * @data-own-size as boolean | string — Lets button keep its internal width inside Stack / Strip instead of being stretched. (Default: true)
 */
export const EmoWhatsIcon = EmoWhatsIconIndexExport;

export { GetBoolAttr } from "./Btn/ButtonPresets";

export { GetButtonPreset } from "./Btn/ButtonPresets";

export { GetButtonTitleColors } from "./Btn/ButtonPresets";

import GridIndexExport from "./Layout/Grid.astro";

/**
 * @pMax as number | string
 * @pMaxP as number | string
 * @pSize as Size
 * @pGap as Pixel
 * @pPad as Pixel
 * @pMargin as Pixel
 * @pBg as ElemBg
 * @pRadius as Pixel
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @Centered as boolean | string
 * @pCentered as boolean | string
 */
export const Grid = GridIndexExport;

import HzStackIndexExport from "./Layout/HzStack.astro";

/**
 * @pSize as Size
 * @pGap as Pixel
 * @pPad as Pixel
 * @pMargin as Pixel
 * @pBg as ElemBg
 * @pBgOpacity as Percent
 * @pRadius as Pixel
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pForceHz as boolean
 */
export const HzStack = HzStackIndexExport;

import IndexBtnIndexExport from "./Btn/IndexBtn.astro";

/**
 * @pText as string (Default: "اسم العنصر")
 * @pIcon as string (Default: "")
 * @pIconHover as string
 * @pIconActive as string
 * @pIconPos as "right" | "left" | "top" | "bottom" (Default: "left")
 * @pWidth as string (Default: "360px")
 * @pHeight as string (Default: "40px")
 * @pRadius as string (Default: "5px")
 * @pBgColor as string (Default: "#ffffff")
 * @pBgColorHover as string
 * @pBgColorActive as string
 * @pBgImg as string (Default: "/Media/IndexBtn.webp")
 * @pBgImgHover as string
 * @pBgImgActive as string
 * @pTextColor as string (Default: "white")
 * @pTextColorHover as string (Default: Colors.OrangeDark)
 * @pTextColorActive as string
 * @pFontSize as string (Default: "16px")
 */
export const IndexBtn = IndexBtnIndexExport;

import ListItemIndexExport from "./Content/ListItem.astro";

/**
 * @pText as string — Plain text rendered as one direct EmoList item.
 */
export const ListItem = ListItemIndexExport;

import SecTitleIndexExport from "./SecTitle.astro";

/**
 * @pTitle as string
 * @pDesc as string
 */
export const SecTitle = SecTitleIndexExport;

import SiteSearch404IndexExport from "./SiteSearch404.astro";

/**
 * @pMaxResults as number (Default: 12)
 */
export const SiteSearch404 = SiteSearch404IndexExport;

import StackIndexExport from "./Layout/Stack.astro";

/**
 * @pDir as StackDir
 * @pWidth as StackCssValue
 * @pHeight as StackCssValue
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pGap as StackCssValue
 * @pPad as StackCssValue
 * @pFlipNarrow as boolean
 * @pBgColor as ElemBg
 * @pBgOpacity as Percent
 * @pBlur as StackCssValue
 * @pMainSizeMode as StackItemSizeMode — اتجاه Row: المقاس الأساسي = العرض.
 * اتجاه Col: المقاس الأساسي = الارتفاع.
 * Own   : كل عنصر بحجمه الطبيعي.
 * Equal : Row يوزع العرض بالتساوي، و Col يساوي الارتفاع على أكبر عنصر.
 * Fixed : كل العناصر تلتزم بقيمة pItemMainSize.
 * @pCrossSizeMode as StackItemSizeMode — اتجاه Row: المقاس الثانوي = الارتفاع.
 * اتجاه Col: المقاس الثانوي = العرض.
 * Own   : كل عنصر بحجمه الطبيعي.
 * Equal : كل العناصر على أكبر مقاس ثانوي داخل المجموعة.
 * Fixed : كل العناصر تلتزم بقيمة pItemCrossSize.
 * @pItemMainSize as StackCssValue
 * @pItemCrossSize as StackCssValue
 */
export const Stack = StackIndexExport;

import TotalGraphIndexExport from "./Content/TotalGraph.astro";

/**
 * @pSize as Size — Responsive width and height of the composed paragraph container.
 * * DefVal = new Size() (Default: new Size())
 * @data-own-size as boolean — Lets the widget keep its own size instead of being stretched by parent Stack row sizing.
 * * DefVal = false
 * * Requires: Effective only when this widget is a direct child of Stack with pDir="Row".
 */
export const TotalGraph = TotalGraphIndexExport;

export { default as Tree } from "./Tree.astro";

import VrStackIndexExport from "./Layout/VrStack.astro";

/**
 * @pSize as Size
 * @pWidth as Pixel
 * @pHeight as Pixel
 * @pGap as Pixel
 * @pPad as Pixel
 * @pMargin as Pixel
 * @pBg as ElemBg
 * @pBgColor as ElemBg
 * @pBgOpacity as Percent
 * @pBlur as Pixel
 * @pRadius as Pixel
 * @pHzAlign as HzAlignValue
 * @pVrAlign as VrAlignValue
 * @pFitContent as boolean
 */
export const VrStack = VrStackIndexExport;
