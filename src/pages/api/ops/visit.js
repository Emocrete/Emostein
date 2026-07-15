export const prerender = false;

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}

function Env(pName) {
	const Value = process.env[pName];
	return typeof Value === "string" ? Value.trim() : "";
}

function Str(pValue) { return String(pValue ?? "").trim(); }
function Bool(pValue) {
	if (pValue === true) return true;
	return ["true", "1", "yes", "on", "important"].includes(Str(pValue).toLowerCase());
}

const cSyntheticUserAgentPattern = /(bot|crawl|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb)/i;
const cArabCountryCodes = new Set(["EG", "SA", "AE", "KW", "QA", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "PS", "MA", "DZ", "TN", "LY", "SD", "SO", "DJ", "KM", "MR"]);

function SyntheticTrafficReason(pRequest, pBody = {}) {
	const UserAgent = Str(pRequest.headers.get("user-agent"));
	const Purpose = Str(pRequest.headers.get("purpose") || pRequest.headers.get("sec-purpose") || pRequest.headers.get("x-purpose")).toLowerCase();
	const BodySignal = Str(pBody.botSignal ?? pBody.bot_signal);
	const TrafficKind = Str(pBody.trafficKind ?? pBody.traffic_kind).toLowerCase();
	const Reasons = [];
	if (cSyntheticUserAgentPattern.test(UserAgent)) Reasons.push("ua_bot");
	if (Purpose.includes("prefetch") || Purpose.includes("preview")) Reasons.push("prefetch");
	if (Bool(pBody.synthetic)) Reasons.push("client_synthetic");
	if (BodySignal) Reasons.push(`client_${BodySignal}`);
	if (["bot", "crawler", "synthetic"].includes(TrafficKind)) Reasons.push(`kind_${TrafficKind}`);
	return Reasons.join(",");
}

function Header(pRequest, ...pNames) {
	for (const Name of pNames) {
		const Value = Str(pRequest.headers.get(Name));
		if (Value) return Value;
	}
	return "";
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
	if (CountryCode === "EG") {
		if (HasGeoWord(All, ["c", "cai", "cairo", "al qahirah", "القاهرة", "القاهره", "محافظة القاهرة", "qahira"])) return { band: "cairo", label: City || Region || "Cairo", borderColor: "#00C853" };
		if (HasGeoWord(All, ["gz", "giza", "al jizah", "jizah", "6th of october", "october", "sheikh zayed", "الجيزة", "الجيزه", "اكتوبر", "السادس من اكتوبر", "الشيخ زايد"])) return { band: "giza", label: City || Region || "Giza", borderColor: "#00D5FF" };
		return { band: "egypt", label: City || Region || "Egypt", borderColor: "#FFD740" };
	}
	if (cArabCountryCodes.has(CountryCode)) return { band: "arab", label: City || CountryCode || "Arab country", borderColor: "#FF8A00" };
	return { band: "world", label: City || CountryCode || "Outside Arab region", borderColor: "#FF3B30" };
}

function BuildGeo(pRequest, pBody = {}) {
	let CountryCode = Header(pRequest, "x-vercel-ip-country", "cf-ipcountry", "x-country-code").toUpperCase();
	const Region = Header(pRequest, "x-vercel-ip-country-region", "x-vercel-ip-region", "x-region", "x-country-region");
	const City = Header(pRequest, "x-vercel-ip-city", "x-city");
	if (!CountryCode && Str(pBody.timezone ?? pBody.timeZone).toLowerCase() === "africa/cairo") CountryCode = "EG";
	const Classified = ClassifyGeo(CountryCode, Region, City);
	return { countryCode: CountryCode, region: DecodeHeaderText(Region), city: DecodeHeaderText(City), ...Classified };
}

function IsValidClientId(pValue, pPrefix) {
	const Value = Str(pValue);
	return !!Value && Value.startsWith(pPrefix) && /^[a-z]_[a-z0-9]+_[a-z0-9]+$/i.test(Value);
}

