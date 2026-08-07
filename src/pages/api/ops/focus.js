export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return !!Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey);
}
function ValidVisitorId(pValue) {
	const Value = Str(pValue);
	return !!Value && Value.startsWith("v_") && /^[a-z]_[a-z0-9]+_[a-z0-9]+$/i.test(Value);
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
async function DeleteFocusRows(pSupabaseUrl, pServiceKey, pVisitorId, pStream, pTypes) {
	const Query = new URL(`${pSupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("visitor_id", `eq.${pVisitorId}`);
	Query.searchParams.set("event_stream", `eq.${pStream}`);
	Query.searchParams.set("event_type", `in.(${pTypes.join(",")})`);
	const Res = await fetch(Query, {
		method: "DELETE",
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`,
			prefer: "return=minimal"
		}
	});
	const Text = await Res.text();
	if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
}

export async function OPTIONS() { return Json({ ok: true }); }

export async function DELETE({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const Body = await ReadJsonBody(request);
		const VisitorId = Str(Body.visitorId);
		if (!ValidVisitorId(VisitorId)) return Json({ ok: false, error: "Invalid visitorId" }, 400);
		const { SupabaseUrl, ServiceKey } = Config();
		await DeleteFocusRows(SupabaseUrl, ServiceKey, VisitorId, "normal", ["page_focus_away", "page_focus_return", "focus_away", "focus_return", "page_blur"]);
		await DeleteFocusRows(SupabaseUrl, ServiceKey, VisitorId, "replay", ["system.blur", "system.focus", "page_focus_away", "page_focus_return", "focus_away", "focus_return", "page_blur"]);
		return Json({ ok: true, visitorId: VisitorId });
	} catch (Ex) {
		const Message = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: Message }, /Invalid/.test(Message) ? 400 : 500);
	}
}
