import type { APIRoute } from "astro";
import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const prerender = true;

const cImageExtPattern = /\.(webp|avif|png|jpe?g)$/i;
const cPreviewImagePattern = /(^|[-_\s])(HeroL|HeroP|Share|Schema[-_\s]?(1x1[-_\s]?1200(?:x1200)?|4x3[-_\s]?1200(?:x900)?|16x9[-_\s]?1200(?:x675)?))(\.|[-_\s])/i;

const cPageMediaAssets = import.meta.glob(
	"/src/pages/**/_M/**/*",
	{
		eager: true,
		query: "?url",
		import: "default"
	}
) as Record<string, string>;

export const GET: APIRoute = ({ site }) => {
	const cSite = String(site ?? "https://www.emocrete.com").replace(/\/$/, "");
	const cImagesByPage = new Map<string, string[]>();

	AddPageMediaImages(cSite, cImagesByPage);
	AddPublicMediaImages(cSite, cImagesByPage);

	const cXml = GetXml(cImagesByPage);

	return new Response(cXml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8"
		}
	});
};

function AddPageMediaImages( pSite: string , pImagesByPage: Map<string, string[]> ) : void
	{
		for (const [cSourcePath, cAssetUrl] of Object.entries(cPageMediaAssets)) {
			const cNormalizedSourcePath = cSourcePath.replace(/\\/g, "/");
			const cFileName = GetFileName(cNormalizedSourcePath);

			if (!cImageExtPattern.test(cFileName)) { continue; }
			if (!cPreviewImagePattern.test(cFileName)) { continue; }

			const cPageUrl = GetPageUrlFromPageMediaPath(pSite, cNormalizedSourcePath);
			if (!cPageUrl) { continue; }

			const cImageUrl = GetAbsoluteUrl(pSite, cAssetUrl);
			AddImage(pImagesByPage, cPageUrl, cImageUrl);
		}
	}

function AddPublicMediaImages( pSite: string , pImagesByPage: Map<string, string[]> ) : void
	{
		const cPublicMediaPath = join(process.cwd(), "public", "Media");

		if (!existsSync(cPublicMediaPath)) { return; }

		GetPreviewImages(cPublicMediaPath).forEach((pFilePath) => {
			const cMediaPath = `/${relative(join(process.cwd(), "public"), pFilePath).replace(/\\/g, "/")}`;
			const cPageUrl = GetPageUrlFromPublicMediaPath(pSite, cMediaPath);
			const cImageUrl = `${pSite}${EncodeUrlPath(cMediaPath)}`;

			AddImage(pImagesByPage, cPageUrl, cImageUrl);
		});
	}

function AddImage( pImagesByPage: Map<string, string[]> , pPageUrl: string , pImageUrl: string ) : void
	{
		if (!pPageUrl || !pImageUrl) { return; }

		const cImages = pImagesByPage.get(pPageUrl) ?? [];

		if (!cImages.includes(pImageUrl)) {
			cImages.push(pImageUrl);
		}

		pImagesByPage.set(pPageUrl, cImages);
	}

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

function GetPageUrlFromPageMediaPath( pSite: string , pSourcePath: string ) : string
	{
		const cNormalizedPath = pSourcePath.replace(/\\/g, "/");
		const cLowerPath = cNormalizedPath.toLowerCase();
		const cPagesIndex = cLowerPath.lastIndexOf("/pages/");

		if (cPagesIndex < 0) { return ""; }

		const cPageRelativePath = cNormalizedPath.slice(cPagesIndex + "/pages/".length);
		const cLowerPageRelativePath = cPageRelativePath.toLowerCase();

		let cPagePath = "";
		const cMediaIndex = cLowerPageRelativePath.lastIndexOf("/_m/");

		if (cMediaIndex >= 0) {
			cPagePath = cPageRelativePath.slice(0, cMediaIndex);
		}
		else if (!cLowerPageRelativePath.startsWith("_m/")) {
			return "";
		}

		cPagePath = cPagePath.replace(/^\/+|\/+$/g, "");

		if (!cPagePath || cPagePath.toLowerCase() === "home") {
			return `${pSite}/`;
		}

		const cUrlPath = cPagePath
			.split("/")
			.filter(Boolean)
			.map((pPart) => encodeURIComponent(pPart.toLowerCase()))
			.join("/");

		return `${pSite}/${cUrlPath}`;
	}

function GetPageUrlFromPublicMediaPath( pSite: string , pMediaPath: string ) : string
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

function GetAbsoluteUrl( pSite: string , pUrl: string ) : string
	{
		const cUrl = `${pUrl ?? ""}`.trim();

		if (!cUrl) { return ""; }
		if (/^https?:\/\//i.test(cUrl)) { return cUrl; }
		if (cUrl.startsWith("//")) { return `https:${cUrl}`; }

		return new URL(cUrl, `${pSite}/`).href;
	}

function GetFileName( pPath: string ) : string
	{
		const cParts = pPath.replace(/\\/g, "/").split("/");
		return cParts[cParts.length - 1] ?? "";
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