function NormalizeEventType(pBody) {
	return Str(pBody.eventType ?? pBody.event_type ?? pBody.type ?? pBody.event) || "page_open";
}

function IsPresenceOnly(pType) {
	return [
		"page_ping", "page_focus_away", "page_focus_return", "focus_away", "focus_return",
		"page_blur", "visibility_hidden", "visibility_visible"
	].includes(Str(pType).toLowerCase());
}

async function ReadBody(pRequest) {
	try {
		const Text = await pRequest.text();
		if (!Text || Text.length > 512000) return null;
		return JSON.parse(Text);
	} catch { return null; }
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

async function UpsertPresence(pSupabaseUrl, pServiceKey, pData) {
	const Row = {
		page_instance_id: pData.pageInstanceId,
		visitor_id: pData.visitorId,
		session_id: pData.sessionId,
		page_path: pData.pagePath,
		page_title: pData.pageTitle,
		focus_state: pData.focusState,
		away_reason: pData.awayReason,
		last_seen_at: new Date().toISOString(),
		elapsed_ms: pData.elapsedMs,
		scroll_percent: pData.scrollPercent,
		location_country_code: pData.locationCountryCode,
		location_region: pData.locationRegion,
		location_city: pData.locationCity,
		location_band: pData.locationBand,
		location_label: pData.locationLabel,
		location_border_color: pData.locationBorderColor,
		user_agent: pData.userAgentClient,
		meta: {
			eventType: pData.eventType,
			createdAtClient: pData.createdAtClient,
			viewport: pData.viewport,
			screen: pData.screen
		}
	};
	return SupabaseRequest(`${pSupabaseUrl}/rest/v1/ops_presence?on_conflict=page_instance_id`, pServiceKey, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"prefer": "resolution=merge-duplicates,return=minimal"
		},
		body: JSON.stringify(Row)
	});
}

async function HasDuplicateEvent(pSupabaseUrl, pServiceKey, pClientEventUid) {
	const Uid = Str(pClientEventUid);
	if (!Uid) return false;
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("select", "id");
	Query.searchParams.set("payload->>clientEventUid", `eq.${Uid}`);
	Query.searchParams.set("limit", "1");
	const Res = await SupabaseRequest(Query, pServiceKey);
	if (!Res.ok) return false;
	try {
		const Rows = JSON.parse(Res.text);
		return Array.isArray(Rows) && Rows.length > 0;
	} catch { return false; }
}

async function HasStoredPageOpen(pSupabaseUrl, pServiceKey, pPageInstanceId) {
	const PageInstanceId = Str(pPageInstanceId);
	if (!PageInstanceId) return true;
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("select", "id,event_type,payload");
	Query.searchParams.set("payload->>pageInstanceId", `eq.${PageInstanceId}`);
	Query.searchParams.set("limit", "20");
	const Res = await SupabaseRequest(Query, pServiceKey);
	if (!Res.ok) return true;
	try {
		const Rows = JSON.parse(Res.text);
		return Array.isArray(Rows) && Rows.some((Row) => {
			const Payload = Row && typeof Row.payload === "object" ? Row.payload : {};
			const Type = Str(Row?.event_type || Payload.eventType || Payload.event_type).toLowerCase();
			return Type === "page_open" || Type === "page_view" || Type === "page_load";
		});
	} catch { return true; }
}

async function IsRepeatedSyntheticVisit(pSupabaseUrl, pServiceKey, pData) {
	if (Str(pData.eventType).toLowerCase() !== "page_open") return false;
	const Fingerprint = Str(pData.clientFingerprint);
	if (!Fingerprint) return false;
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("select", "visitor_id,created_at");
	Query.searchParams.set("event_type", "eq.page_open");
	Query.searchParams.set("page_path", `eq.${pData.pagePath}`);
	Query.searchParams.set("payload->>clientFingerprint", `eq.${Fingerprint}`);
	Query.searchParams.set("created_at", `gte.${new Date(Date.now() - 15 * 60 * 1000).toISOString()}`);
	Query.searchParams.set("order", "created_at.desc");
	Query.searchParams.set("limit", "3");
	const Res = await SupabaseRequest(Query, pServiceKey);
	if (!Res.ok) return false;
	try {
		const Rows = JSON.parse(Res.text);
		return Array.isArray(Rows) && Rows.some((Row) => Str(Row?.visitor_id) && Str(Row.visitor_id) !== pData.visitorId);
	} catch { return false; }
}

