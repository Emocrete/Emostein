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

function Num(pValue, pFallback = 0) {
	const Value = Number(pValue);
	return Number.isFinite(Value) ? Value : pFallback;
}

function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const OpsKey = Env("OPS_API_KEY") || cDefaultOpsKey;
	const GivenKey = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return GivenKey && GivenKey === OpsKey;
}

async function ReadBody(pRequest) {
	try {
		return await pRequest.json();
	} catch {
		return null;
	}
}

async function SupabaseFetch(pPath, pOptions = {}) {
	const SupabaseUrl = Env("SUPABASE_URL");
	const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");

	if (!SupabaseUrl || !ServiceKey) {
		return {
			ok: false,
			status: 500,
			text: JSON.stringify({
				error: "Missing Supabase env vars",
				hasSupabaseUrl: !!SupabaseUrl,
				hasServiceKey: !!ServiceKey
			})
		};
	}

	const Res = await fetch(`${SupabaseUrl}${pPath}`, {
		...pOptions,
		headers: {
			"apikey": ServiceKey,
			"authorization": `Bearer ${ServiceKey}`,
			...(pOptions.headers || {})
		}
	});

	const Text = await Res.text();
	return { ok: Res.ok, status: Res.status, text: Text };
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		const Body = await ReadBody(request);
		if (!Body || typeof Body !== "object") return Json({ ok: false, error: "Invalid JSON body" }, 400);

		const SessionId = Str(Body.sessionId || Body.session_id);
		if (!SessionId) return Json({ ok: false, error: "Missing sessionId" }, 400);

		const Events = Array.isArray(Body.events) ? Body.events : [];
		if (!Events.length) return Json({ ok: true, skipped: true });

		const Row = {
			session_id: SessionId,
			visitor_id: Str(Body.visitorId || Body.visitor_id),
			visit_session_id: Str(Body.visitSessionId || Body.visit_session_id),
			page_id: Str(Body.pageId || Body.page_id),
			chunk_index: Math.max(0, Math.round(Num(Body.chunkIndex || Body.chunk_index))),
			from_ms: Math.round(Num(Body.fromMs || Body.from_ms)),
			to_ms: Math.round(Num(Body.toMs || Body.to_ms)),
			reason: Str(Body.reason),
			events_count: Events.length,
			events_json: Events
		};

		const Res = await SupabaseFetch("/rest/v1/replay_chunks?on_conflict=session_id,chunk_index", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"prefer": "resolution=merge-duplicates,return=representation"
			},
			body: JSON.stringify(Row)
		});

		if (!Res.ok) return Json({ ok: false, error: Res.text }, Res.status || 500);

		let Data = null;
		try { Data = JSON.parse(Res.text); } catch { Data = Res.text; }
		return Json({ ok: true, data: Data });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}

export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);

		const ReqUrl = new URL(request.url);
		const SessionId = Str(ReqUrl.searchParams.get("session_id") || ReqUrl.searchParams.get("sessionId"));
		if (!SessionId) return Json({ ok: false, error: "Missing session_id" }, 400);

		const Query = new URL("http://x/rest/v1/replay_chunks");
		Query.searchParams.set("select", "*");
		Query.searchParams.set("session_id", `eq.${SessionId}`);
		Query.searchParams.set("order", "chunk_index.asc");
		Query.searchParams.set("limit", "1000");

		const Res = await SupabaseFetch(`${Query.pathname}${Query.search}`, {
			headers: { "accept": "application/json" }
		});

		if (!Res.ok) return Json({ ok: false, error: Res.text }, Res.status || 500);

		let Rows = [];
		try { Rows = JSON.parse(Res.text); } catch { Rows = []; }
		return Json({ ok: true, chunks: Array.isArray(Rows) ? Rows : [] });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
