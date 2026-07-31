export { default as Badge } from "./Badge.astro";

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

/**
 * EmoBtn
 *
 * Props:
 * data-own-size: Lets button keep its internal width inside Stack / Strip instead of being stretched.
 */
export { default as EmoBtn } from "./Btn/EmoBtn.astro";

/**
 * EmoCall
 *
 * Props:
 * pText: النص الظاهر داخل زر الاتصال.
 * pIconImgs: صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * pIconPos: مكان الأيقونة داخل الزر.
 * pBgColors: ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * pBgImgs: صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * pTitleColors: ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * data-own-size: Lets button keep its internal width inside Stack / Strip instead of being stretched.
 */
export { default as EmoCall } from "./Btn/EmoCall.astro";

export { default as EmoCountdown } from "./EmoCountdown.astro";

/**
 * EmoDet
 *
 * Props:
 * pText: نص زر التفاصيل.
 * pHref: رابط التفاصيل. يمكن استخدام href مباشرة كذلك.
 * pBlank: فتح الرابط في تبويب جديد مع rel آمن.
 * Sky: Preset سماوي قديم للتوافق.
 * Bistage: Preset بيستاج قديم للتوافق.
 * Gold: Preset ذهبي قديم للتوافق.
 * Green: Preset أخضر داكن قديم للتوافق.
 * Ghost: Preset شفاف قديم للتوافق.
 * Light: Preset فاتح قديم للتوافق.
 * pIconImgs: صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * pIconPos: مكان الأيقونة داخل الزر.
 * pBgColors: ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * pBgImgs: صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * pTitleColors: ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * data-own-size: Lets button keep its internal width inside Stack / Strip instead of being stretched.
 */
export { default as EmoDet } from "./Btn/EmoDet.astro";

export { default as Emograph } from "./Content/Emograph.astro";

export { default as EmoList } from "./Content/EmoList.astro";

/**
 * EmoWhats
 *
 * Props:
 * pText: النص الظاهر داخل زر الواتساب.
 * pPhone: رقم الواتساب بصيغة محلية أو دولية.
 * pMessage: رسالة جاهزة اختيارية تفتح داخل محادثة واتساب.
 * pQrImg: صورة QR مخصصة عند الحاجة. الافتراضي مدمج للرقم الأساسي.
 * Green: Preset واتساب أخضر.
 * GreenDark: Preset واتساب أخضر داكن.
 * Sky: Preset سماوي قديم للتوافق.
 * Bistage: Preset بيستاج قديم للتوافق.
 * pIconImgs: صور الأيقونة في الحالات الثلاث: Normal / Hover / Click.
 * pIconPos: مكان الأيقونة داخل الزر.
 * pBgColors: ألوان خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * pBgImgs: صور خلفية الزر في الحالات الثلاث: Normal / Hover / Click.
 * pTitleColors: ألوان عنوان الزر في الحالات الثلاث: Normal / Hover / Click.
 * data-own-size: Lets button keep its internal width inside Stack / Strip instead of being stretched.
 */
export { default as EmoWhats } from "./Btn/EmoWhats.astro";

export { GetBoolAttr } from "./Btn/ButtonPresets";

export { GetButtonPreset } from "./Btn/ButtonPresets";

export { GetButtonTitleColors } from "./Btn/ButtonPresets";

export { default as Grid } from "./Layout/Grid.astro";

export { default as HzStack } from "./Layout/HzStack.astro";

export { default as IndexBtn } from "./Btn/IndexBtn.astro";

export { default as SecTitle } from "./SecTitle.astro";

export { default as SiteSearch404 } from "./SiteSearch404.astro";

export { default as Stack } from "./Layout/Stack.astro";

export { default as Tree } from "./Tree.astro";

export { default as VrStack } from "./Layout/VrStack.astro";
