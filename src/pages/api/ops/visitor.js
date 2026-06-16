export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}

function Env(pName) {
	const Value = process.env[pName];
	return typeof Value === "string" ? Value.trim() : "";
}

function Str(pValue) {
	return String(pValue ?? "").trim();
}

function CheckOpsKey(pRequest) {
	const OpsKey = Env("OPS_API_KEY") || cDefaultOpsKey;
	const GivenKey = Str(pRequest.headers.get("x-ops-key"));
	return GivenKey && GivenKey === OpsKey;
}

async function ReadBody(pRequest) {
	try {
		return await pRequest.json();
	} catch {
		return {};
	}
}

async function DeleteVisitor(pRequest) {
	if (!CheckOpsKey(pRequest)) return Json({ ok: false, error: "Unauthorized" }, 401);

	const SupabaseUrl = Env("SUPABASE_URL");
	const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");

	if (!SupabaseUrl || !ServiceKey) {
		return Json({
			ok: false,
			error: "Missing Supabase env vars",
			hasSupabaseUrl: !!SupabaseUrl,
			hasServiceKey: !!ServiceKey
		}, 500);
	}

	const ReqUrl = new URL(pRequest.url);
	const Body = await ReadBody(pRequest);
	const VisitorId = Str(Body.visitorId ?? Body.visitor_id ?? ReqUrl.searchParams.get("visitor_id") ?? ReqUrl.searchParams.get("visitorId"));

	if (!VisitorId) return Json({ ok: false, error: "Missing visitorId" }, 400);

	const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
	Query.searchParams.set("visitor_id", `eq.${VisitorId}`);

	const Res = await fetch(Query, {
		method: "DELETE",
		headers: {
			"apikey": ServiceKey,
			"authorization": `Bearer ${ServiceKey}`,
			"prefer": "return=minimal"
		}
	});

	const Text = await Res.text();
	if (!Res.ok) return Json({ ok: false, error: Text }, 500);

	return Json({ ok: true, deleted: true, visitorId: VisitorId });
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		return await DeleteVisitor(request);
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}

export async function DELETE({ request }) {
	try {
		return await DeleteVisitor(request);
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
