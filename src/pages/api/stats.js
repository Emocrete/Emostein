export const prerender = false;

import { createSign } from "node:crypto";

const cAnalyticsScope = "https://www.googleapis.com/auth/analytics.readonly";
const cTokenUrl = "https://oauth2.googleapis.com/token";
const cAnalyticsBaseUrl = "https://analyticsdata.googleapis.com/v1beta";
const cCacheMs = 60 * 1000;
const cCache = new Map();
const cReportCache = new Map();

let fAccessToken = "";
let fAccessTokenExpiresAt = 0;
let fAccessTokenPromise = null;

function Json(pBody, pStatus = 200, pCacheSeconds = 0) {
	const cHeaders = {
		"content-type": "application/json; charset=utf-8",
		"cache-control": pCacheSeconds > 0
			? `public, max-age=0, s-maxage=${pCacheSeconds}, stale-while-revalidate=${pCacheSeconds * 2}`
			: "no-store"
	};

	return new Response(JSON.stringify(pBody), { status: pStatus, headers: cHeaders });
}

function Env(pName) {
	const cValue = process.env[pName];
	return typeof cValue === "string" ? cValue.trim() : "";
}

function GetConfig() {
	const cPropertyId = Env("GA4_PROPERTY_ID");
	let cClientEmail = Env("GA4_CLIENT_EMAIL");
	let cPrivateKey = Env("GA4_PRIVATE_KEY").replace(/\\n/g, "\n");
	const cJson = Env("GA4_SERVICE_ACCOUNT_JSON");

	if (cJson) {
		try {
			const cCredentials = JSON.parse(cJson);
			cClientEmail = String(cCredentials.client_email || cClientEmail).trim();
			cPrivateKey = String(cCredentials.private_key || cPrivateKey).replace(/\\n/g, "\n").trim();
		} catch {
			throw new Error("GA4_SERVICE_ACCOUNT_JSON is not valid JSON");
		}
	}

	if (!cPropertyId || !/^\d+$/.test(cPropertyId)) throw new Error("Missing or invalid GA4_PROPERTY_ID");
	if (!cClientEmail || !cPrivateKey) throw new Error("Missing GA4 service-account credentials");

	return { PropertyId: cPropertyId, ClientEmail: cClientEmail, PrivateKey: cPrivateKey };
}

