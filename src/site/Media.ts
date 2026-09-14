const cPageMediaAssets = import.meta.glob(
	"/src/pages/**/_M/**/*",
	{
		eager: true,
		query: "?url",
		import: "default"
	}
) as Record<string, string>;


interface PageMediaItem {
	RelativePath: string;
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
	const cRelativePath = cPageRelativePath.slice(cMediaIndex + "/_M/".length).replace(/^\/+/, "");
	const cItems = cPageMediaIndex.get(cPagePath) ?? [];

	cItems.push({
		RelativePath: cRelativePath,
		FileName: GetPathFileName(cRelativePath),
		Url: cAssetUrl
	});

	cPageMediaIndex.set(cPagePath, cItems);
}


function GetPathFileName(pPath: string) : string {
	const cNormalizedPath = pPath.replace(/\\/g, "/");
	const cParts = cNormalizedPath.split("/");
	return cParts[cParts.length - 1] ?? "";
}


export interface MediaPathOptions {
	/**
	 * Optional explicit media folder. Use this only when the caller wants to
	 * force a shared/public folder such as /Media/Shared. Relative file paths
	 * without this option are resolved against the current page _M folder.
	 */
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



	/**
	 * Resolve a media/file reference without forcing one storage location.
	 *
	 * - Ready URLs (https:, data:, blob:, //...) are returned unchanged.
	 * - Root-relative URLs (/Media/...) are returned unchanged.
	 * - Relative values first try the current page's _M folder, including any
	 *   nested path, then fall back to the value exactly as supplied.
	 * - pFolder can explicitly force a shared/public folder while keeping the
	 *   old pImgF style working.
	 */
	public static GetPageFile( pPageUrlOrPath: string , pFileOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			const cValue = `${pFileOrPath ?? ""}`.trim();

			if (!cValue) { return ""; }

			if (Media.IsReadyUrl(cValue)) { return cValue; }

			if (cValue.startsWith("/")) {
				return pOptions.pAbsolute
					? Media.GetAbsoluteUrl(pPageUrlOrPath, cValue)
					: cValue;
			}

			const cExplicitFolder = `${pOptions.pFolder ?? ""}`.trim();

			if (cExplicitFolder) {
				const cFolderResult = Media.GetFolderFile(
					pPageUrlOrPath,
					cExplicitFolder,
					cValue,
					pOptions.pAbsolute ?? false
				);

				if (cFolderResult) { return cFolderResult; }
			}

			const cPageAsset = Media.GetExistingPageAsset(
				pPageUrlOrPath,
				cValue,
				pOptions.pAbsolute ?? false
			);

			if (cPageAsset) { return cPageAsset; }

			return pOptions.pAbsolute
				? Media.GetAbsoluteUrl(pPageUrlOrPath, cValue)
				: cValue;

		}



	public static GetPageFiles( pPageUrlOrPath: string , pFilesOrPaths: string[] , pOptions: MediaPathOptions = {} ) : string[]
		{

			return pFilesOrPaths.map((pFileOrPath) => {
				return Media.GetPageFile(pPageUrlOrPath, pFileOrPath, pOptions);
			});

		}



	public static GetExistingPageAsset( pPageUrlOrPath: string , pFileOrPath: string , pAbsolute = false ) : string
		{

			const cValue = `${pFileOrPath ?? ""}`.trim();

			if (!cValue) { return ""; }

			const cPagePath = Media.GetPagePath(pPageUrlOrPath).toLowerCase();
			const cTargetPath = Media.NormalizePageMediaRelativePath(cValue);
			const cTargetPathLower = cTargetPath.toLowerCase();
			const cItems = cPageMediaIndex.get(cPagePath) ?? [];

			if (!cTargetPathLower || cItems.length === 0) { return ""; }

			let cItem = cItems.find((pItem) => {
				return pItem.RelativePath.toLowerCase() === cTargetPathLower;
			});

			if (!cItem && !cTargetPathLower.includes("/")) {
				const cFileMatches = cItems.filter((pItem) => {
					return pItem.FileName.toLowerCase() === cTargetPathLower;
				});

				if (cFileMatches.length === 1) {
					cItem = cFileMatches[0];
				}

				if (!cItem) {
					const cSuffixMatches = cItems.filter((pItem) => {
						return pItem.FileName.toLowerCase().endsWith(cTargetPathLower);
					});

					if (cSuffixMatches.length === 1) {
						cItem = cSuffixMatches[0];
					}
				}
			}

			if (!cItem) { return ""; }

			const cSuffix = Media.GetUrlSuffix(cValue);
			const cAssetUrl = `${cItem.Url}${cSuffix}`;

			return pAbsolute
				? Media.GetAbsoluteUrl(pPageUrlOrPath, cAssetUrl)
				: cAssetUrl;

		}



