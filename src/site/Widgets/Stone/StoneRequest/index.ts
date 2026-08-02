import StoneRequestBuilderIndexExport from "./StoneRequestBuilder.astro";

/**
 * Interactive multi-item marble and granite request builder.
 * Saves the draft locally in IndexedDB, synchronizes it with the StoneReq API,
 * restores the exact interrupted item/step, and submits a structured request.
 *
 * @pApiUrl as string (Default: "/api/stone-req")
 * @pSourcePage as string (Default: "صفحة الرخام والجرانيت")
 * @pTitle as string (Default: "كوّن طلبية الرخام أو الجرانيت")
 * @pDesc as string
 * @pStorageKey as string (Default: "EmoStoneRequestDraftV1")
 * @pMaxAttachments as number (Default: 5)
 * @pMaxImageKb as number (Default: 300)
 * @pMaxRequestImageMb as number (Default: 2.5; maximum: 2.5)
 */
export const StoneRequestBuilder = StoneRequestBuilderIndexExport;
