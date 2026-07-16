export const prerender = false;

const cCache = new Map();
const cCacheMs = 6 * 60 * 60 * 1000;
const cBotPattern = /(bot|crawl|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb|chatgpt-user|gptbot|oai-searchbot|claudebot|anthropic-ai|perplexitybot|bytespider|amazonbot|applebot|ccbot)/i;
const cDataCenterPattern = /(amazon|amazonaws|aws|google cloud|google llc|microsoft|azure|digitalocean|hetzner|ovh|oracle cloud|linode|akamai|cloudflare|fastly|vultr|contabo|leaseweb|choopa|quadranet|hostinger|hosting|data ?center|datacentre|server|colo|vpn|proxy)/i;

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" }
	});
}

function Str(pValue) { return String(pValue ?? "").trim(); }

function ClientIp(pRequest) {
	const Forwarded = Str(pRequest.headers.get("x-forwarded-for")).split(",")[0].trim();
	return Forwarded || Str(pRequest.headers.get("x-real-ip"));
}

function HeaderReason(pRequest) {
	const UserAgent = Str(pRequest.headers.get("user-agent"));
	const Purpose = Str(pRequest.headers.get("purpose") || pRequest.headers.get("sec-purpose") || pRequest.headers.get("x-purpose")).toLowerCase();
	if (cBotPattern.test(UserAgent)) return "known_automation_user_agent";
	if (Purpose.includes("prefetch") || Purpose.includes("preview") || Purpose.includes("prerender")) return "automated_fetch";
	return "";
}

async function LookupIp(pIp) {
	if (!pIp) return null;
	const Cached = cCache.get(pIp);
	if (Cached && Date.now() - Cached.at < cCacheMs) return Cached.value;
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
			city: Str(Data.city)
		};
		cCache.set(pIp, { at: Date.now(), value: Value });
		return Value;
	} catch { return null; }
}

export async function GET({ request }) {
	const HeaderBlock = HeaderReason(request);
	if (HeaderBlock) return Json({ ok: true, track: false, reason: HeaderBlock });

	const Ip = ClientIp(request);
	const Network = await LookupIp(Ip);
	const NetworkText = `${Network?.org || ""} ${Network?.hostname || ""}`;
	if (Network && cDataCenterPattern.test(NetworkText)) {
		return Json({ ok: true, track: false, reason: "automated_network" });
	}

	return Json({ ok: true, track: true, reason: Network ? "accepted_network" : "network_lookup_unavailable" });
}
