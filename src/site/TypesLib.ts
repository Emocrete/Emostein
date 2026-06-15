
export class RespString {
	public readonly Landscape: string;
	public readonly Portrait: string;

	constructor(pLandscape: string, pPortrait: string) {
		this.Landscape = pLandscape;
		this.Portrait = pPortrait;
	}

}
export class NumPer {
	public readonly Landscape: string;
	public readonly Portrait: string;

	constructor(pLandscape: number | string, pPortrait?: number | string) {

		this.Landscape = typeof pLandscape === "number" ? `${pLandscape}px` : `${pLandscape}`;
		this.Portrait = pPortrait === undefined ? this.Landscape : typeof pPortrait === "number" ? `${pPortrait}px` : `${pPortrait}`;

	}
}

export class Angle {

	public readonly Landscape: string;
	public readonly Portrait: string;

	constructor(pLandscape: number = 0, pPortrait?: number) {

		this.Landscape = `${pLandscape}deg`;
		this.Portrait = `${pPortrait ?? pLandscape}deg`;
	}

}

export class Pixel {
	public readonly Landscape: string;
	public readonly Portrait: string;

	constructor(pLandscape: number, pPortrait?: number) {
		this.Landscape = `${pLandscape}px`;
		this.Portrait = `${pPortrait ?? pLandscape}px`;
	}
}


export class Percent {

	public readonly Landscape: string;
	public readonly Portrait: string;

	constructor(pLandscape: number = 100, pPortrait?: number) {

		this.Landscape = `${pLandscape}%`;
		this.Portrait = `${pPortrait ?? pLandscape}%`;
	}

}

export type PlaceOrigin =
	| "left top"
	| "left center"
	| "left bottom"
	| "center top"
	| "center center"
	| "center bottom"
	| "right top"
	| "right center"
	| "right bottom";


export interface PlaceProps {
	pLoc?: Loc;
	pSize?: DirectSize;
	pRotate?: Angle;
	pZ?: number;
	pOrigin?: PlaceOrigin;
	pOpacity?: Percent;
	pClickable?: boolean;
	pLandOnly?: boolean;
	pPortOnly?: boolean;
}

export class Place {

	public readonly IsPlaced: boolean;
	public readonly Class: string;
	public readonly Style: string;

	constructor(
		pProps: PlaceProps,
		pStyle: string = "",
	) {

		this.IsPlaced = Place.IsPlaced(pProps);

		this.Class = this.IsPlaced
			? [
				"IsPlaced",
				pProps.pPortOnly ? "PlaceHideLand" : "",
				pProps.pLandOnly ? "PlaceHidePort" : "",
			].filter(Boolean).join(" ")
			: "";

		this.Style = this.IsPlaced
			? `${Place.GetStyle(pProps)} ${pStyle || ""}`.trim()
			: `${pStyle || ""}`.trim();
	}


	static IsPlaced(pProps: PlaceProps) {
		return !!(
			pProps.pLoc !== undefined ||
			pProps.pRotate !== undefined ||
			pProps.pZ !== undefined ||
			pProps.pOrigin !== undefined ||
			pProps.pOpacity !== undefined ||
			pProps.pClickable !== undefined ||
			pProps.pLandOnly ||
			pProps.pPortOnly
		);
	}


	private static GetStyle(pProps: PlaceProps) {

		const cLoc = pProps.pLoc ?? new Loc(new NumPer(0), new NumPer(0));
		const cSize = pProps.pSize ?? new DirectSize(new NumPer("auto"), new NumPer("auto"));
		const cRotate = pProps.pRotate ?? new Angle(0);
		const cOpacity = pProps.pOpacity ?? new Percent(100);

		return [
			`--PlaceXL:${cLoc.XL};`,
			`--PlaceXP:${cLoc.XP};`,
			`--PlaceYL:${cLoc.YL};`,
			`--PlaceYP:${cLoc.YP};`,

			`--PlaceWidthL:${cSize.WidthL};`,
			`--PlaceWidthP:${cSize.WidthP};`,
			`--PlaceHeightL:${cSize.HeightL};`,
			`--PlaceHeightP:${cSize.HeightP};`,

			`--PlaceRotateL:${cRotate.Landscape};`,
			`--PlaceRotateP:${cRotate.Portrait};`,

			`--PlaceOpacityL:${cOpacity.Landscape};`,
			`--PlaceOpacityP:${cOpacity.Portrait};`,

			`--PlaceZ:${pProps.pZ ?? 1};`,
			`--PlaceOrigin:${pProps.pOrigin ?? "center center"};`,
			`--PlaceClickable:${pProps.pClickable === false ? "none" : "auto"};`,
		].join(" ");
	}

}


