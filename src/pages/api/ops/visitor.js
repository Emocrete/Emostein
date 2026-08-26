export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), { status: pStatus, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function ClientName(pValue) { return Str(pValue).toLowerCase() === "desktop" ? "desktop" : "mobile"; }
function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return !!Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey);
}
function Config() {
	const SupabaseUrl = Env("SUPABASE_URL");
	const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) throw new Error("Missing Supabase env vars");
	return { SupabaseUrl, ServiceKey };
}
async function SupabaseRequest(pUrl, pServiceKey, pOptions = {}) {
	const Res = await fetch(pUrl, { ...pOptions, headers: { apikey: pServiceKey, authorization: `Bearer ${pServiceKey}`, ...(pOptions.headers || {}) } });
	const Text = await Res.text();
	if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
	return Text;
}
async function ReadJsonBody(pRequest) {
	const Text = await pRequest.text();
	if (!Text) return {};
	try { return JSON.parse(Text); }
	catch { throw new Error("Invalid JSON body"); }
}
function ValidVisitorId(pValue) {
	const Value = Str(pValue);
	return !!Value && Value.startsWith("v_") && /^[a-z]_[a-z0-9]+_[a-z0-9]+$/i.test(Value);
}
async function InsertControl(pSupabaseUrl, pServiceKey, pVisitorId, pClient) {
	const Now = new Date().toISOString();
	const Uid = `ops_delete_visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
	const Payload = { controlCommand: "ops_delete_visitor", targetVisitorId: pVisitorId, createdAtClient: Now, eventSource: "ops" };
	const Row = {
		event_stream: "normal",
		client_event_uid: Uid,
		event_type: "ops_delete_visitor",
		event_source: "ops",
		visitor_id: pVisitorId,
		occurred_at: Now,
		payload: Payload,
		read_mobile: pClient === "mobile",
		read_desktop: pClient === "desktop"
	};
	await SupabaseRequest(`${pSupabaseUrl}/rest/v1/ops_events`, pServiceKey, {
		method: "POST",
		headers: { "content-type": "application/json", prefer: "return=minimal" },
		body: JSON.stringify(Row)
	});
}
export async function OPTIONS() { return Json({ ok: true }); }
export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const Body = await ReadJsonBody(request);
		const VisitorId = Str(Body.visitorId);
		const Client = ClientName(Body.client);
		if (!ValidVisitorId(VisitorId)) return Json({ ok: false, error: "Invalid visitorId" }, 400);
		const { SupabaseUrl, ServiceKey } = Config();
		const DeleteQuery = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		DeleteQuery.searchParams.set("visitor_id", `eq.${VisitorId}`);
		await SupabaseRequest(DeleteQuery, ServiceKey, { method: "DELETE", headers: { prefer: "return=minimal" } });
		await InsertControl(SupabaseUrl, ServiceKey, VisitorId, Client);
		return Json({ ok: true, visitorId: VisitorId });
	} catch (Ex) {
		const Message = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: Message }, /Invalid/.test(Message) ? 400 : 500);
	}
}
export async function GET() { return Json({ ok: false, error: "POST only" }, 405); }
export async function DELETE() { return Json({ ok: false, error: "POST only" }, 405); }
