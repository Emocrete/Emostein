import FinishCalcIndexExport from "./FinishCalc.astro";

/**
 * @fVideo as string (Default: "/assets/worker-loop.mp4")
 */
export const FinishCalc = FinishCalcIndexExport;

import FinishCostGameIndexExport from "./FinishCostGame.astro";

/**
 * @pTitle as string — عنوان الحاسبة.
 * @pDesc as string — وصف مختصر لفكرة رفع دقة التقدير تدريجيًا.
 * @pDefaultArea as number — مساحة الفيلا الافتراضية المستخدمة فقط قبل إدخال المستخدم بياناته. DefVal = 450
 */
export const FinishCostGame = FinishCostGameIndexExport;

import FinishCostGameNavIndexExport from "./FinishCostGameNav.astro";

/**
 * @pItems as FinishCostItem[]
 * @pActiveId as string (Default: pItems[0]?.Id ?? "")
 */
export const FinishCostGameNav = FinishCostGameNavIndexExport;

import FinishCostGamePanelIndexExport from "./FinishCostGamePanel.astro";

/**
 * @pItem as FinishCostItem
 * @pActive as boolean (Default: false)
 */
export const FinishCostGamePanel = FinishCostGamePanelIndexExport;

export { default as FinishCostGameSummary } from "./FinishCostGameSummary.astro";

export type { FinishCostItem } from "./FinishCostGame.types";

export type { FinishCostQuestion } from "./FinishCostGame.types";

export type { FinishCostQuestionKind } from "./FinishCostGame.types";

export type { FinishCostQuestionOption } from "./FinishCostGame.types";

export type { FinishCostStage } from "./FinishCostGame.types";

import OccupancyValidityCostCalcIndexExport from "./OccupancyValidityCostCalc.astro";

/**
 * @pServiceFee as number — أتعاب الخدمة المباشرة لشهادة صلاحية المبنى للإشغال للمبنى السكني.
 * @pNonResidentialServiceFee as number — أتعاب الخدمة للمبنى التجاري أو الإداري أو الصناعي.
 */
export const OccupancyValidityCostCalc = OccupancyValidityCostCalcIndexExport;

import StonePricingCalcIndexExport from "./StonePricingCalc.astro";

/**
 * @pSlabWidth as number — عرض الطاولة القياسية بالمتر. DefVal = 1.8
 * @pSlabHeight as number — طول الطاولة القياسية بالمتر. DefVal = 2.9
 * @pProfitRate as number — هامش الربح النهائي بعد حساب كل التكاليف. DefVal = 0.3
 * @pTransportBase as number — تكلفة نقل ثابتة كبداية قبل التحميل بعدد الطاولات. DefVal = 850
 * @pTransportPerSlab as number — تحميل نقل لكل طاولة مطلوبة. DefVal = 180
 * @pDefaultTablePrice as number — سعر متر الطاولة الافتراضي عند فتح الودجت. DefVal = 1200
 * @pDefaultQuantity as number — عدد البلاطات الافتراضي. DefVal = 20
 * @pDefaultTileWidth as number — عرض البلاطة الافتراضي بالسنتيمتر. DefVal = 60
 * @pDefaultTileHeight as number — طول البلاطة الافتراضي بالسنتيمتر. DefVal = 60
 * @pDefaultThickness as number — السمك الافتراضي بالسنتيمتر. DefVal = 2
 */
export const StonePricingCalc = StonePricingCalcIndexExport;

import SupervisionCertificateCostCalcIndexExport from "./SupervisionCertificateCostCalc.astro";

/**
 * @pCairoFee as number — أتعاب الخدمة المباشرة عند اختيار القاهرة.
 * @pGizaFee as number — أتعاب الخدمة المباشرة عند اختيار الجيزة.
 * @pCairoNonResidentialFee as number — أتعاب الخدمة للمبنى التجاري أو الإداري أو الصناعي عند اختيار القاهرة.
 * @pGizaNonResidentialFee as number — أتعاب الخدمة للمبنى التجاري أو الإداري أو الصناعي عند اختيار الجيزة.
 * @pContractFee as number — أتعاب عقد المقاولة عند الحاجة إليه.
 */
export const SupervisionCertificateCostCalc = SupervisionCertificateCostCalcIndexExport;
