export const prerender = false;
const cDefaultOpsKey = "Emocrete20015161";
const cMaxSnapshotChars = 4_000_000;
const cMaxBodyChars = 4_500_000;
function Json(pBody, pStatus = 200) { return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue, pFallback = 0) { const Value = Number(pValue); return Number.isFinite(Value) ? Value : pFallback; }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key")); return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
function ValidId(pValue, pPrefix) { const Value = Str(pValue); return Value.startsWith(`${pPrefix}_`) && /^[a-z]_[a-z0-9]+_[a-z0-9]+$/i.test(Value); }
async function ReadBody(pRequest) { try { const Text = await pRequest.text(); if (!Text || Text.length > cMaxBodyChars) return null; return JSON.parse(Text); } catch { return null; } }
async function SupabaseFetch(pPath, pOptions = {}) {
	const SupabaseUrl = Env("SUPABASE_URL"), ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) return { ok: false, status: 500, text: "Missing Supabase env vars" };
	const Res = await fetch(`${SupabaseUrl}${pPath}`, { ...pOptions, headers: { apikey: ServiceKey, authorization: `Bearer ${ServiceKey}`, ...(pOptions.headers || {}) } });
	return { ok: Res.ok, status: Res.status, text: await Res.text() };
}
function BuildRow(pBody, pRequest) {
	const Viewport = pBody.viewport || {}, Doc = pBody.document || {};
	const Snapshot = typeof pBody.snapshotHtml === "string" ? pBody.snapshotHtml : "";
	return {
		id: Str(pBody.id || pBody.sessionId), visitor_id: Str(pBody.visitorId || pBody.visitor_id), visit_session_id: Str(pBody.visitSessionId || pBody.visit_session_id), page_id: Str(pBody.pageId || pBody.page_id),
		page_url: Str(pBody.pageUrl || pBody.page_url).slice(0, 3000), page_path: Str(pBody.pagePath || pBody.page_path).slice(0, 1000), page_title: Str(pBody.pageTitle || pBody.page_title).slice(0, 1000),
		started_at: Str(pBody.startedAt || pBody.started_at) || new Date().toISOString(), viewport_width: Math.round(Num(Viewport.width)), viewport_height: Math.round(Num(Viewport.height)),
		document_width: Math.round(Num(Doc.width)), document_height: Math.round(Num(Doc.height)), device_pixel_ratio: Num(Viewport.dpr, 1), screen: Str(pBody.screen).slice(0,100),
		language: Str(pBody.language).slice(0,50), timezone: Str(pBody.timezone).slice(0,100), user_agent: Str(pRequest.headers.get("user-agent") || pBody.userAgentClient).slice(0,1000),
		meta: { event: Str(pBody.event).slice(0,50), viewport: Viewport, document: Doc, snapshotLength: Snapshot.length, userAgentClient: Str(pBody.userAgentClient).slice(0,1000) },
		...(Snapshot ? { snapshot_html: Snapshot, snapshot_length: Snapshot.length, snapshot_saved_at: new Date().toISOString() } : {})
	};
}
function BuildOpsEvent(pBody, pRequest) {
	const Replay = BuildRow(pBody, pRequest);
	return {
		event_type: "replay_session",
		visitor_id: Replay.visitor_id,
		session_id: Replay.visit_session_id,
		page_path: Replay.page_path,
		page_title: Replay.page_title,
		user_agent: Replay.user_agent,
		payload: { ...Replay, replay_record_type: "session" }
	};
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const Body = await ReadBody(request); if (!Body || typeof Body !== "object") return Json({ ok: false, error: "Invalid or oversized JSON body" }, 400);
		const Row = BuildRow(Body, request);
		if (!ValidId(Row.id, "r") || !ValidId(Row.visitor_id, "v") || !ValidId(Row.visit_session_id, "s") || !Row.page_id) return Json({ ok: false, error: "Invalid replay identifiers" }, 400);
		if ((Row.snapshot_html || "").length > cMaxSnapshotChars) return Json({ ok: false, error: "Snapshot is too large" }, 413);
		const Res = await SupabaseFetch("/rest/v1/ops_events", { method: "POST", headers: { "content-type": "application/json", prefer: "return=representation" }, body: JSON.stringify(BuildOpsEvent(Body, request)) });
		if (!Res.ok) return Json({ ok: false, error: Res.text }, Res.status || 500);
		let Data = null; try { Data = JSON.parse(Res.text); } catch { Data = Res.text; }
		return Json({ ok: true, data: Data });
	} catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); }
}
export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const Url = new URL(request.url), Id = Str(Url.searchParams.get("id") || Url.searchParams.get("session_id")), VisitSessionId = Str(Url.searchParams.get("visit_session_id") || Url.searchParams.get("visitSessionId"));
		const Query = new URL("http://x/rest/v1/ops_events"); Query.searchParams.set("select", "payload"); Query.searchParams.set("event_type", "eq.replay_session");
		if (Id) { Query.searchParams.set("payload->>id", `eq.${Id}`); Query.searchParams.set("limit", "10"); }
		else if (VisitSessionId) { Query.searchParams.set("session_id", `eq.${VisitSessionId}`); Query.searchParams.set("order", "created_at.asc"); Query.searchParams.set("limit", "400"); }
		else { Query.searchParams.set("order", "created_at.desc"); Query.searchParams.set("limit", "50"); }
		const Res = await SupabaseFetch(`${Query.pathname}${Query.search}`); if (!Res.ok) return Json({ ok: false, error: Res.text }, Res.status || 500);
		let Rows = []; try { Rows = JSON.parse(Res.text).map((Item) => Item.payload || {}); } catch {}
		return Json(Id ? { ok: true, session: Rows?.[0] || null } : { ok: true, sessions: Array.isArray(Rows) ? Rows : [] });
	} catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); }
}
