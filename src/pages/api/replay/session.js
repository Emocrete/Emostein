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

function BuildRow(pBody, pRequest) {
	const Viewport = pBody.viewport || {};
	const Doc = pBody.document || {};
	const Row = {
		id: Str(pBody.id || pBody.sessionId),
		visitor_id: Str(pBody.visitorId || pBody.visitor_id),
		visit_session_id: Str(pBody.visitSessionId || pBody.visit_session_id),
		page_id: Str(pBody.pageId || pBody.page_id),
		page_url: Str(pBody.pageUrl || pBody.page_url),
		page_path: Str(pBody.pagePath || pBody.page_path),
		page_title: Str(pBody.pageTitle || pBody.page_title),
		started_at: Str(pBody.startedAt || pBody.started_at) || new Date().toISOString(),
		viewport_width: Math.round(Num(Viewport.width)),
		viewport_height: Math.round(Num(Viewport.height)),
		document_width: Math.round(Num(Doc.width)),
		document_height: Math.round(Num(Doc.height)),
		device_pixel_ratio: Num(Viewport.dpr, 1),
		screen: Str(pBody.screen),
		language: Str(pBody.language),
		timezone: Str(pBody.timezone),
		user_agent: Str(pRequest.headers.get("user-agent") || pBody.userAgentClient),
		meta: {
			event: Str(pBody.event),
			viewport: Viewport,
			document: Doc,
			snapshotLength: Num(pBody.snapshotLength),
			userAgentClient: Str(pBody.userAgentClient)
		}
	};

	if (typeof pBody.snapshotHtml === "string" && pBody.snapshotHtml.length > 0) {
		Row.snapshot_html = pBody.snapshotHtml;
		Row.snapshot_length = pBody.snapshotHtml.length;
		Row.snapshot_saved_at = new Date().toISOString();
	}

	return Row;
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

		const Row = BuildRow(Body, request);
		if (!Row.id) return Json({ ok: false, error: "Missing replay session id" }, 400);

		const Res = await SupabaseFetch("/rest/v1/replay_sessions?on_conflict=id", {
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
		const Id = Str(ReqUrl.searchParams.get("id") || ReqUrl.searchParams.get("session_id") || ReqUrl.searchParams.get("sessionId"));
		const Limit = Math.min(200, Math.max(1, Number.parseInt(ReqUrl.searchParams.get("limit") || "50", 10) || 50));

		const Query = new URL("http://x/rest/v1/replay_sessions");
		Query.searchParams.set("select", "*");

		if (Id) {
			Query.searchParams.set("id", `eq.${Id}`);
			Query.searchParams.set("limit", "1");
		} else {
			Query.searchParams.set("order", "created_at.desc");
			Query.searchParams.set("limit", String(Limit));
		}

		const Res = await SupabaseFetch(`${Query.pathname}${Query.search}`, {
			headers: { "accept": "application/json" }
		});

		if (!Res.ok) return Json({ ok: false, error: Res.text }, Res.status || 500);

		let Rows = [];
		try { Rows = JSON.parse(Res.text); } catch { Rows = []; }

		if (Id) return Json({ ok: true, session: Array.isArray(Rows) ? Rows[0] ?? null : null });
		return Json({ ok: true, sessions: Array.isArray(Rows) ? Rows : [] });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