function Base64Url(pValue) {
	return Buffer.from(pValue)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

async function GetAccessToken(pConfig) {
	const cNowMs = Date.now();
	if (fAccessToken && cNowMs < fAccessTokenExpiresAt - 60_000) return fAccessToken;
	if (fAccessTokenPromise) return fAccessTokenPromise;

	fAccessTokenPromise = RequestAccessToken(pConfig);
	try {
		return await fAccessTokenPromise;
	} finally {
		fAccessTokenPromise = null;
	}
}

async function RequestAccessToken(pConfig) {
	const cNowMs = Date.now();
	const cNow = Math.floor(cNowMs / 1000);
	const cHeader = Base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const cPayload = Base64Url(JSON.stringify({
		iss: pConfig.ClientEmail,
		scope: cAnalyticsScope,
		aud: cTokenUrl,
		iat: cNow,
		exp: cNow + 3600
	}));
	const cUnsignedJwt = `${cHeader}.${cPayload}`;
	const cSigner = createSign("RSA-SHA256");
	cSigner.update(cUnsignedJwt);
	cSigner.end();
	const cSignature = cSigner.sign(pConfig.PrivateKey, "base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
	const cAssertion = `${cUnsignedJwt}.${cSignature}`;

	const cBody = new URLSearchParams({
		grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
		assertion: cAssertion
	});

	const cResponse = await fetch(cTokenUrl, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: cBody
	});
	const cText = await cResponse.text();
	if (!cResponse.ok) throw new Error(`Google OAuth ${cResponse.status}: ${cText}`);

	const cToken = JSON.parse(cText);
	fAccessToken = String(cToken.access_token || "");
	fAccessTokenExpiresAt = cNowMs + Math.max(300, Number(cToken.expires_in) || 3600) * 1000;
	if (!fAccessToken) throw new Error("Google OAuth did not return an access token");
	return fAccessToken;
}

async function AnalyticsRequest(pConfig, pMethod, pBody) {
	const cAccessToken = await GetAccessToken(pConfig);
	const cUrl = `${cAnalyticsBaseUrl}/properties/${pConfig.PropertyId}:${pMethod}`;
	const cResponse = await fetch(cUrl, {
		method: "POST",
		headers: {
			authorization: `Bearer ${cAccessToken}`,
			"content-type": "application/json"
		},
		body: JSON.stringify(pBody)
	});
	const cText = await cResponse.text();
	if (!cResponse.ok) throw new Error(`Google Analytics ${pMethod} ${cResponse.status}: ${cText}`);
	return cText ? JSON.parse(cText) : {};
}

function NormalizePath(pValue) {
	let cValue = String(pValue || "/").trim();
	try {
		if (/^https?:\/\//i.test(cValue)) cValue = new URL(cValue).pathname;
	} catch {
		cValue = "/";
	}
	cValue = cValue.split(/[?#]/, 1)[0] || "/";
	if (!cValue.startsWith("/")) cValue = `/${cValue}`;
	cValue = cValue.replace(/\/{2,}/g, "/");
	if (cValue.length > 1) cValue = cValue.replace(/\/$/, "");
	return cValue.slice(0, 300);
}

function SectionPathOf(pPagePath) {
	const cFirst = pPagePath.split("/").filter(Boolean)[0] || "";
	return cFirst ? `/${cFirst}/` : "/";
}

function CairoMonthStart() {
	const cParts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Africa/Cairo",
		year: "numeric",
		month: "2-digit"
	}).formatToParts(new Date());
	const cYear = cParts.find((pPart) => pPart.type === "year")?.value || "2026";
	const cMonth = cParts.find((pPart) => pPart.type === "month")?.value || "01";
	return `${cYear}-${cMonth}-01`;
}

function NumberOf(pValue) {
	const cValue = Number(pValue);
	return Number.isFinite(cValue) ? cValue : 0;
}

function SumReport(pReport) {
	const cMetricNames = Array.isArray(pReport?.metricHeaders)
		? pReport.metricHeaders.map((pHeader) => String(pHeader?.name || ""))
		: [];
	const cResult = Object.fromEntries(cMetricNames.map((pName) => [pName, 0]));

	for (const cRow of Array.isArray(pReport?.rows) ? pReport.rows : []) {
		const cValues = Array.isArray(cRow?.metricValues) ? cRow.metricValues : [];
		cMetricNames.forEach((pName, pIndex) => {
			cResult[pName] = NumberOf(cResult[pName]) + NumberOf(cValues[pIndex]?.value);
		});
	}
	return cResult;
}

function PageFilter(pPagePath) {
	return {
		filter: {
			fieldName: "pagePath",
			stringFilter: { matchType: "EXACT", value: pPagePath, caseSensitive: true }
		}
	};
}

function SectionFilter(pSectionPath) {
	if (pSectionPath === "/") return null;
	return {
		filter: {
			fieldName: "pagePath",
			stringFilter: { matchType: "BEGINS_WITH", value: pSectionPath, caseSensitive: true }
		}
	};
}

async function RunPeriodReport(pConfig, pStartDate, pEndDate, pFilter = null, pCacheKey = "") {
	const cKey = `period:${pStartDate}:${pEndDate}:${pCacheKey || "domain"}`;
	const cCached = cReportCache.get(cKey);
	if (cCached && Date.now() - cCached.CreatedAt < cCacheMs) return cCached.Value;

	const cBody = {
		metrics: [
			{ name: "activeUsers" },
			{ name: "screenPageViews" }
		],
		dateRanges: [{ startDate: pStartDate, endDate: pEndDate }]
	};
	if (pFilter) cBody.dimensionFilter = pFilter;

	const cValue = SumReport(await AnalyticsRequest(pConfig, "runReport", cBody));
	cReportCache.set(cKey, { CreatedAt: Date.now(), Value: cValue });
	return cValue;
}


async function BuildStats(pConfig, pPagePath) {
	const cMonthStart = CairoMonthStart();
	const cAllTimeStart = "2020-01-01";
	const cSectionPath = SectionPathOf(pPagePath);
	const cPageFilter = PageFilter(pPagePath);
	const cSectionFilter = SectionFilter(cSectionPath);

	const [
		cPageToday,
		cPageMonth,
		cPageTotal,
		cSectionToday,
		cSectionMonth,
		cSectionTotal,
		cDomainToday,
		cDomainMonth,
		cDomainTotal
	] = await Promise.all([
		RunPeriodReport(pConfig, "today", "today", cPageFilter, `page:${pPagePath}`),
		RunPeriodReport(pConfig, cMonthStart, "today", cPageFilter, `page:${pPagePath}`),
		RunPeriodReport(pConfig, cAllTimeStart, "today", cPageFilter, `page:${pPagePath}`),
		RunPeriodReport(pConfig, "today", "today", cSectionFilter, `section:${cSectionPath}`),
		RunPeriodReport(pConfig, cMonthStart, "today", cSectionFilter, `section:${cSectionPath}`),
		RunPeriodReport(pConfig, cAllTimeStart, "today", cSectionFilter, `section:${cSectionPath}`),
		RunPeriodReport(pConfig, "today", "today", null, "domain"),
		RunPeriodReport(pConfig, cMonthStart, "today", null, "domain"),
		RunPeriodReport(pConfig, cAllTimeStart, "today", null, "domain")
	]);

	return {
		pageVisitorsToday: cPageToday.activeUsers,
		pageViewsToday: cPageToday.screenPageViews,
		pageVisitorsMonth: cPageMonth.activeUsers,
		pageVisitorsTotal: cPageTotal.activeUsers,

		sectionVisitorsToday: cSectionToday.activeUsers,
		sectionVisitorsMonth: cSectionMonth.activeUsers,
		sectionVisitorsTotal: cSectionTotal.activeUsers,

		domainVisitorsToday: cDomainToday.activeUsers,
		domainVisitorsMonth: cDomainMonth.activeUsers,
		domainVisitorsTotal: cDomainTotal.activeUsers
	};
}

export async function GET({ request }) {
	try {
		const cUrl = new URL(request.url);
		const cPagePath = NormalizePath(cUrl.searchParams.get("path") || request.headers.get("referer") || "/");
		const cCacheKey = cPagePath;
		const cCached = cCache.get(cCacheKey);
		if (cCached && Date.now() - cCached.CreatedAt < cCacheMs) {
			return Json(cCached.Value, 200, 60);
		}

		const cConfig = GetConfig();
		const cStats = await BuildStats(cConfig, cPagePath);
		const cValue = {
			ok: true,
			pagePath: cPagePath,
			sectionPath: SectionPathOf(cPagePath),
			generatedAt: new Date().toISOString(),
			stats: cStats
		};
		cCache.set(cCacheKey, { CreatedAt: Date.now(), Value: cValue });
		return Json(cValue, 200, 60);
	} catch (pError) {
		const cMessage = pError instanceof Error ? pError.message : String(pError);
		console.error("EmoStats API:", cMessage);
		return Json({ ok: false, error: "Stats are temporarily unavailable" }, 503);
	}
}
