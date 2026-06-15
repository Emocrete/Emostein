export const prerender = false;

export function GET() {
	return new Response(JSON.stringify({
		ok: true,
		message: "pong",
		time: new Date().toISOString()
	}), {
		status: 200,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}