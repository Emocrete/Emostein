export const prerender = false;

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
	});
}

function Disabled() {
	return Json({
		ok: false,
		error: "This endpoint is disabled. ops_events is a transient queue and may only be acknowledged by exact event IDs through /api/ops/events."
	}, 410);
}

export async function OPTIONS() { return Json({ ok: true }); }
export async function GET() { return Disabled(); }
export async function POST() { return Disabled(); }
export async function DELETE() { return Disabled(); }
