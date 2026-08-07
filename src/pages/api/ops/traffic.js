export const prerender = false;

const cCache = new Map();
const cCacheMs = 6 * 60 * 60 * 1000;
const cBotPattern = /(bot|crawl|spider|slurp|googlebot|googleother|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb|chatgpt-user|gptbot|oai-searchbot|claudebot|anthropic-ai|perplexitybot|bytespider|amazonbot|applebot|ccbot)/i;
const cDataCenterPattern = /(amazon|amazonaws|aws|google cloud|google llc|microsoft|azure|digitalocean|hetzner|ovh|oracle cloud|linode|akamai|cloudflare|fastly|vultr|contabo|leaseweb|choopa|quadranet|hostinger|hosting|data ?center|datacentre|server|colo|vpn|proxy)/i;

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" }
	});
}

function Str(pValue) { return String(pValue ?? "").trim(); }
function Header(pRequest, pName) { return Str(pRequest.headers.get(pName)); }

function ClientIp(pRequest) {
	const Forwarded = Header(pRequest, "x-forwarded-for").split(",")[0].trim();
	return Forwarded || Header(pRequest, "x-real-ip") || Header(pRequest, "cf-connecting-ip");
}

function HeaderReason(pRequest) {
	const UserAgent = Header(pRequest, "user-agent");
	const Purpose = Str(Header(pRequest, "purpose") || Header(pRequest, "sec-purpose") || Header(pRequest, "x-purpose")).toLowerCase();
	if (cBotPattern.test(UserAgent)) return "known_automation_user_agent";
	if (Purpose.includes("prefetch") || Purpose.includes("preview") || Purpose.includes("prerender")) return "automated_fetch";
	return "";
}

async function LookupIp(pIp) {
	if (!pIp) return null;
	const Cached = cCache.get(pIp);
	if (Cached && Date.now() - Cached.at < cCacheMs) return { ...Cached.value, cacheHit: true };
	try {
		const Res = await fetch(`https://ipapi.co/${encodeURIComponent(pIp)}/json/`, {
			headers: { accept: "application/json" }, signal: AbortSignal.timeout(2500)
		});
		if (!Res.ok) return null;
		const Data = await Res.json();
		const Value = {
			ip: pIp,
			asn: Str(Data.asn),
			org: Str(Data.org),
			hostname: Str(Data.hostname),
			country: Str(Data.country_code),
			region: Str(Data.region),
			city: Str(Data.city),
			postal: Str(Data.postal),
			latitude: Data.latitude ?? "",
			longitude: Data.longitude ?? "",
			timezone: Str(Data.timezone),
			cacheHit: false
		};
		cCache.set(pIp, { at: Date.now(), value: Value });
		return Value;
	} catch { return null; }
}

function RequestDiagnostics(pRequest, pIp, pNetwork, pStartedAt, pLookupMs) {
	let Url;
	try { Url = new URL(pRequest.url); } catch { Url = null; }
	return {
		serverReceivedAt: new Date(pStartedAt).toISOString(),
		serverCompletedAt: new Date().toISOString(),
		serverDurationMs: Math.max(0, Date.now() - pStartedAt),
		networkLookupMs: Math.max(0, Number(pLookupMs) || 0),
		method: Str(pRequest.method),
		requestPath: Url ? `${Url.pathname}${Url.search}` : "",
		clientIp: Str(pIp),
		forwardedFor: Header(pRequest, "x-forwarded-for"),
		realIp: Header(pRequest, "x-real-ip"),
		cfConnectingIp: Header(pRequest, "cf-connecting-ip"),
		host: Header(pRequest, "host"),
		forwardedHost: Header(pRequest, "x-forwarded-host"),
		forwardedProto: Header(pRequest, "x-forwarded-proto"),
		referer: Header(pRequest, "referer"),
		userAgent: Header(pRequest, "user-agent"),
		accept: Header(pRequest, "accept"),
		acceptLanguage: Header(pRequest, "accept-language"),
		acceptEncoding: Header(pRequest, "accept-encoding"),
		purpose: Str(Header(pRequest, "purpose") || Header(pRequest, "sec-purpose") || Header(pRequest, "x-purpose")),
		secChUa: Header(pRequest, "sec-ch-ua"),
		secChUaPlatform: Header(pRequest, "sec-ch-ua-platform"),
		secChUaMobile: Header(pRequest, "sec-ch-ua-mobile"),
		secFetchSite: Header(pRequest, "sec-fetch-site"),
		secFetchMode: Header(pRequest, "sec-fetch-mode"),
		secFetchDest: Header(pRequest, "sec-fetch-dest"),
		secFetchUser: Header(pRequest, "sec-fetch-user"),
		vercel: {
			id: Header(pRequest, "x-vercel-id"),
			country: Header(pRequest, "x-vercel-ip-country"),
			region: Header(pRequest, "x-vercel-ip-country-region") || Header(pRequest, "x-vercel-ip-region"),
			city: Header(pRequest, "x-vercel-ip-city"),
			latitude: Header(pRequest, "x-vercel-ip-latitude"),
			longitude: Header(pRequest, "x-vercel-ip-longitude"),
			timezone: Header(pRequest, "x-vercel-ip-timezone"),
			postalCode: Header(pRequest, "x-vercel-ip-postal-code")
		},
		cloudflare: {
			ray: Header(pRequest, "cf-ray"),
			country: Header(pRequest, "cf-ipcountry")
		},
		network: pNetwork || null
	};
}

export async function GET({ request }) {
	const StartedAt = Date.now();
	const Ip = ClientIp(request);
	const HeaderBlock = HeaderReason(request);
	if (HeaderBlock) return Json({
		ok: true,
		track: false,
		reason: HeaderBlock,
		diagnostics: RequestDiagnostics(request, Ip, null, StartedAt, 0)
	});

	const LookupStartedAt = Date.now();
	const Network = await LookupIp(Ip);
	const LookupMs = Date.now() - LookupStartedAt;
	const Diagnostics = RequestDiagnostics(request, Ip, Network, StartedAt, LookupMs);
	const NetworkText = `${Network?.org || ""} ${Network?.hostname || ""}`;
	if (Network && cDataCenterPattern.test(NetworkText)) {
		return Json({ ok: true, track: false, reason: "automated_network", diagnostics: Diagnostics });
	}

	return Json({
		ok: true,
		track: true,
		reason: Network ? "accepted_network" : "network_lookup_unavailable",
		diagnostics: Diagnostics
	});
}
