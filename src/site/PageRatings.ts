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

export async function GetPageRating(pPageUrl: string): Promise<PageRatingData | null> {
	const cRatingApiUrl = import.meta.env.PUBLIC_EMO_RATING_API_URL;

	if (!cRatingApiUrl) return null;

	try {
		const cUrl = new URL(cRatingApiUrl);
		const cPageUrl = new URL(pPageUrl);

		cUrl.searchParams.set("mode", "page");
		cUrl.searchParams.set("page_path", NormalizePath(cPageUrl.pathname));

		const cResponse = await fetch(cUrl.href);

		if (!cResponse.ok) return null;

		const cData = await cResponse.json();

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