export class Loc {
	public readonly XL: string;
	public readonly XP: string;
	public readonly YL: string;
	public readonly YP: string;

	constructor(
		pX: NumPer,
		pY: NumPer,
	) {
		this.XL = pX.Landscape;
		this.XP = pX.Portrait;
		this.YL = pY.Landscape;
		this.YP = pY.Portrait;
	}

	static readonly Center = new Loc(new NumPer("50%"), new NumPer("50%"));

}

export class Location {
	public readonly XL: number | string;
	public readonly XP: number | string;
	public readonly YL: number | string;
	public readonly YP: number | string;

	constructor(
		pXL: number | string,
		pXP: number | string,
		pVL: number | string,
		pVP: number | string,
	) {
		this.XL = typeof pXL === "number" ? `${pXL}px` : `${pXL}`;
		this.XP = typeof pXP === "number" ? `${pXP}px` : `${pXP}`;
		this.YL = typeof pVL === "number" ? `${pVL}px` : `${pVL}`;
		this.YP = typeof pVP === "number" ? `${pVP}px` : `${pVP}`;
	}
}


export class Topic {
	constructor(
		public readonly Title: string,
		public readonly Body?: string,
		public readonly Items?: string[],
	) { }
}

export class Align {
	public readonly HzL: string;
	public readonly HzP: string;
	public readonly VrL: string;
	public readonly VrP: string;
	constructor(
		pHzL?: "Left" | "Center" | "Right",
		pVrL?: "Top" | "Center" | "Bottom",
		pHzP?: "Left" | "Center" | "Right",
		pVrP?: "Top" | "Center" | "Bottom",
	) {
		this.HzL = pHzL ? pHzL.toLowerCase() : "center";
		this.HzP = pHzP ? pHzP.toLowerCase() : "center";
		this.VrL = pVrL ? pVrL.toLowerCase() : "center";
		this.VrP = pVrP ? pVrP.toLowerCase() : "center";
	}

	static readonly Center = new Align();
	static readonly LeftCenter = new Align("Left");
	static readonly RightCenter = new Align("Right");

}

export class DirectSize {
	public readonly WidthL: string;
	public readonly HeightL: string;
	public readonly WidthP: string;
	public readonly HeightP: string;

	constructor(
		pWidth: NumPer = new NumPer("auto"),
		pHeight: NumPer = new NumPer("auto"),
	) {
		this.WidthL = pWidth.Landscape;
		this.HeightL = pHeight.Landscape;
		this.WidthP = pWidth.Portrait;
		this.HeightP = pHeight.Portrait;
	}
}

export class Size {
	public readonly WidthL: string;
	public readonly HeightL: string;
	public readonly WidthP: string;
	public readonly HeightP: string;
	constructor(
		pWidthL: number | string = "auto",
		pHeightL: number | string = "auto",
		pWidthP: number | string = "auto",
		pHeightP: number | string = "auto",
	) {
		this.WidthL = typeof pWidthL === "number" ? `${pWidthL}px` : `${pWidthL}`;
		this.HeightL = typeof pHeightL === "number" ? `${pHeightL}px` : `${pHeightL}`;
		this.WidthP = typeof pWidthP === "number" ? `${pWidthP}px` : `${pWidthP}`;
		this.HeightP = typeof pHeightP === "number" ? `${pHeightP}px` : `${pHeightP}`;
	}
}

