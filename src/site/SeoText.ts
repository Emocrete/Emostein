export class SeoText {
	private static readonly cTitleSeparators = ["|", " - ", " – ", " — "];

	private static readonly cBrandPattern = /\s*(?:\||-|–|—)\s*(?:Emostein|Emodsign|Emocrete|Emostone|Emochain|Emoperm|Emomed|Emonsult|Emostate|م\.?\s*أيمن\s+عاشور|أيمن\s+عاشور|خدمات\s+هندسية|20\d{2}).*$/iu;

	public static GetCleanTitle( pTitle: string ) : string
		{

			const cTitle = SeoText.NormalizeText(pTitle);

			if (!cTitle) { return ""; }

			const cPipeTitle = cTitle.split("|")[0]?.trim() ?? cTitle;
			const cBrandlessTitle = cPipeTitle.replace(SeoText.cBrandPattern, "").trim();

			if (cBrandlessTitle) { return cBrandlessTitle; }

			for (const cSeparator of SeoText.cTitleSeparators) {
				const cPart = cTitle.split(cSeparator)[0]?.trim() ?? "";

				if (cPart) { return cPart; }
			}

			return cTitle;

		}



	public static GetImageAlt( pTitle: string , pDescr: string ) : string
		{

			const cTitle = SeoText.GetCleanTitle(pTitle);
			const cDescr = SeoText.NormalizeText(pDescr);

			if (cTitle && cDescr && cTitle !== cDescr) { return `${cTitle} - ${cDescr}`; }
			if (cTitle) { return cTitle; }

			return cDescr;

		}



	public static GetLocalsImageAlt( pLocals: unknown ) : string
		{

			if (!pLocals || typeof pLocals !== "object") { return ""; }

			const cAlt = (pLocals as Record<string, unknown>).SeoImageAlt;

			return typeof cAlt === "string" ? cAlt : "";

		}



	public static SetLocalsImageAlt( pLocals: unknown , pAlt: string ) : void
		{

			if (!pLocals || typeof pLocals !== "object") { return; }

			(pLocals as Record<string, unknown>).SeoImageAlt = pAlt;

		}



	public static NormalizePageUrl( pUrl: string ) : string
		{

			if (!pUrl) { return ""; }

			const cUrl = new URL(pUrl);
			cUrl.pathname = cUrl.pathname.replace(/\/+$/g, "") || "/";
			cUrl.hash = "";

			return cUrl.href.replace(/\/$/, "");

		}



	private static NormalizeText( pValue: string ) : string
		{

			return (pValue ?? "").replace(/\s+/g, " ").trim();

		}
}
