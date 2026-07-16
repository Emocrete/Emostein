export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";
function Json(pBody, pStatus = 200) { return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key")); return !!Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
async function Delete(pUrl, pKey) {
	const Res = await fetch(pUrl, { method: "DELETE", headers: { apikey: pKey, authorization: `Bearer ${pKey}`, prefer: "return=minimal" } });
	const Text = await Res.text();
	if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const SupabaseUrl = Env("SUPABASE_URL"); const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);
		const Url = new URL(`${SupabaseUrl}/rest/v1/ops_events`); Url.searchParams.set("id", "gte.0");
		await Delete(Url, ServiceKey);
		return Json({ ok: true, deleted: true });
	} catch (Ex) { return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500); }
}
