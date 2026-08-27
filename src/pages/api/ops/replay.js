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
function ReplayOrigin() {
	const Value = Env("EMO_REPLAY_ORIGIN");
	if (!Value) return "";
	try {
		const Parsed = new URL(Value);
		if (!["http:", "https:"].includes(Parsed.protocol)) return "";
		return `${Parsed.protocol}//${Parsed.host}`;
	} catch { return ""; }
}
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
		userAgent: Str(pRow.user_agent || P.userAgentClient || P.userAgent),
		payload: P,
		eventData: P.eventData && typeof P.eventData === "object" ? P.eventData : {}
	};
}
async function SupabaseRequest(pUrl, pServiceKey, pOptions = {}) {
	const Res = await fetch(pUrl, { ...pOptions, headers: { apikey: pServiceKey, authorization: `Bearer ${pServiceKey}`, ...(pOptions.headers || {}) } });
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
function Config() {
	const SupabaseUrl = Env("SUPABASE_URL");
	const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) throw new Error("Missing Supabase env vars");
	return { SupabaseUrl, ServiceKey };
}
function ValidClientId(pValue, pPrefix) {
	const Value = Str(pValue);
	return !!Value && Value.startsWith(`${pPrefix}_`) && /^[a-z]_[a-z0-9]+_[a-z0-9]+$/i.test(Value);
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const { SupabaseUrl, ServiceKey } = Config();
		const Url = new URL(request.url);
		const SessionId = Str(Url.searchParams.get("sessionId"));
		const Client = Str(Url.searchParams.get("client")).toLowerCase();
		const ArchiveRead = !SessionId && Client === "desktop";
		if (!ArchiveRead && !ValidClientId(SessionId, "s")) return Json({ ok: false, error: "Invalid sessionId" }, 400);
		const AfterId = Math.max(0, Math.trunc(Number(Url.searchParams.get("afterId")) || 0));
		const Limit = Math.min(cMaxBatch, Math.max(1, Number.parseInt(Url.searchParams.get("limit") || String(cMaxBatch), 10) || cMaxBatch));
		const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		Query.searchParams.set("select", "id,client_event_uid,event_type,event_source,visitor_id,session_id,page_instance_id,session_seq,page_elapsed_ms,session_elapsed_ms,occurred_at,page_path,page_title,created_at,user_agent,payload");
		if (ArchiveRead) Query.searchParams.set("or", "(event_stream.eq.replay,event_stream.is.null)");
		else Query.searchParams.set("event_stream", "eq.replay");
		if (!ArchiveRead) Query.searchParams.set("session_id", `eq.${SessionId}`);
		if (AfterId > 0) Query.searchParams.set("id", `gt.${AfterId}`);
		Query.searchParams.set("order", "id.asc");
		Query.searchParams.set("limit", String(Limit + 1));
		let Rows = await FetchRows(Query, ServiceKey);
		const HasMore = Rows.length > Limit;
		if (HasMore) Rows = Rows.slice(0, Limit);
		const Events = Rows.map(MapEvent);
		return Json({
			ok: true,
			hasMore: HasMore,
			nextAfterId: Events.length ? Events[Events.length - 1].id : AfterId,
			replayOrigin: ReplayOrigin(),
			events: Events
		});
	} catch (Ex) {
		return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500);
	}
}
export async function DELETE({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const { SupabaseUrl, ServiceKey } = Config();
		const Body = await ReadJsonBody(request);
		const Ids = Array.from(new Set((Array.isArray(Body.ids) ? Body.ids : []).map((Value) => Math.trunc(Number(Value))).filter((Value) => Number.isSafeInteger(Value) && Value > 0)));
		const VisitorId = Str(Body.visitorId);
		const SessionId = Str(Body.sessionId);
		const ThroughId = Math.max(0, Math.trunc(Number(Body.throughId) || 0));
		if (Ids.length > cMaxBatch) return Json({ ok: false, error: `ids must contain at most ${cMaxBatch} items` }, 400);
		let Deleted = 0;
		if (Ids.length) {
			for (let Index = 0; Index < Ids.length; Index += cDeleteChunk) {
				const Chunk = Ids.slice(Index, Index + cDeleteChunk);
				const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
				Query.searchParams.set("id", `in.(${Chunk.join(",")})`);
				Query.searchParams.set("event_stream", "eq.replay");
				await SupabaseRequest(Query, ServiceKey, { method: "DELETE", headers: { prefer: "return=minimal" } });
			}
			Deleted = Ids.length;
		} else if (ValidClientId(SessionId, "s") || ValidClientId(VisitorId, "v")) {
			const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
			Query.searchParams.set("event_stream", "eq.replay");
			if (ValidClientId(SessionId, "s")) {
				Query.searchParams.set("session_id", `eq.${SessionId}`);
				if (ThroughId > 0) Query.searchParams.set("id", `lte.${ThroughId}`);
			} else Query.searchParams.set("visitor_id", `eq.${VisitorId}`);
			await SupabaseRequest(Query, ServiceKey, { method: "DELETE", headers: { prefer: "return=minimal" } });
		} else return Json({ ok: false, error: "Provide ids, sessionId, or visitorId" }, 400);
		return Json({ ok: true, deleted: Deleted });
	} catch (Ex) {
		const Message = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: Message }, /Invalid|Provide|ids must/.test(Message) ? 400 : 500);
	}
}
