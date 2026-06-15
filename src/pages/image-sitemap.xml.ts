import type { APIRoute } from "astro";
import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const prerender = true;

const cImageExtPattern = /\.(webp|avif|png|jpe?g)$/i;
const cPreviewImagePattern = /(^|[-_\s])(HeroL|HeroP|Share|Schema[-_\s]?(1x1|4x3|16x9)?[-_\s]?1200?)(\.|[-_\s])/i;

export const GET: APIRoute = ({ site }) => {
	const cSite = String(site ?? "https://www.emocrete.com").replace(/\/$/, "");
	const cPublicMediaPath = join(process.cwd(), "public", "Media");
	const cImagesByPage = new Map<string, string[]>();

	if (existsSync(cPublicMediaPath)) {
		GetPreviewImages(cPublicMediaPath).forEach((pFilePath) => {
			const cMediaPath = `/${relative(join(process.cwd(), "public"), pFilePath).replace(/\\/g, "/")}`;
			const cPageUrl = GetPageUrlFromMediaPath(cSite, cMediaPath);
			const cImageUrl = `${cSite}${EncodeUrlPath(cMediaPath)}`;
			const cImages = cImagesByPage.get(cPageUrl) ?? [];

			if (!cImages.includes(cImageUrl)) { cImages.push(cImageUrl); }

			cImagesByPage.set(cPageUrl, cImages);
		});
	}

	const cXml = GetXml(cImagesByPage);

	return new Response(cXml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8"
		}
	});
};

function GetPreviewImages( pFolderPath: string ) : string[]
	{

		const cItems: string[] = [];

		readdirSync(pFolderPath, { withFileTypes: true }).forEach((pItem) => {
			const cItemPath = join(pFolderPath, pItem.name);

			if (pItem.isDirectory()) {
				cItems.push(...GetPreviewImages(cItemPath));
				return;
			}

			if (!pItem.isFile()) { return; }
			if (!cImageExtPattern.test(pItem.name)) { return; }
			if (!cPreviewImagePattern.test(pItem.name)) { return; }

			cItems.push(cItemPath);
		});

		return cItems;

	}

function GetPageUrlFromMediaPath( pSite: string , pMediaPath: string ) : string
	{

		const cParts = pMediaPath
			.replace(/^\/Media\//i, "")
			.split("/")
			.slice(0, -1);

		if (cParts.length === 0) { return `${pSite}/`; }
		if (cParts[0]?.toLowerCase() === "home") { return `${pSite}/`; }

		const cPagePath = cParts
			.map((pPart) => pPart.toLowerCase())
			.join("/");

		return `${pSite}/${cPagePath}`;

	}

function EncodeUrlPath( pPath: string ) : string
	{

		return pPath
			.split("/")
			.map((pPart) => encodeURIComponent(pPart))
			.join("/");

	}

function GetXml( pImagesByPage: Map<string, string[]> ) : string
	{

		const cUrls = [...pImagesByPage.entries()]
			.sort(([pFirstUrl], [pSecondUrl]) => pFirstUrl.localeCompare(pSecondUrl))
			.map(([pPageUrl, pImages]) => {
				const cImageNodes = pImages
					.sort((pFirst, pSecond) => pFirst.localeCompare(pSecond))
					.map((pImageUrl) => {
						return `\n\t\t<image:image>\n\t\t\t<image:loc>${EscapeXml(pImageUrl)}</image:loc>\n\t\t</image:image>`;
					})
					.join("");

				return `\n\t<url>\n\t\t<loc>${EscapeXml(pPageUrl)}</loc>${cImageNodes}\n\t</url>`;
			})
			.join("");

		return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${cUrls}\n</urlset>`;

	}

function EscapeXml( pValue: string ) : string
	{

		return pValue
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&apos;");

	}