async function LatestResetAt(pSupabaseUrl, pServiceKey) {
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("select", "created_at");
	Query.searchParams.set("event_type", "eq.ops_clear_all");
	Query.searchParams.set("order", "created_at.desc");
	Query.searchParams.set("limit", "1");
	const Res = await SupabaseRequest(Query, pServiceKey);
	if (!Res.ok) return 0;
	try { return Date.parse(JSON.parse(Res.text)?.[0]?.created_at || "") || 0; }
	catch { return 0; }
}

async function FetchJsonRows(pSupabaseUrl, pServiceKey, pQuery) {
	const Res = await SupabaseRequest(pQuery, pServiceKey);
	if (!Res.ok) return [];
	try { const Rows = JSON.parse(Res.text); return Array.isArray(Rows) ? Rows : []; }
	catch { return []; }
}

async function IsBlockedProfile(pSupabaseUrl, pServiceKey, pProfile) {
	if (!pProfile) return false;
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("select", "id");
	Query.searchParams.set("event_type", "eq.ops_synthetic_profile");
	Query.searchParams.set("payload->>clientProfile", `eq.${pProfile}`);
	Query.searchParams.set("limit", "1");
	return (await FetchJsonRows(pSupabaseUrl, pServiceKey, Query)).length > 0;
}

async function FindRepeatedProfileVisitors(pSupabaseUrl, pServiceKey, pData) {
	if (Str(pData.eventType).toLowerCase() !== "page_open" || !Str(pData.clientProfile)) return [];
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("select", "visitor_id");
	Query.searchParams.set("event_type", "eq.page_open");
	Query.searchParams.set("payload->>clientProfile", `eq.${pData.clientProfile}`);
	Query.searchParams.set("created_at", `gte.${new Date(Date.now() - 45 * 60 * 1000).toISOString()}`);
	Query.searchParams.set("order", "created_at.desc");
	Query.searchParams.set("limit", "20");
	const Values = new Set((await FetchJsonRows(pSupabaseUrl, pServiceKey, Query)).map((Row) => Str(Row?.visitor_id)).filter(Boolean));
	Values.delete(pData.visitorId);
	return Array.from(Values);
}

async function DeleteVisitorsAndBlockProfile(pSupabaseUrl, pServiceKey, pVisitorIds, pData) {
	const Visitors = Array.from(new Set([...(pVisitorIds || []), pData.visitorId].map(Str).filter(Boolean)));
	for (const VisitorId of Visitors) {
		for (const Table of ["ops_presence", "ops_events"]) {
			const Url = new URL(`${pSupabaseUrl}/rest/v1/${Table}`);
			Url.searchParams.set("visitor_id", `eq.${VisitorId}`);
			await SupabaseRequest(Url, pServiceKey, { method: "DELETE", headers: { prefer: "return=minimal" } });
		}
	}
	await SupabaseRequest(`${pSupabaseUrl}/rest/v1/ops_events`, pServiceKey, {
		method: "POST",
		headers: { "content-type": "application/json", prefer: "return=minimal" },
		body: JSON.stringify({
			event_type: "ops_synthetic_profile", visitor_id: "system_synthetic", session_id: `synthetic_${Date.now()}`,
			page_path: pData.pagePath, page_title: pData.pageTitle, user_agent: pData.userAgentClient,
			payload: { clientProfile: pData.clientProfile, blockedVisitorIds: Visitors, blockedAt: new Date().toISOString(), trafficKind: "synthetic", syntheticReason: "repeated_ephemeral_profile" }
		})
	});
}