export class Text {
	/**Takes Text properties ( H , Color , Size , Align , Bold , Family )*/
	constructor(
		public readonly H?: number,
		public readonly size?: Pixel,
		public readonly bold: boolean = false,
		public readonly color?: string,
		public readonly align: "right" | "center" | "left" = "right",
		public readonly family: string = "inherit",
		public readonly text?: string
	) { }


	WithColor(pColor: string) {
		return new Text(
			this.H,
			this.size,
			this.bold,
			pColor,
			this.align,
			this.family,
			this.text
		);
	}


	get Yellow() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Yellow,
			this.align,
			this.family,
			this.text
		);
	}

	get Gray5() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Gray5,
			this.align,
			this.family,
			this.text
		);
	}

	get Gray4() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Gray4,
			this.align,
			this.family,
			this.text
		);
	}


	get Gray3() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Gray3,
			this.align,
			this.family,
			this.text
		);
	}


	get Gray2() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Gray2,
			this.align,
			this.family,
			this.text
		);
	}


	get Gray1() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Gray1,
			this.align,
			this.family,
			this.text
		);
	}

	get Bold() {
		return new Text(
			this.H,
			this.size,
			true,
			this.color,
			this.align,
			this.family,
			this.text
		);
	}


	get Bistage() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Bistage,
			this.align,
			this.family,
			this.text
		);
	}


	get White() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.WhiteOff,
			this.align,
			this.family,
			this.text
		);
	}



	get Red() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			Colors.Red,
			this.align,
			this.family,
			this.text
		);
	}


	get Sky() {
		return new Text(this.H, this.size, this.bold, Colors.Sky, this.align, this.family, this.text);
	}

	get DarkSky() {
		return new Text(this.H, this.size, this.bold, Colors.SkyDark, this.align, this.family, this.text);
	}

	get OrangeDark() {
		return new Text(this.H, this.size, this.bold, Colors.OrangeDark, this.align, this.family, this.text);
	}

	WithAlign(pAlign: TAlign) {
		return new Text(
			this.H,
			this.size,
			this.bold,
			this.color,
			pAlign,
			this.family,
			this.text
		);
	}

	get Centered() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			this.color,
			"center",
			this.family,
			this.text
		);
	}

	get AtLeft() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			this.color,
			"left",
			this.family,
			this.text
		);
	}

	get AtRight() {
		return new Text(
			this.H,
			this.size,
			this.bold,
			this.color,
			"right",
			this.family,
			this.text
		);
	}

	OfText(pText: string) {
		return new Text(
			this.H,
			this.size,
			this.bold,
			this.color,
			this.align,
			this.family,
			pText
		);
	}

	WithSize(pSize: Pixel) {
		return new Text(
			this.H,
			pSize,
			this.bold,
			this.color,
			this.align,
			this.family,
			this.text
		);
	}

	OfSize(Landscape: number, Portrait?: number) {
		return this.WithSize(new Pixel(Landscape, Portrait));
	}


	GetStyle() {
		const cStyle = [
			`margin: 0;`,
			this.color ? `color:${this.color};` : "",
			this.size ? `--TextSizeL:${this.size.Landscape};` : "",
			this.size ? `--TextSizeP:${this.size.Portrait};` : "",
			this.size ? `font-size:var(--TextSize, var(--TextSizeL));` : "",
			`line-height: 2;`,
			`font-weight: ${this.bold ? 700 : 400};`,
			`text-align: ${this.align};`
		].filter(Boolean).join(" ");

		return cStyle;
	}

	/**Returns the h string to be used in defining custom tag*/
	GetTag() {
		return this.H === 0 ? `p` : `h${this.H}`;
	}

	static readonly H1 = new Text(1, new Pixel(50, 24), true);
	static readonly H2 = new Text(2, new Pixel(35, 22), true);
	static readonly H3 = new Text(3, new Pixel(30, 20), true);
	static readonly H4 = new Text(4, new Pixel(25, 18), true);
	static readonly H5 = new Text(5, new Pixel(22, 16), true);
	static readonly H6 = new Text(6, new Pixel(20, 14), true);
	static readonly Body = new Text(0, new Pixel(18, 12));

}

export class Colors {

