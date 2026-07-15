export const prerender = false;
const cDefaultOpsKey = "Emocrete20015161";
const cMaxEventsPerChunk = 500;
const cMaxBodyChars = 2_000_000;
function Json(pBody, pStatus = 200) { return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue, pFallback = 0) { const Value = Number(pValue); return Number.isFinite(Value) ? Value : pFallback; }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key")); return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
function ValidReplayId(pValue) { return /^r_[a-z0-9]+_[a-z0-9]+$/i.test(Str(pValue)); }
async function ReadBody(pRequest) { try { const Text = await pRequest.text(); if (!Text || Text.length > cMaxBodyChars) return null; return JSON.parse(Text); } catch { return null; } }
async function SupabaseFetch(pPath, pOptions = {}) {
	const SupabaseUrl = Env("SUPABASE_URL"), ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) return { ok: false, status: 500, text: "Missing Supabase env vars" };
	const Res = await fetch(`${SupabaseUrl}${pPath}`, { ...pOptions, headers: { apikey: ServiceKey, authorization: `Bearer ${ServiceKey}`, ...(pOptions.headers || {}) } });
	return { ok: Res.ok, status: Res.status, text: await Res.text() };
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const Body = await ReadBody(request); if (!Body || typeof Body !== "object") return Json({ ok: false, error: "Invalid or oversized JSON body" }, 400);
		const SessionId = Str(Body.sessionId || Body.session_id); if (!ValidReplayId(SessionId)) return Json({ ok: false, error: "Invalid sessionId" }, 400);
		const Events = Array.isArray(Body.events) ? Body.events : []; if (!Events.length) return Json({ ok: true, skipped: true });
		if (Events.length > cMaxEventsPerChunk) return Json({ ok: false, error: "Too many events in one chunk" }, 413);
		const Row = { session_id: SessionId, visitor_id: Str(Body.visitorId || Body.visitor_id), visit_session_id: Str(Body.visitSessionId || Body.visit_session_id), page_id: Str(Body.pageId || Body.page_id),
			chunk_index: Math.max(0, Math.round(Num(Body.chunkIndex ?? Body.chunk_index))), from_ms: Math.max(0,Math.round(Num(Body.fromMs ?? Body.from_ms))), to_ms: Math.max(0,Math.round(Num(Body.toMs ?? Body.to_ms))),
			reason: Str(Body.reason).slice(0,100), events_count: Events.length, events_json: Events };
		const Res = await SupabaseFetch("/rest/v1/ops_events", { method: "POST", headers: { "content-type": "application/json", prefer: "return=representation" }, body: JSON.stringify({ event_type: "replay_chunk", visitor_id: Row.visitor_id, session_id: Row.visit_session_id, page_path: Str(Body.pagePath), page_title: Str(Body.pageTitle), referrer: "", screen: Str(Body.screen), language: Str(Body.language), timezone: Str(Body.timezone), user_agent: Str(request.headers.get("user-agent") || Body.userAgentClient), payload: { ...Row, replay_record_type: "chunk" } }) });
		if (!Res.ok) return Json({ ok: false, error: "Replay chunk write failed", details: Res.text, status: Res.status }, Res.status || 500);
		let Data = null; try { Data = JSON.parse(Res.text); } catch { Data = Res.text; }
		return Json({ ok: true, data: Data });
	} catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); }
}
export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const Url = new URL(request.url), SessionId = Str(Url.searchParams.get("session_id") || Url.searchParams.get("sessionId"));
		if (!ValidReplayId(SessionId)) return Json({ ok: false, error: "Invalid session_id" }, 400);
		const Query = new URL("http://x/rest/v1/ops_events"); Query.searchParams.set("select", "payload"); Query.searchParams.set("event_type", "eq.replay_chunk"); Query.searchParams.set("payload->>session_id", `eq.${SessionId}`); Query.searchParams.set("order", "created_at.asc"); Query.searchParams.set("limit", "2000");
		const Res = await SupabaseFetch(`${Query.pathname}${Query.search}`); if (!Res.ok) return Json({ ok: false, error: Res.text }, Res.status || 500);
		let Rows = []; try { Rows = JSON.parse(Res.text).map((Item) => Item.payload || {}); } catch {}
		return Json({ ok: true, chunks: Array.isArray(Rows) ? Rows : [] });
	} catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); }
}
