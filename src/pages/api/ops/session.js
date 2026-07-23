export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";
function Json(pBody, pStatus = 200) { return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key")); return !!Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
async function ReadBody(pRequest) { try { return await pRequest.json(); } catch { return {}; } }
async function Handle(pRequest) {
	if (!CheckOpsKey(pRequest)) return Json({ ok: false, error: "Unauthorized" }, 401);
	const SupabaseUrl = Env("SUPABASE_URL"); const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);
	const RequestUrl = new URL(pRequest.url); const Body = await ReadBody(pRequest);
	const VisitorId = Str(Body.visitorId ?? Body.visitor_id ?? RequestUrl.searchParams.get("visitor_id") ?? RequestUrl.searchParams.get("visitorId"));
	const SessionId = Str(Body.sessionId ?? Body.session_id ?? RequestUrl.searchParams.get("session_id") ?? RequestUrl.searchParams.get("sessionId"));
	if (!SessionId) return Json({ ok: false, error: "Missing sessionId" }, 400);
	const Url = new URL(`${SupabaseUrl}/rest/v1/ops_events`); Url.searchParams.set("session_id", `eq.${SessionId}`); if (VisitorId) Url.searchParams.set("visitor_id", `eq.${VisitorId}`);
	const Res = await fetch(Url, { method: "DELETE", headers: { apikey: ServiceKey, authorization: `Bearer ${ServiceKey}`, prefer: "return=minimal" } });
	const Text = await Res.text(); if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
	return Json({ ok: true, deleted: true, visitorId: VisitorId, sessionId: SessionId });
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) { try { return await Handle(request); } catch (Ex) { return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500); } }
export async function DELETE({ request }) { try { return await Handle(request); } catch (Ex) { return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500); } }
