export const prerender = false;

const cCache = new Map();
const cCacheMs = 6 * 60 * 60 * 1000;
const cLookupTimeoutMs = 2500;
const cBotPattern = /(bot|crawl|spider|slurp|googlebot|googleother|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb|chatgpt-user|gptbot|oai-searchbot|claudebot|anthropic-ai|perplexitybot|bytespider|amazonbot|applebot|ccbot)/i;
const cDataCenterPattern = /(amazon|amazonaws|aws|google cloud|google llc|microsoft|azure|digitalocean|hetzner|ovh|oracle cloud|linode|akamai|cloudflare|fastly|vultr|contabo|leaseweb|choopa|quadranet|hostinger|hosting|data ?center|datacentre|server|colo|vpn|proxy)/i;
const cSourceWeights = { vercel: 1, ipapi: 1, ipwho: 1, ipinfo: 1.15, maxmind: 1.2 };

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" }
	});
}

function Env(pName) {
	const Value = process.env[pName];
	return typeof Value === "string" ? Value.trim() : "";
}

function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue) {
	const Value = Number(pValue);
	return Number.isFinite(Value) ? Value : null;
}
function Header(pRequest, pName) { return Str(pRequest.headers.get(pName)); }

function DecodeHeaderText(pValue) {
	const Value = Str(pValue);
	if (!Value) return "";
	try { return decodeURIComponent(Value.replace(/\+/g, "%20")).trim(); }
	catch { return Value; }
}

