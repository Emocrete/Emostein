export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";
const cMaxSessionIds = 200;
const cIndexEventType = "system.clarity_session_index";

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
	});
}
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function ValidId(pValue, pPrefix = "") {
	const Value = Str(pValue);
	return Value.length >= 3 && Value.length <= 190 && /^[A-Za-z0-9_-]+$/.test(Value) && (!pPrefix || Value.startsWith(`${pPrefix}_`));
}
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
	const Res = await fetch(pUrl, {
		...pOptions,
		headers: { apikey: pServiceKey, authorization: `Bearer ${pServiceKey}`, ...(pOptions.headers || {}) }
	});
	const Text = await Res.text();
	if (!Res.ok) throw new Error(Text || `HTTP ${Res.status}`);
	return Text;
}
async function ReadJson(pRequest) {
	const Text = await pRequest.text();
	if (!Text) return {};
	try { return JSON.parse(Text); }
	catch { throw new Error("Invalid JSON body"); }
}
function Payload(pRow) {
	if (pRow?.payload && typeof pRow.payload === "object") return pRow.payload;
	try { return JSON.parse(pRow?.payload || "{}"); }
	catch { return {}; }
}
function SessionIdsFromUrl(pRequest) {
	const Url = new URL(pRequest.url);
	const Raw = Url.searchParams.getAll("sessionId")
		.concat(Str(Url.searchParams.get("sessionIds")).split(","));
	return Array.from(new Set(Raw.map(Str).filter((Value) => ValidId(Value, "s")))).slice(0, cMaxSessionIds);
}
function InFilter(pValues) {
	return `in.(${pValues.join(",")})`;
}

export async function OPTIONS() { return Json({ ok: true }); }

export async function POST({ request }) {
	try {
		const Body = await ReadJson(request);
		const VisitorId = Str(Body.visitorId);
		const SessionId = Str(Body.sessionId);
		const PageInstanceId = Str(Body.pageInstanceId);
		const ProjectId = Str(Body.clarityProjectId);
		const UserId = Str(Body.clarityUserId);
		const ClaritySessionId = Str(Body.claritySessionId);
		const ClarityUrl = Str(Body.clarityUrl);
		if (!ValidId(SessionId, "s") || !ValidId(VisitorId, "v") || !ValidId(PageInstanceId, "p"))
			return Json({ ok: false, error: "Invalid visit IDs" }, 400);
		if (!ProjectId || !UserId || !ClaritySessionId || !ClarityUrl.startsWith("https://clarity.microsoft.com/player/"))
			return Json({ ok: false, error: "Invalid Clarity metadata" }, 400);

		const { SupabaseUrl, ServiceKey } = Config();
		const Row = {
			client_event_uid: `clarity-session-index:${SessionId}`,
			event_type: cIndexEventType,
			event_source: "clarity_index",
			visitor_id: VisitorId,
			session_id: SessionId,
			page_instance_id: PageInstanceId,
			session_seq: 0,
			page_elapsed_ms: 0,
			session_elapsed_ms: 0,
			occurred_at: Str(Body.indexedAt) || new Date().toISOString(),
			page_path: "",
			page_title: "",
			referrer: "",
			screen: "",
			language: "",
			timezone: "",
			user_agent: Str(request.headers.get("user-agent")),
			payload: {
				kind: "clarity_session_index",
				sessionId: SessionId,
				clarityUrl: ClarityUrl,
				clarityProjectId: ProjectId,
				clarityUserId: UserId,
				claritySessionId: ClaritySessionId,
				indexedAt: Str(Body.indexedAt) || new Date().toISOString()
			}
		};
		const Url = `${SupabaseUrl}/rest/v1/ops_events?on_conflict=client_event_uid`;
		await SupabaseRequest(Url, ServiceKey, {
			method: "POST",
			headers: { "content-type": "application/json", prefer: "resolution=merge-duplicates,return=minimal" },
			body: JSON.stringify([Row])
		});
		return Json({ ok: true });
	} catch (Ex) {
		return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500);
	}
}

export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const SessionIds = SessionIdsFromUrl(request);
		if (!SessionIds.length) return Json({ ok: true, matches: [] });
		const { SupabaseUrl, ServiceKey } = Config();
		const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		Query.searchParams.set("select", "id,session_id,created_at,payload");
		Query.searchParams.set("event_type", `eq.${cIndexEventType}`);
		Query.searchParams.set("session_id", InFilter(SessionIds));
		Query.searchParams.set("order", "id.desc");
		Query.searchParams.set("limit", String(cMaxSessionIds * 2));
		const Text = await SupabaseRequest(Query, ServiceKey);
		let Rows = [];
		try { Rows = JSON.parse(Text); } catch {}
		const Seen = new Set();
		const Matches = [];
		for (const Row of Array.isArray(Rows) ? Rows : []) {
			const SessionId = Str(Row.session_id);
			if (!SessionId || Seen.has(SessionId)) continue;
			const P = Payload(Row);
			const Url = Str(P.clarityUrl);
			if (!Url.startsWith("https://clarity.microsoft.com/player/")) continue;
			Seen.add(SessionId);
			Matches.push({ sessionId: SessionId, clarityUrl: Url, indexedAt: Str(P.indexedAt || Row.created_at) });
		}
		return Json({ ok: true, matches: Matches });
	} catch (Ex) {
		return Json({ ok: false, error: Ex instanceof Error ? Ex.message : String(Ex) }, 500);
	}
}
