import { Size, Location, RespString } from "@/TypesLib";

export type TFreeHeroMotion =
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

export class FreeHeroKeyPoint {
	constructor(
		public readonly Loc: Location,
		public readonly Box: Size = new Box(),
		public readonly Rotate: string | RespString = "0deg",
		public readonly Opacity: number | RespString = 1,
		public readonly Transform?: string | RespString,
	) { }
}

export function OffsetLocation(
	pLoc: Location,
	pDeltaXL: string = "0px",
	pDeltaXP: string = "0px",
	pDeltaYL: string = "0px",
	pDeltaYP: string = "0px",
): Location {
	return new Location(
		AddCss(pLoc.XL, pDeltaXL),
		AddCss(pLoc.XP, pDeltaXP),
		AddCss(pLoc.YL, pDeltaYL),
		AddCss(pLoc.YP, pDeltaYP),
	);
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

export function BuildFreeHeroMotionPoints(
	pMotion: TFreeHeroMotion,
	pLoc: Location,
	pBox: Size,
	pDistance: string | RespString = new RespString("180px", "90px"),
): FreeHeroKeyPoint[] {
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
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInTop":
			return [
				new FreeHeroKeyPoint(cFromTop, pBox, "0deg", 0),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "SlideInBottom":
			return [
				new FreeHeroKeyPoint(cFromBottom, pBox, "0deg", 0),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "ZoomIn":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0, "scale(.55)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "scale(.6)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "scale(.6)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInTop":
			return [
				new FreeHeroKeyPoint(cFromTop, pBox, "0deg", 0, "scale(.6)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "ZoomInBottom":
			return [
				new FreeHeroKeyPoint(cFromBottom, pBox, "0deg", 0, "scale(.6)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "FlipInX":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0, "perspective(900px) rotateX(88deg) scale(.9)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateX(0deg) scale(1)"),
			];

		case "FlipInY":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0, "perspective(900px) rotateY(88deg) scale(.9)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateY(0deg) scale(1)"),
			];

		case "FlipInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "perspective(900px) rotateY(-78deg) scale(.9)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateY(0deg) scale(1)"),
			];

		case "FlipInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "perspective(900px) rotateY(78deg) scale(.9)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateY(0deg) scale(1)"),
			];

		case "FlipInTop":
			return [
				new FreeHeroKeyPoint(cFromTop, pBox, "0deg", 0, "perspective(900px) rotateX(-78deg) scale(.9)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateX(0deg) scale(1)"),
			];

		case "FlipInBottom":
			return [
				new FreeHeroKeyPoint(cFromBottom, pBox, "0deg", 0, "perspective(900px) rotateX(78deg) scale(.9)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "perspective(900px) rotateX(0deg) scale(1)"),
			];

		case "RotateIn":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0, "rotate(-90deg) scale(.75)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "RotateInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "rotate(55deg) scale(.8)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "RotateInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "rotate(-55deg) scale(.8)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "SpinReveal":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0, "rotate(-180deg) scale(.2)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", .7, "rotate(20deg) scale(1.08)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg) scale(1)"),
			];

		case "BounceIn":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 0, "scale(.35)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1.08)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(.96)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "scale(.9)"),
				new FreeHeroKeyPoint(cOverRight, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "scale(.9)"),
				new FreeHeroKeyPoint(cOverLeft, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInTop":
			return [
				new FreeHeroKeyPoint(cFromTop, pBox, "0deg", 0, "scale(.9)"),
				new FreeHeroKeyPoint(cOverTop, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BounceInBottom":
			return [
				new FreeHeroKeyPoint(cFromBottom, pBox, "0deg", 0, "scale(.9)"),
				new FreeHeroKeyPoint(cOverBottom, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "scale(.72)"),
				new FreeHeroKeyPoint(cOverRight, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "scale(.72)"),
				new FreeHeroKeyPoint(cOverLeft, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInTop":
			return [
				new FreeHeroKeyPoint(cFromTop, pBox, "0deg", 0, "scale(.72)"),
				new FreeHeroKeyPoint(cOverTop, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "BackInBottom":
			return [
				new FreeHeroKeyPoint(cFromBottom, pBox, "0deg", 0, "scale(.72)"),
				new FreeHeroKeyPoint(cOverBottom, pBox, "0deg", 1, "scale(1.03)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "RollInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "rotate(120deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];

		case "RollInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "rotate(-120deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];

		case "LightSpeedInRight":
			return [
				new FreeHeroKeyPoint(cFromRight, pBox, "0deg", 0, "skewX(-28deg)"),
				new FreeHeroKeyPoint(cOverRight, pBox, "0deg", 1, "skewX(8deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "skewX(0deg)"),
			];

		case "LightSpeedInLeft":
			return [
				new FreeHeroKeyPoint(cFromLeft, pBox, "0deg", 0, "skewX(28deg)"),
				new FreeHeroKeyPoint(cOverLeft, pBox, "0deg", 1, "skewX(-8deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "skewX(0deg)"),
			];

		case "FloatY":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cFloatTop, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "FloatX":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cFloatRight, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "Pulse":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1.08)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1)"),
			];

		case "Breathe":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", .72, "scale(.98)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "scale(1.04)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", .72, "scale(.98)"),
			];

		case "Wiggle":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(-4deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(4deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];

		case "DriftBox":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cFloatRight, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cBoxCorner, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cBottomCorner, pBox, "0deg", 1),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1),
			];

		case "OrbitSmall":
			return [
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
				new FreeHeroKeyPoint(cFloatRight, pBox, "0deg", 1, "rotate(8deg)"),
				new FreeHeroKeyPoint(cBoxCorner, pBox, "0deg", 1, "rotate(0deg)"),
				new FreeHeroKeyPoint(cBottomCorner, pBox, "0deg", 1, "rotate(-8deg)"),
				new FreeHeroKeyPoint(cSame, pBox, "0deg", 1, "rotate(0deg)"),
			];
	}
}

export function GetDefaultIntervals(pMotion: TFreeHeroMotion, pDuration: number): number[] {
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

export function GetDefaultLoop(pMotion: TFreeHeroMotion): boolean {
	return ["FloatY", "FloatX", "Pulse", "Breathe", "Wiggle", "DriftBox", "OrbitSmall"].includes(pMotion);
}

export function GetDefaultEase(pMotion: TFreeHeroMotion): string {
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
