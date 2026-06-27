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

function ParseDateMs(pValue) {
	const Text = Str(pValue);
	if (!Text) return 0;
	const Parsed = Date.parse(Text);
	return Number.isFinite(Parsed) ? Parsed : 0;
}

function ClientCreatedAtMsOf(pPayload) {
	return ParseDateMs(Pick(pPayload, "createdAtClient", "created_at_client", "clientCreatedAt", "client_created_at"));
}

function ServerCreatedAtMsOf(pRow) {
	return ParseDateMs(Pick(pRow, "created_at", "createdAt", "createdAtServer", "created_at_server"));
}

function CreatedAtMsOf(pRow, pPayload = null) {
	const Payload = pPayload || PayloadOf(pRow);
	return ClientCreatedAtMsOf(Payload) || ServerCreatedAtMsOf(pRow);
}

function ExplicitElapsedMsOf(pPayload) {
	const ExplicitMs = Pick(pPayload, "elapsedMs", "elapsed_ms");
	const ExplicitSec = Pick(pPayload, "elapsedSec", "elapsed_sec");
	if (ExplicitMs !== "") return Math.max(0, Num(ExplicitMs));
	if (ExplicitSec !== "") return Math.max(0, Num(ExplicitSec) * 1000);
	return -1;
}

function EventElapsedMs(pRow, pPayload, pFirstCreatedAtMs) {
	const CreatedAt = CreatedAtMsOf(pRow, pPayload);
	if (CreatedAt > 0 && Number.isFinite(pFirstCreatedAtMs) && pFirstCreatedAtMs > 0) {
		return Math.max(0, CreatedAt - pFirstCreatedAtMs);
	}

	const PayloadElapsed = ExplicitElapsedMsOf(pPayload);
	if (PayloadElapsed >= 0) return PayloadElapsed;

	return 0;
}

