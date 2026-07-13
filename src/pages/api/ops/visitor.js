export const prerender = false;
const cDefaultOpsKey = "Emocrete20015161";
function Json(pBody, pStatus = 200) { return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key")); return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
async function ReadBody(pRequest) { try { return await pRequest.json(); } catch { return {}; } }
async function DeleteVisitor(pRequest) {
	if (!CheckOpsKey(pRequest)) return Json({ ok: false, error: "Unauthorized" }, 401);
	const SupabaseUrl = Env("SUPABASE_URL"), ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);
	const Url = new URL(pRequest.url), Body = await ReadBody(pRequest);
	const VisitorId = Str(Body.visitorId ?? Body.visitor_id ?? Url.searchParams.get("visitor_id") ?? Url.searchParams.get("visitorId"));
	if (!VisitorId) return Json({ ok: false, error: "Missing visitorId" }, 400);
	const Res = await fetch(`${SupabaseUrl}/rest/v1/rpc/ops_delete_visitor_data`, { method: "POST", headers: { apikey: ServiceKey, authorization: `Bearer ${ServiceKey}`, "content-type": "application/json" }, body: JSON.stringify({ p_visitor_id: VisitorId }) });
	const Text = await Res.text(); if (!Res.ok) return Json({ ok: false, error: Text }, Res.status || 500);
	let Data = {}; try { Data = JSON.parse(Text); } catch {}
	return Json({ ok: true, visitorId: VisitorId, ...Data });
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) { try { return await DeleteVisitor(request); } catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); } }
export async function DELETE({ request }) { try { return await DeleteVisitor(request); } catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); } }
