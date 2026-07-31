import FinishCalcIndexExport from "./FinishCalc.astro";

/**
 * @fVideo as string (Default: "/assets/worker-loop.mp4")
 */
export const FinishCalc = FinishCalcIndexExport;

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
