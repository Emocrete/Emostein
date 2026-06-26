export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";

function Html(pBody, pStatus = 200) {
	return new Response(pBody, {
		status: pStatus,
		headers: {
			"content-type": "text/html; charset=utf-8",
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

function EscapeHtml(pValue) {
	return Str(pValue)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function PayloadOf(pRow) {
	if (!pRow || pRow.payload === null || pRow.payload === undefined) return {};
	if (typeof pRow.payload === "object") return pRow.payload;
	if (typeof pRow.payload === "string" && pRow.payload.trim()) {
		try {
			return JSON.parse(pRow.payload);
		} catch {
			return {};
		}
	}
	return {};
}

function Pick(pObj, ...pNames) {
	for (const Name of pNames) {
		if (pObj && pObj[Name] !== undefined && pObj[Name] !== null && pObj[Name] !== "") return pObj[Name];
	}
	return "";
}

function CheckOpsKey(pRequest) {
	const OpsKey = Env("OPS_API_KEY") || cDefaultOpsKey;
	const ReqUrl = new URL(pRequest.url);
	const GivenKey = Str(pRequest.headers.get("x-ops-key") || ReqUrl.searchParams.get("key") || ReqUrl.searchParams.get("k"));
	return GivenKey && GivenKey === OpsKey;
}

function EventTime(pRow) {
	try {
		return new Date(pRow.created_at).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });
	} catch {
		return Str(pRow.created_at);
	}
}

function EventTitle(pRow, pPayload) {
	return Str(Pick(pRow, "event_type") || Pick(pPayload, "eventType", "type") || "event");
}

function EventLabel(pRow, pPayload) {
	return Str(Pick(pPayload, "label", "event_label", "eventText") || Pick(pRow, "page_title") || Pick(pPayload, "pageTitle") || Pick(pRow, "page_path") || Pick(pPayload, "pagePath"));
}

function RenderReplay(pEvents, pSessionId, pPageInstanceId) {
	const Rows = pEvents.map((EventRow, Index) => {
		const Payload = PayloadOf(EventRow);
		const EventType = EventTitle(EventRow, Payload);
		const Label = EventLabel(EventRow, Payload);
		const ElapsedMs = Number(Pick(Payload, "elapsedMs", "elapsed_ms") || 0) || 0;
		const PagePath = Str(Pick(EventRow, "page_path") || Pick(Payload, "pagePath"));
		return `<div class="event" data-index="${Index}" data-ms="${ElapsedMs}">
			<div class="eventTop"><b>${Index + 1}</b><span>${EscapeHtml(EventTime(EventRow))}</span><strong>${EscapeHtml(Math.round(ElapsedMs / 1000))} ث</strong></div>
			<div class="eventType">${EscapeHtml(EventType)}</div>
			<div class="eventLabel">${EscapeHtml(Label)}</div>
			<div class="eventPath">${EscapeHtml(PagePath)}</div>
		</div>`;
	}).join("\n");

	return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>EmoLive Replay</title>
<style>
body{margin:0;background:#0f141c;color:#eaf2ff;font-family:system-ui,Tahoma,Arial,sans-serif}.wrap{max-width:1100px;margin:auto;padding:18px}.head{background:#171f2b;border:1px solid #334f6680;border-radius:18px;padding:14px;margin-bottom:14px}.grid{display:grid;grid-template-columns:1fr;gap:8px}.event{background:#141d29;border:1px solid #4f6680;border-radius:14px;padding:10px}.eventTop{display:flex;gap:12px;align-items:center;color:#9dacbe}.eventTop b,.eventTop strong{color:#ffc74a}.eventType{font-size:20px;font-weight:800;margin-top:6px}.eventLabel{font-size:16px;margin-top:4px}.eventPath{direction:ltr;text-align:left;color:#9dacbe;margin-top:5px}.empty{padding:30px;text-align:center;color:#9dacbe}</style>
</head>
<body>
<div class="wrap">
<div class="head"><h1>EmoLive Replay</h1><div>Session: ${EscapeHtml(pSessionId)}</div><div>Page: ${EscapeHtml(pPageInstanceId || "كل الصفحات")}</div><div>Events: ${pEvents.length}</div></div>
<div class="grid">${Rows || `<div class="empty">لا توجد أحداث مطابقة حتى الآن.</div>`}</div>
</div>
</body>
</html>`;
}

export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Html("Unauthorized", 401);

		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Html("Missing Supabase env vars", 500);

		const ReqUrl = new URL(request.url);
		const SessionId = Str(ReqUrl.searchParams.get("session_id") || ReqUrl.searchParams.get("sessionId"));
		const VisitorId = Str(ReqUrl.searchParams.get("visitor_id") || ReqUrl.searchParams.get("visitorId"));
		const PageInstanceId = Str(ReqUrl.searchParams.get("page_instance_id") || ReqUrl.searchParams.get("pageInstanceId"));
		if (!SessionId) return Html("Missing session_id", 400);

		const Query = new URL(`${SupabaseUrl}/rest/v1/ops_events`);
		Query.searchParams.set("select", "*");
		Query.searchParams.set("session_id", `eq.${SessionId}`);
		if (VisitorId) Query.searchParams.set("visitor_id", `eq.${VisitorId}`);
		Query.searchParams.set("order", "id.asc");
		Query.searchParams.set("limit", "1000");

		const Res = await fetch(Query, {
			headers: {
				"apikey": ServiceKey,
				"authorization": `Bearer ${ServiceKey}`
			}
		});

		const Text = await Res.text();
		if (!Res.ok) return Html(EscapeHtml(Text), 500);

		let Events = [];
		try {
			Events = JSON.parse(Text);
		} catch {
			Events = [];
		}

		if (PageInstanceId) {
			Events = Events.filter((EventRow) => {
				const Payload = PayloadOf(EventRow);
				return Str(Pick(EventRow, "page_instance_id") || Pick(Payload, "pageInstanceId", "page_instance_id")) === PageInstanceId;
			});
		}

		return Html(RenderReplay(Events, SessionId, PageInstanceId));
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Html(EscapeHtml(Msg), 500);
	}
}
