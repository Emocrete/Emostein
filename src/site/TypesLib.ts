
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


export interface PlaceProps extends MovingProps, WidgetBehaviorProps {
	pLoc?: Loc;
	pSize?: Size;
	pRotate?: Angle | RespString;
	pZ?: number;
	pOrigin?: PlaceOrigin;
	pOpacity?: Percent | RespString | number;
	pClickable?: boolean;
	pLandOnly?: boolean;
	pPortOnly?: boolean;
}

export class Place {

	public readonly IsPlaced: boolean;
	public readonly IsMoving: boolean;
	public readonly Class: string;
	public readonly Style: string;

	constructor(
		pProps: PlaceProps,
		pStyle: string = "",
	) {

		this.IsPlaced = Place.IsPlaced(pProps);
		this.IsMoving = Moving.IsMoving(pProps);

		this.Class = [
			this.IsPlaced ? "IsPlaced" : "",
			Place.HasSize(pProps, this.IsPlaced) ? "PlaceSized" : "",
			Place.HasVisualStyle(pProps) ? "PlaceStyled" : "",
			this.IsMoving ? "IsMoving" : "",
			pProps.pPortOnly ? "PlaceHideLand" : "",
			pProps.pLandOnly ? "PlaceHidePort" : "",
		].filter(Boolean).join(" ");

		this.Style = [
			Place.HasStyle(pProps, this.IsPlaced) ? Place.GetStyle(pProps, this.IsPlaced) : "",
			this.IsMoving ? Moving.GetStyle(pProps) : "",
			pStyle || "",
		].filter(Boolean).join(" ").trim();
	}


	static IsPlaced(pProps: PlaceProps) {
		return !!(
			pProps.pLoc !== undefined ||
			pProps.pMoveLoc !== undefined ||
			Moving.HasCustomPath(pProps)
		);
	}

	static HasSize(pProps: PlaceProps, pIsPlaced: boolean = Place.IsPlaced(pProps)) {
		return !!(
			pProps.pSize !== undefined ||
			(pIsPlaced && pProps.pMoveBox !== undefined)
		);
	}

	static HasVisualStyle(pProps: PlaceProps) {
		return !!(
			pProps.pRotate !== undefined ||
			pProps.pZ !== undefined ||
			pProps.pOrigin !== undefined ||
			pProps.pOpacity !== undefined ||
			pProps.pClickable !== undefined
		);
	}

	static HasStyle(pProps: PlaceProps, pIsPlaced: boolean = Place.IsPlaced(pProps)) {
		return !!(
			pIsPlaced ||
			Place.HasSize(pProps, pIsPlaced) ||
			Place.HasVisualStyle(pProps)
		);
	}

	private static GetOpacity(pOpacity?: Percent | RespString | number) {
		if (pOpacity instanceof Percent || pOpacity instanceof RespString) {
			return pOpacity;
		}

		if (typeof pOpacity === "number") {
			return new RespString(`${pOpacity}`, `${pOpacity}`);
		}

		return new Percent(100);
	}

