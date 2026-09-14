import DaabesRequestIndexExport from "./DaabesRequest.astro";

/**
 * @pTitle as string (Default: "سجّل عرضك أو طلبك")
 * @pDesc as string (Default: "اختار حالتك، وسجّل البيانات المناسبة لطلبك.")
 * @pDefaultCase as CaseKey | "" (Default: "")
 * @pMaxWidth as string (Default: "1100px")
 */
export const DaabesRequest = DaabesRequestIndexExport;

import PharmacyWorkCardIndexExport from "./PharmacyWorkCard.astro";

/**
 * @pName as string
 * @pAddress as string
 * @pActivity as string
 * @pActivityLabel as string
 * @pSteps as StepLike[]
 * @pCode as string
 * @pStatus as string
 * @pUpdatedAt as string
 * @pAccent as string
 * @pAccent2 as string
 * @pSize as Size
 * @pCompact as boolean | string
 */
export const PharmacyWorkCard = PharmacyWorkCardIndexExport;
