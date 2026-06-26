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

function Num(pValue, pDefault = 0) {
	const Value = Number(pValue);
	return Number.isFinite(Value) ? Value : pDefault;
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

function EventTypeOf(pRow, pPayload) {
	return Str(Pick(pRow, "event_type") || Pick(pPayload, "eventType", "event_type", "type") || "event");
}

function PagePathOf(pRow, pPayload) {
	return Str(Pick(pRow, "page_path") || Pick(pPayload, "pagePath", "page_path") || "/");
}

function PageTitleOf(pRow, pPayload) {
	return Str(Pick(pRow, "page_title") || Pick(pPayload, "pageTitle", "page_title") || PagePathOf(pRow, pPayload));
}

function EventLabel(pRow, pPayload) {
	return Str(Pick(pPayload, "label", "event_label", "eventText") || PageTitleOf(pRow, pPayload));
}

function EventElapsedMs(pRow, pPayload, pFirstCreatedAtMs) {
	const Explicit = Pick(pPayload, "elapsedMs", "elapsed_ms");
	if (Explicit !== "") return Math.max(0, Num(Explicit));
	const CreatedAt = Date.parse(Str(Pick(pRow, "created_at")));
	if (Number.isFinite(CreatedAt) && Number.isFinite(pFirstCreatedAtMs)) return Math.max(0, CreatedAt - pFirstCreatedAtMs);
	return 0;
}

function ScrollPercentOf(pEventType, pPayload) {
	const Explicit = Pick(pPayload, "scrollPercent", "scroll_percent");
	if (Explicit !== "") return Math.max(0, Math.min(100, Num(Explicit)));
	const Value = Pick(pPayload, "value");
	if (String(pEventType).startsWith("scroll_") && Value !== "") return Math.max(0, Math.min(100, Num(Value)));
	const Match = String(pEventType).match(/^scroll_(\d{1,3})$/i);
	if (Match) return Math.max(0, Math.min(100, Num(Match[1])));
	return "";
}

function EventTime(pRow) {
	try {
		return new Date(pRow.created_at).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });
	} catch {
		return Str(pRow.created_at);
	}
}

function SafeReplayData(pEvents, pRequestUrl) {
	const Origin = new URL(pRequestUrl).origin;
	const FirstCreatedAtMs = pEvents.length ? Date.parse(Str(pEvents[0].created_at)) : 0;

	return pEvents.map((EventRow, Index) => {
		const Payload = PayloadOf(EventRow);
		const EventType = EventTypeOf(EventRow, Payload);
		const PagePath = PagePathOf(EventRow, Payload);
		const PageUrl = new URL(PagePath || "/", Origin);
		PageUrl.searchParams.set("emoReplay", "1");
		PageUrl.searchParams.set("emo_replay", "1");

		return {
			index: Index,
			id: Num(Pick(EventRow, "id"), Index + 1),
			type: EventType,
			label: EventLabel(EventRow, Payload),
			pagePath: PagePath,
			pageTitle: PageTitleOf(EventRow, Payload),
			pageUrl: PageUrl.toString(),
			createdAtText: EventTime(EventRow),
			elapsedMs: EventElapsedMs(EventRow, Payload, FirstCreatedAtMs),
			scrollPercent: ScrollPercentOf(EventType, Payload),
			scrollX: Pick(Payload, "scrollX", "scroll_x"),
			scrollY: Pick(Payload, "scrollY", "scroll_y"),
			viewportWidth: Pick(Payload, "viewportWidth", "viewport_width"),
			viewportHeight: Pick(Payload, "viewportHeight", "viewport_height"),
			pointerClientX: Pick(Payload, "pointerClientX", "pointer_client_x"),
			pointerClientY: Pick(Payload, "pointerClientY", "pointer_client_y"),
			href: Str(Pick(Payload, "href")),
			value: Pick(Payload, "value")
		};
	});
}