	public static GetExistingHeroLandscape( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			return Media.GetExistingHero(
				pPageUrlOrPath,
				"HeroL",
				pOptions
			);

		}



	public static GetExistingHeroPortrait( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			return Media.GetExistingHero(
				pPageUrlOrPath,
				"HeroP",
				pOptions
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



	private static GetExistingHero( pPageUrlOrPath: string , pHeroName: "HeroL" | "HeroP" , pOptions: MediaPathOptions ) : string
		{

			const cExtensions = ["webp", "avif", "png", "jpg", "jpeg"];
			const cExplicitFolder = `${pOptions.pFolder ?? ""}`.trim();

			if (cExplicitFolder && !Media.IsPageMediaFolder(pPageUrlOrPath, cExplicitFolder)) {
				return Media.GetPageFile(
					pPageUrlOrPath,
					`${pHeroName}.${cExtensions[0]}`,
					pOptions
				);
			}

			for (const cExtension of cExtensions) {
				const cAssetUrl = Media.GetExistingPageAsset(
					pPageUrlOrPath,
					`${pHeroName}.${cExtension}`,
					pOptions.pAbsolute ?? false
				);

				if (cAssetUrl) { return cAssetUrl; }
			}

			return "";

		}



	private static GetFolderFile( pPageUrlOrPath: string , pFolder: string , pFileOrPath: string , pAbsolute: boolean ) : string
		{

			if (Media.IsPageMediaFolder(pPageUrlOrPath, pFolder)) {
				return Media.GetExistingPageAsset(pPageUrlOrPath, pFileOrPath, pAbsolute);
			}

			const cFolder = pFolder.replace(/\\/g, "/").replace(/\/+$/, "");
			const cFile = pFileOrPath.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");

			if (!cFolder || !cFile) { return ""; }

			let cJoined = "";

			if (Media.IsReadyUrl(cFolder)) {
				const cBase = cFolder.endsWith("/") ? cFolder : `${cFolder}/`;
				cJoined = new URL(cFile, cBase).href;
			}
			else {
				cJoined = `${cFolder}/${cFile}`.replace(/\/{2,}/g, "/");
				if (pFolder.startsWith("/") && !cJoined.startsWith("/")) {
					cJoined = `/${cJoined}`;
				}
			}

			return pAbsolute
				? Media.GetAbsoluteUrl(pPageUrlOrPath, cJoined)
				: cJoined;

		}



	private static IsPageMediaFolder( pPageUrlOrPath: string , pFolder: string ) : boolean
		{

			const cFolder = pFolder.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
			const cExpected = Media.GetPageFolder(pPageUrlOrPath).replace(/\/+$/, "").toLowerCase();

			return cFolder === cExpected || cFolder === "_m" || cFolder === "./_m";

		}



	private static NormalizePageMediaRelativePath( pValue: string ) : string
		{

			const cWithoutSuffix = pValue.split(/[?#]/, 1)[0];
			let cPath = Media.SafeDecodeURIComponent(cWithoutSuffix)
				.replace(/\\/g, "/")
				.replace(/^\.\//, "")
				.replace(/^\/+/, "");

			if (cPath.toLowerCase().startsWith("_m/")) {
				cPath = cPath.slice(3);
			}

			const cNestedMediaIndex = cPath.toLowerCase().lastIndexOf("/_m/");
			if (cNestedMediaIndex >= 0) {
				cPath = cPath.slice(cNestedMediaIndex + "/_M/".length);
			}

			return cPath.replace(/^\/+|\/+$/g, "");

		}



	private static GetPagePath( pPageUrlOrPath: string ) : string
		{

			return Media.SafeDecodeURIComponent(Media.GetPathname(pPageUrlOrPath))
				.split(/[?#]/, 1)[0]
				.replace(/^\/+|\/+$/g, "");

		}



	public static GetFileName( pPath: string ) : string
		{

			const cCleanPath = pPath.split(/[?#]/, 1)[0];
			const cNormalizedPath = Media.SafeDecodeURIComponent(cCleanPath).replace(/\\/g, "/");
			const cParts = cNormalizedPath.split("/");

			return cParts[cParts.length - 1] ?? "";

		}



	private static GetUrlSuffix( pValue: string ) : string
		{

			const cIndex = pValue.search(/[?#]/);
			return cIndex >= 0 ? pValue.slice(cIndex) : "";

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

			return /^[a-z][a-z0-9+.-]*:/i.test(pValue) || pValue.startsWith("//");

		}



	private static SafeDecodeURIComponent( pValue: string ) : string
		{

			try {
				return decodeURIComponent(pValue);
			}
			catch {
				return pValue;
			}

		}

}
