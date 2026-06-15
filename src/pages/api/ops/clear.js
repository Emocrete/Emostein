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

function CheckOpsKey(pRequest) {
	const OpsKey = Env("OPS_API_KEY") || cDefaultOpsKey;
	const GivenKey = String(pRequest.headers.get("x-ops-key") ?? "").trim();
	return GivenKey && GivenKey === OpsKey;
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);

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

		const Res = await fetch(`${SupabaseUrl}/rest/v1/ops_events?id=gte.0`, {
			method: "DELETE",
			headers: {
				"apikey": ServiceKey,
				"authorization": `Bearer ${ServiceKey}`,
				"prefer": "return=minimal"
			}
		});

		const Text = await Res.text();
		if (!Res.ok) return Json({ ok: false, error: Text }, 500);

		return Json({ ok: true, deleted: true });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
