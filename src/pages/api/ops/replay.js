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

function CreatedAtMsOf(pRow, pPayload = null) {
	const Payload = pPayload || PayloadOf(pRow);
	const Candidates = [
		Pick(pRow, "created_at", "createdAt", "createdAtServer", "created_at_server"),
		Pick(Payload, "createdAtClient", "created_at_client", "createdAt", "created_at")
	];

	for (const Candidate of Candidates) {
		const Text = Str(Candidate);
		if (!Text) continue;
		const Parsed = Date.parse(Text);
		if (Number.isFinite(Parsed)) return Parsed;
	}

	return 0;
}

function EventElapsedMs(pRow, pPayload, pFirstCreatedAtMs) {
	const CreatedAt = CreatedAtMsOf(pRow, pPayload);
	if (CreatedAt > 0 && Number.isFinite(pFirstCreatedAtMs) && pFirstCreatedAtMs > 0) {
		return Math.max(0, CreatedAt - pFirstCreatedAtMs);
	}

	const ExplicitMs = Pick(pPayload, "elapsedMs", "elapsed_ms");
	const ExplicitSec = Pick(pPayload, "elapsedSec", "elapsed_sec");
	let PayloadElapsed = 0;
	if (ExplicitMs !== "") PayloadElapsed = Math.max(PayloadElapsed, Num(ExplicitMs));
	if (ExplicitSec !== "") PayloadElapsed = Math.max(PayloadElapsed, Num(ExplicitSec) * 1000);
	return Math.max(0, PayloadElapsed);
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
		return new Date(CreatedAtMsOf(pRow)).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });
	} catch {
		return Str(Pick(pRow, "created_at", "createdAt"));
	}
}

function NormalizeReplayEvents(pReplayEvents) {
	if (!pReplayEvents.length) return [];

	let MaxElapsed = 0;
	for (const EventItem of pReplayEvents) MaxElapsed = Math.max(MaxElapsed, Num(EventItem.elapsedMs));

	if (MaxElapsed <= 0 && pReplayEvents.length > 1) {
		const CreatedValues = pReplayEvents.map((EventItem) => Num(EventItem.createdAtMs)).filter((Value) => Value > 0);
		if (CreatedValues.length > 1) {
			const FirstCreatedAt = Math.min(...CreatedValues);
			for (const EventItem of pReplayEvents) {
				if (Num(EventItem.createdAtMs) > 0) EventItem.elapsedMs = Math.max(0, Num(EventItem.createdAtMs) - FirstCreatedAt);
			}
		}
	}

	MaxElapsed = 0;
	for (const EventItem of pReplayEvents) MaxElapsed = Math.max(MaxElapsed, Num(EventItem.elapsedMs));

	if (MaxElapsed <= 0 && pReplayEvents.length > 1) {
		for (let Index = 0; Index < pReplayEvents.length; Index++) pReplayEvents[Index].elapsedMs = Index * 2000;
	}

	return pReplayEvents;
}

