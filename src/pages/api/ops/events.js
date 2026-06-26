export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";

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

function Str(pValue) {
	return String(pValue ?? "").trim();
}

function Bool(pValue) {
	if (pValue === true) return true;
	const Value = Str(pValue).toLowerCase();
	return Value === "true" || Value === "1" || Value === "yes" || Value === "on" || Value === "important";
}

const cSyntheticUserAgentPattern = /(bot|crawl|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb)/i;

function SyntheticReasonFromRow(pRow, pPayload) {
	const UserAgent = Str(Pick(pRow, "user_agent") || Pick(pPayload, "userAgent", "user_agent", "userAgentClient", "user_agent_client"));
	const BodySignal = Str(Pick(pPayload, "botSignal", "bot_signal"));
	const TrafficKind = Str(Pick(pPayload, "trafficKind", "traffic_kind")).toLowerCase();
	const StoredSynthetic = Bool(Pick(pPayload, "isSynthetic", "is_synthetic", "synthetic"));
	const Reasons = [];

	if (!UserAgent) Reasons.push("empty_ua");
	if (cSyntheticUserAgentPattern.test(UserAgent)) Reasons.push("ua_bot");
	if (BodySignal) Reasons.push(`client_${BodySignal}`);
	if (TrafficKind === "bot" || TrafficKind === "crawler" || TrafficKind === "synthetic") Reasons.push(`kind_${TrafficKind}`);
	if (StoredSynthetic) Reasons.push("stored_synthetic");

	return Reasons.join(",");
}

function PayloadOf(pRow) {
	if (!pRow || pRow.payload === null || pRow.payload === undefined) return {};
	if (typeof pRow.payload === "object") return pRow.payload;
	if (typeof pRow.payload === "string" && pRow.payload.trim()) {
		try {
			return JSON.parse(pRow.payload);
		} catch {
			return {};
		}
	}
	return {};
}

function Pick(pObj, ...pNames) {
	for (const Name of pNames) {
		if (pObj && pObj[Name] !== undefined && pObj[Name] !== null && pObj[Name] !== "") return pObj[Name];
	}
	return "";
}

