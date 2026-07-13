export const prerender = false;
const cDefaultOpsKey = "Emocrete20015161";
function Json(pBody, pStatus = 200) { return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key")); return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const SupabaseUrl = Env("SUPABASE_URL"), ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);
		const Res = await fetch(`${SupabaseUrl}/rest/v1/rpc/ops_clear_all_data`, { method: "POST", headers: { apikey: ServiceKey, authorization: `Bearer ${ServiceKey}`, "content-type": "application/json" }, body: "{}" });
		const Text = await Res.text(); if (!Res.ok) return Json({ ok: false, error: Text }, Res.status || 500);
		let Data = {}; try { Data = JSON.parse(Text); } catch {}
		return Json({ ok: true, ...Data });
	} catch (Ex) { return Json({ ok: false, error: "Function crashed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500); }
}
