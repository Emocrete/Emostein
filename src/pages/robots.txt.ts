export const prerender = true;

export function GET() {
	const ReplayMode = import.meta.env.EMO_DEPLOY_MODE === "replay";
	const Body = ReplayMode
		? "User-agent: *\nDisallow: /\n"
		: "User-agent: *\nAllow: /\n\nSitemap: https://www.emocrete.com/sitemap-index.xml\nSitemap: https://www.emocrete.com/image-sitemap.xml\n";
	return new Response(Body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