function ExplicitDurationMsOf(pEvent) {
	const DurationValue = Pick(pEvent, "durationMs", "duration_ms");
	if (DurationValue === "") return 0;
	return Math.max(0, Num(DurationValue));
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

function LowerType(pEventType) {
	return Str(pEventType).toLowerCase();
}

function EventSearchText(pEvent) {
	return Str([
		pEvent && pEvent.type,
		pEvent && pEvent.eventOn,
		pEvent && pEvent.label,
		pEvent && pEvent.targetText,
		pEvent && pEvent.widget,
		pEvent && pEvent.href
	].join(" ")).toLowerCase();
}

function IsReplayOnlyMotionType(pEventType) {
	const Type = LowerType(pEventType);
	return Type === "pointer_move" || Type === "mouse_move" || Type === "touch_move" || Type === "scroll_move";
}

function IsReplayVisualEventType(pEventType) {
	const Type = LowerType(pEventType);
	if (!Type) return false;
	if (Type === "page_ping" || Type === "heartbeat" || Type === "clarity_link" || Type.includes("clarity")) return false;
	if (Type.startsWith("ops_")) return false;
	return true;
}

function IsCallEvent(pEvent) {
	const Text = EventSearchText(pEvent);
	return Text.includes("call") || Text.includes("phone") || Text.includes("tel:") || Text.includes("اتصال") || Text.includes("تليفون") || Text.includes("هاتف");
}

function IsWhatsappEvent(pEvent) {
	const Text = EventSearchText(pEvent);
	return Text.includes("whatsapp") || Text.includes("wa.me") || Text.includes("واتساب") || Text.includes("واتس");
}

function IsFullReadEvent(pEvent) {
	const Type = LowerType(pEvent && pEvent.type);
	return Type === "read_full" || Type === "read" || Type === "read_stay" || Type.endsWith("_stay");
}

function IsQuickReadEvent(pEvent) {
	const Type = LowerType(pEvent && pEvent.type);
	return Type === "read_quick" || Type === "read_skim" || Type === "skim" || Type === "skimming";
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

	pReplayEvents.sort((A, B) => {
		const ElapsedA = Num(A.elapsedMs);
		const ElapsedB = Num(B.elapsedMs);
		const SeqA = Num(A.clientEventSeq);
		const SeqB = Num(B.clientEventSeq);
		return ElapsedA - ElapsedB || SeqA - SeqB || Num(A.id) - Num(B.id) || Num(A.index) - Num(B.index);
	});

	let MaxElapsed = 0;
	for (const EventItem of pReplayEvents) MaxElapsed = Math.max(MaxElapsed, Num(EventItem.elapsedMs));
	if (MaxElapsed <= 0 && pReplayEvents.length > 1) {
		for (let Index = 0; Index < pReplayEvents.length; Index++) pReplayEvents[Index].elapsedMs = Index * 1500;
	}

	let LastElapsed = -1;
	for (const EventItem of pReplayEvents) {
		let Elapsed = Math.max(0, Num(EventItem.elapsedMs));
		if (Elapsed < LastElapsed) Elapsed = LastElapsed;
		EventItem.elapsedMs = Elapsed;
		LastElapsed = Elapsed;
	}

	return pReplayEvents;
}

function IsReplayDurationEvent(pEvent) {
	const Type = LowerType(pEvent && pEvent.type);
	if (!IsReplayVisualEventType(Type)) return false;
	if (IsReplayOnlyMotionType(Type)) return false;
	if (Type === "page_ping" || Type === "heartbeat" || Type === "clarity_link") return false;
	if (Type === "page_exit" || Type === "page_close" || Type === "visibility_hidden" || Type === "page_hidden") return false;
	return true;
}

function ReplayDurationMsOf(pReplayEvents) {
	let MaxElapsed = 0;
	for (const EventItem of pReplayEvents) {
		if (!IsReplayDurationEvent(EventItem)) continue;
		MaxElapsed = Math.max(MaxElapsed, Num(EventItem.elapsedMs));
	}
	if (MaxElapsed <= 0) {
		for (const EventItem of pReplayEvents) {
			if (IsReplayOnlyMotionType(EventItem.type)) continue;
			MaxElapsed = Math.max(MaxElapsed, Num(EventItem.elapsedMs));
		}
	}
	if (MaxElapsed <= 0) return pReplayEvents.length > 1 ? (pReplayEvents.length - 1) * 1500 : 1000;
	return Math.max(1000, Math.round(MaxElapsed));
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
	const PageStarts = new Map();
	const FallbackDates = [];
	for (const EventRow of OrderedEvents) {
		const Payload = PayloadOf(EventRow);
		const CreatedAt = CreatedAtMsOf(EventRow, Payload);
		if (CreatedAt > 0) FallbackDates.push(CreatedAt);
		const ExplicitElapsed = ExplicitElapsedMsOf(Payload);
		if (CreatedAt > 0 && ExplicitElapsed >= 0) {
			const Key = PageInstanceKeyOf(EventRow, Payload);
			const StartAt = CreatedAt - ExplicitElapsed;
			if (!PageStarts.has(Key) || StartAt < PageStarts.get(Key)) PageStarts.set(Key, StartAt);
		}
	}
	const StartCandidates = [...PageStarts.values()].filter((Value) => Number.isFinite(Value) && Value > 0);
	const SessionStartMs = StartCandidates.length ? Math.min(...StartCandidates) : (FallbackDates.length ? Math.min(...FallbackDates) : 0);
	function AbsoluteElapsedMs(EventRow, Payload) {
		const ExplicitElapsed = ExplicitElapsedMsOf(Payload);
		const Key = PageInstanceKeyOf(EventRow, Payload);
		if (ExplicitElapsed >= 0 && PageStarts.has(Key) && SessionStartMs > 0) return Math.max(0, PageStarts.get(Key) + ExplicitElapsed - SessionStartMs);
		const CreatedAt = CreatedAtMsOf(EventRow, Payload);
		if (CreatedAt > 0 && SessionStartMs > 0) return Math.max(0, CreatedAt - SessionStartMs);
		return Math.max(0, ExplicitElapsed);
	}

	const VisualEvents = OrderedEvents.filter((EventRow) => IsReplayVisualEventType(EventTypeOf(EventRow, PayloadOf(EventRow))));

	const Result = VisualEvents.map((EventRow, Index) => {
		const Payload = PayloadOf(EventRow);
		const EventType = EventTypeOf(EventRow, Payload);
		const PagePath = PagePathOf(EventRow, Payload);
		const PageUrl = new URL(PagePath || "/", Origin);
		PageUrl.searchParams.set("emoReplay", "1");
		PageUrl.searchParams.set("emo_replay", "1");

		const PageReplayUrl = ReplayProxyUrlOf(PageUrl.toString(), pRequestUrl);

		return {
			index: Index,
			id: Num(Pick(EventRow, "id"), Index + 1),
			type: EventType,
			label: EventLabel(EventRow, Payload),
			eventOn: Str(Pick(Payload, "eventOn", "event_on")),
			pagePath: PagePath,
			pageTitle: PageTitleOf(EventRow, Payload),
			pageUrl: PageReplayUrl,
			livePageUrl: PageUrl.toString(),
			createdAtMs: CreatedAtMsOf(EventRow, Payload),
			createdAtText: EventTime(EventRow),
			clientEventSeq: Num(Pick(Payload, "clientEventSeq", "client_event_seq")),
			elapsedMs: AbsoluteElapsedMs(EventRow, Payload),
			durationMs: Pick(Payload, "durationMs", "duration_ms"),
			scrollPercent: ScrollPercentOf(EventType, Payload),
			scrollX: Pick(Payload, "scrollX", "scroll_x"),
			scrollY: Pick(Payload, "scrollY", "scroll_y"),
			viewportWidth: Pick(Payload, "viewportWidth", "viewport_width"),
			viewportHeight: Pick(Payload, "viewportHeight", "viewport_height"),
			pointerClientX: Pick(Payload, "pointerClientX", "pointer_client_x"),
			pointerClientY: Pick(Payload, "pointerClientY", "pointer_client_y"),
			href: Str(Pick(Payload, "href")),
			value: Pick(Payload, "value"),
			targetSelector: Str(Pick(Payload, "targetSelector", "target_selector")),
			targetText: Str(Pick(Payload, "targetText", "target_text"))
		};
	});

	return NormalizeReplayEvents(Result);
}

function JsonForHtml(pValue) {
	return JSON.stringify(pValue).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function UrlPathOf(pValue) {
	const Text = Str(pValue) || "/";
	try {
		const Parsed = new URL(Text, "https://emocrete.com");
		return Parsed.pathname + Parsed.search + Parsed.hash;
	} catch {
		return Text.startsWith("/") ? Text : "/" + Text;
	}
}

function PageInstanceKeyOf(pRow, pPayload) {
	return Str(Pick(pRow, "page_instance_id", "pageInstanceId") || Pick(pPayload, "pageInstanceId", "page_instance_id") || PagePathOf(pRow, pPayload));
}

function ReplayProxyUrlOf(pPageUrl, pRequestUrl) {
	const ReqUrl = new URL(pRequestUrl);
	const ProxyUrl = new URL(ReqUrl.origin + ReqUrl.pathname);
	ProxyUrl.searchParams.set("raw", "1");
	ProxyUrl.searchParams.set("path", UrlPathOf(pPageUrl));
	const Key = Str(ReqUrl.searchParams.get("key") || ReqUrl.searchParams.get("k"));
	if (Key) ProxyUrl.searchParams.set("key", Key);
	return ProxyUrl.toString();
}

function ShouldStripScript(pScriptTag) {
	const Text = String(pScriptTag || "").toLowerCase();
	return Text.includes("googletagmanager.com")
		|| Text.includes("google-analytics.com")
		|| Text.includes("/gtag/js")
		|| Text.includes("gtag(")
		|| Text.includes("dataLayer")
		|| Text.includes("clarity.ms")
		|| Text.includes("clarity(")
		|| Text.includes("/api/ops/visit")
		|| Text.includes("opsvisittracker")
		|| Text.includes("emo_ops_");
}

function SanitizeReplayHtml(pHtml, pSourceUrl) {
	let HtmlText = String(pHtml || "");
	const SourceUrl = new URL(pSourceUrl);
	const BaseHref = SourceUrl.href;

	HtmlText = HtmlText.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (Match) => ShouldStripScript(Match) ? "" : Match);
	HtmlText = HtmlText.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, (Match) => /googletagmanager|google-analytics|clarity|ops\/visit/i.test(Match) ? "" : Match);
	HtmlText = HtmlText.replace(/<base\b[^>]*>/gi, "");
	HtmlText = HtmlText.replace(/\s+ping\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

	const InjectHead = `
<base href="${EscapeHtml(BaseHref)}">
<meta name="robots" content="noindex,nofollow,noarchive">
<script>
window.__EMO_REPLAY__=true;
window.__EMO_NO_ANALYTICS__=true;
window.dataLayer=[];
window.gtag=function(){};
window.clarity=function(){};
window.fbq=function(){};
</script>
<style>
html,body{overscroll-behavior:none!important;}
*{scroll-behavior:auto!important;}
</style>`;

	if (/<head\b[^>]*>/i.test(HtmlText)) {
		HtmlText = HtmlText.replace(/<head\b([^>]*)>/i, `<head$1>${InjectHead}`);
	} else if (/<html\b[^>]*>/i.test(HtmlText)) {
		HtmlText = HtmlText.replace(/<html\b([^>]*)>/i, `<html$1><head>${InjectHead}</head>`);
	} else {
		HtmlText = `<!doctype html><html><head>${InjectHead}</head><body>${HtmlText}</body></html>`;
	}

	return HtmlText;
}

async function RenderRawReplayPage(pRequest) {
	if (!CheckOpsKey(pRequest)) return Html("Unauthorized", 401);
	const ReqUrl = new URL(pRequest.url);
	const Path = UrlPathOf(ReqUrl.searchParams.get("path") || "/");
	const SourceUrl = new URL(Path, ReqUrl.origin);
	SourceUrl.searchParams.set("emoReplay", "1");
	SourceUrl.searchParams.set("emo_replay", "1");
	SourceUrl.searchParams.set("emoNoAnalytics", "1");

	const Res = await fetch(SourceUrl.toString(), {
		headers: {
			"user-agent": "EmoLiveReplay/1.0",
			"accept": "text/html,application/xhtml+xml"
		},
		redirect: "follow"
	});

	const Text = await Res.text();
	if (!Res.ok) return Html(EscapeHtml(Text), Res.status || 500);
	return Html(SanitizeReplayHtml(Text, SourceUrl.toString()), 200);
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
	const DurationMs = ReplayDurationMsOf(ReplayEvents);
	const TimelineRows = ReplayEvents.map((EventItem, Index) => `<button class="timelineItem" type="button" data-index="${Index}"><span class="timelineNo">${Index + 1}</span><span class="timelineBody"><b>${EscapeHtml(EventItem.type)}</b><small>${EscapeHtml(EventItem.label)}</small><em>${EscapeHtml(EventItem.pagePath)}</em></span><strong>${Math.round(EventItem.elapsedMs / 1000)} ث</strong></button>`).join("\n");

	return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>EmoLive Replay</title>

<style>
:root{color-scheme:dark;--bg:#05080d;--panel:#0c131d;--line:#26384d;--text:#eef5ff;--muted:#a8b7c9;--blue:#2da5ff;--gold:#ffca4b;--red:#ff4b4b;--appH:100vh}*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;position:fixed;inset:0}body{background:#05080d;color:var(--text);font-family:system-ui,Tahoma,Arial,sans-serif;overscroll-behavior:none;touch-action:none;user-select:none}.shell{width:100vw;height:var(--appH);display:grid;grid-template-rows:auto 1fr;background:#05080d;overflow:hidden}.top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:28px 5px;gap:3px 6px;align-items:center;padding:3px 6px;background:#0c131d;border-bottom:1px solid #233348;direction:ltr}.controls{display:flex;gap:4px;align-items:center}.iconBtn{width:28px;height:26px;border:1px solid #3b5670;background:#152235;color:var(--text);border-radius:8px;font-size:14px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;line-height:1}.iconBtn:hover{border-color:var(--blue)}.speed{height:26px;background:#101925;color:var(--text);border:1px solid #3b5670;border-radius:8px;padding:0 4px;font-weight:800;max-width:56px}.meta{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align:center;font-size:11px;color:var(--muted);direction:ltr}.meta b{color:var(--text);font-size:11px}.meta a{color:#8fd0ff;text-decoration:none}.timeBox{color:var(--gold);font-weight:1000;min-width:46px;text-align:center;font-size:12px;direction:ltr}.progressRow{grid-column:1/4;height:7px;position:relative}.trackLayer{position:absolute;left:0;right:0;top:1px;height:5px;border-radius:999px;overflow:visible;background:#233348;pointer-events:none;z-index:7}.trackSegment{position:absolute;top:0;height:100%;opacity:.9}.trackSegment.full{background:#16c784}.trackSegment.quick{background:#ff9f1a}.trackMarker{position:absolute;top:50%;transform:translate(-50%,-50%);font-size:14px;line-height:1;text-shadow:0 1px 4px #000;z-index:12}.progress{appearance:none;position:relative;z-index:8;background:transparent!important;width:100%;height:5px;border-radius:999px;display:block;margin:0}.progress::-webkit-slider-runnable-track{height:5px;background:transparent!important}.progress::-moz-range-track{height:5px;background:transparent!important}.progress::-webkit-slider-thumb{appearance:none;width:13px;height:13px;border-radius:50%;background:var(--blue);cursor:pointer;margin-top:-4px}.progress::-moz-range-thumb{width:13px;height:13px;border:0;border-radius:50%;background:var(--blue);cursor:pointer}.main{min-height:0;position:relative;overflow:hidden;background:#05080d}.timeline{display:none}.stageWrap{position:absolute;inset:0;overflow:hidden;background:#05080d;direction:ltr}.viewport{position:absolute;inset:0;overflow:hidden;background:#05080d}.deviceFrame{position:absolute;left:0;top:0;flex:none;width:${ReplayViewport.Width}px;height:${ReplayViewport.Height}px;transform-origin:top left;background:white;box-shadow:0 12px 60px #000d;border:1px solid #ffffff26;will-change:transform;overflow:hidden}.pageFrame{position:absolute;inset:0;width:100%;height:100%;border:0;background:white;pointer-events:none;overflow:hidden}.interactionBlock{position:absolute;inset:0;z-index:4;background:transparent;touch-action:none}.trailLayer{position:absolute;inset:0;z-index:7;pointer-events:none}.trailPoint{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none}.trailPoint.mouse{background:#ff4b4b;box-shadow:0 0 14px #ff4b4bcc}.trailPoint.touch{background:#ffd233;box-shadow:0 0 14px #ffd233cc}.cursor{position:absolute;z-index:8;width:22px;height:22px;border:3px solid var(--red);border-radius:50%;pointer-events:none;display:none;transform:translate(-50%,-50%);box-shadow:0 0 0 8px #ff4b4b25}.cursor.pulse{animation:pulse .45s ease-out}.cursor.clicking{background:var(--red);border-color:var(--red)}.rotatedReplay .shell{grid-template-rows:1fr}.rotatedReplay .top{position:fixed;z-index:40;left:auto;right:0;top:0;width:var(--appH);height:38px;transform-origin:top right;transform:rotate(90deg);border:1px solid #233348;border-radius:10px;box-shadow:0 8px 30px #0008;overflow:visible}.rotatedReplay .main{grid-row:1/2}.rotatedReplay .progressRow{height:8px}.rotatedReplay .trackLayer{top:2px}.rotatedReplay .progress{height:8px}.rotatedReplay .progress::-webkit-slider-runnable-track{height:5px}.rotatedReplay .progress::-moz-range-track{height:5px}.replayToast{position:absolute;z-index:12;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);min-width:96px;max-width:min(80vw,360px);padding:10px 18px;border-radius:999px;border:1px solid #ffffff3a;background:#05080ddf;color:#fff;font-weight:1000;font-size:20px;text-align:center;box-shadow:0 16px 50px #000b;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease}.replayToast.show{opacity:1;transform:translate(-50%,-50%) scale(1)}@keyframes pulse{from{box-shadow:0 0 0 4px #ff4b4b66}to{box-shadow:0 0 0 24px #ff4b4b00}}.srOnly{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}@media(max-width:650px){.top{grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:27px 5px;padding:3px 5px}.iconBtn{width:27px;height:25px}.speed{height:25px}.meta{font-size:10px}.meta b{font-size:10px}.timeBox{font-size:11px;min-width:40px}}
</style>
</head>
<body>
<div class="shell">
	<div class="top">
		<div class="controls"><button id="restartBtn" class="iconBtn" type="button" title="من الأول">↺</button><button id="playBtn" class="iconBtn" type="button" title="تشغيل">▶</button><select id="speedSelect" class="speed"><option value="0.5">0.5x</option><option value="1" selected>1x</option><option value="2">2x</option><option value="4">4x</option><option value="8">8x</option></select></div>
		<div class="meta"><b>${EscapeHtml(Meta.label)}</b> · ${EscapeHtml(Meta.firstPath)} · ${ReplayViewport.Width}×${ReplayViewport.Height} · <a href="${EscapeHtml(Meta.deepLink)}">فتح في التطبيق</a></div>
		<div id="timeBox" class="timeBox">0 / ${Math.round(DurationMs / 1000)}ث</div>
		<div class="progressRow"><div id="trackLayer" class="trackLayer"></div><input id="progress" class="progress" type="range" min="0" max="${Math.max(1000, Math.round(DurationMs))}" step="1" value="0" /></div>
	</div>
	<div class="main">
		<section class="stageWrap"><div id="viewport" class="viewport"><div id="deviceFrame" class="deviceFrame"><iframe id="pageFrame" class="pageFrame" src="${EscapeHtml(FirstPage)}" width="${ReplayViewport.Width}" height="${ReplayViewport.Height}"></iframe><div id="interactionBlock" class="interactionBlock"></div><div id="trailLayer" class="trailLayer"></div><div id="cursor" class="cursor"></div><div id="replayToast" class="replayToast"></div></div></div><span id="eventBadge" class="srOnly"></span><span id="eventText" class="srOnly"></span></section>
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
const fTrailLayer = document.getElementById("trailLayer");
const cReplayIsMobile = cReplayViewportWidth <= 600 || cReplayViewportHeight > cReplayViewportWidth;
const fReplayToast = document.getElementById("replayToast");
const fTrackLayer = document.getElementById("trackLayer");
const fMaxMs = Math.max(1000, Number(cReplayDurationMs) || 1000);
let fPlaying = false;
let fStartedAt = 0;
let fBaseMs = 0;
let fAppliedIndex = -1;
let fNextEventIndex = 0;
let fToastTimer = 0;
let fCurrentPageUrl = fFrame.getAttribute("src") || "";
let fPendingScroll = null;
let fAnimationId = 0;
let fScale = 1;
let fScrollAnimationId = 0;
let fLastFramePagePath = "";
let fTemporarySpeed = 0;

function ViewportHeight() {
	const Visual = window.visualViewport;
	if (Visual && Number.isFinite(Visual.height) && Visual.height > 0) return Visual.height;
	return window.innerHeight || document.documentElement.clientHeight || 1;
}

function ResizeDeviceFrame() {
	const AppHeight = Math.max(1, ViewportHeight());
	document.documentElement.style.setProperty("--appH", AppHeight + "px");
	const AvailableWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || fViewport.clientWidth || 1);
	const SourceIsDesktopLandscape = cReplayViewportWidth >= 900 && cReplayViewportWidth > cReplayViewportHeight;
	const ViewerIsPortraitMobile = AvailableWidth <= 700 && AppHeight > AvailableWidth;
	const RotateForMobilePreview = SourceIsDesktopLandscape && ViewerIsPortraitMobile;
	document.body.classList.toggle("rotatedReplay", RotateForMobilePreview);

	const TopBar = document.querySelector(".top");
	const NormalTopHeight = TopBar && !RotateForMobilePreview ? Math.ceil(TopBar.offsetHeight || TopBar.getBoundingClientRect().height || 0) : 0;
	const RotatedControlThickness = RotateForMobilePreview ? 40 : 0;
	const StageWidth = Math.max(80, AvailableWidth - RotatedControlThickness);
	const StageHeight = Math.max(80, RotateForMobilePreview ? AppHeight : AppHeight - NormalTopHeight);
	const FitWidth = RotateForMobilePreview ? cReplayViewportHeight : cReplayViewportWidth;
	const FitHeight = RotateForMobilePreview ? cReplayViewportWidth : cReplayViewportHeight;
	const WidthScale = StageWidth / Math.max(1, FitWidth);
	const HeightScale = StageHeight / Math.max(1, FitHeight);
	fScale = Math.min(WidthScale, HeightScale);
	if (!Number.isFinite(fScale) || fScale <= 0) fScale = 1;

	fDeviceFrame.style.width = cReplayViewportWidth + "px";
	fDeviceFrame.style.height = cReplayViewportHeight + "px";
	fDeviceFrame.style.left = Math.max(0, (StageWidth - FitWidth * fScale) / 2) + "px";
	fDeviceFrame.style.top = Math.max(0, (StageHeight - FitHeight * fScale) / 2) + "px";
	if (RotateForMobilePreview) {
		fDeviceFrame.style.transform = "translateX(" + (cReplayViewportHeight * fScale) + "px) rotate(90deg) scale(" + fScale + ")";
	} else {
		fDeviceFrame.style.transform = "scale(" + fScale + ")";
	}
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

function CancelScrollAnimation() {
	if (fScrollAnimationId) cancelAnimationFrame(fScrollAnimationId);
	fScrollAnimationId = 0;
}

function TargetScrollFromEvent(pEvent) {
	const Win = FrameWindow();
	const Doc = FrameDocument();
	if (!Win || !Doc || !Doc.documentElement) return null;
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
	return { Win, Top, Left };
}

function ScrollFrameToPosition(pEvent, pSmooth = true) {
	const Target = TargetScrollFromEvent(pEvent);
	if (!Target) {
		fPendingScroll = pEvent;
		return;
	}
	CancelScrollAnimation();
	const StartTop = Number(Target.Win.scrollY || Target.Win.pageYOffset || 0);
	const StartLeft = Number(Target.Win.scrollX || Target.Win.pageXOffset || 0);
	const DeltaTop = Target.Top - StartTop;
	const DeltaLeft = Target.Left - StartLeft;
	if (!pSmooth || (Math.abs(DeltaTop) < 2 && Math.abs(DeltaLeft) < 2)) {
		Target.Win.scrollTo(Target.Left, Target.Top);
		return;
	}
	const Duration = Math.max(260, Math.min(1350, Math.abs(DeltaTop) * 0.55));
	const StartedAt = performance.now();
	function Step(Now) {
		const T = Math.max(0, Math.min(1, (Now - StartedAt) / Duration));
		const Ease = T < .5 ? 2 * T * T : 1 - Math.pow(-2 * T + 2, 2) / 2;
		Target.Win.scrollTo(StartLeft + DeltaLeft * Ease, StartTop + DeltaTop * Ease);
		if (T < 1) fScrollAnimationId = requestAnimationFrame(Step);
		else fScrollAnimationId = 0;
	}
	fScrollAnimationId = requestAnimationFrame(Step);
}

function PointerPointOf(pEvent) {
	const X = Number(pEvent && pEvent.pointerClientX);
	const Y = Number(pEvent && pEvent.pointerClientY);
	if (!Number.isFinite(X) || !Number.isFinite(Y) || X <= 0 || Y <= 0) return null;
	const BaseW = Number(pEvent.viewportWidth) || cReplayViewportWidth;
	const BaseH = Number(pEvent.viewportHeight) || cReplayViewportHeight;
	return {
		x: Math.max(0, Math.min(cReplayViewportWidth, X * cReplayViewportWidth / Math.max(1, BaseW))),
		y: Math.max(0, Math.min(cReplayViewportHeight, Y * cReplayViewportHeight / Math.max(1, BaseH)))
	};
}

function MoveCursorTo(pEvent, pPulse = false) {
	const Point = PointerPointOf(pEvent);
	if (!Point) return;
	fCursor.style.left = Point.x + "px";
	fCursor.style.top = Point.y + "px";
	fCursor.style.display = "block";
	if (pPulse) {
		fCursor.classList.remove("pulse", "clicking");
		void fCursor.offsetWidth;
		fCursor.classList.add("pulse", "clicking");
		setTimeout(() => fCursor.classList.remove("clicking"), 420);
	}
}

function ShowCursor(pEvent) {
	MoveCursorTo(pEvent, true);
}

function EventHasPointer(pEvent) {
	return Number.isFinite(Number(pEvent && pEvent.pointerClientX)) && Number.isFinite(Number(pEvent && pEvent.pointerClientY));
}

function RenderPointerTrail(pMs) {
	if (!fTrailLayer) return;
	fTrailLayer.innerHTML = "";
	const TrailEvents = [];
	for (const EventItem of cEvents) {
		const EventTime = Number(EventItem.elapsedMs) || 0;
		if (EventTime < pMs - 2000 || EventTime > pMs) continue;
		if (EventHasPointer(EventItem)) TrailEvents.push(EventItem);
	}
	for (const EventItem of TrailEvents) {
		const Point = PointerPointOf(EventItem);
		if (!Point) continue;
		const Age = Math.max(0, pMs - (Number(EventItem.elapsedMs) || 0));
		const Opacity = Math.max(0, 1 - Age / 2000);
		const Dot = document.createElement("span");
		Dot.className = "trailPoint " + (cReplayIsMobile ? "touch" : "mouse");
		const Size = cReplayIsMobile ? 24 : Math.max(6, 22 * Opacity);
		Dot.style.width = Size + "px";
		Dot.style.height = Size + "px";
		Dot.style.left = Point.x + "px";
		Dot.style.top = Point.y + "px";
		Dot.style.opacity = String(cReplayIsMobile ? Opacity * 0.82 : Opacity * 0.72);
		fTrailLayer.appendChild(Dot);
	}
}

function UpdateCursorForTime(pMs) {
	RenderPointerTrail(pMs);
	let Prev = null;
	let Next = null;
	for (let Index = 0; Index < cEvents.length; Index++) {
		const EventItem = cEvents[Index];
		if (!EventHasPointer(EventItem)) continue;
		const EventTime = Number(EventItem.elapsedMs) || 0;
		if (EventTime <= pMs) Prev = EventItem;
		else { Next = EventItem; break; }
	}
	if (!Prev && Next) return MoveCursorTo(Next, false);
	if (Prev && !Next) return MoveCursorTo(Prev, false);
	if (!Prev || !Next) return;
	const PrevTime = Number(Prev.elapsedMs) || 0;
	const NextTime = Number(Next.elapsedMs) || PrevTime + 1;
	const Ratio = Math.max(0, Math.min(1, (pMs - PrevTime) / Math.max(1, NextTime - PrevTime)));
	const Mixed = {
		pointerClientX: Number(Prev.pointerClientX) + (Number(Next.pointerClientX) - Number(Prev.pointerClientX)) * Ratio,
		pointerClientY: Number(Prev.pointerClientY) + (Number(Next.pointerClientY) - Number(Prev.pointerClientY)) * Ratio,
		viewportWidth: Next.viewportWidth || Prev.viewportWidth,
		viewportHeight: Next.viewportHeight || Prev.viewportHeight
	};
	MoveCursorTo(Mixed, false);
}

function LoadPageIfNeeded(pEvent) {
	if (!pEvent || !pEvent.pageUrl || pEvent.pageUrl === fCurrentPageUrl) return false;
	fCurrentPageUrl = pEvent.pageUrl;
	fFrame.src = pEvent.pageUrl;
	const PathText = String(pEvent.pageTitle || pEvent.pagePath || "صفحة جديدة");
	ShowReplayToast("انتقال إلى " + PathText);
	fLastFramePagePath = String(pEvent.pagePath || "");
	return true;
}

function Escape(pText) {
	return String(pText || "").replace(/[&<>"']/g, (pChar) => {
		if (pChar === "&") return "&amp;";
		if (pChar === "<") return "&lt;";
		if (pChar === ">") return "&gt;";
		if (pChar === String.fromCharCode(34)) return "&quot;";
		if (pChar === "'") return "&#39;";
		return pChar;
	});
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

function ClickToastText(pEvent) {
	if (!pEvent) return "";
	const Type = String(pEvent.type || "").toLowerCase();
	const EventOn = String(pEvent.eventOn || "").toLowerCase();
	if (IsCallEvent(pEvent)) return "كليك اتصال";
	if (IsWhatsappEvent(pEvent)) return "كليك واتساب";
	if (Type.includes("click") || EventOn === "click") return "كليك";
	return "";
}

function ShowReplayToast(pText) {
	const Text = String(pText || "").trim();
	if (!Text) return;
	if (fToastTimer) clearTimeout(fToastTimer);
	fReplayToast.textContent = Text;
	fReplayToast.classList.add("show");
	fToastTimer = setTimeout(() => { fReplayToast.classList.remove("show"); }, 3000);
}

function EventHasScroll(pEvent) {
	if (!pEvent) return false;
	if (String(pEvent.type || "").startsWith("scroll_")) return true;
	if (pEvent.scrollY !== "" && pEvent.scrollY !== null && pEvent.scrollY !== undefined) return true;
	if (pEvent.scrollPercent !== "" && pEvent.scrollPercent !== null && pEvent.scrollPercent !== undefined) return true;
	return false;
}

function IsClickEvent(pEvent) {
	const Type = String(pEvent && pEvent.type || "").toLowerCase();
	const EventOn = String(pEvent && pEvent.eventOn || "").toLowerCase();
	return EventOn === "click" || Type.includes("click") || Type.includes("faq_open");
}

function DispatchReplayClick(pEvent) {
	if (!IsClickEvent(pEvent)) return;
	const Win = FrameWindow();
	const Doc = FrameDocument();
	if (!Win || !Doc) return;
	let Target = null;
	const Selector = String(pEvent.targetSelector || "").trim();
	if (Selector) {
		try { Target = Doc.querySelector(Selector); } catch {}
	}
	if (!Target) {
		const X = Number(pEvent.pointerClientX);
		const Y = Number(pEvent.pointerClientY);
		if (Number.isFinite(X) && Number.isFinite(Y)) Target = Doc.elementFromPoint(X, Y);
	}
	if (!Target) return;
	const X = Number(pEvent.pointerClientX) || 0;
	const Y = Number(pEvent.pointerClientY) || 0;
	try {
		["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((Name) => {
			const Ctor = Name.startsWith("pointer") && Win.PointerEvent ? Win.PointerEvent : Win.MouseEvent;
			Target.dispatchEvent(new Ctor(Name, { bubbles: true, cancelable: true, view: Win, clientX: X, clientY: Y, pointerId: 1, pointerType: cReplayIsMobile ? "touch" : "mouse", isPrimary: true }));
		});
		const Clickable = Target.closest ? Target.closest("button,summary,[role='button'],[aria-expanded],.FaqQuestion,.FaqQuestionText,.EmoBtn,.EmoCall,.EmoWhats,[data-ops-click]") : null;
		if (Clickable && typeof Clickable.click === "function") Clickable.click();
	} catch {}
}

function ClientType(pEvent) {
	return String(pEvent && pEvent.type || "").toLowerCase();
}

function ClientSearchText(pEvent) {
	return String([pEvent && pEvent.type, pEvent && pEvent.eventOn, pEvent && pEvent.label, pEvent && pEvent.targetText, pEvent && pEvent.widget, pEvent && pEvent.href].join(" ")).toLowerCase();
}

function IsCallEvent(pEvent) {
	const Text = ClientSearchText(pEvent);
	return Text.includes("call") || Text.includes("phone") || Text.includes("tel:") || Text.includes("اتصال") || Text.includes("تليفون") || Text.includes("هاتف");
}

function IsWhatsappEvent(pEvent) {
	const Text = ClientSearchText(pEvent);
	return Text.includes("whatsapp") || Text.includes("wa.me") || Text.includes("واتساب") || Text.includes("واتس");
}

function IsFullReadEvent(pEvent) {
	const Type = ClientType(pEvent);
	return Type === "read_full" || Type === "read" || Type === "read_stay" || Type.endsWith("_stay");
}

function IsQuickReadEvent(pEvent) {
	const Type = ClientType(pEvent);
	return Type === "read_quick" || Type === "read_skim" || Type === "skim" || Type === "skimming";
}

function BuildTimelineLayer() {
	if (!fTrackLayer) return;
	fTrackLayer.innerHTML = "";
	function AddSegment(StartMs, EndMs, ClassName) {
		if (EndMs <= StartMs) return;
		const Left = Math.max(0, Math.min(100, StartMs / fMaxMs * 100));
		const Width = Math.max(.7, Math.min(100 - Left, (EndMs - StartMs) / fMaxMs * 100));
		const Elem = document.createElement("span");
		Elem.className = "trackSegment " + ClassName;
		Elem.style.left = Left + "%";
		Elem.style.width = Width + "%";
		fTrackLayer.appendChild(Elem);
	}
	function AddMarker(TimeMs, Text, Title) {
		const Elem = document.createElement("span");
		Elem.className = "trackMarker";
		Elem.textContent = Text;
		Elem.title = Title || "";
		Elem.style.left = Math.max(0, Math.min(100, TimeMs / fMaxMs * 100)) + "%";
		fTrackLayer.appendChild(Elem);
	}
	let LastPage = "";
	for (let Index = 0; Index < cEvents.length; Index++) {
		const EventItem = cEvents[Index];
		const TimeMs = Number(EventItem.elapsedMs) || 0;
		const Duration = Math.max(800, Number(EventItem.durationMs) || 1800);
		if (IsFullReadEvent(EventItem)) AddSegment(TimeMs, Math.min(fMaxMs, TimeMs + Duration), "full");
		if (IsQuickReadEvent(EventItem)) AddSegment(TimeMs, Math.min(fMaxMs, TimeMs + Duration), "quick");
		if (IsCallEvent(EventItem)) AddMarker(TimeMs, "☎", "كليك اتصال");
		if (IsWhatsappEvent(EventItem)) AddMarker(TimeMs, "☘", "واتساب");
		if (LastPage && EventItem.pagePath && EventItem.pagePath !== LastPage) AddMarker(TimeMs, "🚪", "انتقال صفحة");
		if (EventItem.pagePath) LastPage = EventItem.pagePath;
	}
	for (let Index = 0; Index < cEvents.length - 1; Index++) {
		const A = cEvents[Index];
		const B = cEvents[Index + 1];
		const StartMs = Number(A.elapsedMs) || 0;
		const EndMs = Number(B.elapsedMs) || 0;
		const Gap = EndMs - StartMs;
		if (Gap < 4000 || A.pagePath !== B.pagePath) continue;
		const AScroll = Number(A.scrollY);
		const BScroll = Number(B.scrollY);
		if (Number.isFinite(AScroll) && Number.isFinite(BScroll) && Math.abs(AScroll - BScroll) > 20) continue;
		AddSegment(StartMs, EndMs, Gap >= 12000 ? "full" : "quick");
	}
}

function ApplyEvent(pEvent, pIndex, pSmooth = true) {
	if (!pEvent) return;
	const PageChanged = LoadPageIfNeeded(pEvent);
	fEventBadge.textContent = String(pIndex + 1) + " / " + String(cEvents.length);
	fEventText.innerHTML = "<b>" + Escape(String(pEvent.type || "event")) + "</b><small>" + Escape(String(pEvent.label || "")) + "</small>";
	if (EventHasScroll(pEvent)) {
		if (PageChanged) fPendingScroll = pEvent;
		else ScrollFrameToPosition(pEvent, pSmooth);
	}
	ShowCursor(pEvent);
	try { DispatchReplayClick(pEvent); } catch {}
	ShowReplayToast(ClickToastText(pEvent));
}

function ApplyStateAt(pMs, pSmooth = false, pForce = false) {
	const LastIndex = LastEventIndexAt(pMs);
	if (LastIndex >= 0) {
		const LastEvent = cEvents[LastIndex];
		LoadPageIfNeeded(LastEvent);
		if (pForce || LastIndex !== fAppliedIndex) {
			fAppliedIndex = LastIndex;
			fEventBadge.textContent = String(LastIndex + 1) + " / " + String(cEvents.length);
			fEventText.innerHTML = "<b>" + Escape(String(LastEvent.type || "event")) + "</b><small>" + Escape(String(LastEvent.label || "")) + "</small>";
		}
	}
	const LastScroll = LastScrollEventAt(pMs);
	if (LastScroll) ScrollFrameToPosition(LastScroll, false);
	else ScrollFrameToPosition({ scrollX: 0, scrollY: 0, scrollPercent: 0 }, false);
	fNextEventIndex = Math.max(0, LastIndex + 1);
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

function ApplyDueEvents(pTimeMs) {
	while (fNextEventIndex < cEvents.length) {
		const EventItem = cEvents[fNextEventIndex];
		const EventTime = Number(EventItem.elapsedMs) || 0;
		if (EventTime > pTimeMs) break;
		fAppliedIndex = fNextEventIndex;
		try { ApplyEvent(EventItem, fNextEventIndex, true); } catch {}
		fNextEventIndex++;
	}
}

function EffectiveSpeed() {
	return fTemporarySpeed > 0 ? fTemporarySpeed : (Number(fSpeedSelect.value) || 1);
}

function RebasePlaybackClock() {
	fBaseMs = Number(fProgress.value) || 0;
	fStartedAt = performance.now();
}

function Tick(pNow) {
	if (!fPlaying) return;
	const Speed = EffectiveSpeed();
	const TimeMs = Math.min(fMaxMs, fBaseMs + (pNow - fStartedAt) * Speed);
	fProgress.value = String(Math.round(TimeMs));
	UpdateTime(TimeMs);
	UpdateCursorForTime(TimeMs);
	ApplyDueEvents(TimeMs);
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

function PreviewSpeedFromPointer(pEvent) {
	const Rect = fDeviceFrame.getBoundingClientRect();
	if (!Rect || Rect.width <= 0) return 0;
	const X = Number(pEvent.clientX) - Rect.left;
	if (!Number.isFinite(X) || X < 0 || X > Rect.width) return 0;
	const Distance = Math.abs(X - Rect.width / 2);
	return Distance <= Rect.width / 4 ? 2 : 4;
}

function BeginTemporarySpeed(pEvent) {
	const Speed = PreviewSpeedFromPointer(pEvent);
	if (Speed <= 0) return;
	if (pEvent && pEvent.cancelable) pEvent.preventDefault();
	fTemporarySpeed = Speed;
	if (fPlaying) RebasePlaybackClock();
}

function EndTemporarySpeed() {
	if (fTemporarySpeed <= 0) return;
	if (fPlaying) RebasePlaybackClock();
	fTemporarySpeed = 0;
}

fInteractionBlock.addEventListener("pointerdown", BeginTemporarySpeed, { passive: false });
document.addEventListener("pointerup", EndTemporarySpeed, { passive: true });
document.addEventListener("pointercancel", EndTemporarySpeed, { passive: true });
fInteractionBlock.addEventListener("pointerleave", EndTemporarySpeed, { passive: true });

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
fSpeedSelect.addEventListener("change", () => { if (fPlaying) RebasePlaybackClock(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) ResizeDeviceFrame(); });
BuildTimelineLayer();
UpdateTime(0);
if (cEvents.length) { Seek(0, false); setTimeout(Play, 550); } else fEventText.textContent = "";
})();
</script>
</body>
</html>`;
}

export async function GET({ request }) {
	try {
		const ReqUrlForMode = new URL(request.url);
		if (ReqUrlForMode.searchParams.get("raw") === "1") return await RenderRawReplayPage(request);

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

		return Html(RenderReplay(Events, SessionId, PageInstanceId, request.url));
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Html(EscapeHtml(Msg), 500);
	}
}
