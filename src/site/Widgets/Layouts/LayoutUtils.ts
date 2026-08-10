import { ElemBg, NumPer, Pixel, RespString } from "@/TypesLib";

export type LayoutValue = string | number | Pixel | NumPer | RespString;
export type LayoutBackground = string | ElemBg;

export interface LayoutPair {
  Landscape: string;
  Portrait: string;
}

const cPlacePropNames = [
  "pLoc",
  "pSize",
  "pRotate",
  "pZ",
  "pOrigin",
  "pOpacity",
  "pClickable",
  "pLandOnly",
  "pPortOnly",
  "pMove",
  "pMoveDuration",
  "pMoveLoc",
  "pMoveBox",
  "pMoveDistance",
  "pMoveKeyPoints",
  "pMoveIntervals",
  "pMoveDelay",
  "pMoveEase",
  "pMoveLoop",
  "pMoveLoopFor",
  "pMoveLoopInterval",
  "pMoveReverse",
  "pMoveStartOnView",
  "pMoveReplayOnView",
  "pMovePauseWhenOut",
  "pMoveViewThreshold",
  "pMoveViewMargin",
  "pMoveViewTarget",
] as const;

export function GetLayoutPair(pValue: LayoutValue | undefined, pDefault: LayoutValue, pNumberUnit = "px"): LayoutPair {
  const cValue = pValue ?? pDefault;

  if (typeof cValue === "number") {
    const cText = `${cValue}${pNumberUnit}`;
    return { Landscape: cText, Portrait: cText };
  }

  if (typeof cValue === "string") {
    return { Landscape: cValue, Portrait: cValue };
  }

  return {
    Landscape: cValue.Landscape,
    Portrait: cValue.Portrait,
  };
}

export function GetLayoutBackground(pBg: LayoutBackground | undefined, pDefault = "transparent") {
  if (typeof pBg === "string") return pBg;
  return pBg?.Color ?? pDefault;
}

export function GetStyleText(pStyle: unknown) {
  if (!pStyle) return "";
  if (typeof pStyle === "string") return pStyle;
  if (typeof pStyle !== "object") return "";

  return Object.entries(pStyle as Record<string, string | number | null | undefined>)
    .map(([pName, pValue]) => {
      if (pValue === undefined || pValue === null) return "";
      return `${GetCssName(pName)}:${pValue};`;
    })
    .filter(Boolean)
    .join(" ");
}

export function GetRootAttributes(pProps: Record<string, unknown>, pWidgetPropNames: readonly string[]) {
  const cOmitted = new Set<string>([...cPlacePropNames, ...pWidgetPropNames, "id", "class", "style"]);

  return Object.fromEntries(Object.entries(pProps).filter(([pName]) => !cOmitted.has(pName)));
}

export function ClampInt(pValue: unknown, pDefault: number, pMin = 1, pMax = 24) {
  const cValue = typeof pValue === "number" ? pValue : Number.parseInt(`${pValue}`, 10);
  if (!Number.isFinite(cValue)) return pDefault;
  return Math.min(pMax, Math.max(pMin, Math.floor(cValue)));
}

export function GetGridLine(pStart: number | string | undefined, pSpan: number) {
  if (pStart === undefined || pStart === "" || pStart === "auto") return `span ${pSpan}`;
  return `${pStart} / span ${pSpan}`;
}

function GetCssName(pName: string) {
  if (pName.startsWith("--")) return pName;
  return pName.replace(/[A-Z]/g, (pChar) => `-${pChar.toLowerCase()}`);
}