function JsonForHtml(pValue) {
	return JSON.stringify(pValue).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function RenderReplay(pEvents, pSessionId, pPageInstanceId, pRequestUrl) {
	const ReplayEvents = SafeReplayData(pEvents, pRequestUrl).sort((A, B) => A.elapsedMs - B.elapsedMs || A.id - B.id);
	const FirstPage = ReplayEvents.find((EventItem) => EventItem.pageUrl)?.pageUrl || new URL("/", pRequestUrl).origin;
	const TimelineRows = ReplayEvents.map((EventItem, Index) => `<button class="timelineItem" type="button" data-index="${Index}">
		<span class="timelineNo">${Index + 1}</span>
		<span class="timelineBody"><b>${EscapeHtml(EventItem.type)}</b><small>${EscapeHtml(EventItem.label)}</small><em>${EscapeHtml(EventItem.pagePath)}</em></span>
		<strong>${Math.round(EventItem.elapsedMs / 1000)} ث</strong>
	</button>`).join("\n");

	return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>EmoLive Replay</title>
<style>
:root{color-scheme:dark;--bg:#0b111a;--panel:#131d29;--panel2:#172333;--line:#334a62;--text:#eef5ff;--muted:#a8b7c9;--blue:#2da5ff;--gold:#ffca4b;--red:#ff4b4b}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0,#172233 0,#0b111a 46%,#080d14 100%);color:var(--text);font-family:system-ui,Tahoma,Arial,sans-serif;overflow:hidden}.shell{height:100vh;display:grid;grid-template-rows:auto 1fr}.top{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#0f1722;border-bottom:1px solid #293a4f}.title{display:flex;flex-direction:column;gap:2px;min-width:220px}.title h1{font-size:20px;margin:0}.title small{color:var(--muted);direction:ltr;text-align:right}.controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.btn{border:1px solid #3b5670;background:#172333;color:var(--text);border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer}.btn:hover{border-color:var(--blue)}.timeBox{color:var(--gold);font-weight:900;min-width:72px;text-align:center}.speed{background:#0c141f;color:var(--text);border:1px solid #3b5670;border-radius:9px;padding:7px}.progress{appearance:none;flex:1;min-width:160px;height:8px;border-radius:999px;background:#26364a}.progress::-webkit-slider-thumb{appearance:none;width:18px;height:18px;border-radius:50%;background:var(--blue);cursor:pointer}.main{min-height:0;display:grid;grid-template-columns:minmax(270px,340px) 1fr;gap:10px;padding:10px;direction:ltr}.timeline{direction:rtl;min-height:0;background:#0f1722;border:1px solid #26384d;border-radius:16px;display:flex;flex-direction:column;overflow:hidden}.timelineHead{padding:12px;border-bottom:1px solid #26384d;font-weight:900}.timelineList{overflow:auto;padding:8px;display:flex;flex-direction:column;gap:7px}.timelineItem{display:grid;grid-template-columns:34px 1fr 54px;gap:8px;align-items:center;text-align:right;background:#131d29;border:1px solid #334a62;color:var(--text);border-radius:12px;padding:8px;cursor:pointer}.timelineItem.active{border-color:var(--gold);box-shadow:0 0 0 1px #ffca4b66 inset;background:#1b2a3b}.timelineNo{color:var(--blue);font-weight:1000;font-size:18px}.timelineBody{min-width:0}.timelineBody b{display:block;font-size:14px}.timelineBody small{display:block;color:#dce8f5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.timelineBody em{display:block;color:var(--muted);direction:ltr;text-align:left;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.timelineItem strong{color:var(--gold);text-align:left}.stageWrap{min-height:0;position:relative;background:#060a10;border:1px solid #26384d;border-radius:18px;overflow:hidden;direction:ltr}.stageBar{position:absolute;z-index:5;left:12px;right:12px;top:12px;display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #ffffff1f;border-radius:14px;background:#07101bcc;backdrop-filter:blur(10px);direction:rtl}.eventBadge{font-weight:900;color:var(--gold)}.eventText{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eventText b{color:var(--text)}.eventText small{color:var(--muted);margin-inline-start:8px}.viewport{position:absolute;inset:0;padding-top:54px}.pageFrame{width:100%;height:100%;border:0;background:white}.cursor{position:absolute;z-index:8;width:22px;height:22px;border:3px solid var(--red);border-radius:50%;pointer-events:none;display:none;transform:translate(-50%,-50%);box-shadow:0 0 0 8px #ff4b4b25}.cursor.pulse{animation:pulse .45s ease-out}@keyframes pulse{from{box-shadow:0 0 0 4px #ff4b4b66}to{box-shadow:0 0 0 24px #ff4b4b00}}.empty{padding:30px;text-align:center;color:var(--muted)}@media(max-width:850px){body{overflow:auto}.shell{height:auto;min-height:100vh}.main{grid-template-columns:1fr;height:calc(100vh - 104px)}.timeline{display:none}.title small{font-size:11px}.top{align-items:flex-start}.stageWrap{min-height:0}.controls{gap:6px}.btn{padding:7px 9px}}
</style>
</head>
<body>
<div class="shell">
	<div class="top">
		<div class="title">
			<h1>EmoLive Replay</h1>
			<small>Session: ${EscapeHtml(pSessionId)}</small>
			<small>Page: ${EscapeHtml(pPageInstanceId || "كل الصفحات")}</small>
		</div>
		<div class="controls">
			<button id="playBtn" class="btn" type="button">تشغيل</button>
			<button id="restartBtn" class="btn" type="button">من الأول</button>
			<select id="speedSelect" class="speed"><option value="0.5">0.5x</option><option value="1" selected>1x</option><option value="2">2x</option><option value="4">4x</option><option value="8">8x</option></select>
			<span id="timeBox" class="timeBox">0 ث</span>
		</div>
		<input id="progress" class="progress" type="range" min="0" max="1" step="1" value="0" />
	</div>
	<div class="main">
		<aside class="timeline">
			<div class="timelineHead">الأحداث المسجلة: ${ReplayEvents.length}</div>
			<div id="timelineList" class="timelineList">${TimelineRows || `<div class="empty">لا توجد أحداث مطابقة.</div>`}</div>
		</aside>
		<section class="stageWrap">
			<div class="stageBar"><span id="eventBadge" class="eventBadge">جاهز</span><span id="eventText" class="eventText">اضغط تشغيل لبدء محاكاة الزيارة فوق الصفحة الفعلية.</span></div>
			<div class="viewport"><iframe id="pageFrame" class="pageFrame" src="${EscapeHtml(FirstPage)}"></iframe></div>
			<div id="cursor" class="cursor"></div>
		</section>
	</div>
</div>
<script>
(() => {
const cEvents = ${JsonForHtml(ReplayEvents)};
const fFrame = document.getElementById("pageFrame");
const fPlayBtn = document.getElementById("playBtn");
const fRestartBtn = document.getElementById("restartBtn");
const fProgress = document.getElementById("progress");
const fSpeedSelect = document.getElementById("speedSelect");
const fTimeBox = document.getElementById("timeBox");
const fEventBadge = document.getElementById("eventBadge");
const fEventText = document.getElementById("eventText");
const fCursor = document.getElementById("cursor");
const fTimeline = Array.from(document.querySelectorAll(".timelineItem"));
const fMaxMs = Math.max(1, ...cEvents.map((pEvent) => Number(pEvent.elapsedMs) || 0));
let fPlaying = false;
let fStartedAt = 0;
let fBaseMs = 0;
let fAppliedIndex = -1;
let fCurrentPageUrl = fFrame.getAttribute("src") || "";
let fPendingScroll = null;
fProgress.max = String(fMaxMs);

function FormatTime(pMs) {
	const Seconds = Math.round(Math.max(0, pMs) / 1000);
	if (Seconds < 60) return Seconds + " ث";
	return Math.floor(Seconds / 60) + ":" + String(Seconds % 60).padStart(2, "0");
}

function FrameWindow() {
	try { return fFrame.contentWindow; } catch { return null; }
}

function FrameDocument() {
	try { return fFrame.contentDocument || fFrame.contentWindow?.document || null; } catch { return null; }
}

function ScrollFrameToPercent(pPercent, pSmooth = true) {
	const Percent = Number(pPercent);
	if (!Number.isFinite(Percent)) return;
	const Win = FrameWindow();
	const Doc = FrameDocument();
	if (!Win || !Doc) {
		fPendingScroll = Percent;
		return;
	}
	const Body = Doc.body;
	const Root = Doc.documentElement;
	const Height = Math.max(Root.scrollHeight || 0, Body?.scrollHeight || 0) - Win.innerHeight;
	const Top = Math.max(0, Height * Math.max(0, Math.min(100, Percent)) / 100);
	try {
		Win.scrollTo({ top: Top, left: 0, behavior: pSmooth ? "smooth" : "auto" });
	} catch {
		Win.scrollTo(0, Top);
	}
}

function ShowCursor(pEvent) {
	const X = Number(pEvent.pointerClientX);
	const Y = Number(pEvent.pointerClientY);
	if (!Number.isFinite(X) || !Number.isFinite(Y) || X <= 0 || Y <= 0) return;
	const Viewport = document.querySelector(".viewport");
	const Rect = Viewport.getBoundingClientRect();
	const ScaleX = Rect.width / Math.max(1, Number(pEvent.viewportWidth) || Rect.width);
	const ScaleY = Rect.height / Math.max(1, Number(pEvent.viewportHeight) || Rect.height);
	fCursor.style.left = (Rect.left + X * ScaleX) + "px";
	fCursor.style.top = (Rect.top + Y * ScaleY) + "px";
	fCursor.style.display = "block";
	fCursor.classList.remove("pulse");
	void fCursor.offsetWidth;
	fCursor.classList.add("pulse");
}

function SetActive(pIndex) {
	fTimeline.forEach((pItem, pItemIndex) => pItem.classList.toggle("active", pItemIndex === pIndex));
	const Active = fTimeline[pIndex];
	if (Active) Active.scrollIntoView({ block: "nearest" });
}

function LoadPageIfNeeded(pEvent) {
	if (!pEvent.pageUrl || pEvent.pageUrl === fCurrentPageUrl) return;
	fCurrentPageUrl = pEvent.pageUrl;
	fFrame.src = pEvent.pageUrl;
}

function ApplyEvent(pEvent, pIndex, pSmooth = true) {
	LoadPageIfNeeded(pEvent);
	fEventBadge.textContent = String(pIndex + 1) + " / " + String(cEvents.length);
	fEventText.innerHTML = "<b>" + Escape(String(pEvent.type || "event")) + "</b><small>" + Escape(String(pEvent.label || "")) + "</small>";
	SetActive(pIndex);
	if (pEvent.scrollPercent !== "" && pEvent.scrollPercent !== null && pEvent.scrollPercent !== undefined) ScrollFrameToPercent(pEvent.scrollPercent, pSmooth);
	ShowCursor(pEvent);
}

function Escape(pText) {
	return pText.replace(/[&<>"']/g, (pChar) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[pChar] || pChar));
}

function Seek(pMs, pSmooth = false) {
	const TimeMs = Math.max(0, Math.min(fMaxMs, Number(pMs) || 0));
	fBaseMs = TimeMs;
	fStartedAt = performance.now();
	fProgress.value = String(Math.round(TimeMs));
	fTimeBox.textContent = FormatTime(TimeMs);
	let LastIndex = -1;
	for (let Index = 0; Index < cEvents.length; Index++) {
		if ((Number(cEvents[Index].elapsedMs) || 0) <= TimeMs) LastIndex = Index;
		else break;
	}
	if (LastIndex >= 0) {
		fAppliedIndex = LastIndex;
		ApplyEvent(cEvents[LastIndex], LastIndex, pSmooth);
	} else {
		fAppliedIndex = -1;
	}
}

function Tick(pNow) {
	if (!fPlaying) return;
	const Speed = Number(fSpeedSelect.value) || 1;
	const TimeMs = Math.min(fMaxMs, fBaseMs + (pNow - fStartedAt) * Speed);
	fProgress.value = String(Math.round(TimeMs));
	fTimeBox.textContent = FormatTime(TimeMs);
	while (fAppliedIndex + 1 < cEvents.length && (Number(cEvents[fAppliedIndex + 1].elapsedMs) || 0) <= TimeMs) {
		fAppliedIndex += 1;
		ApplyEvent(cEvents[fAppliedIndex], fAppliedIndex, true);
	}
	if (TimeMs >= fMaxMs) {
		fPlaying = false;
		fPlayBtn.textContent = "تشغيل";
		return;
	}
	requestAnimationFrame(Tick);
}

function Play() {
	if (!cEvents.length) return;
	if (fPlaying) {
		fPlaying = false;
		fBaseMs = Number(fProgress.value) || 0;
		fPlayBtn.textContent = "تشغيل";
		return;
	}
	fPlaying = true;
	fStartedAt = performance.now();
	fBaseMs = Number(fProgress.value) || 0;
	fPlayBtn.textContent = "إيقاف";
	requestAnimationFrame(Tick);
}

fFrame.addEventListener("load", () => {
	if (fPendingScroll !== null) {
		const Percent = fPendingScroll;
		fPendingScroll = null;
		setTimeout(() => ScrollFrameToPercent(Percent, false), 250);
	}
});

fPlayBtn.addEventListener("click", Play);
fRestartBtn.addEventListener("click", () => { fPlaying = false; fPlayBtn.textContent = "تشغيل"; Seek(0, false); });
fProgress.addEventListener("input", () => Seek(Number(fProgress.value) || 0, false));
fTimeline.forEach((pItem) => pItem.addEventListener("click", () => {
	const Index = Number(pItem.dataset.index);
	const EventItem = cEvents[Index];
	if (!EventItem) return;
	Seek(Number(EventItem.elapsedMs) || 0, false);
}));

if (cEvents.length) {
	Seek(0, false);
} else {
	fEventText.textContent = "لا توجد أحداث يمكن تشغيلها.";
}
})();
</script>
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
		Query.searchParams.set("limit", "1500");

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

		return Html(RenderReplay(Events, SessionId, PageInstanceId, request.url));
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Html(EscapeHtml(Msg), 500);
	}
}