async function RecoverPageOpenFromPing(pSupabaseUrl, pServiceKey, pData) {
	if (Str(pData.eventType).toLowerCase() !== "page_ping") return null;
	if (await HasStoredPageOpen(pSupabaseUrl, pServiceKey, pData.pageInstanceId)) return null;
	const RecoveryData = {
		...pData,
		eventType: "page_open",
		eventOn: "recovered_from_live_ping",
		clientEventUid: `${pData.pageInstanceId}:page_open:recovered`,
		label: pData.pageTitle || pData.pagePath,
		important: true,
		notifyMobile: true,
		sound: true,
		focusState: "visible"
	};
	return InsertEvent(pSupabaseUrl, pServiceKey, RecoveryData);
}

async function InsertEvent(pSupabaseUrl, pServiceKey, pData) {
	if (await HasDuplicateEvent(pSupabaseUrl, pServiceKey, pData.clientEventUid)) {
		return { ok: true, status: 200, text: "[]", duplicate: true };
	}

	// Do not require a client_event_uid database column. The UID remains inside
	// payload, so this works against both the original and migrated ops_events table.
	const Row = {
		event_type: pData.eventType,
		visitor_id: pData.visitorId,
		session_id: pData.sessionId,
		page_path: pData.pagePath,
		page_title: pData.pageTitle,
		referrer: pData.referrer,
		screen: pData.screen,
		language: pData.language,
		timezone: pData.timezone,
		user_agent: pData.userAgentClient,
		payload: pData
	};
	return SupabaseRequest(`${pSupabaseUrl}/rest/v1/ops_events`, pServiceKey, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"prefer": "return=representation"
		},
		body: JSON.stringify(Row)
	});
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);

		const Body = await ReadBody(request);
		if (!Body || typeof Body !== "object") return Json({ ok: false, error: "Invalid JSON body" }, 400);

		const EventType = NormalizeEventType(Body);
		const VisitorId = Str(Body.visitorId ?? Body.visitor_id);
		const SessionId = Str(Body.sessionId ?? Body.session_id);
		const PageInstanceId = Str(Body.pageInstanceId ?? Body.page_instance_id);
		const PagePath = Str(Body.pagePath ?? Body.page_path);
		const ClientEventUid = Str(Body.clientEventUid ?? Body.client_event_uid ?? Body.eventUid ?? Body.event_uid)
			|| `${PageInstanceId}:${EventType}:${Str(Body.clientEventSeq ?? Body.client_event_seq)}`;

		if (!IsValidClientId(VisitorId, "v_") || !IsValidClientId(SessionId, "s_") || !IsValidClientId(PageInstanceId, "p_") || !PagePath || !ClientEventUid) {
			return Json({ ok: true, skipped: true, reason: "invalid_client_tracking_ids" });
		}

		const SyntheticReason = SyntheticTrafficReason(request, Body);
		if (SyntheticReason) return Json({ ok: true, skipped: true, reason: "synthetic_traffic", syntheticReason: SyntheticReason });

		const Geo = BuildGeo(request, Body);
		const ReplayUrl = Str(Body.replayUrl ?? Body.replay_url);
		const ClarityUrl = Str(Body.clarityRecordingUrl ?? Body.clarity_recording_url ?? Body.clarityUrl ?? Body.clarity_url);
		const Data = {
			...Body,
			eventType: EventType,
			visitorId: VisitorId,
			sessionId: SessionId,
			pageInstanceId: PageInstanceId,
			pagePath: PagePath,
			pageTitle: Str(Body.pageTitle ?? Body.page_title),
			clientEventUid: ClientEventUid,
			createdAtClient: Str(Body.createdAtClient ?? Body.created_at_client) || new Date().toISOString(),
			focusState: Str(Body.focusState ?? Body.focus_state) || (EventType === "page_exit" ? "closed" : "visible"),
			awayReason: Str(Body.awayReason ?? Body.away_reason),
			elapsedMs: Math.max(0, Math.round(Number(Body.elapsedMs ?? Body.elapsed_ms) || 0)),
			scrollPercent: Math.max(0, Math.min(100, Math.round(Number(Body.scrollPercent ?? Body.scroll_percent) || 0))),
			locationCountryCode: Geo.countryCode,
			locationRegion: Geo.region,
			locationCity: Geo.city,
			locationBand: Geo.band,
			locationLabel: Geo.label,
			locationBorderColor: Geo.borderColor,
			userAgentClient: Str(request.headers.get("user-agent") || Body.userAgentClient),
			replayUrl: ReplayUrl,
			clarityUrl: ClarityUrl,
			videoUrl: ReplayUrl || ClarityUrl || Str(Body.videoUrl ?? Body.video_url),
			important: Bool(Body.important),
			notifyMobile: Bool(Body.notifyMobile ?? Body.notify_mobile ?? Body.notify),
			sound: Bool(Body.sound),
			trafficKind: "human",
			botSignal: ""
		};
		const ResetAt = await LatestResetAt(SupabaseUrl, ServiceKey);
		const PageStartedAt = Date.parse(Str(Body.pageStartedAt ?? Body.page_started_at)) || 0;
		if (ResetAt > 0 && PageStartedAt > 0 && PageStartedAt < ResetAt) {
			return Json({ ok: true, skipped: true, reason: "page_started_before_full_reset" });
		}
		if (await IsBlockedProfile(SupabaseUrl, ServiceKey, Str(Data.clientProfile))) {
			return Json({ ok: true, skipped: true, reason: "blocked_synthetic_profile" });
		}
		const RepeatedVisitors = await FindRepeatedProfileVisitors(SupabaseUrl, ServiceKey, Data);
		if (RepeatedVisitors.length) {
			await DeleteVisitorsAndBlockProfile(SupabaseUrl, ServiceKey, RepeatedVisitors, Data);
			return Json({ ok: true, skipped: true, reason: "repeated_ephemeral_profile_removed" });
		}

		if (await IsRepeatedSyntheticVisit(SupabaseUrl, ServiceKey, Data)) {
			return Json({ ok: true, skipped: true, reason: "repeated_ephemeral_browser" });
		}

		const PresenceRes = await UpsertPresence(SupabaseUrl, ServiceKey, Data);
		if (!PresenceRes.ok) {
			return Json({
				ok: false,
				error: "Presence write failed",
				details: PresenceRes.text || `HTTP ${PresenceRes.status}`
			}, PresenceRes.status || 500);
		}

		if (IsPresenceOnly(EventType)) {
			const Recovery = await RecoverPageOpenFromPing(SupabaseUrl, ServiceKey, Data);
			if (Recovery && !Recovery.ok) {
				return Json({
					ok: false,
					presence: true,
					eventStored: false,
					error: "Recovered page_open write failed",
					details: Recovery.text || `HTTP ${Recovery.status}`
				}, Recovery.status || 500);
			}
			return Json({
				ok: true,
				presence: true,
				eventStored: !!Recovery,
				recoveredPageOpen: !!Recovery
			});
		}

		const EventRes = await InsertEvent(SupabaseUrl, ServiceKey, Data);
		if (!EventRes.ok) {
			return Json({
				ok: false,
				presence: true,
				eventStored: false,
				error: "Event write failed",
				details: EventRes.text || `HTTP ${EventRes.status}`
			}, EventRes.status || 500);
		}

		let Rows = [];
		try { Rows = JSON.parse(EventRes.text); }
		catch {}
		return Json({
			ok: true,
			presence: true,
			eventStored: true,
			duplicate: EventRes.duplicate === true || !Array.isArray(Rows) || Rows.length === 0,
			data: Rows
		});
	} catch (Ex) {
		return Json({
			ok: false,
			error: "Function crashed",
			message: Ex instanceof Error ? Ex.message : String(Ex)
		}, 500);
	}
}
