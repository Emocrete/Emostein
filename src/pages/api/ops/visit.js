export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";
const cMaxEventsPerRequest = 500;
const cMaxBodyBytes = 4 * 1024 * 1024;
const cSyntheticUserAgentPattern = /(bot|crawl|spider|slurp|googlebot|googleother|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb|pageburst|google-read-aloud|google-notebooklm|google-gemininotebook|google-agent|googlemessages|google-pinpoint|google-cws|feedfetcher-google|ptst(?:\/|\b))/i;
const cSyntheticReferrerHosts = new Set(["pagespeed.web.dev"]);
const cArabCountryCodes = new Set(["EG", "SA", "AE", "KW", "QA", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "PS", "MA", "DZ", "TN", "LY", "SD", "SO", "DJ", "KM", "MR"]);
const cAssetDocumentPattern = /\.(?:avif|webp|jpe?g|png|gif|svg|ico|bmp|tiff?|css|js|mjs|map|woff2?|ttf|otf|eot|pdf|zip|rar|7z|xml|json|txt)(?:\/|$)/i;

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
	});
}

function Env(pName) {
	const Value = process.env[pName];
	return typeof Value === "string" ? Value.trim() : "";
}

function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue, pFallback = 0) {
	const Value = Number(pValue);
	return Number.isFinite(Value) ? Value : pFallback;
}
function Bool(pValue) {
	return pValue === true || ["true", "1", "yes", "on", "important"].includes(Str(pValue).toLowerCase());
}

function EventTypeOf(pInput) {
	const Input = pInput && typeof pInput === "object" ? pInput : {};
	const Nested = Input.payload && typeof Input.payload === "object" ? Input.payload : {};
	return Str(Input.eventType ?? Input.event_type ?? Input.type ?? Input.event ?? Nested.eventType ?? Nested.event_type ?? Nested.type ?? Nested.event).toLowerCase();
}
function PagePathOf(pInput) {
	const Input = pInput && typeof pInput === "object" ? pInput : {};
	const Nested = Input.payload && typeof Input.payload === "object" ? Input.payload : {};
	return Str(Input.pagePath ?? Input.page_path ?? Nested.pagePath ?? Nested.page_path);
}

function EventSourceOf(pInput) {
	const Input = pInput && typeof pInput === "object" ? pInput : {};
	const Nested = Input.payload && typeof Input.payload === "object" ? Input.payload : {};
	return Str(Input.eventSource ?? Input.event_source ?? Nested.eventSource ?? Nested.event_source).toLowerCase();
}

function IsAssetDocumentPath(pValue) {
	const Value = Str(pValue).split(/[?#]/, 1)[0];
	return !!Value && cAssetDocumentPattern.test(Value);
}

function EventStreamOf(pEventType) {
	const Type = Str(pEventType).toLowerCase();
	return Type.startsWith("system.") && Type !== "system.clarity_session_index" ? "replay" : "normal";
}

function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return !!Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey);
}

function Header(pRequest, ...pNames) {
	for (const Name of pNames) {
		const Value = Str(pRequest.headers.get(Name));
		if (Value) return Value;
	}
	return "";
}

function ClientIp(pRequest) {
	const Forwarded = Header(pRequest, "x-forwarded-for").split(",")[0].trim();
	return Forwarded || Header(pRequest, "x-real-ip") || Header(pRequest, "cf-connecting-ip");
}

function BuildRequestDiagnostics(pRequest) {
	let Url;
	try { Url = new URL(pRequest.url); } catch { Url = null; }
	return {
		serverReceivedAt: new Date().toISOString(),
		method: Str(pRequest.method),
		requestPath: Url ? `${Url.pathname}${Url.search}` : "",
		clientIp: ClientIp(pRequest),
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
		purpose: Header(pRequest, "purpose", "sec-purpose", "x-purpose"),
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
			region: Header(pRequest, "x-vercel-ip-country-region", "x-vercel-ip-region"),
			city: Header(pRequest, "x-vercel-ip-city"),
			latitude: Header(pRequest, "x-vercel-ip-latitude"),
			longitude: Header(pRequest, "x-vercel-ip-longitude"),
			timezone: Header(pRequest, "x-vercel-ip-timezone"),
			postalCode: Header(pRequest, "x-vercel-ip-postal-code")
		},
		cloudflare: { ray: Header(pRequest, "cf-ray"), country: Header(pRequest, "cf-ipcountry") }
	};
}

