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
	const ReqUrl = new URL(pRequest.url);
	const GivenKey = Str(pRequest.headers.get("x-ops-key") || ReqUrl.searchParams.get("key") || ReqUrl.searchParams.get("k"));
	return GivenKey && GivenKey === OpsKey;
}

async function InsertControlEvent(pSupabaseUrl, pServiceKey, pCommand, pPayload = {}) {
	const Now = new Date().toISOString();
	const Row = {
		event_type: pCommand,
		visitor_id: "__ops_system__",
		session_id: "__ops_control__",
		page_path: "",
		page_title: pCommand,
		referrer: "",
		screen: "",
		language: "",
		timezone: "",
		user_agent: "EmoLiveControl",
		payload: {
			...pPayload,
			controlCommand: pCommand,
			opsCommand: pCommand,
			createdAtClient: Now,
			notifyMobile: false,
			sound: false,
			trafficKind: "ops_control",
			botSignal: "",
			userAgentClient: "EmoLiveControl"
		}
	};

	const Res = await fetch(`${pSupabaseUrl}/rest/v1/ops_events`, {
		method: "POST",
		headers: {
			"apikey": pServiceKey,
			"authorization": `Bearer ${pServiceKey}`,
			"content-type": "application/json",
			"prefer": "return=representation"
		},
		body: JSON.stringify(Row)
	});

	const Text = await Res.text();
	if (!Res.ok) throw new Error(Text || "Failed to insert control event");

	try {
		const Data = JSON.parse(Text);
		return Array.isArray(Data) && Data.length ? Data[0] : null;
	} catch {
		return null;
	}
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

		const ControlRow = await InsertControlEvent(SupabaseUrl, ServiceKey, "ops_clear_all", {
			resetAt: new Date().toISOString()
		});

		return Json({ ok: true, deleted: true, controlId: ControlRow?.id ?? 0 });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
