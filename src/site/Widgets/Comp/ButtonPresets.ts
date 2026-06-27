import { Colors, HoverColors } from "@/TypesLib";

export interface ButtonPresetProps {
	/** Preset: خلفية سوداء وهوفر داكن. */
	Black?: boolean;

	/** Preset: خلفية سوداء مع هوفر برتقالي. */
	BlackOrange?: boolean;

	/** Preset: خلفية سوداء مع هوفر سماوي. */
	BlackSky?: boolean;

	/** Preset: خلفية سوداء مع هوفر أخضر. */
	BlackGreen?: boolean;

	/** Preset: خلفية سوداء مع هوفر بيستاج. */
	BlackBistage?: boolean;

	/** Preset: خلفية سوداء مع هوفر أحمر. */
	BlackRed?: boolean;

	/** Preset: خلفية سماوية مع هوفر أسود. */
	SkyBlack?: boolean;

	/** Preset: خلفية سماوية مع هوفر بيستاج. */
	SkyBistage?: boolean;

	/** Preset: خلفية بيستاج مع هوفر أسود. */
	BistageBlack?: boolean;

	/** Preset: خلفية بيستاج مع هوفر سماوي. */
	BistageSky?: boolean;

	/** Preset: خلفية بيستاج مع هوفر برتقالي. */
	BistageOrange?: boolean;

	/** Preset: خلفية برتقالية مع هوفر أسود. */
	OrangeBlack?: boolean;

	/** Preset: خلفية برتقالية فاتحة مع هوفر سماوي داكن. */
	OrangeSky?: boolean;

	/** Preset: خلفية خضراء فاتحة مع هوفر أسود. */
	GreenBlack?: boolean;

	/** Preset: خلفية خضراء فاتحة مع هوفر سماوي داكن. */
	GreenSky?: boolean;

	/** Preset: خلفية رمادية فاتحة مع هوفر أسود. */
	GrayBlack?: boolean;

	/** Preset: خلفية رمادية فاتحة مع هوفر برتقالي. */
	GrayOrange?: boolean;

	/** Preset: خلفية كريمي مع هوفر أسود. */
	CreamyBlack?: boolean;

	/** Preset: خلفية صفراء مع هوفر أسود. */
	YellowBlack?: boolean;

	/** Preset: خلفية حمراء مع هوفر أسود. */
	RedBlack?: boolean;

	/** Preset: خلفية بيضاء مع هوفر أسود. */
	WhiteBlack?: boolean;
}

export interface ButtonColorPreset {
	BgColors: HoverColors;
	TitleColors: HoverColors;
}

type CssColor = string;

const cDarkText = Colors.Black;
const cLightText = "#ffffff";

const cNamedColors: Record<string, string> = {
	black: "#000000",
	white: "#ffffff",
	orange: "#ffa500",
	green: "#008000",
	red: "#ff0000",
	transparent: "#ffffff",
};

export const ButtonColorPresets: Record<keyof ButtonPresetProps, ButtonColorPreset> = {
	Black: CreateButtonPreset(Colors.Black, Colors.Gray5),
	BlackOrange: CreateButtonPreset(Colors.Black, Colors.OrangeDark),
	BlackSky: CreateButtonPreset(Colors.Black, Colors.Sky),
	BlackGreen: CreateButtonPreset(Colors.Black, Colors.GreenLite),
	BlackBistage: CreateButtonPreset(Colors.Black, Colors.Bistage),
	BlackRed: CreateButtonPreset(Colors.Black, Colors.Red),
	SkyBlack: CreateButtonPreset(Colors.Sky, Colors.Black),
	SkyBistage: CreateButtonPreset(Colors.Sky, Colors.BistageDark),
	BistageBlack: CreateButtonPreset(Colors.Bistage, Colors.Black),
	BistageSky: CreateButtonPreset(Colors.Bistage, Colors.SkyDark),
	BistageOrange: CreateButtonPreset(Colors.Bistage, Colors.OrangeDark),
	OrangeBlack: CreateButtonPreset(Colors.OrangeLite, Colors.Black),
	OrangeSky: CreateButtonPreset(Colors.OrangeLite, Colors.SkyDark),
	GreenBlack: CreateButtonPreset(Colors.GreenLite, Colors.Black),
	GreenSky: CreateButtonPreset(Colors.GreenLite, Colors.SkyDark),
	GrayBlack: CreateButtonPreset(Colors.Gray1, Colors.Black),
	GrayOrange: CreateButtonPreset(Colors.Gray1, Colors.OrangeDark),
	CreamyBlack: CreateButtonPreset(Colors.Creamy, Colors.Black),
	YellowBlack: CreateButtonPreset(Colors.Yellow, Colors.Black),
	RedBlack: CreateButtonPreset(Colors.Red, Colors.Black),
	WhiteBlack: CreateButtonPreset(Colors.WhiteOff, Colors.Black),
};

