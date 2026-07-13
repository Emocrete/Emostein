export const prerender = false;
const cDefaultOpsKey = "Emocrete20015161";
function Env(pName) { const Value = process.env[pName]; return typeof Value === "string" ? Value.trim() : ""; }
function Str(pValue) { return String(pValue ?? "").trim(); }
function EscapeHtml(pValue) { return Str(pValue).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function CheckOpsKey(pRequest) { const Url = new URL(pRequest.url); const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key") || Url.searchParams.get("k")); return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey); }
function Html(pBody, pStatus = 200) { return new Response(pBody, { status: pStatus, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }); }
async function FetchRows(pUrl, pServiceKey) {
	const Res = await fetch(pUrl, { headers: { apikey: pServiceKey, authorization: `Bearer ${pServiceKey}` } });
	const Text = await Res.text(); if (!Res.ok) throw new Error(Text); try { return JSON.parse(Text); } catch { return []; }
}
function SafeJson(pValue) { return JSON.stringify(pValue).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026"); }
function ErrorPage(pMessage) {
	return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EmoReplay</title><style>html,body{margin:0;min-height:100%;background:#0f141c;color:#eaf2ff;font-family:Tahoma,Arial,sans-serif}.box{max-width:720px;margin:12vh auto;padding:24px;background:#1a2431;border:1px solid #4f6680;border-radius:16px;text-align:center}h1{color:#2ea8ff}</style></head><body><main class="box"><h1>EmoReplay</h1><p>${EscapeHtml(pMessage)}</p></main></body></html>`;
}
function BuildViewer(pSessions, pChunks, pMeta) {
	const Payload = SafeJson({ sessions: pSessions, chunks: pChunks, meta: pMeta });
	return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>EmoReplay — ${EscapeHtml(pMeta.title || "جلسة")}</title>
<style>
:root{color-scheme:dark;--bg:#05080d;--panel:#0c131d;--line:#26384d;--text:#eef5ff;--muted:#a8b7c9;--blue:#2da5ff;--gold:#ffca4b;--red:#ff4b4b}
*{box-sizing:border-box}
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:var(--bg);color:var(--text);font-family:system-ui,Tahoma,Arial,sans-serif;overscroll-behavior:none}
.shell{width:100vw;height:100dvh;display:grid;grid-template-rows:auto 1fr}
.top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:6px;align-items:center;padding:6px;background:var(--panel);border-bottom:1px solid var(--line);direction:ltr}
.controls{display:flex;align-items:center;gap:5px}.btn,.speed{height:34px;border:1px solid #3b5670;background:#152235;color:var(--text);border-radius:9px;font-weight:800}.btn{min-width:38px;cursor:pointer}.btn:hover{border-color:var(--blue)}.speed{padding:0 7px}
.meta{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align:center;color:var(--muted);font-size:12px}.meta b{color:var(--text)}
.time{min-width:95px;text-align:center;color:var(--gold);font-weight:900;font-variant-numeric:tabular-nums}
.progressWrap{grid-column:1/4;position:relative;height:16px}.progress{width:100%;height:16px;margin:0;accent-color:var(--blue)}
.stage{position:relative;min-height:0;overflow:hidden;background:#080d14}.device{position:absolute;left:0;top:0;transform-origin:top left;background:#fff;overflow:hidden;box-shadow:0 10px 45px #000b;border:1px solid #ffffff22}.frame{width:100%;height:100%;border:0;background:#fff;pointer-events:none}.cursor{position:absolute;z-index:5;width:22px;height:22px;border:3px solid var(--red);border-radius:50%;transform:translate(-50%,-50%);display:none;pointer-events:none;box-shadow:0 0 0 7px #ff4b4b22}.cursor.click{background:var(--red)}
.pageBadge{position:absolute;right:8px;bottom:8px;z-index:8;background:#05080ddd;border:1px solid #3b5670;border-radius:999px;padding:5px 10px;font-size:11px;color:var(--muted)}
.toast{position:absolute;left:50%;top:50%;z-index:10;transform:translate(-50%,-50%) scale(.96);padding:10px 18px;border-radius:999px;background:#05080de8;border:1px solid #ffffff44;color:#fff;font-size:18px;font-weight:900;opacity:0;transition:opacity .15s ease,transform .15s ease;pointer-events:none}.toast.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
@media(max-width:650px){.top{grid-template-columns:auto minmax(0,1fr) auto;padding:4px}.btn{height:30px;min-width:34px}.speed{height:30px;max-width:62px}.meta{font-size:10px}.time{min-width:76px;font-size:11px}}
</style>
</head>
<body>
<div class="shell">
<header class="top">
<div class="controls"><button id="play" class="btn" title="تشغيل">▶</button><button id="back" class="btn" title="رجوع 5 ثوان">−5</button><button id="forward" class="btn" title="تقديم 5 ثوان">+5</button><select id="speed" class="speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="3">3×</option></select></div>
<div id="meta" class="meta"></div><div id="time" class="time">00:00 / 00:00</div>
<div class="progressWrap"><input id="progress" class="progress" type="range" min="0" max="1000" value="0"></div>
</header>
<main id="stage" class="stage"><div id="device" class="device"><iframe id="frame" class="frame" sandbox="allow-same-origin"></iframe><div id="cursor" class="cursor"></div></div><div id="pageBadge" class="pageBadge"></div><div id="toast" class="toast"></div></main>
</div>
<script>window.__REPLAY_DATA__=${Payload};</script>
<script>
(() => {
const data=window.__REPLAY_DATA__||{};
const sessions=Array.isArray(data.sessions)?data.sessions:[];
const chunkRows=Array.isArray(data.chunks)?data.chunks:[];
const chunksBySession=new Map();
for(const row of chunkRows){const a=chunksBySession.get(row.session_id)||[];a.push(row);chunksBySession.set(row.session_id,a)}
const segments=[];let total=0;
for(const session of sessions){
 const events=[];for(const chunk of (chunksBySession.get(session.id)||[]).sort((a,b)=>(a.chunk_index||0)-(b.chunk_index||0))){const list=Array.isArray(chunk.events_json)?chunk.events_json:[];events.push(...list)}
 events.sort((a,b)=>(a.t||0)-(b.t||0));const duration=Math.max(1000,...events.map(e=>Number(e.t)||0),...(chunksBySession.get(session.id)||[]).map(c=>Number(c.to_ms)||0));
 segments.push({session,events,start:total,duration,end:total+duration});total+=duration;
}
const el={play:document.getElementById('play'),back:document.getElementById('back'),forward:document.getElementById('forward'),speed:document.getElementById('speed'),progress:document.getElementById('progress'),time:document.getElementById('time'),meta:document.getElementById('meta'),stage:document.getElementById('stage'),device:document.getElementById('device'),frame:document.getElementById('frame'),cursor:document.getElementById('cursor'),badge:document.getElementById('pageBadge'),toast:document.getElementById('toast')};
let current=0,playing=false,lastTick=performance.now(),activeIndex=-1,appliedIndex=-1,frameReady=false,toastTimer=0;
function fmt(ms){const sec=Math.max(0,Math.floor(ms/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
function segmentAt(ms){for(let i=0;i<segments.length;i++)if(ms<segments[i].end||i===segments.length-1)return {segment:segments[i],index:i,local:Math.max(0,ms-segments[i].start)};return null}
function fit(){if(activeIndex<0)return;const s=segments[activeIndex].session;const w=Math.max(1,Number(s.viewport_width)||360),h=Math.max(1,Number(s.viewport_height)||800);const scale=Math.min(el.stage.clientWidth/w,el.stage.clientHeight/h);el.device.style.width=w+'px';el.device.style.height=h+'px';el.device.style.transform='scale('+scale+')';el.device.style.left=Math.max(0,(el.stage.clientWidth-w*scale)/2)+'px';el.device.style.top=Math.max(0,(el.stage.clientHeight-h*scale)/2)+'px'}
function loadSegment(index){activeIndex=index;appliedIndex=-1;frameReady=false;const s=segments[index].session;el.frame.onload=()=>{frameReady=true;applyCurrent()};el.frame.srcdoc=s.snapshot_html||'<html><body style="font-family:sans-serif;padding:30px">لا توجد لقطة محفوظة لهذه الصفحة</body></html>';el.meta.innerHTML='<b>'+escapeHtml(s.page_title||'صفحة')+'</b> — '+escapeHtml(s.page_path||'');el.badge.textContent=(index+1)+' / '+segments.length;fit()}
function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showToast(text){if(!text)return;el.toast.textContent=text;el.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.classList.remove('show'),700)}
function applyEvent(e){if(!frameReady)return;const doc=el.frame.contentDocument,win=el.frame.contentWindow;if(!doc||!win)return;const type=String(e.type||'');
 if(type==='scroll'){try{win.scrollTo(Number(e.x)||0,Number(e.y)||0)}catch{}}
 if(type.startsWith('pointer')||type==='click'||type==='touch'){const x=Number.isFinite(Number(e.x))?Number(e.x):(Number(e.nx)||0)*(Number(segments[activeIndex].session.viewport_width)||360);const y=Number.isFinite(Number(e.y))?Number(e.y):(Number(e.ny)||0)*(Number(segments[activeIndex].session.viewport_height)||800);el.cursor.style.left=x+'px';el.cursor.style.top=y+'px';el.cursor.style.display='block';el.cursor.classList.toggle('click',type.includes('down')||type==='click'||type==='touch')}
 if(type==='input'||type==='change'){let target=null;try{if(e.selector)target=doc.querySelector(e.selector)}catch{}if(target&&'value'in target)target.value=e.value??''}
 if(type==='click'||type==='pointerdown'||type==='touchstart')showToast(e.label||'نقرة')
}
function applyCurrent(){const hit=segmentAt(current);if(!hit)return;if(hit.index!==activeIndex)loadSegment(hit.index);if(!frameReady)return;const events=hit.segment.events;let target=-1;for(let i=0;i<events.length;i++){if((Number(events[i].t)||0)<=hit.local)target=i;else break}if(target<appliedIndex){loadSegment(hit.index);return}for(let i=appliedIndex+1;i<=target;i++)applyEvent(events[i]);appliedIndex=target}
function render(){current=Math.max(0,Math.min(total,current));const hit=segmentAt(current);if(hit&&hit.index!==activeIndex)loadSegment(hit.index);applyCurrent();el.progress.value=total?Math.round(current/total*1000):0;el.time.textContent=fmt(current)+' / '+fmt(total);if(current>=total){playing=false;el.play.textContent='▶'}}
function tick(now){const dt=now-lastTick;lastTick=now;if(playing){current+=dt*Number(el.speed.value||1);render()}requestAnimationFrame(tick)}
el.play.onclick=()=>{playing=!playing;if(current>=total)current=0;el.play.textContent=playing?'❚❚':'▶';lastTick=performance.now()};el.back.onclick=()=>{current-=5000;render()};el.forward.onclick=()=>{current+=5000;render()};el.progress.oninput=()=>{current=total*Number(el.progress.value)/1000;render()};window.addEventListener('resize',fit);
if(!segments.length){el.meta.textContent='لا توجد بيانات Replay';el.badge.textContent='0 / 0'}else{loadSegment(0);render()}requestAnimationFrame(tick);
})();
</script>
</body></html>`;
}
export async function GET({ request }) {
	try {
		if (!CheckOpsKey(request)) return Html(ErrorPage("غير مصرح بفتح التسجيل"), 401);
		const SupabaseUrl = Env("SUPABASE_URL"), ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Html(ErrorPage("إعدادات Supabase غير مكتملة"), 500);
		const Url = new URL(request.url);
		const VisitSessionId = Str(Url.searchParams.get("session_id") || Url.searchParams.get("sessionId") || Url.searchParams.get("visit_session_id"));
		const PageId = Str(Url.searchParams.get("page_instance_id") || Url.searchParams.get("pageInstanceId") || Url.searchParams.get("page_id"));
		const VisitorId = Str(Url.searchParams.get("visitor_id") || Url.searchParams.get("visitorId"));
		if (!VisitSessionId) return Html(ErrorPage("معرف الجلسة غير موجود"), 400);
		const SessionQuery = new URL(`${SupabaseUrl}/rest/v1/replay_sessions`);
		SessionQuery.searchParams.set("select", "*"); SessionQuery.searchParams.set("visit_session_id", `eq.${VisitSessionId}`);
		if (PageId) SessionQuery.searchParams.set("page_id", `eq.${PageId}`);
		SessionQuery.searchParams.set("order", "started_at.asc"); SessionQuery.searchParams.set("limit", "200");
		const Sessions = await FetchRows(SessionQuery, ServiceKey);
		if (!Array.isArray(Sessions) || !Sessions.length) return Html(ErrorPage("لا توجد تسجيلات محفوظة لهذه الجلسة بعد"), 404);
		const SessionIds = Sessions.map((Item) => Item.id).filter(Boolean);
		const ChunkQuery = new URL(`${SupabaseUrl}/rest/v1/replay_chunks`);
		ChunkQuery.searchParams.set("select", "session_id,chunk_index,from_ms,to_ms,events_count,events_json");
		ChunkQuery.searchParams.set("session_id", `in.(${SessionIds.map((Id)=>`\"${Id.replace(/\"/g,"")}\"`).join(",")})`);
		ChunkQuery.searchParams.set("order", "session_id.asc,chunk_index.asc"); ChunkQuery.searchParams.set("limit", "5000");
		const Chunks = await FetchRows(ChunkQuery, ServiceKey);
		return Html(BuildViewer(Sessions, Array.isArray(Chunks) ? Chunks : [], { title: Sessions[0]?.page_title || "جلسة", visitSessionId: VisitSessionId, visitorId: VisitorId }));
	} catch (Ex) { return Html(ErrorPage(Ex instanceof Error ? Ex.message : String(Ex)), 500); }
}
