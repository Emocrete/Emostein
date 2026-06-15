import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface MediaPathOptions {
	pRoot?: string;
	pFolder?: string;
	pAbsolute?: boolean;
	pImgName?: string;
}

export class Media {

	private static readonly cDefaultRoot = "/Media";

	public static GetPageFolder( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			if (pOptions.pFolder) { return Media.NormalizeFolder(pOptions.pFolder); }

			const cRoot = Media.NormalizeFolder(pOptions.pRoot ?? Media.cDefaultRoot).replace(/\/$/, "");
			const cPath = Media.GetPathname(pPageUrlOrPath);

			const cParts = cPath
				.split("/")
				.map((pPart) => pPart.trim())
				.filter((pPart) => pPart.length > 0)
				.map((pPart) => Media.ToFolderPart(pPart));

			if (cParts.length === 0) { return `${cRoot}/`; }

			return `${cRoot}/${cParts.join("/")}/`;

		}



	public static GetPageFile( pPageUrlOrPath: string , pFileOrPath: string , pOptions: MediaPathOptions = {} ) : string
		{

			if (!pFileOrPath) { return ""; }

			if (Media.IsReadyUrl(pFileOrPath)) { return pFileOrPath; }

			const cPath = pFileOrPath.startsWith("/") ? pFileOrPath : `${Media.GetPageFolder(pPageUrlOrPath, pOptions)}${pFileOrPath}`;

			if (!pOptions.pAbsolute) { return cPath; }

			return Media.GetAbsoluteUrl(pPageUrlOrPath, cPath);

		}



	public static GetPageFiles( pPageUrlOrPath: string , pFilesOrPaths: string[] , pOptions: MediaPathOptions = {} ) : string[]
		{

			return pFilesOrPaths.map((pFileOrPath) => {
				return Media.GetPageFile(pPageUrlOrPath, pFileOrPath, pOptions);
			});

		}



		public static GetHeroLandscape( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
			{

				return Media.GetPageFile(pPageUrlOrPath, Media.GetHeroFileName(pPageUrlOrPath, pOptions, "HeroL"), pOptions);

			}



		public static GetHeroPortrait( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string
			{

				return Media.GetPageFile(pPageUrlOrPath, Media.GetHeroFileName(pPageUrlOrPath, pOptions, "HeroP"), pOptions);

			}



	public static GetHeroImages( pPageUrlOrPath: string , pOptions: MediaPathOptions = {} ) : string[]
		{

			return [
				Media.GetHeroLandscape(pPageUrlOrPath, pOptions),
				Media.GetHeroPortrait(pPageUrlOrPath, pOptions)
			];

		}



		private static GetHeroFileName( pPageUrlOrPath: string , pOptions: MediaPathOptions , pHeroName: "HeroL" | "HeroP" ) : string
			{

				const cFolder = Media.GetPageFolder(pPageUrlOrPath, pOptions);
				const cFoundFile = Media.FindHeroFileName(cFolder, pHeroName);

				return cFoundFile || `${pHeroName}.webp`;

			}



		private static FindHeroFileName( pFolder: string , pHeroName: "HeroL" | "HeroP" ) : string
			{

				const cFolderPath = Media.GetPublicFolderPath(pFolder);

				if (!existsSync(cFolderPath)) { return ""; }

				const cHeroFilePattern = new RegExp(`${pHeroName}\\.(webp|avif|png|jpe?g)$`, "i");

				const cFiles = readdirSync(cFolderPath, { withFileTypes: true })
					.filter((pFile) => pFile.isFile())
					.map((pFile) => pFile.name)
					.filter((pFileName) => cHeroFilePattern.test(pFileName))
					.sort((pFirst, pSecond) => {
						return Media.GetHeroFilePriority(pFirst, pHeroName) - Media.GetHeroFilePriority(pSecond, pHeroName)
							|| pFirst.localeCompare(pSecond);
					});

				return cFiles[0] ?? "";

			}



		private static GetHeroFilePriority( pFileName: string , pHeroName: "HeroL" | "HeroP" ) : number
			{

				return pFileName.toLowerCase() === `${pHeroName.toLowerCase()}.webp` ? 10 : 0;

			}



		private static GetPublicFolderPath( pFolder: string ) : string
			{

				const cFolder = Media.NormalizeFolder(pFolder).replace(/^\/+/, "");

				return join(process.cwd(), "public", cFolder);

			}



	private static GetPathname( pPageUrlOrPath: string ) : string
		{

			if (/^https?:\/\//i.test(pPageUrlOrPath)) {	return new URL(pPageUrlOrPath).pathname;}

			return pPageUrlOrPath;

		}



	private static GetAbsoluteUrl( pPageUrlOrPath: string , pPath: string ) : string
		{

			const cBase = /^https?:\/\//i.test(pPageUrlOrPath) ? pPageUrlOrPath : "https://www.emocrete.com/";

			return new URL(pPath, cBase).href;

		}



	private static IsReadyUrl( pValue: string ) : boolean
		{

			return /^https?:\/\//i.test(pValue) || pValue.startsWith("data:") || pValue.startsWith("blob:");

		}



	private static NormalizeFolder( pFolder: string ) : string
		{

			if (!pFolder) { return "/"; }

			const cStart = pFolder.startsWith("/") ? pFolder : `/${pFolder}`;

			return cStart.endsWith("/") ? cStart : `${cStart}/`;

		}



	private static ToFolderPart( pValue: string ) : string
		{

			return pValue
				.split("-")
				.filter((pPart) => pPart.length > 0)
				.map((pPart) => {
					return pPart.charAt(0).toUpperCase() + pPart.slice(1);
				})
				.join("-");

		}
}