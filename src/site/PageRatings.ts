export interface PageReviewData {
	ratingValue: number;
	ratingComment: string;
	datePublished: string;
	authorName: string;
}

export interface PageRatingData {
	hasRating: boolean;
	pagePath: string;
	ratingValue: number;
	ratingCount: number;
	bestRating: number;
	worstRating: number;
	review: PageReviewData | null;
}

interface RatingApiData {
	ok?: boolean;
	hasRating?: boolean;
	pagePath?: string;
	ratingValue?: number;
	ratingCount?: number;
	bestRating?: number;
	worstRating?: number;
	review?: {
		ratingValue?: number;
		ratingComment?: string;
		datePublished?: string;
		authorName?: string;
	} | null;
}

export async function GetPageRating(pRatingApiUrl: string, pPageUrl: string): Promise<PageRatingData | null> {
	if (!pRatingApiUrl || !IsRealSiteUrl(pPageUrl)) return null;

	try {
		const cPageUrl = new URL(pPageUrl);
		const cData = await LoadRatingJsonp(pRatingApiUrl, NormalizePath(cPageUrl.pathname));

		if (!cData?.ok || !cData?.hasRating) return null;

		return {
			hasRating: true,
			pagePath: String(cData.pagePath || ""),
			ratingValue: Number(cData.ratingValue || 0),
			ratingCount: Number(cData.ratingCount || 0),
			bestRating: Number(cData.bestRating || 5),
			worstRating: Number(cData.worstRating || 1),
			review: cData.review
				? {
					ratingValue: Number(cData.review.ratingValue || 0),
					ratingComment: String(cData.review.ratingComment || ""),
					datePublished: String(cData.review.datePublished || ""),
					authorName: String(cData.review.authorName || "عميل من زوار الموقع")
				}
				: null
		};
	} catch {
		return null;
	}
}

function LoadRatingJsonp(pRatingApiUrl: string, pPagePath: string): Promise<RatingApiData> {
	return new Promise(function HandleJsonp(pResolve, pReject): void {
		const cCallbackName = `EmoRatingCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
		const cUrl = new URL(pRatingApiUrl);
		const cScript = document.createElement("script");
		let cDone = false;

		cUrl.searchParams.set("mode", "page");
		cUrl.searchParams.set("page_path", pPagePath);
		cUrl.searchParams.set("callback", cCallbackName);

		(window as unknown as Record<string, unknown>)[cCallbackName] = function HandleRatingCallback(pData: RatingApiData): void {
			cDone = true;
			Cleanup();
			pResolve(pData);
		};

		cScript.src = cUrl.href;
		cScript.async = true;

		cScript.addEventListener("error", function HandleError(): void {
			if (cDone) return;

			Cleanup();
			pReject(new Error("Rating JSONP loading failed."));
		});

		document.head.appendChild(cScript);

		function Cleanup(): void {
			delete (window as unknown as Record<string, unknown>)[cCallbackName];
			cScript.remove();
		}
	});
}

function IsRealSiteUrl(pPageUrl: string): boolean {
	try {
		const cHostname = new URL(pPageUrl).hostname.toLowerCase();
		return cHostname === "emocrete.com" || cHostname === "www.emocrete.com";
	} catch {
		return false;
	}
}

function NormalizePath(pValue: string): string {
	let cValue = pValue.trim();

	if (!cValue.startsWith("/")) {
		cValue = `/${cValue}`;
	}

	if (!cValue.endsWith("/")) {
		cValue = `${cValue}/`;
	}

	return cValue.toLowerCase();
}
