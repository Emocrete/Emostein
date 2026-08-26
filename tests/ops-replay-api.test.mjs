import assert from "node:assert/strict";

process.env.SUPABASE_URL = "https://supabase.test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
process.env.OPS_API_KEY = "test-key";
process.env.EMO_REPLAY_ORIGIN = "https://emocrete-replay.vercel.app";

const Visit = await import("../src/pages/api/ops/visit.js");
const Events = await import("../src/pages/api/ops/events.js");
const Replay = await import("../src/pages/api/ops/replay.js");

const OriginalFetch = globalThis.fetch;
let Calls = [];

function SetFetch(Handler) {
	Calls = [];
	globalThis.fetch = async (Input, Init = {}) => {
		const Url = String(Input);
		Calls.push({ url: Url, init: Init });
		return Handler(Url, Init);
	};
}
function ApiRequest(Path, Method = "GET", Body = undefined) {
	return new Request(`https://www.emocrete.com${Path}`, {
		method: Method,
		headers: { "x-ops-key": "test-key", ...(Body === undefined ? {} : { "content-type": "application/json" }) },
		body: Body === undefined ? undefined : JSON.stringify(Body)
	});
}
async function JsonOf(ResponseValue) { return JSON.parse(await ResponseValue.text()); }

try {
	let Inserted = null;
	SetFetch(async (Url, Init) => {
		assert.match(Url, /\/rest\/v1\/ops_events/);
		Inserted = JSON.parse(String(Init.body || "[]"));
		return new Response("", { status: 201 });
	});
	const ReplayPost = await Visit.POST({ request: ApiRequest("/api/ops/visit", "POST", {
		eventType: "system.click",
		eventSource: "site",
		visitorId: "v_abc_123",
		sessionId: "s_abc_123",
		pageInstanceId: "p_abc_123",
		clientEventUid: "evt-replay-1",
		sessionSeq: 8,
		pageElapsedMs: 120,
		sessionElapsedMs: 840,
		pagePath: "/sample",
		pageTitle: "Sample",
		referrer: "must-not-copy",
		userAgentClient: "must-not-copy",
		eventData: { x: 25, y: 30, selector: "#Button" }
	}) });
	assert.equal(ReplayPost.status, 200);
	assert.equal((await JsonOf(ReplayPost)).accepted, 1);
	assert.equal(Inserted.length, 1);
	assert.equal(Inserted[0].event_stream, "replay");
	assert.equal(Inserted[0].payload.eventType, "system.click");
	assert.equal(Inserted[0].payload.eventData.selector, "#Button");
	assert.equal(Inserted[0].payload.referrer, undefined);
	assert.equal(Inserted[0].payload.userAgentClient, undefined);
	assert.equal(Inserted[0].user_agent, "");

	Inserted = null;
	SetFetch(async (Url, Init) => {
		Inserted = JSON.parse(String(Init.body || "[]"));
		return new Response("", { status: 201 });
	});
	const NormalPost = await Visit.POST({ request: ApiRequest("/api/ops/visit", "POST", {
		eventType: "page_open",
		eventSource: "site",
		visitorId: "v_abc_123",
		sessionId: "s_abc_123",
		pageInstanceId: "p_abc_123",
		clientEventUid: "evt-normal-1",
		pagePath: "/sample",
		pageTitle: "Sample",
		eventData: { replayAvailable: true, viewportWidth: 1366, viewportHeight: 768 }
	}) });
	assert.equal(NormalPost.status, 200);
	assert.equal(Inserted[0].event_stream, "normal");
	assert.equal(Inserted[0].payload.eventData.replayAvailable, true);

	SetFetch(async (Url) => {
		const Parsed = new URL(Url);
		assert.equal(Parsed.searchParams.get("event_stream"), "eq.normal");
		assert.equal(Parsed.searchParams.get("read_mobile"), "eq.false");
		return new Response(JSON.stringify([{
			id: 10,
			client_event_uid: "evt-normal-1",
			event_type: "page_open",
			event_source: "site",
			visitor_id: "v_abc_123",
			session_id: "s_abc_123",
			page_instance_id: "p_abc_123",
			session_seq: 1,
			page_elapsed_ms: 0,
			session_elapsed_ms: 0,
			occurred_at: "2026-07-24T10:00:00Z",
			page_path: "/sample",
			page_title: "Sample",
			created_at: "2026-07-24T10:00:01Z",
			user_agent: "UA",
			payload: { label: "فتح الصفحة", eventData: { replayAvailable: true } }
		}]), { status: 200 });
	});
	const NormalGet = await Events.GET({ request: ApiRequest("/api/ops/events?limit=50") });
	const NormalJson = await JsonOf(NormalGet);
	assert.equal(NormalJson.ok, true);
	assert.equal(NormalJson.events.length, 1);
	assert.equal(NormalJson.events[0].replayAvailable, true);
	assert.equal(Object.hasOwn(NormalJson.events[0], "payload"), false);

	SetFetch(async (Url) => {
		const Parsed = new URL(Url);
		assert.equal(Parsed.searchParams.get("event_stream"), "eq.replay");
		assert.equal(Parsed.searchParams.get("session_id"), "eq.s_abc_123");
		assert.equal(Parsed.searchParams.get("read_mobile"), "eq.false");
		assert.equal(Parsed.searchParams.get("id"), "gt.5");
		return new Response(JSON.stringify([{
			id: 7,
			client_event_uid: "evt-replay-1",
			event_type: "system.click",
			event_source: "site",
			visitor_id: "v_abc_123",
			session_id: "s_abc_123",
			page_instance_id: "p_abc_123",
			session_seq: 8,
			page_elapsed_ms: 120,
			session_elapsed_ms: 840,
			occurred_at: "2026-07-24T10:00:00Z",
			page_path: "/sample",
			page_title: "Sample",
			created_at: "2026-07-24T10:00:01Z",
			payload: { eventData: { x: 25, y: 30, selector: "#Button" } }
		}]), { status: 200 });
	});
	const ReplayGet = await Replay.GET({ request: ApiRequest("/api/ops/replay?sessionId=s_abc_123&afterId=5&limit=100") });
	const ReplayJson = await JsonOf(ReplayGet);
	assert.equal(ReplayJson.ok, true);
	assert.equal(ReplayJson.replayOrigin, "https://emocrete-replay.vercel.app");
	assert.equal(ReplayJson.nextAfterId, 7);
	assert.equal(ReplayJson.events[0].eventData.selector, "#Button");

	let ReplayAckCall = 0;
	SetFetch(async (Url, Init) => {
		ReplayAckCall += 1;
		const Parsed = new URL(Url);
		assert.equal(Parsed.searchParams.get("event_stream"), "eq.replay");
		assert.equal(Parsed.searchParams.get("session_id"), "eq.s_abc_123");
		assert.equal(Parsed.searchParams.get("id"), "lte.7");
		if (ReplayAckCall === 1) {
			assert.equal(Init.method, "PATCH");
			assert.equal(JSON.parse(String(Init.body || "{}")).read_mobile, true);
			return new Response(null, { status: 204 });
		}
		assert.equal(Init.method, "DELETE");
		assert.equal(Parsed.searchParams.get("read_mobile"), "eq.true");
		assert.equal(Parsed.searchParams.get("read_desktop"), "eq.true");
		return new Response(JSON.stringify([]), { status: 200 });
	});
	const ReplayDelete = await Replay.DELETE({ request: ApiRequest("/api/ops/replay", "DELETE", { client: "mobile", sessionId: "s_abc_123", throughId: 7 }) });
	assert.equal((await JsonOf(ReplayDelete)).ok, true);

	console.log("ops replay API tests passed");
} finally {
	globalThis.fetch = OriginalFetch;
}