function SafeReplayData(pEvents, pRequestUrl) {
	const Origin = new URL(pRequestUrl).origin;
	const OrderedEvents = [...pEvents].sort((A, B) => {
		const PayloadA = PayloadOf(A);
		const PayloadB = PayloadOf(B);
		const TimeA = CreatedAtMsOf(A, PayloadA);
		const TimeB = CreatedAtMsOf(B, PayloadB);
		return TimeA - TimeB || Num(Pick(A, "id")) - Num(Pick(B, "id"));
	});
	const FirstEventWithDate = OrderedEvents.find((EventRow) => CreatedAtMsOf(EventRow, PayloadOf(EventRow)) > 0);
	const FirstCreatedAtMs = FirstEventWithDate ? CreatedAtMsOf(FirstEventWithDate, PayloadOf(FirstEventWithDate)) : 0;

	const Result = OrderedEvents.map((EventRow, Index) => {
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
			createdAtMs: CreatedAtMsOf(EventRow, Payload),
			createdAtText: EventTime(EventRow),
			elapsedMs: EventElapsedMs(EventRow, Payload, FirstCreatedAtMs),
			durationMs: Pick(Payload, "durationMs", "duration_ms"),
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

	return NormalizeReplayEvents(Result);
}

function JsonForHtml(pValue) {
	return JSON.stringify(pValue).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function ReplayViewportOf(pReplayEvents) {
	const WithViewport = pReplayEvents.find((EventItem) => Num(EventItem.viewportWidth) >= 240 && Num(EventItem.viewportHeight) >= 320);
	let Width = WithViewport ? Num(WithViewport.viewportWidth) : 1366;
	let Height = WithViewport ? Num(WithViewport.viewportHeight) : 768;

	Width = Math.max(240, Math.min(3840, Math.round(Width)));
	Height = Math.max(320, Math.min(2160, Math.round(Height)));

	return { Width, Height, IsMobile: Width <= 600 };
}

function RequestMeta(pRequestUrl, pSessionId, pPageInstanceId, pReplayEvents) {
	const ReqUrl = new URL(pRequestUrl);
	const Params = ReqUrl.searchParams;
	const FirstEvent = pReplayEvents[0] || {};
	const VisitorId = Str(Params.get("visitor_id") || Params.get("visitorId"));
	const SessionId = Str(Params.get("session_id") || Params.get("sessionId") || pSessionId);
	const PageId = Str(Params.get("page_instance_id") || Params.get("pageInstanceId") || pPageInstanceId);
	const VisitorNo = Str(Params.get("visitor_no") || Params.get("visitorNo"));
	const SessionNo = Str(Params.get("session_no") || Params.get("sessionNo"));
	const PageNo = Str(Params.get("page_no") || Params.get("pageNo"));
	const LabelParts = [];
	if (VisitorNo) LabelParts.push("V#" + VisitorNo);
	if (SessionNo) LabelParts.push("S#" + SessionNo);
	if (PageNo) LabelParts.push("P#" + PageNo);
	if (!LabelParts.length) {
		if (VisitorId) LabelParts.push("V:" + VisitorId.slice(0, 10));
		if (SessionId) LabelParts.push("S:" + SessionId.slice(0, 10));
		if (PageId) LabelParts.push("P:" + PageId.slice(0, 10));
	}
	const DeepLink = "emolive://select?visitor_id=" + encodeURIComponent(VisitorId) + "&session_id=" + encodeURIComponent(SessionId) + "&page_instance_id=" + encodeURIComponent(PageId) + "&visitor_no=" + encodeURIComponent(VisitorNo) + "&session_no=" + encodeURIComponent(SessionNo) + "&page_no=" + encodeURIComponent(PageNo);
	return {
		visitorId: VisitorId,
		sessionId: SessionId,
		pageId: PageId,
		visitorNo: VisitorNo,
		sessionNo: SessionNo,
		pageNo: PageNo,
		label: LabelParts.join(" · ") || "EmoLive Replay",
		deepLink: DeepLink,
		firstPath: FirstEvent.pagePath || ""
	};
}

function RenderReplay(pEvents, pSessionId, pPageInstanceId, pRequestUrl) {
	const ReplayEvents = SafeReplayData(pEvents, pRequestUrl).sort((A, B) => A.elapsedMs - B.elapsedMs || A.id - B.id);
	const ReplayViewport = ReplayViewportOf(ReplayEvents);
	const Meta = RequestMeta(pRequestUrl, pSessionId, pPageInstanceId, ReplayEvents);
	const FirstPage = ReplayEvents.find((EventItem) => EventItem.pageUrl)?.pageUrl || new URL("/", pRequestUrl).origin;
	const MaxEventMs = Math.max(0, ...ReplayEvents.map((EventItem) => Num(EventItem.elapsedMs)));
	const DurationMs = Math.max(MaxEventMs, ReplayEvents.length > 1 && MaxEventMs <= 0 ? (ReplayEvents.length - 1) * 1500 : 1000);
	const TimelineRows = ReplayEvents.map((EventItem, Index) => `<button class="timelineItem" type="button" data-index="${Index}"><span class="timelineNo">${Index + 1}</span><span class="timelineBody"><b>${EscapeHtml(EventItem.type)}</b><small>${EscapeHtml(EventItem.label)}</small><em>${EscapeHtml(EventItem.pagePath)}</em></span><strong>${Math.round(EventItem.elapsedMs / 1000)} ث</strong></button>`).join("\n");

	return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>EmoLive Replay</title>

<style>
:root{color-scheme:dark;--bg:#05080d;--panel:#0c131d;--line:#26384d;--text:#eef5ff;--muted:#a8b7c9;--blue:#2da5ff;--gold:#ffca4b;--red:#ff4b4b;--appH:100vh}*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;position:fixed;inset:0}body{background:#05080d;color:var(--text);font-family:system-ui,Tahoma,Arial,sans-serif;overscroll-behavior:none;touch-action:none;user-select:none}.shell{width:100vw;height:var(--appH);display:grid;grid-template-rows:auto 1fr;background:#05080d;overflow:hidden}.top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:28px 5px;gap:3px 6px;align-items:center;padding:3px 6px;background:#0c131d;border-bottom:1px solid #233348;direction:ltr}.controls{display:flex;gap:4px;align-items:center}.iconBtn{width:28px;height:26px;border:1px solid #3b5670;background:#152235;color:var(--text);border-radius:8px;font-size:14px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;line-height:1}.iconBtn:hover{border-color:var(--blue)}.speed{height:26px;background:#101925;color:var(--text);border:1px solid #3b5670;border-radius:8px;padding:0 4px;font-weight:800;max-width:56px}.meta{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align:center;font-size:11px;color:var(--muted);direction:ltr}.meta b{color:var(--text);font-size:11px}.meta a{color:#8fd0ff;text-decoration:none}.timeBox{color:var(--gold);font-weight:1000;min-width:46px;text-align:center;font-size:12px;direction:ltr}.progressRow{grid-column:1/4;height:5px}.progress{appearance:none;width:100%;height:4px;border-radius:999px;background:#233348;display:block;margin:0}.progress::-webkit-slider-thumb{appearance:none;width:13px;height:13px;border-radius:50%;background:var(--blue);cursor:pointer}.progress::-moz-range-thumb{width:13px;height:13px;border:0;border-radius:50%;background:var(--blue);cursor:pointer}.main{min-height:0;position:relative;overflow:hidden;background:#05080d}.timeline{display:none}.stageWrap{position:absolute;inset:0;overflow:hidden;background:#05080d;direction:ltr}.viewport{position:absolute;inset:0;overflow:hidden;background:#05080d}.deviceFrame{position:absolute;left:0;top:0;flex:none;width:${ReplayViewport.Width}px;height:${ReplayViewport.Height}px;transform-origin:top left;background:white;box-shadow:0 12px 60px #000d;border:1px solid #ffffff26;will-change:transform}.pageFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:white;pointer-events:none;overflow:hidden}.interactionBlock{position:absolute;inset:0;z-index:4;background:transparent;touch-action:none}.cursor{position:absolute;z-index:8;width:22px;height:22px;border:3px solid var(--red);border-radius:50%;pointer-events:none;display:none;transform:translate(-50%,-50%);box-shadow:0 0 0 8px #ff4b4b25}.cursor.pulse{animation:pulse .45s ease-out}@keyframes pulse{from{box-shadow:0 0 0 4px #ff4b4b66}to{box-shadow:0 0 0 24px #ff4b4b00}}.srOnly{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}@media(max-width:650px){.top{grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:27px 5px;padding:3px 5px}.iconBtn{width:27px;height:25px}.speed{height:25px}.meta{font-size:10px}.meta b{font-size:10px}.timeBox{font-size:11px;min-width:40px}}
</style>
</head>
<body>
<div class="shell">
	<div class="top">
		<div class="controls"><button id="restartBtn" class="iconBtn" type="button" title="من الأول">↺</button><button id="playBtn" class="iconBtn" type="button" title="تشغيل">▶</button><select id="speedSelect" class="speed"><option value="0.5">0.5x</option><option value="1" selected>1x</option><option value="2">2x</option><option value="4">4x</option><option value="8">8x</option></select></div>
		<div class="meta"><b>${EscapeHtml(Meta.label)}</b> · ${EscapeHtml(Meta.firstPath)} · ${ReplayViewport.Width}×${ReplayViewport.Height} · <a href="${EscapeHtml(Meta.deepLink)}">فتح في التطبيق</a></div>
		<div id="timeBox" class="timeBox">0 / ${Math.round(DurationMs / 1000)}ث</div>
		<div class="progressRow"><input id="progress" class="progress" type="range" min="0" max="${Math.max(1000, Math.round(DurationMs))}" step="1" value="0" /></div>
	</div>
	<div class="main">
		<section class="stageWrap"><div id="viewport" class="viewport"><div id="deviceFrame" class="deviceFrame"><iframe id="pageFrame" class="pageFrame" src="${EscapeHtml(FirstPage)}" width="${ReplayViewport.Width}" height="${ReplayViewport.Height}"></iframe><div id="interactionBlock" class="interactionBlock"></div></div></div><div id="cursor" class="cursor"></div><span id="eventBadge" class="srOnly"></span><span id="eventText" class="srOnly"></span></section>
	</div>
</div>
<script>
(() => {
const cEvents = ${JsonForHtml(ReplayEvents)};
const cReplayViewportWidth = ${ReplayViewport.Width};
const cReplayViewportHeight = ${ReplayViewport.Height};
const cReplayDurationMs = ${Math.max(1000, Math.round(DurationMs))};
const fFrame = document.getElementById("pageFrame");
const fViewport = document.getElementById("viewport");
const fDeviceFrame = document.getElementById("deviceFrame");
const fInteractionBlock = document.getElementById("interactionBlock");
const fPlayBtn = document.getElementById("playBtn");
const fRestartBtn = document.getElementById("restartBtn");
const fProgress = document.getElementById("progress");
const fSpeedSelect = document.getElementById("speedSelect");
const fTimeBox = document.getElementById("timeBox");
const fEventBadge = document.getElementById("eventBadge");
const fEventText = document.getElementById("eventText");
const fCursor = document.getElementById("cursor");
const fMaxMs = Math.max(1000, Number(cReplayDurationMs) || 1000);
let fPlaying = false;
let fStartedAt = 0;
let fBaseMs = 0;
let fAppliedIndex = -1;
let fCurrentPageUrl = fFrame.getAttribute("src") || "";
let fPendingScroll = null;
let fAnimationId = 0;
let fScale = 1;

function ViewportHeight() {
	const Visual = window.visualViewport;
	if (Visual && Number.isFinite(Visual.height) && Visual.height > 0) return Visual.height;
	return window.innerHeight || document.documentElement.clientHeight || 1;
}

function ResizeDeviceFrame() {
	const AppHeight = Math.max(1, ViewportHeight());
	document.documentElement.style.setProperty("--appH", AppHeight + "px");
	const TopBar = document.querySelector(".top");
	const TopHeight = TopBar ? Math.ceil(TopBar.getBoundingClientRect().height) : 0;
	const AvailableWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || fViewport.clientWidth || 1);
	const AvailableHeight = Math.max(1, AppHeight - TopHeight);
	const WidthScale = AvailableWidth / Math.max(1, cReplayViewportWidth);
	const HeightScale = AvailableHeight / Math.max(1, cReplayViewportHeight);
	fScale = Math.min(WidthScale, HeightScale);
	if (!Number.isFinite(fScale) || fScale <= 0) fScale = 1;
	fDeviceFrame.style.width = cReplayViewportWidth + "px";
	fDeviceFrame.style.height = cReplayViewportHeight + "px";
	fDeviceFrame.style.left = Math.max(0, (AvailableWidth - cReplayViewportWidth * fScale) / 2) + "px";
	fDeviceFrame.style.top = Math.max(0, (AvailableHeight - cReplayViewportHeight * fScale) / 2) + "px";
	fDeviceFrame.style.transform = "scale(" + fScale + ")";
}

function BlockInteraction(pEvent) {
	pEvent.preventDefault();
	pEvent.stopPropagation();
}

["pointerdown", "pointermove", "pointerup", "wheel", "touchstart", "touchmove", "touchend", "contextmenu", "click", "dblclick"].forEach((EventName) => {
	fInteractionBlock.addEventListener(EventName, BlockInteraction, { passive: false });
});
window.addEventListener("resize", ResizeDeviceFrame);
if (window.visualViewport) window.visualViewport.addEventListener("resize", ResizeDeviceFrame);
window.addEventListener("orientationchange", () => setTimeout(ResizeDeviceFrame, 250));
ResizeDeviceFrame();
setTimeout(ResizeDeviceFrame, 100);
setTimeout(ResizeDeviceFrame, 400);

fProgress.max = String(fMaxMs);

function FormatTime(pMs) {
	const Seconds = Math.round(Math.max(0, pMs) / 1000);
	if (Seconds < 60) return Seconds + "ث";
	return Math.floor(Seconds / 60) + ":" + String(Seconds % 60).padStart(2, "0");
}

function UpdateTime(pMs) {
	fTimeBox.textContent = FormatTime(pMs) + " / " + FormatTime(fMaxMs);
}

function FrameWindow() {
	try { return fFrame.contentWindow; } catch { return null; }
}

function FrameDocument() {
	try { return fFrame.contentDocument || (fFrame.contentWindow ? fFrame.contentWindow.document : null) || null; } catch { return null; }
}

function ScrollFrameToPosition(pEvent, pSmooth = true) {
	const Win = FrameWindow();
	const Doc = FrameDocument();
	if (!Win || !Doc || !Doc.documentElement) {
		fPendingScroll = pEvent;
		return;
	}
	const Body = Doc.body;
	const Root = Doc.documentElement;
	const MaxTop = Math.max(0, Math.max(Root.scrollHeight || 0, Body ? Body.scrollHeight || 0 : 0) - Win.innerHeight);
	const MaxLeft = Math.max(0, Math.max(Root.scrollWidth || 0, Body ? Body.scrollWidth || 0 : 0) - Win.innerWidth);
	let Top = Number(pEvent.scrollY);
	let Left = Number(pEvent.scrollX);
	const Percent = Number(pEvent.scrollPercent);
	if (!Number.isFinite(Top) || Top < 0) {
		if (Number.isFinite(Percent)) Top = MaxTop * Math.max(0, Math.min(100, Percent)) / 100;
		else Top = 0;
	}
	if (!Number.isFinite(Left) || Left < 0) Left = 0;
	Top = Math.max(0, Math.min(MaxTop, Top));
	Left = Math.max(0, Math.min(MaxLeft, Left));
	try { Win.scrollTo({ top: Top, left: Left, behavior: pSmooth ? "smooth" : "auto" }); } catch { Win.scrollTo(Left, Top); }
}

function ShowCursor(pEvent) {
	const X = Number(pEvent.pointerClientX);
	const Y = Number(pEvent.pointerClientY);
	if (!Number.isFinite(X) || !Number.isFinite(Y) || X <= 0 || Y <= 0) return;
	const Rect = fDeviceFrame.getBoundingClientRect();
	const ScaleX = Rect.width / Math.max(1, Number(pEvent.viewportWidth) || cReplayViewportWidth);
	const ScaleY = Rect.height / Math.max(1, Number(pEvent.viewportHeight) || cReplayViewportHeight);
	fCursor.style.left = (Rect.left + X * ScaleX) + "px";
	fCursor.style.top = (Rect.top + Y * ScaleY) + "px";
	fCursor.style.display = "block";
	fCursor.classList.remove("pulse");
	void fCursor.offsetWidth;
	fCursor.classList.add("pulse");
}

function LoadPageIfNeeded(pEvent) {
	if (!pEvent || !pEvent.pageUrl || pEvent.pageUrl === fCurrentPageUrl) return;
	fCurrentPageUrl = pEvent.pageUrl;
	fFrame.src = pEvent.pageUrl;
}

function Escape(pText) {
	return String(pText || "").replace(/[&<>"']/g, (pChar) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[pChar] || pChar));
}

function LastEventIndexAt(pMs) {
	let LastIndex = -1;
	for (let Index = 0; Index < cEvents.length; Index++) {
		if ((Number(cEvents[Index].elapsedMs) || 0) <= pMs) LastIndex = Index;
		else break;
	}
	return LastIndex;
}

function LastScrollEventAt(pMs) {
	let LastScroll = null;
	for (let Index = 0; Index < cEvents.length; Index++) {
		const EventItem = cEvents[Index];
		if ((Number(EventItem.elapsedMs) || 0) > pMs) break;
		const HasScrollY = EventItem.scrollY !== "" && EventItem.scrollY !== null && EventItem.scrollY !== undefined;
		const HasScrollPercent = EventItem.scrollPercent !== "" && EventItem.scrollPercent !== null && EventItem.scrollPercent !== undefined;
		if (HasScrollY || HasScrollPercent || String(EventItem.type || "").startsWith("scroll_")) LastScroll = EventItem;
	}
	return LastScroll;
}

function EventHasScroll(pEvent) {
	if (!pEvent) return false;
	if (String(pEvent.type || "").startsWith("scroll_")) return true;
	if (pEvent.scrollY !== "" && pEvent.scrollY !== null && pEvent.scrollY !== undefined) return true;
	if (pEvent.scrollPercent !== "" && pEvent.scrollPercent !== null && pEvent.scrollPercent !== undefined) return true;
	return false;
}

function ApplyEvent(pEvent, pIndex, pSmooth = true) {
	if (!pEvent) return;
	LoadPageIfNeeded(pEvent);
	fEventBadge.textContent = String(pIndex + 1) + " / " + String(cEvents.length);
	fEventText.innerHTML = "<b>" + Escape(String(pEvent.type || "event")) + "</b><small>" + Escape(String(pEvent.label || "")) + "</small>";
	if (EventHasScroll(pEvent)) ScrollFrameToPosition(pEvent, pSmooth);
	ShowCursor(pEvent);
}

function ApplyStateAt(pMs, pSmooth = false, pForce = false) {
	const LastIndex = LastEventIndexAt(pMs);
	if (LastIndex >= 0 && (pForce || LastIndex !== fAppliedIndex)) {
		fAppliedIndex = LastIndex;
		ApplyEvent(cEvents[LastIndex], LastIndex, pSmooth);
	}
	const LastScroll = LastScrollEventAt(pMs);
	if (LastScroll) ScrollFrameToPosition(LastScroll, pSmooth);
	else ScrollFrameToPosition({ scrollX: 0, scrollY: 0, scrollPercent: 0 }, false);
}

function Seek(pMs, pSmooth = false) {
	const TimeMs = Math.max(0, Math.min(fMaxMs, Number(pMs) || 0));
	fBaseMs = TimeMs;
	fStartedAt = performance.now();
	fProgress.value = String(Math.round(TimeMs));
	UpdateTime(TimeMs);
	fAppliedIndex = -1;
	ApplyStateAt(TimeMs, pSmooth, true);
}

function StopAnimation() {
	if (fAnimationId) cancelAnimationFrame(fAnimationId);
	fAnimationId = 0;
}

function Tick(pNow) {
	if (!fPlaying) return;
	const Speed = Number(fSpeedSelect.value) || 1;
	const TimeMs = Math.min(fMaxMs, fBaseMs + (pNow - fStartedAt) * Speed);
	fProgress.value = String(Math.round(TimeMs));
	UpdateTime(TimeMs);
	const LastIndex = LastEventIndexAt(TimeMs);
	if (LastIndex !== fAppliedIndex) {
		const DirectionBack = LastIndex < fAppliedIndex;
		fAppliedIndex = -1;
		ApplyStateAt(TimeMs, !DirectionBack, true);
	}
	if (TimeMs >= fMaxMs) {
		fPlaying = false;
		fPlayBtn.textContent = "▶";
		fBaseMs = fMaxMs;
		StopAnimation();
		return;
	}
	fAnimationId = requestAnimationFrame(Tick);
}

function Play() {
	if (!cEvents.length) return;
	if (fPlaying) {
		fPlaying = false;
		fBaseMs = Number(fProgress.value) || 0;
		fPlayBtn.textContent = "▶";
		StopAnimation();
		return;
	}
	if ((Number(fProgress.value) || 0) >= fMaxMs) Seek(0, false);
	fPlaying = true;
	fStartedAt = performance.now();
	fBaseMs = Number(fProgress.value) || 0;
	fPlayBtn.textContent = "⏸";
	StopAnimation();
	fAnimationId = requestAnimationFrame(Tick);
}

fFrame.addEventListener("load", () => {
	ResizeDeviceFrame();
	setTimeout(() => {
		if (fPendingScroll !== null) {
			const PendingEvent = fPendingScroll;
			fPendingScroll = null;
			ScrollFrameToPosition(PendingEvent, false);
		} else {
			ApplyStateAt(Number(fProgress.value) || 0, false, true);
		}
	}, 250);
});
fPlayBtn.addEventListener("click", Play);
fRestartBtn.addEventListener("click", () => { fPlaying = false; fPlayBtn.textContent = "▶"; StopAnimation(); Seek(0, false); });
fProgress.addEventListener("input", () => { fPlaying = false; fPlayBtn.textContent = "▶"; StopAnimation(); Seek(Number(fProgress.value) || 0, false); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) ResizeDeviceFrame(); });
UpdateTime(0);
if (cEvents.length) Seek(0, false); else fEventText.textContent = "";
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
