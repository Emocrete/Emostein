export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";
const cMaxBatch = 5000;
const cDeleteChunk = 200;

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue) { const Value = Number(pValue); return Number.isFinite(Value) ? Value : 0; }
function Bool(pValue) { return pValue === true || ["true", "1", "yes", "on", "important"].includes(Str(pValue).toLowerCase()); }
function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return !!Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey);
}
function Payload(pRow) {
	if (pRow?.payload && typeof pRow.payload === "object") return pRow.payload;
	try { return JSON.parse(pRow?.payload || "{}"); }
	catch { return {}; }
}
function MapEvent(pRow) {
	const P = Payload(pRow);
	return {
		id: Num(pRow.id),
		clientEventUid: Str(pRow.client_event_uid || P.clientEventUid),
		eventType: Str(pRow.event_type || P.eventType),
		eventSource: Str(pRow.event_source || P.eventSource || "site"),
		visitorId: Str(pRow.visitor_id || P.visitorId),
		sessionId: Str(pRow.session_id || P.sessionId),
		pageInstanceId: Str(pRow.page_instance_id || P.pageInstanceId),
		sessionSeq: Num(pRow.session_seq || P.sessionSeq),
		pageElapsedMs: Num(pRow.page_elapsed_ms || P.pageElapsedMs || P.elapsedMs),
		sessionElapsedMs: Num(pRow.session_elapsed_ms || P.sessionElapsedMs),
		occurredAt: Str(pRow.occurred_at || P.createdAtClient),
		createdAt: Str(pRow.created_at),
		pagePath: Str(pRow.page_path || P.pagePath),
		pageTitle: Str(pRow.page_title || P.pageTitle),
		focusState: Str(P.focusState),
		label: Str(P.label || P.eventLabel),
		widget: Str(P.widget),
		locationBand: Str(P.locationBand),
		locationLabel: Str(P.locationLabel),
		locationBorderColor: Str(P.locationBorderColor),
		locationCity: Str(P.locationCity),
		locationCountryCode: Str(P.locationCountryCode),
		durationMs: Num(P.durationMs),
		elapsedMs: Num(P.elapsedMs || pRow.page_elapsed_ms),
		awayReason: Str(P.awayReason),
		clarityUrl: Str(P.clarityUrl || P.clarityRecordingUrl),
		clarityAvailableAfter: Str(P.clarityAvailableAfter),
		clarityStatus: Str(P.clarityStatus),
		userAgent: Str(pRow.user_agent || P.userAgentClient),
		important: Bool(P.important || P.notifyMobile || P.notify || P.sound),
		eventData: P.eventData && typeof P.eventData === "object" ? P.eventData : {},
		payload: P
	};
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
	if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
	return Text;
}

async function FetchRows(pUrl, pServiceKey) {
	const Text = await SupabaseRequest(pUrl, pServiceKey);
	try { const Rows = JSON.parse(Text); return Array.isArray(Rows) ? Rows : []; }
	catch { return []; }
}

async function ReadJsonBody(pRequest) {
	const Text = await pRequest.text();
	if (!Text) return {};
	try { return JSON.parse(Text); }
	catch { throw new Error("Invalid JSON body"); }
}

function GetConfig() {
	const SupabaseUrl = Env("SUPABASE_URL");
	const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) throw new Error("Missing Supabase env vars");
	return { SupabaseUrl, ServiceKey };
}

export async function OPTIONS() { return Json({ ok: true }); }

export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const { SupabaseUrl, ServiceKey } = GetConfig();
		const Url = new URL(request.url);
		const Limit = Math.min(cMaxBatch, Math.max(1, Number.parseInt(Url.searchParams.get("limit") || String(cMaxBatch), 10) || cMaxBatch));
		const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		Query.searchParams.set("select", "id,client_event_uid,event_type,event_source,visitor_id,session_id,page_instance_id,session_seq,page_elapsed_ms,session_elapsed_ms,occurred_at,page_path,page_title,created_at,user_agent,payload");
		Query.searchParams.set("event_type", "neq.system.clarity_session_index");
		Query.searchParams.set("order", "id.asc");
		Query.searchParams.set("limit", String(Limit + 1));
		let Rows = await FetchRows(Query, ServiceKey);
		const HasMore = Rows.length > Limit;
		if (HasMore) Rows = Rows.slice(0, Limit);
		return Json({ ok: true, hasMore: HasMore, serverTime: new Date().toISOString(), events: Rows.map(MapEvent) });
	} catch (Ex) {
		return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500);
	}
}

export async function DELETE({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const { SupabaseUrl, ServiceKey } = GetConfig();
		const Body = await ReadJsonBody(request);
		const Ids = Array.from(new Set((Array.isArray(Body.ids) ? Body.ids : [])
			.map((Value) => Math.trunc(Number(Value)))
			.filter((Value) => Number.isSafeInteger(Value) && Value > 0)));
		if (!Ids.length) return Json({ ok: true, deleted: 0 });
		if (Ids.length > cMaxBatch) return Json({ ok: false, error: `ids must contain at most ${cMaxBatch} items` }, 400);

		for (let Index = 0; Index < Ids.length; Index += cDeleteChunk) {
			const Chunk = Ids.slice(Index, Index + cDeleteChunk);
			const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
			Query.searchParams.set("id", `in.(${Chunk.join(",")})`);
			await SupabaseRequest(Query, ServiceKey, { method: "DELETE", headers: { prefer: "return=minimal" } });
		}
		return Json({ ok: true, deleted: Ids.length });
	} catch (Ex) {
		const Message = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: Message }, /Invalid|ids must/.test(Message) ? 400 : 500);
	}
}