	static readonly BlackOff = "#333333";
	static readonly Black = "#111111";
	static readonly WhiteOff = "#FAFAFA";

	static readonly Gray1 = "#EDEDED";
	static readonly Gray2 = "#c9c9c9";
	static readonly Gray3 = "#9b9999";
	static readonly Gray4 = "#636262";
	static readonly Gray5 = "#353535";

	static readonly GreenLite = "#D7F58C";
	static readonly GreenDark = "green";

	static readonly OrangeLite = "#FDCB9E";
	static readonly OrangeDark = "orange";
	static readonly Red = "red";

	static readonly SkyLite = "#DAEFFE";
	static readonly Sky = "#CFE9FF";
	static readonly SkyDark = "#328fe8";

	static readonly BistageLite = "#D7F58C";
	static readonly Bistage = "#A7C45C";
	static readonly BistageDark = "#849e44";

	static readonly Creamy = "#FFF5F0";
	static readonly Yellow = "#fbff00";

	constructor(
		public readonly Color: string = "#000000",
	) { }
}

type ColorInput = string | Colors;

function GetColorValue(pColor: ColorInput): string {
	return typeof pColor === "string" ? pColor : pColor.Color;
}

export class HoverColors {

	public readonly Normal: string;
	public readonly Hover: string;
	public readonly Click: string;

	constructor(
		pNormal: ColorInput = Colors.Black,
		pHover: ColorInput = pNormal,
		pClick?: ColorInput,
	) {
		this.Normal = GetColorValue(pNormal);
		this.Hover = GetColorValue(pHover);
		this.Click = GetColorValue(pClick ?? pHover);
	}

	static readonly BlackOrange = new HoverColors(Colors.Black, Colors.OrangeDark);
	static readonly Bistage = new HoverColors(Colors.Bistage, Colors.BistageDark);
	static readonly Sky = new HoverColors(Colors.Sky, Colors.SkyDark);
}

export class HoverImg {

	public readonly Normal: string;
	public readonly Hover: string;
	public readonly Click: string;

	constructor(
		pNormal: string,
		pHover: string = pNormal,
		pClick?: string,
	) {
		this.Normal = pNormal;
		this.Hover = pHover;
		this.Click = pClick ?? pHover;
	}
}

export class ElemBg {
	constructor(
		public readonly Color: string = Colors.Gray5,
		public readonly Img?: EmoMediaData,
		public readonly Vid?: EmoMediaData,
	) { }

}


export class EmoMediaData {

	public readonly LinkL: string;
	public readonly LinkP: string;

	constructor(

		public readonly Type: "Vid" | "Img",
		pSrcFolder: string,
		pFile: string,
		pResp: boolean = false,
		public readonly Alt: string = "",
		public readonly Size?: Size,
		public readonly Pos?: Location,
		public readonly SwitchLimit?: number,
	) {
		this.LinkL = EmoMediaData.BuildLink(pSrcFolder, pFile, pResp ? "L" : null);
		this.LinkP = EmoMediaData.BuildLink(pSrcFolder, pFile, pResp ? "P" : null);
	}

	private static BuildLink( pSrcFolder: string , pFile: string , pDir: "L" | "P" | null ) : string
		{

			const cFolder = pSrcFolder.endsWith("/") ? pSrcFolder : `${pSrcFolder}/`;

			const cDotIdx = pFile.lastIndexOf(".");

			const cFinalFile = pDir === null ? pFile : `${pFile.slice(0, cDotIdx)}${pDir}${pFile.slice(cDotIdx)}`;

			return `${cFolder}${cFinalFile}`;

		}

}



export { };

declare global {
	function GetWidgetId(pPrefix: string): string;
}

declare global {
	interface Number {
		readonly AsPixel: string;
		readonly ToPixel: Pixel;
	}
}



Object.defineProperty(Number.prototype, "AsPixel", {
	get: function () {
		return `${this}px`;
	},
	configurable: true
});
export { };


Object.defineProperty(Number.prototype, "ToPixel", {
	get: function () {
		return new Pixel(this, this);
	},
	configurable: true
});


export { };