	private static GetStyle(pProps: PlaceProps, pIsPlaced: boolean = Place.IsPlaced(pProps)) {

		const cLoc = pProps.pLoc ?? pProps.pMoveLoc ?? new Loc(new NumPer(0), new NumPer(0));
		const cSize = pProps.pSize ?? (pIsPlaced ? pProps.pMoveBox : undefined) ?? new Size();
		const cRotate = pProps.pRotate ?? new Angle(0);
		const cOpacity = Place.GetOpacity(pProps.pOpacity);

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


export class Topic {
	constructor(
		public readonly Title: string,
		public readonly Body?: string,
		public readonly Items?: string[],
	) { }
}

export type HzAlignValue = Align | "Left" | "Center" | "Right" | "Start" | "End" | "Stretch" | "left" | "center" | "right" | "start" | "end" | "stretch";
export type VrAlignValue = Align | "Top" | "Center" | "Bottom" | "Start" | "End" | "Stretch" | "top" | "center" | "bottom" | "start" | "end" | "stretch";

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

export function GetHzAlignCss(pValue: HzAlignValue | undefined, pOrientation: "Landscape" | "Portrait" = "Landscape") {
	const cValue = pValue instanceof Align
		? (pOrientation === "Portrait" ? pValue.HzP : pValue.HzL)
		: `${pValue ?? "center"}`.toLowerCase();

	if (cValue === "left" || cValue === "start") return "flex-start";
	if (cValue === "right" || cValue === "end") return "flex-end";
	if (cValue === "stretch") return "stretch";
	return "center";
}

export function GetVrAlignCss(pValue: VrAlignValue | undefined, pOrientation: "Landscape" | "Portrait" = "Landscape") {
	const cValue = pValue instanceof Align
		? (pOrientation === "Portrait" ? pValue.VrP : pValue.VrL)
		: `${pValue ?? "center"}`.toLowerCase();

	if (cValue === "top" || cValue === "start") return "flex-start";
	if (cValue === "bottom" || cValue === "end") return "flex-end";
	if (cValue === "stretch") return "stretch";
	return "center";
}

export class Size {
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


export interface MovingProps {
	/** حركة جاهزة على نفس الودجت، بدون أي wrapper خارجي. */
	pMove?: MovingMotion;
	/** مدة الحركة الافتراضية عند استخدام pMove. */
	pMoveDuration?: number;
	/** مكان مباشر للحركة. وجوده يعني أن العنصر له تموضع صريح ويخرج من التدفق الطبيعي. */
	pMoveLoc?: Loc;
	/** مقاس مباشر للحركة. يطبق كحجم فعلي عندما يكون العنصر متموضعًا بواسطة pLoc أو pMoveLoc أو مسار حركة مخصص. */
	pMoveBox?: Size;
	/** مسافة الحركة في presets مثل Slide/Float/Back. */
	pMoveDistance?: string | RespString;
	/** نقاط حركة كاملة لمن يحتاج مسار مخصص. */
	pMoveKeyPoints?: MovingKeyPoint[];
	pMoveIntervals?: number[];
	pMoveDelay?: number;
	pMoveEase?: string;
	pMoveLoop?: boolean;
	pMoveLoopFor?: number;
	pMoveLoopInterval?: number;
	pMoveReverse?: boolean;
	pMoveStartOnView?: boolean;
	pMoveReplayOnView?: boolean;
	pMovePauseWhenOut?: boolean;
	pMoveViewThreshold?: number;
	pMoveViewMargin?: string;
	pMoveViewTarget?: "self" | "parent";
}

export class Moving {

	static IsMoving(pProps: MovingProps) {
		return !!(
			Moving.HasCustomPath(pProps) ||
			pProps.pMove !== undefined
		);
	}

	static HasCustomPath(pProps: MovingProps) {
		return Array.isArray(pProps.pMoveKeyPoints) && pProps.pMoveKeyPoints.length > 0;
	}


	static GetStyle(pProps: PlaceProps) {
		const cKeyPoints = Moving.GetKeyPointsData(pProps);

		if (cKeyPoints.length === 0) {
			return "";
		}

		const cIntervals = pProps.pMoveIntervals
			?? GetMovingDefaultIntervals(pProps.pMove ?? "FadeIn", pProps.pMoveDuration ?? 900);

		const cEase = pProps.pMoveEase ?? GetMovingDefaultEase(pProps.pMove ?? "FadeIn");
		const cLoop = pProps.pMoveLoop ?? GetMovingDefaultLoop(pProps.pMove ?? "FadeIn");

		return [
			`--MoveKeyPoints:${Moving.Encode(cKeyPoints)};`,
			`--MoveIntervals:${Moving.Encode(cIntervals)};`,
			`--MoveDelay:${pProps.pMoveDelay ?? 0};`,
			`--MoveEase:${cEase};`,
			`--MoveLoop:${cLoop ? "true" : "false"};`,
			`--MoveLoopFor:${pProps.pMoveLoopFor ?? ""};`,
			`--MoveLoopInterval:${pProps.pMoveLoopInterval ?? ""};`,
			`--MoveReverse:${pProps.pMoveReverse ? "true" : "false"};`,
			`--MoveStartOnView:${pProps.pMoveStartOnView === false ? "false" : "true"};`,
			`--MoveReplayOnView:${pProps.pMoveReplayOnView ? "true" : "false"};`,
			`--MovePauseWhenOut:${pProps.pMovePauseWhenOut === false ? "false" : "true"};`,
			`--MoveViewThreshold:${pProps.pMoveViewThreshold ?? 0.15};`,
			`--MoveViewMargin:${pProps.pMoveViewMargin ?? "0px 0px -10% 0px"};`,
			`--MoveViewTarget:${pProps.pMoveViewTarget ?? "parent"};`,
		].join(" ");
	}

	private static GetKeyPointsData(pProps: PlaceProps) {
		const cPoints = Moving.GetKeyPoints(pProps);
		const cPlaceRotateL = pProps.pRotate?.Landscape;
		const cPlaceRotateP = pProps.pRotate?.Portrait;

		return cPoints.map((pPoint) => {
			const cRotateL = pPoint.Rotate instanceof RespString ? pPoint.Rotate.Landscape : pPoint.Rotate;
			const cRotateP = pPoint.Rotate instanceof RespString ? pPoint.Rotate.Portrait : pPoint.Rotate;
			const cOpacityL = pPoint.Opacity instanceof RespString ? pPoint.Opacity.Landscape : `${pPoint.Opacity}`;
			const cOpacityP = pPoint.Opacity instanceof RespString ? pPoint.Opacity.Portrait : `${pPoint.Opacity}`;
			const cTransformL = pPoint.Transform instanceof RespString ? pPoint.Transform.Landscape : pPoint.Transform;
			const cTransformP = pPoint.Transform instanceof RespString ? pPoint.Transform.Portrait : pPoint.Transform;
			const cUseRotateL = cRotateL === "0deg" && !cTransformL && cPlaceRotateL ? cPlaceRotateL : cRotateL;
			const cUseRotateP = cRotateP === "0deg" && !cTransformP && cPlaceRotateP ? cPlaceRotateP : cRotateP;

			return {
				xL: `${pPoint.Loc.XL}`,
				xP: `${pPoint.Loc.XP}`,
				yL: `${pPoint.Loc.YL}`,
				yP: `${pPoint.Loc.YP}`,
				wL: pPoint.Box.WidthL,
				wP: pPoint.Box.WidthP,
				hL: pPoint.Box.HeightL,
				hP: pPoint.Box.HeightP,
				tL: cTransformL || `rotate(${cUseRotateL})`,
				tP: cTransformP || `rotate(${cUseRotateP})`,
				oL: cOpacityL,
				oP: cOpacityP,
			};
		});
	}

	private static GetKeyPoints(pProps: PlaceProps) {
		if (Moving.HasCustomPath(pProps)) {
			return pProps.pMoveKeyPoints ?? [];
		}

		if (pProps.pMove === undefined) {
			return [];
		}

		const cLoc = pProps.pMoveLoc ?? pProps.pLoc ?? new Loc(new NumPer(0), new NumPer(0));
		const cBox = pProps.pMoveBox ?? pProps.pSize ?? new Size();

		return BuildMovingMotionPoints(
			pProps.pMove,
			cLoc,
			cBox,
			pProps.pMoveDistance ?? new RespString("180px", "90px"),
		);
	}

	private static Encode(pValue: unknown) {
		return encodeURIComponent(JSON.stringify(pValue));
	}
}

export type MovingMotion =
	| "FadeIn"
	| "SlideInRight"
	| "SlideInLeft"
	| "SlideInTop"
	| "SlideInBottom"
	| "ZoomIn"
	| "ZoomInRight"
	| "ZoomInLeft"
	| "ZoomInTop"
	| "ZoomInBottom"
	| "FlipInX"
	| "FlipInY"
	| "FlipInRight"
	| "FlipInLeft"
	| "FlipInTop"
	| "FlipInBottom"
	| "RotateIn"
	| "RotateInRight"
	| "RotateInLeft"
	| "SpinReveal"
	| "BounceIn"
	| "BounceInRight"
	| "BounceInLeft"
	| "BounceInTop"
	| "BounceInBottom"
	| "BackInRight"
	| "BackInLeft"
	| "BackInTop"
	| "BackInBottom"
	| "RollInRight"
	| "RollInLeft"
	| "LightSpeedInRight"
	| "LightSpeedInLeft"
	| "FloatY"
	| "FloatX"
	| "Pulse"
	| "Breathe"
	| "Wiggle"
	| "DriftBox"
	| "OrbitSmall";

export class MovingKeyPoint {
	constructor(
		public readonly Loc: Loc,
		public readonly Box: Size = new Size(),
		public readonly Rotate: string | RespString = "0deg",
		public readonly Opacity: number | RespString = 1,
		public readonly Transform?: string | RespString,
	) { }
}

export function OffsetLocation(
	pLoc: Loc,
	pDeltaXL: string = "0px",
	pDeltaXP: string = "0px",
	pDeltaYL: string = "0px",
	pDeltaYP: string = "0px",
): Loc {
	return new Loc(new NumPer(AddCss(pLoc.XL, pDeltaXL), AddCss(pLoc.XP, pDeltaXP)), new NumPer(AddCss(pLoc.YL, pDeltaYL), AddCss(pLoc.YP, pDeltaYP)));
}

export function AddCss(pBase: string | number, pDelta: string): string {
	const cBase = `${pBase}`;
	const cDelta = pDelta.trim();

	if (!cDelta || cDelta === "0" || cDelta === "0px") {
		return cBase;
	}

	if (cDelta.startsWith("-")) {
		return `calc(${cBase} - ${cDelta.slice(1)})`;
	}

	return `calc(${cBase} + ${cDelta})`;
}

export function NegCss(pValue: string): string {
	const cValue = pValue.trim();

	if (cValue.startsWith("-")) {
		return cValue.slice(1);
	}

	return `-${cValue}`;
}

export function GetDistanceL(pDistance: string | RespString): string {
	return pDistance instanceof RespString ? pDistance.Landscape : pDistance;
}

export function GetDistanceP(pDistance: string | RespString): string {
	return pDistance instanceof RespString ? pDistance.Portrait : pDistance;
}

export function BuildMovingMotionPoints(
	pMotion: MovingMotion,
	pLoc: Loc,
	pBox: Size,
	pDistance: string | RespString = new RespString("180px", "90px"),
): MovingKeyPoint[] {
	const cDL = GetDistanceL(pDistance);
	const cDP = GetDistanceP(pDistance);
	const cNegDL = NegCss(cDL);
	const cNegDP = NegCss(cDP);

	const cSame = pLoc;
	const cFromRight = OffsetLocation(pLoc, cDL, cDP, "0px", "0px");
	const cFromLeft = OffsetLocation(pLoc, cNegDL, cNegDP, "0px", "0px");
	const cFromTop = OffsetLocation(pLoc, "0px", "0px", cNegDL, cNegDP);
	const cFromBottom = OffsetLocation(pLoc, "0px", "0px", cDL, cDP);
	const cOverRight = OffsetLocation(pLoc, "-25px", "-15px", "0px", "0px");
	const cOverLeft = OffsetLocation(pLoc, "25px", "15px", "0px", "0px");
	const cOverTop = OffsetLocation(pLoc, "0px", "0px", "25px", "15px");
	const cOverBottom = OffsetLocation(pLoc, "0px", "0px", "-25px", "-15px");
	const cFloatTop = OffsetLocation(pLoc, "0px", "0px", cNegDL, cNegDP);
	const cFloatRight = OffsetLocation(pLoc, cDL, cDP, "0px", "0px");
	const cBoxCorner = OffsetLocation(pLoc, cDL, cDP, cDL, cDP);
	const cBottomCorner = OffsetLocation(pLoc, "0px", "0px", cDL, cDP);

	switch (pMotion) {
		case "FadeIn":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInTop":
			return [
				new MovingKeyPoint(cFromTop, pBox, "0deg", 0),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInBottom":
			return [
				new MovingKeyPoint(cFromBottom, pBox, "0deg", 0),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "ZoomIn":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0, "scale(.55)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "scale(.6)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "scale(.6)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInTop":
			return [
				new MovingKeyPoint(cFromTop, pBox, "0deg", 0, "scale(.6)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInBottom":
			return [
				new MovingKeyPoint(cFromBottom, pBox, "0deg", 0, "scale(.6)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "FlipInX":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0, "perspective(900px) rotateX(88deg) scale(.9)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateX(0deg) scale(1)"),
			];

		case "FlipInY":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0, "perspective(900px) rotateY(88deg) scale(.9)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateY(0deg) scale(1)"),
			];

		case "FlipInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "perspective(900px) rotateY(-78deg) scale(.9)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateY(0deg) scale(1)"),
			];

		case "FlipInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "perspective(900px) rotateY(78deg) scale(.9)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateY(0deg) scale(1)"),
			];

		case "FlipInTop":
			return [
				new MovingKeyPoint(cFromTop, pBox, "0deg", 0, "perspective(900px) rotateX(-78deg) scale(.9)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateX(0deg) scale(1)"),
			];

		case "FlipInBottom":
			return [
				new MovingKeyPoint(cFromBottom, pBox, "0deg", 0, "perspective(900px) rotateX(78deg) scale(.9)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateX(0deg) scale(1)"),
			];

		case "RotateIn":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0, "rotate(-90deg) scale(.75)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "RotateInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "rotate(55deg) scale(.8)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "RotateInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "rotate(-55deg) scale(.8)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "SpinReveal":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0, "rotate(-180deg) scale(.2)"),
				new MovingKeyPoint(cSame, pBox, "0deg", .7, "rotate(20deg) scale(1.08)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "BounceIn":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 0, "scale(.35)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1.08)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(.96)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "scale(.9)"),
				new MovingKeyPoint(cOverRight, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "scale(.9)"),
				new MovingKeyPoint(cOverLeft, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInTop":
			return [
				new MovingKeyPoint(cFromTop, pBox, "0deg", 0, "scale(.9)"),
				new MovingKeyPoint(cOverTop, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInBottom":
			return [
				new MovingKeyPoint(cFromBottom, pBox, "0deg", 0, "scale(.9)"),
				new MovingKeyPoint(cOverBottom, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "scale(.72)"),
				new MovingKeyPoint(cOverRight, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "scale(.72)"),
				new MovingKeyPoint(cOverLeft, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInTop":
			return [
				new MovingKeyPoint(cFromTop, pBox, "0deg", 0, "scale(.72)"),
				new MovingKeyPoint(cOverTop, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInBottom":
			return [
				new MovingKeyPoint(cFromBottom, pBox, "0deg", 0, "scale(.72)"),
				new MovingKeyPoint(cOverBottom, pBox, "0deg", 1, "scale(1.03)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "RollInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "rotate(120deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];

		case "RollInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "rotate(-120deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];

		case "LightSpeedInRight":
			return [
				new MovingKeyPoint(cFromRight, pBox, "0deg", 0, "skewX(-28deg)"),
				new MovingKeyPoint(cOverRight, pBox, "0deg", 1, "skewX(8deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "skewX(0deg)"),
			];

		case "LightSpeedInLeft":
			return [
				new MovingKeyPoint(cFromLeft, pBox, "0deg", 0, "skewX(28deg)"),
				new MovingKeyPoint(cOverLeft, pBox, "0deg", 1, "skewX(-8deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "skewX(0deg)"),
			];

		case "FloatY":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
				new MovingKeyPoint(cFloatTop, pBox, "0deg", 1),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "FloatX":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
				new MovingKeyPoint(cFloatRight, pBox, "0deg", 1),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "Pulse":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1.08)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "Breathe":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", .72, "scale(.98)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "scale(1.04)"),
				new MovingKeyPoint(cSame, pBox, "0deg", .72, "scale(.98)"),
			];

		case "Wiggle":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(-4deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(4deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];

		case "DriftBox":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
				new MovingKeyPoint(cFloatRight, pBox, "0deg", 1),
				new MovingKeyPoint(cBoxCorner, pBox, "0deg", 1),
				new MovingKeyPoint(cBottomCorner, pBox, "0deg", 1),
				new MovingKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "OrbitSmall":
			return [
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
				new MovingKeyPoint(cFloatRight, pBox, "0deg", 1, "rotate(8deg)"),
				new MovingKeyPoint(cBoxCorner, pBox, "0deg", 1, "rotate(0deg)"),
				new MovingKeyPoint(cBottomCorner, pBox, "0deg", 1, "rotate(-8deg)"),
				new MovingKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];
	}
}

export function GetMovingDefaultIntervals(pMotion: MovingMotion, pDuration: number): number[] {
	switch (pMotion) {
		case "BounceIn":
			return [pDuration * .45, pDuration * .25, pDuration * .30];

		case "SpinReveal":
			return [pDuration * .7, pDuration * .3];

		case "BounceInRight":
		case "BounceInLeft":
		case "BounceInTop":
		case "BounceInBottom":
		case "BackInRight":
		case "BackInLeft":
		case "BackInTop":
		case "BackInBottom":
		case "LightSpeedInRight":
		case "LightSpeedInLeft":
			return [pDuration * .72, pDuration * .28];

		case "FloatY":
		case "FloatX":
		case "Pulse":
		case "Breathe":
			return [pDuration / 2, pDuration / 2];

		case "Wiggle":
			return [pDuration / 3, pDuration / 3, pDuration / 3];

		case "DriftBox":
		case "OrbitSmall":
			return [pDuration / 4, pDuration / 4, pDuration / 4, pDuration / 4];

		default:
			return [pDuration];
	}
}

export function GetMovingDefaultLoop(pMotion: MovingMotion): boolean {
	return ["FloatY", "FloatX", "Pulse", "Breathe", "Wiggle", "DriftBox", "OrbitSmall"].includes(pMotion);
}

export function GetMovingDefaultEase(pMotion: MovingMotion): string {
	if (["BounceIn", "BounceInRight", "BounceInLeft", "BounceInTop", "BounceInBottom"].includes(pMotion)) {
		return "cubic-bezier(.22, 1.35, .36, 1)";
	}

	if (["LightSpeedInRight", "LightSpeedInLeft", "SpinReveal"].includes(pMotion)) {
		return "cubic-bezier(.16, 1, .3, 1)";
	}

	if (["FloatY", "FloatX", "Pulse", "Breathe", "Wiggle", "DriftBox", "OrbitSmall"].includes(pMotion)) {
		return "ease-in-out";
	}

	return "cubic-bezier(.42, 0, .18, 1)";
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
	static readonly Green = "#1c8801";
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
		public readonly Pos?: Loc,
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