function GeoNorm(pValue) {
	return DecodeHeaderText(pValue).toLowerCase()
		.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
		.replace(/[\u064B-\u065F\u0670]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
		.replace(/[^a-z0-9ا-ي]+/g, " ").replace(/\s+/g, " ").trim();
}

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

function GeoSource(pSource, pData = {}) {
	return {
		source: pSource,
		countryCode: Str(pData.countryCode).toUpperCase(),
		country: Str(pData.country),
		region: DecodeHeaderText(pData.region),
		regionCode: Str(pData.regionCode),
		city: DecodeHeaderText(pData.city),
		postal: Str(pData.postal),
		latitude: Num(pData.latitude),
		longitude: Num(pData.longitude),
		timezone: Str(pData.timezone),
		accuracyRadiusKm: Num(pData.accuracyRadiusKm),
		asn: Str(pData.asn),
		org: Str(pData.org),
		hostname: Str(pData.hostname),
		networkType: Str(pData.networkType),
		isAnonymous: pData.isAnonymous === true,
		isHosting: pData.isHosting === true,
		isMobile: pData.isMobile === true,
		configured: pData.configured !== false
	};
}

function VercelGeoSource(pRequest) {
	const CountryCode = Header(pRequest, "x-vercel-ip-country");
	const Region = Header(pRequest, "x-vercel-ip-country-region") || Header(pRequest, "x-vercel-ip-region");
	const City = Header(pRequest, "x-vercel-ip-city");
	if (!CountryCode && !Region && !City) return null;
	return GeoSource("vercel", {
		countryCode: CountryCode,
		region: Region,
		city: City,
		postal: Header(pRequest, "x-vercel-ip-postal-code"),
		latitude: Header(pRequest, "x-vercel-ip-latitude"),
		longitude: Header(pRequest, "x-vercel-ip-longitude"),
		timezone: Header(pRequest, "x-vercel-ip-timezone")
	});
}

async function CachedLookup(pKey, pLoader) {
	const Cached = cCache.get(pKey);
	if (Cached && Date.now() - Cached.at < cCacheMs) return Cached.value ? { ...Cached.value, cacheHit: true } : null;
	try {
		const Value = await pLoader();
		cCache.set(pKey, { at: Date.now(), value: Value });
		return Value ? { ...Value, cacheHit: false } : null;
	} catch {
		cCache.set(pKey, { at: Date.now(), value: null });
		return null;
	}
}

async function FetchJson(pUrl, pOptions = {}) {
	const Res = await fetch(pUrl, {
		...pOptions,
		headers: { accept: "application/json", ...(pOptions.headers || {}) },
		signal: AbortSignal.timeout(cLookupTimeoutMs)
	});
	if (!Res.ok) return null;
	return await Res.json();
}

async function LookupIpApi(pIp) {
	if (!pIp) return null;
	return await CachedLookup(`ipapi:${pIp}`, async () => {
		const Data = await FetchJson(`https://ipapi.co/${encodeURIComponent(pIp)}/json/`);
		if (!Data || Data.error) return null;
		return GeoSource("ipapi", {
			countryCode: Data.country_code,
			country: Data.country_name,
			region: Data.region,
			regionCode: Data.region_code,
			city: Data.city,
			postal: Data.postal,
			latitude: Data.latitude,
			longitude: Data.longitude,
			timezone: Data.timezone,
			asn: Data.asn,
			org: Data.org,
			hostname: Data.hostname
		});
	});
}

async function LookupIpWho(pIp) {
	if (!pIp) return null;
	return await CachedLookup(`ipwho:${pIp}`, async () => {
		const Data = await FetchJson(`https://ipwho.is/${encodeURIComponent(pIp)}`);
		if (!Data || Data.success === false) return null;
		return GeoSource("ipwho", {
			countryCode: Data.country_code,
			country: Data.country,
			region: Data.region,
			regionCode: Data.region_code,
			city: Data.city,
			postal: Data.postal,
			latitude: Data.latitude,
			longitude: Data.longitude,
			timezone: Data.timezone?.id,
			asn: Data.connection?.asn,
			org: Data.connection?.org || Data.connection?.isp,
			networkType: Data.type
		});
	});
}

async function LookupIpInfo(pIp) {
	const Token = Env("IPINFO_TOKEN");
	if (!pIp || !Token) return null;
	return await CachedLookup(`ipinfo:${pIp}`, async () => {
		const Data = await FetchJson(`https://api.ipinfo.io/lookup/${encodeURIComponent(pIp)}?token=${encodeURIComponent(Token)}`);
		if (!Data || !Data.geo) return null;
		return GeoSource("ipinfo", {
			countryCode: Data.geo.country_code,
			country: Data.geo.country,
			region: Data.geo.region,
			regionCode: Data.geo.region_code,
			city: Data.geo.city,
			postal: Data.geo.postal_code,
			latitude: Data.geo.latitude,
			longitude: Data.geo.longitude,
			timezone: Data.geo.timezone,
			accuracyRadiusKm: Data.geo.radius,
			asn: Data.as?.asn,
			org: Data.as?.name,
			hostname: Data.hostname,
			networkType: Data.as?.type,
			isAnonymous: Data.is_anonymous === true || Data.anonymous?.is_proxy === true || Data.anonymous?.is_vpn === true,
			isHosting: Data.is_hosting === true,
			isMobile: Data.is_mobile === true
		});
	});
}

async function LookupMaxMind(pIp) {
	const AccountId = Env("MAXMIND_ACCOUNT_ID");
	const LicenseKey = Env("MAXMIND_LICENSE_KEY");
	if (!pIp || !AccountId || !LicenseKey || typeof Buffer === "undefined") return null;
	return await CachedLookup(`maxmind:${pIp}`, async () => {
		const Auth = Buffer.from(`${AccountId}:${LicenseKey}`).toString("base64");
		const Data = await FetchJson(`https://geoip.maxmind.com/geoip/v2.1/city/${encodeURIComponent(pIp)}`, { headers: { authorization: `Basic ${Auth}` } });
		if (!Data) return null;
		const Subdivision = Array.isArray(Data.subdivisions) && Data.subdivisions.length ? Data.subdivisions[0] : null;
		return GeoSource("maxmind", {
			countryCode: Data.country?.iso_code,
			country: Data.country?.names?.en,
			region: Subdivision?.names?.en,
			regionCode: Subdivision?.iso_code,
			city: Data.city?.names?.en,
			postal: Data.postal?.code,
			latitude: Data.location?.latitude,
			longitude: Data.location?.longitude,
			timezone: Data.location?.time_zone,
			accuracyRadiusKm: Data.location?.accuracy_radius,
			asn: Data.traits?.autonomous_system_number ? `AS${Data.traits.autonomous_system_number}` : "",
			org: Data.traits?.autonomous_system_organization,
			networkType: Data.traits?.user_type,
			isAnonymous: Data.traits?.is_anonymous_proxy === true,
			isHosting: Data.traits?.user_type === "hosting",
			isMobile: Data.traits?.user_type === "cellular"
		});
	});
}

function BestVote(pSources, pField, pFilter = null) {
	const Votes = new Map();
	for (const Source of pSources) {
		if (!Source || (pFilter && !pFilter(Source))) continue;
		const Raw = Str(Source[pField]);
		const Key = pField === "countryCode" ? Raw.toUpperCase() : GeoNorm(Raw);
		if (!Key) continue;
		const Weight = cSourceWeights[Source.source] || 1;
		const Existing = Votes.get(Key) || { key: Key, value: Raw, score: 0, sources: [] };
		Existing.score += Weight;
		Existing.sources.push(Source.source);
		if (!Existing.value) Existing.value = Raw;
		Votes.set(Key, Existing);
	}
	const Ordered = Array.from(Votes.values()).sort((A, B) => B.score - A.score || B.sources.length - A.sources.length);
	return Ordered[0] || null;
}

function WeightedCoordinate(pSources, pCountryCode) {
	let Lat = 0;
	let Lon = 0;
	let WeightTotal = 0;
	const Used = [];
	for (const Source of pSources) {
		if (!Source || (pCountryCode && Source.countryCode !== pCountryCode)) continue;
		if (!Number.isFinite(Source.latitude) || !Number.isFinite(Source.longitude)) continue;
		const Weight = cSourceWeights[Source.source] || 1;
		Lat += Source.latitude * Weight;
		Lon += Source.longitude * Weight;
		WeightTotal += Weight;
		Used.push(Source.source);
	}
	if (!WeightTotal) return { latitude: null, longitude: null, sources: [] };
	return { latitude: Lat / WeightTotal, longitude: Lon / WeightTotal, sources: Used };
}

function ResolveIpLocation(pSources) {
	const Sources = (pSources || []).filter(Boolean);
	if (!Sources.length) return null;
	const CountryVote = BestVote(Sources, "countryCode");
	const CountryCode = Str(CountryVote?.value).toUpperCase();
	const MatchingCountry = (Source) => !CountryCode || Source.countryCode === CountryCode;
	const RegionVote = BestVote(Sources, "region", MatchingCountry);
	const CityVote = BestVote(Sources, "city", MatchingCountry);
	const Coordinates = WeightedCoordinate(Sources, CountryCode);
	const CityAgreement = CityVote?.sources?.length || 0;
	const CountryAgreement = CountryVote?.sources?.length || 0;
	return {
		method: "ip_consensus",
		confidence: CityAgreement >= 3 ? "medium" : CityAgreement >= 2 ? "medium_low" : "low",
		countryConfidence: CountryAgreement >= 2 ? "high" : "medium",
		countryCode: CountryCode,
		region: Str(RegionVote?.value),
		city: Str(CityVote?.value),
		latitude: Coordinates.latitude,
		longitude: Coordinates.longitude,
		sourceCount: Sources.length,
		countryAgreementSources: CountryVote?.sources || [],
		regionAgreementSources: RegionVote?.sources || [],
		cityAgreementSources: CityVote?.sources || [],
		coordinateSources: Coordinates.sources,
		note: "IP-derived city is an estimate of the public network egress, not verified physical device location"
	};
}

async function LookupIpSources(pRequest, pIp) {
	const Vercel = VercelGeoSource(pRequest);
	const [IpApi, IpWho, IpInfo, MaxMind] = await Promise.all([
		LookupIpApi(pIp),
		LookupIpWho(pIp),
		LookupIpInfo(pIp),
		LookupMaxMind(pIp)
	]);
	return [Vercel, IpApi, IpWho, IpInfo, MaxMind].filter(Boolean);
}

function RequestDiagnostics(pRequest, pIp, pSources, pResolved, pStartedAt, pLookupMs) {
	let Url;
	try { Url = new URL(pRequest.url); } catch { Url = null; }
	const Network = (pSources || []).find((Item) => Item?.org || Item?.asn || Item?.hostname) || null;
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
			city: DecodeHeaderText(Header(pRequest, "x-vercel-ip-city")),
			latitude: Header(pRequest, "x-vercel-ip-latitude"),
			longitude: Header(pRequest, "x-vercel-ip-longitude"),
			timezone: Header(pRequest, "x-vercel-ip-timezone"),
			postalCode: Header(pRequest, "x-vercel-ip-postal-code")
		},
		cloudflare: {
			ray: Header(pRequest, "cf-ray"),
			country: Header(pRequest, "cf-ipcountry")
		},
		network: Network,
		geoSources: pSources || [],
		resolvedIpLocation: pResolved,
		geoProviderConfiguration: {
			vercel: true,
			ipapi: true,
			ipwho: true,
			ipinfo: !!Env("IPINFO_TOKEN"),
			maxmind: !!Env("MAXMIND_ACCOUNT_ID") && !!Env("MAXMIND_LICENSE_KEY"),
			browserBigDataCloud: true,
			browserDeviceGeolocation: "used only when browser permission is already granted; no permission prompt is triggered"
		}
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
		diagnostics: RequestDiagnostics(request, Ip, [], null, StartedAt, 0)
	});

	const LookupStartedAt = Date.now();
	const Sources = await LookupIpSources(request, Ip);
	const LookupMs = Date.now() - LookupStartedAt;
	const Resolved = ResolveIpLocation(Sources);
	const Diagnostics = RequestDiagnostics(request, Ip, Sources, Resolved, StartedAt, LookupMs);
	const NetworkText = Sources.map((Item) => `${Item?.org || ""} ${Item?.hostname || ""} ${Item?.networkType || ""}`).join(" ");
	const NetworkAutomationHint = Boolean(NetworkText && cDataCenterPattern.test(NetworkText));
	Diagnostics.networkAutomationHint = NetworkAutomationHint;
	Diagnostics.networkDecision = "observe_only";

	return Json({
		ok: true,
		track: true,
		reason: NetworkAutomationHint ? "observed_automation_network" : (Sources.length ? "accepted_network" : "network_lookup_unavailable"),
		diagnostics: Diagnostics
	});
}