function MapEvent(pRow) {
	const Payload = PayloadOf(pRow);
	const EventType = Str(Pick(pRow, "event_type") || Pick(Payload, "eventType", "event_type", "type", "event"));
	const VisitorId = Str(Pick(pRow, "visitor_id") || Pick(Payload, "visitorId", "visitor_id"));
	const SessionId = Str(Pick(pRow, "session_id") || Pick(Payload, "sessionId", "session_id"));
	const PagePath = Str(Pick(pRow, "page_path") || Pick(Payload, "pagePath", "page_path"));
	const PageTitle = Str(Pick(pRow, "page_title") || Pick(Payload, "pageTitle", "page_title"));
	const PageInstanceId = Str(Pick(pRow, "page_instance_id") || Pick(Payload, "pageInstanceId", "page_instance_id"));

	const DurationMs = Pick(Payload, "durationMs", "duration_ms");
	const AwayReason = Str(Pick(Payload, "awayReason", "away_reason"));
	const VideoUrl = Str(Pick(Payload, "videoUrl", "video_url", "sessionVideoUrl", "session_video_url", "sessionRecordingUrl", "session_recording_url", "recordingUrl", "recording_url", "recordUrl", "record_url", "replayUrl", "replay_url", "clarityUrl", "clarity_url"));
	const LocationCountryCode = Str(Pick(Payload, "locationCountryCode", "location_country_code"));
	const LocationRegion = Str(Pick(Payload, "locationRegion", "location_region"));
	const LocationCity = Str(Pick(Payload, "locationCity", "location_city"));
	const LocationBand = Str(Pick(Payload, "locationBand", "location_band"));
	const LocationLabel = Str(Pick(Payload, "locationLabel", "location_label"));
	const LocationBorderColor = Str(Pick(Payload, "locationBorderColor", "location_border_color"));
	const UserAgent = Str(Pick(pRow, "user_agent") || Pick(Payload, "userAgent", "user_agent", "userAgentClient", "user_agent_client"));
	const SyntheticReason = SyntheticReasonFromRow(pRow, Payload);
	const IsSynthetic = SyntheticReason !== "";
	const TrafficKind = IsSynthetic ? "synthetic" : Str(Pick(Payload, "trafficKind", "traffic_kind") || "human");

	return {
		...pRow,
		event_type: EventType,
		eventType: EventType,
		visitor_id: VisitorId,
		visitorId: VisitorId,
		session_id: SessionId,
		sessionId: SessionId,
		page_instance_id: PageInstanceId,
		pageInstanceId: PageInstanceId,
		page_path: PagePath,
		pagePath: PagePath,
		page_title: PageTitle,
		pageTitle: PageTitle,
		page_title_short: Str(Pick(Payload, "pageTitleShort", "page_title_short")),
		event_on: Str(Pick(Payload, "eventOn", "event_on")),
		eventOn: Str(Pick(Payload, "eventOn", "event_on")),
		widget: Str(Pick(Payload, "widget")),
		label: Str(Pick(Payload, "label")),
		value: Pick(Payload, "value"),
		elapsed_ms: Pick(Payload, "elapsedMs", "elapsed_ms"),
		elapsedMs: Pick(Payload, "elapsedMs", "elapsed_ms"),
		elapsed_sec: Pick(Payload, "elapsedSec", "elapsed_sec"),
		elapsedSec: Pick(Payload, "elapsedSec", "elapsed_sec"),
		href: Str(Pick(Payload, "href")),
		duration_ms: DurationMs,
		durationMs: DurationMs,
		away_reason: AwayReason,
		awayReason: AwayReason,
		video_url: VideoUrl,
		videoUrl: VideoUrl,
		location_country_code: LocationCountryCode,
		locationCountryCode: LocationCountryCode,
		location_region: LocationRegion,
		locationRegion: LocationRegion,
		location_city: LocationCity,
		locationCity: LocationCity,
		location_band: LocationBand,
		locationBand: LocationBand,
		location_label: LocationLabel,
		locationLabel: LocationLabel,
		location_border_color: LocationBorderColor,
		locationBorderColor: LocationBorderColor,
		user_agent: UserAgent,
		userAgent: UserAgent,
		is_synthetic: IsSynthetic,
		isSynthetic: IsSynthetic,
		traffic_kind: TrafficKind,
		trafficKind: TrafficKind,
		synthetic_reason: SyntheticReason,
		syntheticReason: SyntheticReason,
		important: Bool(Pick(Payload, "important")),
		notify_mobile: Bool(Pick(Payload, "notifyMobile", "notify_mobile", "notify")),
		notifyMobile: Bool(Pick(Payload, "notifyMobile", "notify_mobile", "notify")),
		sound: Bool(Pick(Payload, "sound")),
		client_event_seq: Pick(Payload, "clientEventSeq", "client_event_seq"),
		clientEventSeq: Pick(Payload, "clientEventSeq", "client_event_seq"),
		created_at_client: Str(Pick(Payload, "createdAtClient", "created_at_client")),
		createdAtClient: Str(Pick(Payload, "createdAtClient", "created_at_client")),
		payload: Payload
	};
}

function CheckOpsKey(pRequest) {
	const OpsKey = Env("OPS_API_KEY") || cDefaultOpsKey;
	const GivenKey = String(pRequest.headers.get("x-ops-key") ?? "").trim();
	return GivenKey && GivenKey === OpsKey;
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);

		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");

		if (!SupabaseUrl || !ServiceKey) {
			return Json({
				ok: false,
				error: "Missing Supabase env vars",
				hasSupabaseUrl: !!SupabaseUrl,
				hasServiceKey: !!ServiceKey
			}, 500);
		}

		const ReqUrl = new URL(request.url);
		const AfterId = Math.max(0, Number.parseInt(ReqUrl.searchParams.get("after_id") ?? ReqUrl.searchParams.get("afterId") ?? "0", 10) || 0);
		const Limit = Math.min(200, Math.max(1, Number.parseInt(ReqUrl.searchParams.get("limit") ?? "50", 10) || 50));

		const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		Query.searchParams.set("select", "*");
		Query.searchParams.set("id", `gt.${AfterId}`);
		Query.searchParams.set("order", "id.asc");
		Query.searchParams.set("limit", String(Limit));

		const Res = await fetch(Query, {
			headers: {
				"apikey": ServiceKey,
				"authorization": `Bearer ${ServiceKey}`
			}
		});

		const Text = await Res.text();
		if (!Res.ok) return Json({ ok: false, error: Text }, 500);

		let Rows = [];
		try {
			Rows = JSON.parse(Text);
		} catch {
			Rows = [];
		}

		const Events = Array.isArray(Rows) ? Rows.map(MapEvent) : [];
		return Json({ ok: true, events: Events });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
