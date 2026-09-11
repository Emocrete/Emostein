const cPageMediaAssets = import.meta.glob(
	"/src/pages/**/_M/*",
	{
		eager: true,
		query: "?url",
		import: "default"
	}
) as Record<string, string>;


interface PageMediaItem {
	FileName: string;
	Url: string;
}


const cPageMediaIndex = new Map<string, PageMediaItem[]>();

for (const [cSourcePath, cAssetUrl] of Object.entries(cPageMediaAssets)) {
	const cNormalizedSourcePath = cSourcePath.replace(/\\/g, "/");
	const cLowerSourcePath = cNormalizedSourcePath.toLowerCase();
	const cPagesIndex = cLowerSourcePath.lastIndexOf("/pages/");

	if (cPagesIndex < 0) { continue; }

	const cPageRelativePath = cNormalizedSourcePath.slice(cPagesIndex + "/pages/".length);
	const cLowerPageRelativePath = cPageRelativePath.toLowerCase();
	const cMediaIndex = cLowerPageRelativePath.lastIndexOf("/_m/");

	if (cMediaIndex < 0) { continue; }

	const cPagePath = cLowerPageRelativePath.slice(0, cMediaIndex);
	const cFileName = cPageRelativePath.slice(cMediaIndex + "/_M/".length);
	const cItems = cPageMediaIndex.get(cPagePath) ?? [];

	cItems.push({
		FileName: cFileName,
		Url: cAssetUrl
	});

	cPageMediaIndex.set(cPagePath, cItems);
}


export interface MediaPathOptions {
	pFolder?: string;
	pAbsolute?: boolean;
}


export class Media {

	public static GetPageFolder( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			const cPagePath = Media.GetPagePath(pPageUrlOrPath);

			return cPagePath
				? `/${cPagePath}/_M/`
				: "/_M/";

		}



	public static GetPageFile( pPageUrlOrPath: string , pFileOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			if (!pFileOrPath) { return ""; }

			if (Media.IsReadyUrl(pFileOrPath)) { return pFileOrPath; }

			if (pFileOrPath.startsWith("/")) {
				return pOptions.pAbsolute
					? Media.GetAbsoluteUrl(pPageUrlOrPath, pFileOrPath)
					: pFileOrPath;
			}

			return Media.GetExistingPageAsset(
				pPageUrlOrPath,
				pFileOrPath,
				pOptions.pAbsolute ?? false
			);

		}



	public static GetPageFiles( pPageUrlOrPath: string , pFilesOrPaths: string[] , pOptions: MediaPathOptions = {} ) : string[]
		{

			return pFilesOrPaths.map((pFileOrPath) => {
				return Media.GetPageFile(pPageUrlOrPath, pFileOrPath, pOptions);
			});

		}



	public static GetExistingPageAsset( pPageUrlOrPath: string , pFileName: string , pAbsolute = false ) : string
		{

			if (!pFileName) { return ""; }

			const cPagePath = Media.GetPagePath(pPageUrlOrPath).toLowerCase();
			const cTargetFileName = Media.GetFileName(pFileName).toLowerCase();
			const cItems = cPageMediaIndex.get(cPagePath) ?? [];

			if (!cTargetFileName || cItems.length === 0) { return ""; }

			const cExactItem = cItems.find((pItem) => {
				return pItem.FileName.toLowerCase() === cTargetFileName;
			});

			const cSuffixItem = cExactItem ?? cItems.find((pItem) => {
				return pItem.FileName.toLowerCase().endsWith(cTargetFileName);
			});

			const cAssetUrl = cSuffixItem?.Url ?? "";

			if (!cAssetUrl) { return ""; }

			return pAbsolute
				? Media.GetAbsoluteUrl(pPageUrlOrPath, cAssetUrl)
				: cAssetUrl;

		}



	public static GetExistingHeroLandscape( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			return Media.GetExistingHero(
				pPageUrlOrPath,
				"HeroL",
				pOptions.pAbsolute ?? false
			);

		}



	public static GetExistingHeroPortrait( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			return Media.GetExistingHero(
				pPageUrlOrPath,
				"HeroP",
				pOptions.pAbsolute ?? false
			);

		}



	public static GetHeroLandscape( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			return Media.GetExistingHeroLandscape(pPageUrlOrPath, pOptions);

		}



	public static GetHeroPortrait( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			return Media.GetExistingHeroPortrait(pPageUrlOrPath, pOptions);

		}



	public static GetHeroImages( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string[]
		{

			return [
				Media.GetHeroLandscape(pPageUrlOrPath, pOptions),
				Media.GetHeroPortrait(pPageUrlOrPath, pOptions)
			];

		}



	private static GetExistingHero( pPageUrlOrPath: string , pHeroName: "HeroL" | "HeroP" , pAbsolute: boolean ) : string
		{

			const cExtensions = ["webp", "avif", "png", "jpg", "jpeg"];

			for (const cExtension of cExtensions) {
				const cAssetUrl = Media.GetExistingPageAsset(
					pPageUrlOrPath,
					`${pHeroName}.${cExtension}`,
					pAbsolute
				);

				if (cAssetUrl) { return cAssetUrl; }
			}

			return "";

		}



	private static GetPagePath( pPageUrlOrPath: string ) : string
		{

			return Media.GetPathname(pPageUrlOrPath)
				.split(/[?#]/, 1)[0]
				.replace(/^\/+|\/+$/g, "");

		}



	private static GetFileName( pPath: string ) : string
		{

			const cNormalizedPath = pPath.replace(/\\/g, "/");
			const cParts = cNormalizedPath.split("/");

			return cParts[cParts.length - 1] ?? "";

		}



	private static GetPathname( pPageUrlOrPath: string ) : string
		{

			if (/^https?:\/\//i.test(pPageUrlOrPath)) {
				return new URL(pPageUrlOrPath).pathname;
			}

			return pPageUrlOrPath;

		}



	private static GetAbsoluteUrl( pPageUrlOrPath: string , pPath: string ) : string
		{

			if (Media.IsReadyUrl(pPath)) { return pPath; }

			const cBase = /^https?:\/\//i.test(pPageUrlOrPath)
				? pPageUrlOrPath
				: "https://www.emocrete.com/";

			return new URL(pPath, cBase).href;

		}



	private static IsReadyUrl( pValue: string ) : boolean
		{

			return /^https?:\/\//i.test(pValue) ||
				pValue.startsWith("data:") ||
				pValue.startsWith("blob:");

		}

}