const cPresetPriority: Array<keyof ButtonPresetProps> = [
	"Black",
	"BlackOrange",
	"BlackSky",
	"BlackGreen",
	"BlackBistage",
	"BlackRed",
	"SkyBlack",
	"SkyBistage",
	"BistageBlack",
	"BistageSky",
	"BistageOrange",
	"OrangeBlack",
	"OrangeSky",
	"GreenBlack",
	"GreenSky",
	"GrayBlack",
	"GrayOrange",
	"CreamyBlack",
	"YellowBlack",
	"RedBlack",
	"WhiteBlack",
];

export function GetButtonPreset(pProps: ButtonPresetProps): ButtonColorPreset | undefined {
	const cName = cPresetPriority.find((pName) => pProps[pName]);

	return cName ? ButtonColorPresets[cName] : undefined;
}

export function GetButtonTitleColors(pBgColors: HoverColors): HoverColors {
	return new HoverColors(
		GetReadableTextColor(pBgColors.Normal),
		GetReadableTextColor(pBgColors.Hover),
		GetReadableTextColor(pBgColors.Click),
	);
}

export function CreateButtonPreset(
	pNormal: CssColor,
	pHover: CssColor,
	pClick?: CssColor,
): ButtonColorPreset {
	const cBgColors = new HoverColors(pNormal, pHover, pClick);

	return {
		BgColors: cBgColors,
		TitleColors: GetButtonTitleColors(cBgColors),
	};
}

export function GetBoolAttr(pValue: boolean | string | null | undefined, pDefault = false): boolean {
	if (pValue === undefined || pValue === null) return pDefault;
	if (typeof pValue === "boolean") return pValue;

	const cValue = pValue.trim().toLowerCase();

	if (!cValue) return true;
	if (["false", "0", "no", "off"].includes(cValue)) return false;

	return true;
}

function GetReadableTextColor(pBgColor: CssColor): CssColor {
	const cRgb = GetRgb(pBgColor);

	if (!cRgb) return cLightText;

	const cBgLuminance = GetRelativeLuminance(cRgb.R, cRgb.G, cRgb.B);
	const cBlackContrast = GetContrastRatio(cBgLuminance, 0);
	const cWhiteContrast = GetContrastRatio(cBgLuminance, 1);

	return cBlackContrast >= cWhiteContrast ? cDarkText : cLightText;
}

function GetRgb(pColor: CssColor) {
	const cColor = pColor.trim().toLowerCase();
	const cHex = cNamedColors[cColor] ?? cColor;

	if (/^#[0-9a-f]{3}$/i.test(cHex)) {
		const cR = cHex[1];
		const cG = cHex[2];
		const cB = cHex[3];
		return {
			R: Number.parseInt(`${cR}${cR}`, 16),
			G: Number.parseInt(`${cG}${cG}`, 16),
			B: Number.parseInt(`${cB}${cB}`, 16),
		};
	}

	if (/^#[0-9a-f]{6}$/i.test(cHex)) {
		return {
			R: Number.parseInt(cHex.slice(1, 3), 16),
			G: Number.parseInt(cHex.slice(3, 5), 16),
			B: Number.parseInt(cHex.slice(5, 7), 16),
		};
	}

	const cRgbMatch = cColor.match(/^rgba?\(([^)]+)\)$/i);

	if (!cRgbMatch) return undefined;

	const cParts = cRgbMatch[1].split(",").map((pPart) => Number.parseFloat(pPart.trim()));

	if (cParts.length < 3 || cParts.some((pValue) => Number.isNaN(pValue))) return undefined;

	return {
		R: ClampRgb(cParts[0]),
		G: ClampRgb(cParts[1]),
		B: ClampRgb(cParts[2]),
	};
}

function ClampRgb(pValue: number) {
	return Math.max(0, Math.min(255, pValue));
}

function GetRelativeLuminance(pR: number, pG: number, pB: number) {
	const cR = NormalizeChannel(pR);
	const cG = NormalizeChannel(pG);
	const cB = NormalizeChannel(pB);

	return 0.2126 * cR + 0.7152 * cG + 0.0722 * cB;
}

function GetContrastRatio(pL1: number, pL2: number) {
	const cMax = Math.max(pL1, pL2);
	const cMin = Math.min(pL1, pL2);

	return (cMax + 0.05) / (cMin + 0.05);
}

function NormalizeChannel(pValue: number) {
	const cValue = pValue / 255;

	return cValue <= 0.03928 ? cValue / 12.92 : ((cValue + 0.055) / 1.055) ** 2.4;
}