function DecodeHeaderText(pValue) {
	const Value = Str(pValue);
	if (!Value) return "";
	try { return decodeURIComponent(Value.replace(/\+/g, "%20")).trim(); }
	catch { return Value; }
}

function GeoNorm(pValue) {
	return DecodeHeaderText(pValue).toLowerCase()
		.replace(/[\u064B-\u065F\u0670]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
		.replace(/[^a-z0-9ا-ي]+/g, " ").replace(/\s+/g, " ").trim();
}

function HasGeoWord(pText, pWords) {
	const Text = ` ${GeoNorm(pText)} `;
	return pWords.some((pWord) => {
		const Word = GeoNorm(pWord);
		return Word && (Text.includes(` ${Word} `) || (Word.length > 2 && Text.includes(Word)));
	});
}

function ClassifyGeo(pCountryCode, pRegion, pCity) {
	const CountryCode = Str(pCountryCode).toUpperCase();
	const Region = DecodeHeaderText(pRegion);
	const City = DecodeHeaderText(pCity);
	const All = `${City} ${Region}`;
	if (!CountryCode) return { band: "", label: "", borderColor: "" };
	if (CountryCode === "EG") {
		if (HasGeoWord(All, ["c", "cai", "cairo", "al qahirah", "القاهرة", "القاهره", "محافظة القاهرة", "qahira"])) return { band: "cairo", label: City || Region || "Cairo", borderColor: "#00C853" };
		if (HasGeoWord(All, ["gz", "giza", "al jizah", "jizah", "6th of october", "october", "sheikh zayed", "الجيزة", "الجيزه", "اكتوبر", "السادس من اكتوبر", "الشيخ زايد"])) return { band: "giza", label: City || Region || "Giza", borderColor: "#00D5FF" };
		return { band: "egypt", label: City || Region || "Egypt", borderColor: "#FFD740" };
	}
	if (cArabCountryCodes.has(CountryCode)) return { band: "arab", label: City || CountryCode || "Arab country", borderColor: "#FF8A00" };
	return { band: "world", label: City || CountryCode || "Outside Arab region", borderColor: "#FF3B30" };
}

function BuildGeo(pRequest, pEvent = {}) {
	let CountryCode = Header(pRequest, "x-vercel-ip-country", "cf-ipcountry", "x-country-code").toUpperCase();
	const Region = Header(pRequest, "x-vercel-ip-country-region", "x-vercel-ip-region", "x-region", "x-country-region");
	const City = Header(pRequest, "x-vercel-ip-city", "x-city");
	if (!CountryCode && Str(pEvent.timezone ?? pEvent.timeZone).toLowerCase() === "africa/cairo") CountryCode = "EG";
	const Classified = ClassifyGeo(CountryCode, Region, City);
	return { countryCode: CountryCode, region: DecodeHeaderText(Region), city: DecodeHeaderText(City), ...Classified };
}

function UserAgentPlatformFamily(pUserAgent) {
	const Value = Str(pUserAgent).toLowerCase();
	if (/iphone|ipad|ipod/.test(Value)) return "ios";
	if (Value.includes("android")) return "android";
	if (Value.includes("windows")) return "windows";
	if (Value.includes("macintosh") || Value.includes("mac os x")) return "macos";
	if (Value.includes("cros")) return "chromeos";
	if (Value.includes("linux") || Value.includes("x11")) return "linux";
	return "";
}

function NavigatorPlatformFamily(pPlatform) {
	const Value = Str(pPlatform).toLowerCase();
	if (Value.includes("iphone") || Value.includes("ipad") || Value.includes("ipod")) return "ios";
	if (Value.includes("android")) return "android";
	if (Value.includes("win")) return "windows";
	if (Value.includes("mac")) return "macos";
	if (Value.includes("cros")) return "chromeos";
	if (Value.includes("linux")) return "linux";
	return "";
}

function UserAgentDataPlatformFamily(pPlatform) {
	const Value = Str(pPlatform).toLowerCase();
	if (Value.includes("android")) return "android";
	if (Value.includes("windows")) return "windows";
	if (Value.includes("mac")) return "macos";
	if (Value.includes("chrome os") || Value.includes("chromeos")) return "chromeos";
	if (Value.includes("linux")) return "linux";
	return "";
}

function IsNavigatorPlatformCompatible(pUaFamily, pNavigatorFamily) {
	if (!pUaFamily || !pNavigatorFamily) return true;
	if (pUaFamily === "android") return pNavigatorFamily === "android" || pNavigatorFamily === "linux";
	if (pUaFamily === "ios") return pNavigatorFamily === "ios" || pNavigatorFamily === "macos";
	return pUaFamily === pNavigatorFamily;
}

function ChromeMajorFromUserAgent(pUserAgent) {
	const Match = Str(pUserAgent).match(/(?:Chrome|Chromium)\/(\d+)/i);
	return Match ? Num(Match[1], 0) : 0;
}

function ChromeMajorFromUserAgentData(pUserAgentData) {
	const Lists = [
		Array.isArray(pUserAgentData?.fullVersionList) ? pUserAgentData.fullVersionList : [],
		Array.isArray(pUserAgentData?.brands) ? pUserAgentData.brands : []
	];
	for (const List of Lists) {
		for (const Item of List) {
			const Brand = Str(Item?.brand).toLowerCase();
			if (Brand !== "google chrome" && Brand !== "chromium") continue;
			const Major = Number.parseInt(Str(Item?.version).split(".")[0], 10);
			if (Number.isFinite(Major) && Major > 0) return Major;
		}
	}
	return 0;
}

function UserAgentDataHasHeadlessBrand(pUserAgentData) {
	const Lists = [
		Array.isArray(pUserAgentData?.fullVersionList) ? pUserAgentData.fullVersionList : [],
		Array.isArray(pUserAgentData?.brands) ? pUserAgentData.brands : []
	];
	return Lists.some((List) => List.some((Item) => /headlesschrome|headless/i.test(Str(Item?.brand))));
}

function SyntheticReferrerReason(pValue) {
	const Value = Str(pValue);
	if (!Value) return "";
	try {
		const Host = new URL(Value).hostname.toLowerCase();
		return cSyntheticReferrerHosts.has(Host) ? "pagespeed_referrer" : "";
	} catch {
		return "";
	}
}

function BrowserAutomationReason(pEvent = {}) {
	const EventData = pEvent?.eventData && typeof pEvent.eventData === "object" ? pEvent.eventData : {};
	const Diagnostics = EventData.clientDiagnostics && typeof EventData.clientDiagnostics === "object" ? EventData.clientDiagnostics : null;
	if (!Diagnostics) return "";
	const Hardware = Num(Diagnostics.hardwareConcurrency, 0);
	const DeviceMemory = Num(Diagnostics.deviceMemory, 0);
	const Renderer = Str(Diagnostics.webgl?.renderer).toLowerCase();
	const SwiftShader = Renderer.includes("swiftshader");
	const EmptyBrowserSurface = Num(Diagnostics.pluginsLength, 0) === 0 && Num(Diagnostics.mimeTypesLength, 0) === 0;
	const UserAgent = Str(Diagnostics.userAgent || pEvent.userAgentClient || pEvent.userAgent);
	const UserAgentData = Diagnostics.userAgentData && typeof Diagnostics.userAgentData === "object" ? Diagnostics.userAgentData : null;
	const UaFamily = UserAgentPlatformFamily(UserAgent);
	const NavigatorFamily = NavigatorPlatformFamily(Diagnostics.platform);
	const UaDataFamily = UserAgentDataPlatformFamily(UserAgentData?.platform);
	const UaChromeMajor = ChromeMajorFromUserAgent(UserAgent);
	const UaDataChromeMajor = ChromeMajorFromUserAgentData(UserAgentData);
	const UaLooksMobile = /iphone|ipad|ipod|android|\bmobile\b/i.test(UserAgent);

	if (Diagnostics.webdriver === true) return "webdriver";
	if (UserAgentDataHasHeadlessBrand(UserAgentData)) return "headless_client_hint";
	if (DeviceMemory > 8) return "device_memory_impossible";
	if (Hardware >= 256) return "hardware_concurrency_extreme";
	if (!IsNavigatorPlatformCompatible(UaFamily, NavigatorFamily)) return "ua_navigator_platform_mismatch";
	if (UaDataFamily && UaFamily && UaFamily !== "ios" && UaFamily !== UaDataFamily) return "ua_client_hint_platform_mismatch";
	if (UserAgentData && UaLooksMobile && UserAgentData.mobile === false) return "mobile_client_hint_mismatch";
	if (UaChromeMajor && UaDataChromeMajor && Math.abs(UaChromeMajor - UaDataChromeMajor) >= 2) return "chrome_version_mismatch";
	if (SwiftShader && EmptyBrowserSurface) return "swiftshader_empty_browser_surface";
	if (SwiftShader && Hardware >= 64) return "swiftshader_high_concurrency";
	return "";
}

function SyntheticTrafficReason(pRequest, pEvent = {}) {
	const UserAgent = Str(pRequest.headers.get("user-agent") || pEvent.userAgentClient || pEvent.userAgent);
	const ClientHintUa = Str(pRequest.headers.get("sec-ch-ua"));
	const Purpose = Str(pRequest.headers.get("purpose") || pRequest.headers.get("sec-purpose") || pRequest.headers.get("x-purpose")).toLowerCase();
	const BodySignal = Str(pEvent.botSignal ?? pEvent.bot_signal);
	const TrafficKind = Str(pEvent.trafficKind ?? pEvent.traffic_kind).toLowerCase();
	const Reasons = [];
	if (EventSourceOf(pEvent) !== "emolive" && IsAssetDocumentPath(PagePathOf(pEvent))) Reasons.push("asset_document_path");
	if (cSyntheticUserAgentPattern.test(UserAgent) || cSyntheticUserAgentPattern.test(ClientHintUa)) Reasons.push("ua_bot");
	if (Purpose.includes("prefetch") || Purpose.includes("preview") || Purpose.includes("prerender")) Reasons.push("prefetch");
	const ReferrerReason = SyntheticReferrerReason(pEvent.referrer);
	if (ReferrerReason) Reasons.push(ReferrerReason);
	if (Bool(pEvent.synthetic ?? pEvent.isSynthetic)) Reasons.push("client_synthetic");
	const BrowserReason = BrowserAutomationReason(pEvent);
	if (BrowserReason) Reasons.push(`browser_${BrowserReason}`);
	if (BodySignal) Reasons.push(`client_${BodySignal}`);
	if (["bot", "crawler", "synthetic"].includes(TrafficKind)) Reasons.push(`kind_${TrafficKind}`);
	return Reasons.join(",");
}

function IsValidClientId(pValue, pPrefix) {
	const Value = Str(pValue);
	return !!Value && Value.startsWith(`${pPrefix}_`) && /^[a-z]_[a-z0-9]+_[a-z0-9]+$/i.test(Value);
}

async function ReadBody(pRequest) {
	const Text = await pRequest.text();
	if (!Text) return null;
	if (Text.length > cMaxBodyBytes) throw new Error("Request body is too large");
	try { return JSON.parse(Text); }
	catch { throw new Error("Invalid JSON body"); }
}

async function SupabaseRequest(pUrl, pServiceKey, pOptions = {}) {
	const Res = await fetch(pUrl, {
		...pOptions,
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`,
			...(pOptions.headers || {})
		}
	});
	const Text = await Res.text();
	return { ok: Res.ok, status: Res.status, text: Text };
}

function NormalizeEvent(pInput, pRequest) {
	const Input = pInput && typeof pInput === "object" ? pInput : {};
	const Nested = Input.payload && typeof Input.payload === "object" ? Input.payload : {};
	const Event = { ...Nested, ...Input };
	delete Event.payload;

	const EventType = Str(Event.eventType ?? Event.event_type ?? Event.type ?? Event.event).toLowerCase();
	const EventStream = EventStreamOf(EventType);
	const VisitorId = Str(Event.visitorId ?? Event.visitor_id);
	const SessionId = Str(Event.sessionId ?? Event.session_id ?? Event.visitSessionId);
	const PageInstanceId = Str(Event.pageInstanceId ?? Event.page_instance_id ?? Event.pageId);
	const ClientEventUid = Str(Event.clientEventUid ?? Event.client_event_uid);
	const EventSource = Str(Event.eventSource ?? Event.event_source) || "site";
	if (!EventType) throw new Error("Missing eventType");
	if (!IsValidClientId(VisitorId, "v")) throw new Error("Invalid visitorId");
	if (!IsValidClientId(SessionId, "s")) throw new Error("Invalid sessionId");
	if (!IsValidClientId(PageInstanceId, "p")) throw new Error("Invalid pageInstanceId");
	if (!ClientEventUid || ClientEventUid.length > 240) throw new Error("Invalid clientEventUid");

	const RawEventData = Event.eventData && typeof Event.eventData === "object" ? Event.eventData : {};
	const EventData = EventType === "page_open" && EventSource !== "emolive"
		? { ...RawEventData, visitRequest: BuildRequestDiagnostics(pRequest) }
		: RawEventData;
	const OccurredAt = Str(Event.createdAtClient ?? Event.occurredAt ?? Event.occurred_at) || new Date().toISOString();
	const SessionSeq = Math.max(0, Math.trunc(Num(Event.sessionSeq ?? Event.session_seq)));
	const PageElapsedMs = Math.max(0, Math.trunc(Num(Event.pageElapsedMs ?? Event.page_elapsed_ms ?? Event.elapsedMs)));
	const SessionElapsedMs = Math.max(0, Math.trunc(Num(Event.sessionElapsedMs ?? Event.session_elapsed_ms)));
	const PagePath = Str(Event.pagePath ?? Event.page_path) || "/";
	const PageTitle = Str(Event.pageTitle ?? Event.page_title);
	const FocusState = Str(Event.focusState ?? Event.focus_state);

	let FullPayload;
	let UserAgent = "";
	if (EventStream === "replay") {
		FullPayload = {
			clientEventUid: ClientEventUid,
			eventType: EventType,
			eventSource: EventSource,
			visitorId: VisitorId,
			sessionId: SessionId,
			pageInstanceId: PageInstanceId,
			pagePath: PagePath,
			pageTitle: PageTitle,
			sessionSeq: SessionSeq,
			pageElapsedMs: PageElapsedMs,
			sessionElapsedMs: SessionElapsedMs,
			createdAtClient: OccurredAt,
			focusState: FocusState,
			eventData: EventData
		};
	} else {
		const Geo = EventSource === "emolive"
			? { countryCode: "", region: "", city: "", band: "", label: "", borderColor: "" }
			: BuildGeo(pRequest, Event);
		const Resolution = EventData.locationResolution && typeof EventData.locationResolution === "object" ? EventData.locationResolution : null;
		const HasCanonicalResolution = !!Resolution;
		const LocationCountryCode = HasCanonicalResolution ? Str(Resolution.countryCode) : (Str(Event.locationCountryCode) || Geo.countryCode);
		const LocationGovernorate = HasCanonicalResolution ? Str(Resolution.governorate || Resolution.region) : Str(Event.locationGovernorate || Event.locationRegion || Geo.region);
		const LocationCity = HasCanonicalResolution ? Str(Resolution.city) : (Str(Event.locationCity) || Geo.city);
		const LocationArea = HasCanonicalResolution ? Str(Resolution.area) : Str(Event.locationArea);
		const LocationAreaType = HasCanonicalResolution ? Str(Resolution.areaType) : Str(Event.locationAreaType);
		const LocationBand = HasCanonicalResolution ? Str(Resolution.band) : (Str(Event.locationBand) || Geo.band);
		const LocationLabel = HasCanonicalResolution ? Str(Resolution.label) : (Str(Event.locationLabel) || Geo.label);
		const LocationBorderColor = HasCanonicalResolution ? Str(Resolution.borderColor) : (Str(Event.locationBorderColor) || Geo.borderColor);
		UserAgent = EventSource === "emolive"
			? Str(Event.userAgentClient || Event.userAgent)
			: Str(pRequest.headers.get("user-agent") || Event.userAgentClient || Event.userAgent);
		FullPayload = {
			...Event,
			clientEventUid: ClientEventUid,
			eventType: EventType,
			eventSource: EventSource,
			visitorId: VisitorId,
			sessionId: SessionId,
			pageInstanceId: PageInstanceId,
			pagePath: PagePath,
			pageTitle: PageTitle,
			sessionSeq: SessionSeq,
			pageElapsedMs: PageElapsedMs,
			sessionElapsedMs: SessionElapsedMs,
			createdAtClient: OccurredAt,
			focusState: FocusState,
			eventData: EventData,
			locationCountryCode: LocationCountryCode,
			locationGovernorate: LocationGovernorate,
			locationRegion: LocationGovernorate,
			locationCity: LocationCity,
			locationArea: LocationArea,
			locationAreaType: LocationAreaType,
			locationBand: LocationBand,
			locationLabel: LocationLabel,
			locationBorderColor: LocationBorderColor,
			userAgentClient: UserAgent
		};
	}

	return {
		event_stream: EventStream,
		client_event_uid: ClientEventUid,
		event_type: EventType,
		event_source: EventSource,
		visitor_id: VisitorId,
		session_id: SessionId,
		page_instance_id: PageInstanceId,
		session_seq: SessionSeq,
		page_elapsed_ms: PageElapsedMs,
		session_elapsed_ms: SessionElapsedMs,
		occurred_at: OccurredAt,
		page_path: PagePath,
		page_title: PageTitle,
		referrer: EventStream === "replay" ? "" : Str(Event.referrer),
		screen: EventStream === "replay" ? "" : Str(Event.screen),
		language: EventStream === "replay" ? "" : Str(Event.language),
		timezone: EventStream === "replay" ? "" : Str(Event.timezone),
		user_agent: UserAgent,
		payload: FullPayload
	};
}

async function InsertRows(pSupabaseUrl, pServiceKey, pRows) {
	const Res = await SupabaseRequest(`${pSupabaseUrl}/rest/v1/ops_events?on_conflict=client_event_uid`, pServiceKey, {
		method: "POST",
		headers: { "content-type": "application/json", prefer: "resolution=ignore-duplicates,return=minimal" },
		body: JSON.stringify(pRows)
	});
	if (!Res.ok) throw new Error(Res.text || `Insert HTTP ${Res.status}`);
}

export async function OPTIONS() { return Json({ ok: true }); }

export async function POST({ request }) {
	try {
		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);

		const Body = await ReadBody(request);
		if (!Body) return Json({ ok: false, error: "Missing body" }, 400);
		const Inputs = Array.isArray(Body.events) ? Body.events : [Body];
		if (!Inputs.length || Inputs.length > cMaxEventsPerRequest) return Json({ ok: false, error: `events must contain 1-${cMaxEventsPerRequest} items` }, 400);
		const ActiveInputs = Inputs.filter((Item) => EventTypeOf(Item) !== "system.page_snapshot");
		if (!ActiveInputs.length) return Json({ ok: true, accepted: 0, ignored: true, reason: "legacy_snapshot_disabled" });
		const SyntheticReason = ActiveInputs.map((Item) => SyntheticTrafficReason(request, Item)).find(Boolean) || SyntheticTrafficReason(request, Body);
		if (SyntheticReason) return Json({ ok: true, stored: 0, ignored: true, blocked: true, reason: SyntheticReason });

		const Rows = ActiveInputs.map((Item) => NormalizeEvent(Item, request));
		for (const Row of Rows) {
			if (Row.event_source === "emolive" && !CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		}

		await InsertRows(SupabaseUrl, ServiceKey, Rows);
		return Json({ ok: true, accepted: Rows.length });
	} catch (Ex) {
		const Message = Ex instanceof Error ? Ex.message : String(Ex);
		const IsClientError = /Missing|Invalid|events must|too large|JSON/.test(Message);
		return Json({ ok: false, error: Message }, IsClientError ? 400 : 500);
	}
}
