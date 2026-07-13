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
	return pValue === true || ["true", "1", "yes", "on", "important"].includes(Str(pValue).toLowerCase());
}

function CheckOpsKey(pRequest) {
	const OpsKey = Env("OPS_API_KEY") || cDefaultOpsKey;
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return Given && Given === OpsKey;
}

function Payload(pRow) {
	if (pRow?.payload && typeof pRow.payload === "object") return pRow.payload;
	try { return JSON.parse(pRow?.payload || "{}"); }
	catch { return {}; }
}

function Pick(pObject, ...pNames) {
	for (const Name of pNames) {
		const Value = pObject?.[Name];
		if (Value !== undefined && Value !== null && Str(Value) !== "") return Value;
	}
	return "";
}

function MapEvent(pRow) {
	const P = Payload(pRow);
	return {
		id: Number(pRow.id || 0),
		clientEventUid: Str(Pick(P, "clientEventUid", "client_event_uid")),
		eventType: Str(pRow.event_type || Pick(P, "eventType", "event_type")),
		visitorId: Str(pRow.visitor_id || Pick(P, "visitorId", "visitor_id")),
		sessionId: Str(pRow.session_id || Pick(P, "sessionId", "session_id")),
		pagePath: Str(pRow.page_path || Pick(P, "pagePath", "page_path")),
		pageTitle: Str(pRow.page_title || Pick(P, "pageTitle", "page_title")),
		pageInstanceId: Str(Pick(P, "pageInstanceId", "page_instance_id")),
		createdAt: Str(pRow.created_at),
		createdAtClient: Str(Pick(P, "createdAtClient", "created_at_client")),
		label: Str(Pick(P, "label", "eventLabel", "event_label")),
		widget: Str(Pick(P, "widget")),
		locationBand: Str(Pick(P, "locationBand", "location_band")),
		locationLabel: Str(Pick(P, "locationLabel", "location_label")),
		locationBorderColor: Str(Pick(P, "locationBorderColor", "location_border_color")),
		locationCity: Str(Pick(P, "locationCity", "location_city")),
		locationCountryCode: Str(Pick(P, "locationCountryCode", "location_country_code")),
		durationMs: Pick(P, "durationMs", "duration_ms"),
		elapsedMs: Pick(P, "elapsedMs", "elapsed_ms"),
		awayReason: Str(Pick(P, "awayReason", "away_reason")),
		replayUrl: Str(Pick(P, "replayUrl", "replay_url")),
		clarityUrl: Str(Pick(P, "clarityUrl", "clarity_url", "clarityRecordingUrl", "clarity_recording_url")),
		clarityAvailableAfter: Str(Pick(P, "clarityAvailableAfter", "clarity_available_after")),
		clarityStatus: Str(Pick(P, "clarityStatus", "clarity_status")),
		videoUrl: Str(Pick(P, "videoUrl", "video_url")),
		controlCommand: Str(Pick(P, "controlCommand", "control_command", "opsCommand", "ops_command")),
		targetVisitorId: Str(Pick(P, "targetVisitorId", "target_visitor_id")),
		userAgent: Str(pRow.user_agent || Pick(P, "userAgentClient", "user_agent_client")),
		trafficKind: Str(Pick(P, "trafficKind", "traffic_kind")),
		syntheticReason: Str(Pick(P, "syntheticReason", "synthetic_reason", "botSignal", "bot_signal")),
		isSynthetic: Bool(Pick(P, "isSynthetic", "is_synthetic", "synthetic")),
		important: Bool(Pick(P, "important", "notifyMobile", "notify_mobile", "notify", "sound")),
		payload: P
	};
}

function MapPresence(pRow) {
	return {
		visitorId: Str(pRow.visitor_id),
		sessionId: Str(pRow.session_id),
		pageInstanceId: Str(pRow.page_instance_id),
		pagePath: Str(pRow.page_path),
		pageTitle: Str(pRow.page_title),
		focusState: Str(pRow.focus_state),
		awayReason: Str(pRow.away_reason),
		lastSeenAt: Str(pRow.last_seen_at),
		elapsedMs: Number(pRow.elapsed_ms || 0),
		scrollPercent: Number(pRow.scroll_percent || 0),
		locationBand: Str(pRow.location_band),
		locationLabel: Str(pRow.location_label),
		locationBorderColor: Str(pRow.location_border_color),
		locationCity: Str(pRow.location_city),
		locationCountryCode: Str(pRow.location_country_code),
		userAgent: Str(pRow.user_agent)
	};
}

async function FetchRows(pUrl, pServiceKey) {
	const Res = await fetch(pUrl, {
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`
		}
	});
	const Text = await Res.text();
	if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
	try { return JSON.parse(Text); }
	catch { return []; }
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);

		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);

		const Url = new URL(request.url);
		const AfterId = Math.max(0, Number.parseInt(Url.searchParams.get("after_id") || "0", 10) || 0);
		const Limit = Math.min(1500, Math.max(1, Number.parseInt(Url.searchParams.get("limit") || "50", 10) || 50));
		const Latest = ["1", "true", "yes"].includes(Str(Url.searchParams.get("latest")).toLowerCase());
		const IncludePresence = !["0", "false", "no"].includes(Str(Url.searchParams.get("include_presence")).toLowerCase());

		const EventQuery = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		// client_event_uid is intentionally read from payload. This keeps the endpoint
		// compatible with both the original table and the newer migrated table.
		EventQuery.searchParams.set("select", "id,event_type,visitor_id,session_id,page_path,page_title,created_at,user_agent,payload");
		if (!Latest) EventQuery.searchParams.set("id", `gt.${AfterId}`);
		EventQuery.searchParams.set("order", Latest ? "id.desc" : "id.asc");
		EventQuery.searchParams.set("limit", String(Latest ? Limit : Limit + 1));

		let Rows = await FetchRows(EventQuery, ServiceKey);
		const HasMore = !Latest && Array.isArray(Rows) && Rows.length > Limit;
		if (HasMore) Rows = Rows.slice(0, Limit);
		if (Latest && Array.isArray(Rows)) Rows = Rows.reverse();

		let Presence = [];
		if (IncludePresence) {
			const PresenceQuery = new URL(`${SupabaseUrl}/rest/v1/ops_presence`);
			PresenceQuery.searchParams.set("select", "page_instance_id,visitor_id,session_id,page_path,page_title,focus_state,away_reason,last_seen_at,elapsed_ms,scroll_percent,location_country_code,location_city,location_band,location_label,location_border_color,user_agent");
			PresenceQuery.searchParams.set("last_seen_at", `gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
			PresenceQuery.searchParams.set("order", "last_seen_at.desc");
			PresenceQuery.searchParams.set("limit", "1000");
			Presence = (await FetchRows(PresenceQuery, ServiceKey)).map(MapPresence);
		}

		const Events = Array.isArray(Rows) ? Rows.map(MapEvent) : [];
		const Cursor = Events.reduce((pMax, pEvent) => Math.max(pMax, Number(pEvent.id || 0)), AfterId);
		return Json({
			ok: true,
			latest: Latest,
			afterId: AfterId,
			cursor: Cursor,
			hasMore: HasMore,
			serverTime: new Date().toISOString(),
			events: Events,
			presence: Presence
		});
	} catch (Ex) {
		return Json({
			ok: false,
			error: "Function crashed",
			message: Ex instanceof Error ? Ex.message : String(Ex)
		}, 500);
	}
}
