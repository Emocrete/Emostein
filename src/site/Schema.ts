import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Media } from "@/Media";
import { SeoText } from "@/SeoText";

type SchemaObject = Record<string, unknown>;

export type LayoutSchemaType =
	| "Organization"
	| "Person"
	| "LocalBusiness"
	| "GeneralContractor"
	| "HomeAndConstructionBusiness"
	| "MedicalBusiness"
	| "CollectionPage"
	| "Service"
	| "Article";

interface SchemaImageSpec {
	FileName: string;
	Width?: number;
	Height?: number;
}

export interface SchemaImageMeta {
	Url: string;
	Width?: number;
	Height?: number;
	Alt: string;
}

export interface ServiceSchemaOptions {
	pImages?: string[];
	pHeroFolder?: string;
	pHeroImageNames?: string[];
	pServiceType?: string;
	pProviderId?: string;
	pAreaServed?: string | SchemaObject | SchemaObject[];
}

export interface SectionSchemaOptions {
	pImages?: string[];
	pHeroFolder?: string;
	pHeroImageNames?: string[];
	pSchemaType?: LayoutSchemaType;
	pParentId?: string;
	pSameAs?: string[];
	pTelephone?: string;
	pPriceRange?: string;
}

export interface CollectionSchemaOptions {
	pImages?: string[];
	pHeroFolder?: string;
	pHeroImageNames?: string[];
}

export interface ArticleSchemaOptions {
	pImages?: string[];
	pHeroFolder?: string;
	pHeroImageNames?: string[];
	pAuthorId?: string;
}

export interface OrganizationSchemaOptions {
	pName?: string;
	pUrl?: string;
	pLogo?: string;
	pSameAs?: string[];
	pTelephone?: string;
	pImages?: string[];
	pHeroFolder?: string;
	pHeroImageNames?: string[];
}

export interface FreelancerSchemaOptions {
	pName?: string;
	pUrl?: string;
	pSameAs?: string[];
	pTelephone?: string;
	pImages?: string[];
	pHeroFolder?: string;
	pHeroImageNames?: string[];
}

export class Schema {
	private static readonly cOrgId = "https://www.emocrete.com#org";
	private static readonly cWebsiteId = "https://www.emocrete.com#website";
	private static readonly cFounderId = "https://www.emocrete.com#founder";
	private static readonly cTelephone = "01014490054";
	private static readonly cPriceRange = "$$";
	private static readonly cDefaultOrgName = "Emostein";
	private static readonly cLogoPath = "/Media/EmoLogo.svg";

	private static readonly cDefaultSchemaImageSpecs: SchemaImageSpec[] = [
		{ FileName: "Schema-1x1-1200.webp", Width: 1200, Height: 1200 },
		{ FileName: "Schema-4x3-1200.webp", Width: 1200, Height: 900 },
		{ FileName: "Schema-16x9-1200.webp", Width: 1200, Height: 675 },
		{ FileName: "HeroL.webp", Width: 1920, Height: 800 },
		{ FileName: "HeroP.webp", Width: 360, Height: 680 },
		{ FileName: "Share.webp", Width: 1200, Height: 630 },
		{ FileName: "Share.jpg", Width: 1200, Height: 630 }
	];

	private static readonly cSameAs = [
		"https://www.youtube.com/@aymanashoor7410"
	];


	private static readonly cBreadcrumbNames: Record<string, string> = {
		emochain: "إدارة المشروعات",
		emocrete: "البناء والتشييد",
		emodsign: "المكتب الهندسي",
		emomed: "ترخيص المنشآت الطبية",
		emonsult: "خدمات استشارية",
		emoperm: "تراخيص إدارية",
		emostate: "خدمات عقارية",
		emostone: "رخام وجرانيت",
		report: "تقارير هندسية",
		certificate: "شهادات هندسية",
		stamp: "ختم هندسي",
		building: "تراخيص البناء",
		retail: "تراخيص المحلات",
		general: "ترخيص محل تجاري",
		resturant: "ترخيص مطعم",
		pharmacy: "ترخيص صيدلية",
		clinic: "ترخيص عيادة",
		lab: "ترخيص معمل تحاليل",
		pharmastore: "ترخيص مخزن أدوية",
		hospital: "ترخيص مستشفى",
		soffice: "ترخيص مكتب علمي",
		factory: "ترخيص مصنع",
		fuelstation: "ترخيص محطة وقود",
		nursery: "ترخيص حضانة",
		dwg: "رسم هندسي",
		doc: "المستندات المطلوبة",
		proc: "الإجراءات",
		cond: "الشروط",
		cost: "التكلفة",
		distance: "قياس المسافة",
		finishing: "التشطيبات",
		supervision: "الإشراف الهندسي",
		construction: "البناء",
		contracting: "مقاولات عامة",
		develop: "التطوير العقاري",
		des: "التصميم",
		cr: "تصميم إبداعي",
		eng: "تصميم هندسي",
		arch: "تصميم معماري",
		struc: "تصميم إنشائي",
		elec: "تصميم كهرباء",
		mech: "تصميم ميكانيكا",
		tech: "خدمات فنية",
		shopdwg: "شوب دروينج",
		takeoff: "حصر كميات",
		manage: "إدارة فنية",
		table: "جداول المشروع",
		apartment: "شقق",
		villa: "فيلات",
		marble: "رخام",
		granit: "جرانيت",
		eg: "مصري",
		imp: "مستورد",
		index: "الرئيسية"
	};

	public static GetOrganization( pTitle: string , pDescr: string , pUrl: string , pOptions: OrganizationSchemaOptions = {} ) : string
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cPageId = `${cUrl}#webpage`;
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cGraph = Schema.GetBaseGraph(pTitle, pDescr, cUrl, pOptions);

			cGraph.push(Schema.GetPageNode(
				"WebPage",
				pTitle,
				pDescr,
				cUrl,
				cPageId,
				Schema.cOrgId,
				cImages
			));

			return Schema.StringifyGraph(cGraph);

		}



	public static GetFreelancer( pTitle: string , pDescr: string , pUrl: string , pOptions: FreelancerSchemaOptions = {} ) : string
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cPageId = `${cUrl}#webpage`;
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cGraph = Schema.GetBaseGraph(pTitle, pDescr, cUrl, {
				pSameAs: pOptions.pSameAs,
				pTelephone: pOptions.pTelephone,
				pImages: pOptions.pImages,
				pHeroFolder: pOptions.pHeroFolder,
				pHeroImageNames: pOptions.pHeroImageNames
			});

			cGraph.push(Schema.GetPageNode(
				"WebPage",
				pTitle,
				pDescr,
				cUrl,
				cPageId,
				Schema.cFounderId,
				cImages
			));

			return Schema.StringifyGraph(cGraph);

		}



	public static GetSection( pTitle: string , pDescr: string , pUrl: string , pOptions: SectionSchemaOptions = {} ) : string
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cSectionId = `${cUrl}#business`;
			const cPageId = `${cUrl}#webpage`;
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cGraph = Schema.GetBaseGraph(pTitle, pDescr, cUrl);

			cGraph.push(Schema.GetPageNode(
				"CollectionPage",
				pTitle,
				pDescr,
				cUrl,
				cPageId,
				cSectionId,
				cImages
			));

			cGraph.push({
				"@type": pOptions.pSchemaType ?? "LocalBusiness",
				"@id": cSectionId,
				"name": pTitle,
				"description": pDescr,
				"url": cUrl,
				...Schema.GetImageProperty(cImages),
				"telephone": pOptions.pTelephone ?? Schema.cTelephone,
				"priceRange": pOptions.pPriceRange ?? Schema.cPriceRange,
				"parentOrganization": {
					"@id": pOptions.pParentId ?? Schema.cOrgId
				},
				"address": Schema.GetAddress(),
				"geo": Schema.GetGeo(),
				"openingHoursSpecification": Schema.GetOpeningHours(),
				"sameAs": pOptions.pSameAs ?? Schema.cSameAs
			});

			return Schema.StringifyGraph(cGraph);

		}



	public static GetCollection( pTitle: string , pDescr: string , pUrl: string , pOptions: CollectionSchemaOptions = {} ) : string
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cPageId = `${cUrl}#webpage`;
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cGraph = Schema.GetBaseGraph(pTitle, pDescr, cUrl);

			cGraph.push({
				...Schema.GetPageNode(
					"CollectionPage",
					pTitle,
					pDescr,
					cUrl,
					cPageId,
					undefined,
					cImages
				),
				...Schema.GetImageProperty(cImages)
			});

			return Schema.StringifyGraph(cGraph);

		}



	public static GetService( pTitle: string , pDescr: string , pUrl: string , pOptions: ServiceSchemaOptions = {} ) : string
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cServiceId = `${cUrl}#service`;
			const cPageId = `${cUrl}#webpage`;
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cGraph = Schema.GetBaseGraph(pTitle, pDescr, cUrl);

			cGraph.push(Schema.GetPageNode(
				"WebPage",
				pTitle,
				pDescr,
				cUrl,
				cPageId,
				cServiceId,
				cImages
			));

			cGraph.push({
				"@type": "Service",
				"@id": cServiceId,
				"name": pTitle,
				"description": pDescr,
				"url": cUrl,
				...Schema.GetImageProperty(cImages),
				"serviceType": pOptions.pServiceType ?? pTitle,
				"areaServed": pOptions.pAreaServed ?? "EG",
				"provider": {
					"@id": pOptions.pProviderId ?? Schema.cOrgId
				},
				"mainEntityOfPage": {
					"@id": cPageId
				}
			});

			return Schema.StringifyGraph(cGraph);

		}



	public static GetArticle( pTitle: string , pDescr: string , pUrl: string , pOptions: ArticleSchemaOptions = {} ) : string
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cArticleId = `${cUrl}#article`;
			const cPageId = `${cUrl}#webpage`;
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cGraph = Schema.GetBaseGraph(pTitle, pDescr, cUrl);

			cGraph.push(Schema.GetPageNode(
				"WebPage",
				pTitle,
				pDescr,
				cUrl,
				cPageId,
				cArticleId,
				cImages
			));

			cGraph.push({
				"@type": "Article",
				"@id": cArticleId,
				"headline": pTitle,
				"name": pTitle,
				"description": pDescr,
				"url": cUrl,
				...Schema.GetImageProperty(cImages),
				"inLanguage": "ar-EG",
				"author": {
					"@id": pOptions.pAuthorId ?? Schema.cFounderId
				},
				"publisher": {
					"@id": Schema.cOrgId
				},
				"mainEntityOfPage": {
					"@id": cPageId
				}
			});

			return Schema.StringifyGraph(cGraph);

		}



	public static GetPrimaryImageUrl( pTitle: string , pUrl: string , pOptions: ServiceSchemaOptions | SectionSchemaOptions | CollectionSchemaOptions | ArticleSchemaOptions | OrganizationSchemaOptions = {} ) : string
		{

			return Schema.GetPrimaryImageMeta(pTitle, "", pUrl, pOptions).Url;

		}



	public static GetPrimaryImageMeta( pTitle: string , pDescr: string , pUrl: string , pOptions: ServiceSchemaOptions | SectionSchemaOptions | CollectionSchemaOptions | ArticleSchemaOptions | OrganizationSchemaOptions = {} ) : SchemaImageMeta
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cImages = Schema.GetSchemaImages(cUrl, pTitle, pDescr, pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames);
			const cImage = cImages[0];

			return {
				Url: Schema.GetImageUrl(cImage),
				Width: Schema.GetNumber(cImage?.["width"]),
				Height: Schema.GetNumber(cImage?.["height"]),
				Alt: SeoText.GetImageAlt(pTitle, pDescr)
			};

		}



	public static GetImageUrls( pTitle: string , pUrl: string , pOptions: ServiceSchemaOptions | SectionSchemaOptions | CollectionSchemaOptions | ArticleSchemaOptions | OrganizationSchemaOptions = {} ) : string[]
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);

			return Schema.GetSchemaImages(cUrl, pTitle, "", pOptions.pImages, pOptions.pHeroFolder, pOptions.pHeroImageNames)
				.map((pImage) => Schema.GetImageUrl(pImage))
				.filter((pUrl) => pUrl.length > 0);

		}



	private static GetBaseGraph( pTitle: string , pDescr: string , pUrl: string , pOptions: OrganizationSchemaOptions = {} ) : SchemaObject[]
		{

			const cSiteUrl = SeoText.NormalizePageUrl(pOptions.pUrl ?? Schema.GetSiteOrigin(pUrl));
			const cLogo = Schema.GetAbsoluteUrl(pUrl, pOptions.pLogo ?? Schema.cLogoPath);
			const cOrgName = pOptions.pName ?? Schema.cDefaultOrgName;
			const cSameAs = pOptions.pSameAs ?? Schema.cSameAs;
			const cTelephone = pOptions.pTelephone ?? Schema.cTelephone;

			return [
				{
					"@type": "Organization",
					"@id": Schema.cOrgId,
					"name": cOrgName,
					"url": cSiteUrl,
					"logo": cLogo,
					"telephone": cTelephone,
					"sameAs": cSameAs,
					"founder": {
						"@id": Schema.cFounderId
					},
					"contactPoint": {
						"@type": "ContactPoint",
						"telephone": cTelephone,
						"contactType": "customer service",
						"areaServed": "EG",
						"availableLanguage": [
							"ar-EG",
							"en"
						]
					}
				},
				{
					"@type": "Person",
					"@id": Schema.cFounderId,
					"name": "أيمن عاشور",
					"telephone": cTelephone,
					"sameAs": cSameAs,
					"worksFor": {
						"@id": Schema.cOrgId
					}
				},
				{
					"@type": "WebSite",
					"@id": Schema.cWebsiteId,
					"url": cSiteUrl,
					"name": cOrgName,
					"inLanguage": "ar-EG",
					"publisher": {
						"@id": Schema.cOrgId
					}
				},
				Schema.GetBreadcrumbNode(pTitle, pUrl)
			];

		}



	private static GetPageNode( pPageType: "WebPage" | "CollectionPage" , pTitle: string , pDescr: string , pUrl: string , pPageId: string , pMainEntityId?: string , pImages: SchemaObject[] = [] ) : SchemaObject
		{

			const cUrl = Schema.NormalizePageUrl(pUrl);
			const cPageNode: SchemaObject = {
				"@type": pPageType,
				"@id": pPageId,
				"name": pTitle,
				"description": pDescr,
				"url": cUrl,
				"inLanguage": "ar-EG",
				"isPartOf": {
					"@id": Schema.cWebsiteId
				},
				"breadcrumb": {
					"@id": `${cUrl}#breadcrumb`
				}
			};

			if (pMainEntityId) {
				cPageNode["mainEntity"] = {
					"@id": pMainEntityId
				};
			}

			if (pImages.length > 0) {
				const cPrimaryImage = pImages[0];
				const cPrimaryImageUrl = Schema.GetImageUrl(cPrimaryImage);

				cPageNode["image"] = pImages;

				if (cPrimaryImage?.["@id"]) {
					cPageNode["primaryImageOfPage"] = {
						"@id": cPrimaryImage["@id"]
					};
				}

				if (cPrimaryImageUrl) { cPageNode["thumbnailUrl"] = cPrimaryImageUrl; }
			}

			return cPageNode;

		}



	private static GetSchemaImages( pUrl: string , pTitle: string , pDescr: string , pImages?: string[] , pHeroFolder?: string , pHeroImageNames?: string[] ) : SchemaObject[]
		{

			const cHeroFolder = Schema.GetSchemaHeroFolder(pUrl, pHeroFolder);
			const cImages: SchemaObject[] = [];
			const cUsedUrls = new Set<string>();

			Schema.AddImageObjects(
				cImages,
				cUsedUrls,
				pUrl,
				pTitle,
				pDescr,
				(pImages ?? []).map((pImage) => {
					return { FileName: pImage };
				}),
				cHeroFolder
			);

			Schema.AddImageObjects(
				cImages,
				cUsedUrls,
				pUrl,
				pTitle,
				pDescr,
				(pHeroImageNames ?? []).map((pImage) => {
					return Schema.GetImageSpecByName(pImage);
				}),
				cHeroFolder
			);

			Schema.AddImageObjects(cImages, cUsedUrls, pUrl, pTitle, pDescr, Schema.cDefaultSchemaImageSpecs, cHeroFolder, true);

			if (cImages.length === 0) {
				for (const cFallbackFolder of Schema.GetFallbackHeroFolders(cHeroFolder)) {
					Schema.AddImageObjects(cImages, cUsedUrls, pUrl, pTitle, pDescr, Schema.cDefaultSchemaImageSpecs, cFallbackFolder, true);

					if (cImages.length > 0) { break; }
				}
			}

			if (cImages.length > 0) { cImages[0]["representativeOfPage"] = true; }

			return cImages;

		}



	private static GetFallbackHeroFolders( pFolder: string ) : string[]
		{

			const cParts = Schema.NormalizeFolder(pFolder)
				.replace(/^\/+|\/+$/g, "")
				.split("/")
				.filter((pPart) => pPart.length > 0);
			const cFolders: string[] = [];

			while (cParts.length > 2) {
				cParts.pop();

				const cFolder = Schema.ResolveExistingFolderPath(`/${cParts.join("/")}/`);

				if (cFolder) { cFolders.push(cFolder); }
			}

			return cFolders;

		}



	private static AddImageObjects( pImages: SchemaObject[] , pUsedUrls: Set<string> , pPageUrl: string , pTitle: string , pDescr: string , pSpecs: SchemaImageSpec[] , pFolder: string , pRequireLocalFile = false ) : void
		{

			pSpecs.forEach((pSpec) => {
				const cPath = Schema.ResolveImagePath(pPageUrl, pFolder, pSpec, pRequireLocalFile);

				if (!cPath) { return; }
				if (!Schema.IsExternalUrl(cPath) && !Schema.CanUseImagePath(cPath)) { return; }

				const cUrl = Schema.GetAbsoluteUrl(pPageUrl, cPath);

				if (pUsedUrls.has(cUrl)) { return; }

				pUsedUrls.add(cUrl);
				pImages.push(Schema.GetImageObject(cUrl, pTitle, pDescr, pSpec.Width, pSpec.Height));
			});

		}



	private static GetSchemaHeroFolder( pUrl: string , pHeroFolder?: string ) : string
		{

			if (pHeroFolder) {
				const cFolder = Media.GetPageFolder(pUrl, { pFolder: pHeroFolder });

				return Schema.ResolveExistingFolderPath(cFolder) || cFolder;
			}

			const cPath = new URL(pUrl).pathname.replace(/\/+$/, "") || "/";
			const cFolder = cPath === "/" ? "/Media/Home/" : Media.GetPageFolder(pUrl);

			return Schema.ResolveExistingFolderPath(cFolder) || cFolder;

		}



	private static ResolveExistingFolderPath( pFolder: string ) : string
		{

			const cFolder = Schema.NormalizeFolder(pFolder);
			const cExactPath = join(process.cwd(), "public", cFolder.replace(/^\/+/, ""));

			if (existsSync(cExactPath)) { return cFolder; }

			const cParts = cFolder.replace(/^\/+|\/+$/g, "").split("/").filter((pPart) => pPart.length > 0);
			let cCurrentPath = join(process.cwd(), "public");
			const cResolvedParts: string[] = [];

			for (const cPart of cParts) {
				if (!existsSync(cCurrentPath)) { return ""; }

				const cFoundPart = readdirSync(cCurrentPath, { withFileTypes: true })
					.filter((pItem) => pItem.isDirectory())
					.map((pItem) => pItem.name)
					.find((pName) => pName.toLowerCase() === cPart.toLowerCase());

				if (!cFoundPart) { return ""; }

				cResolvedParts.push(cFoundPart);
				cCurrentPath = join(cCurrentPath, cFoundPart);
			}

			return `/${cResolvedParts.join("/")}/`;

		}



	private static ResolveImagePath( pPageUrl: string , pFolder: string , pSpec: SchemaImageSpec , pRequireLocalFile: boolean ) : string
		{

			if (!pSpec.FileName) { return ""; }
			if (Schema.IsExternalUrl(pSpec.FileName)) { return pSpec.FileName; }

			const cHeroPath = Schema.GetHeroPath(pPageUrl, pFolder, pSpec.FileName);
			if (cHeroPath) { return cHeroPath; }

			const cRawPath = Schema.JoinImagePath(pFolder, pSpec.FileName);
			const cResolvedPath = Schema.ResolveExistingImagePath(cRawPath);

			if (cResolvedPath) { return cResolvedPath; }
			if (pRequireLocalFile) { return ""; }

			return cRawPath;

		}



	private static GetHeroPath( pPageUrl: string , pFolder: string , pFileName: string ) : string
		{

			const cFileName = Schema.GetFileName(pFileName).toLowerCase();

			if (cFileName === "herol.webp") {
				const cHeroPath = Media.GetHeroLandscape(pPageUrl, { pFolder });

				return Schema.CanUseImagePath(cHeroPath) ? cHeroPath : "";
			}

			if (cFileName === "herop.webp") {
				const cHeroPath = Media.GetHeroPortrait(pPageUrl, { pFolder });

				return Schema.CanUseImagePath(cHeroPath) ? cHeroPath : "";
			}

			return "";

		}



	private static ResolveExistingImagePath( pPath: string ) : string
		{

			if (Schema.IsExternalUrl(pPath)) { return pPath; }
			if (Schema.CanUseImagePath(pPath)) { return pPath; }
			if (!pPath.startsWith("/")) { return ""; }

			const cSlashIndex = pPath.lastIndexOf("/");
			if (cSlashIndex < 0) { return ""; }

			const cFolder = pPath.slice(0, cSlashIndex + 1);
			const cFileName = pPath.slice(cSlashIndex + 1);
			const cFoundFile = Schema.FindLocalFileBySuffix(cFolder, cFileName);

			return cFoundFile ? `${cFolder}${cFoundFile}` : "";

		}



	private static FindLocalFileBySuffix( pFolder: string , pFileName: string ) : string
		{

			const cFolder = Schema.NormalizeFolder(pFolder);
			const cFolderPath = join(process.cwd(), "public", cFolder.replace(/^\/+/, ""));

			if (!existsSync(cFolderPath)) { return ""; }

			const cFileName = pFileName.toLowerCase();
			const cFiles = readdirSync(cFolderPath, { withFileTypes: true })
				.filter((pFile) => pFile.isFile())
				.map((pFile) => pFile.name)
				.filter((pFoundFileName) => pFoundFileName.toLowerCase().endsWith(cFileName))
				.sort((pFirst, pSecond) => {
					return Schema.GetFileSuffixPriority(pFirst, cFileName) - Schema.GetFileSuffixPriority(pSecond, cFileName)
						|| pFirst.localeCompare(pSecond);
				});

			return cFiles[0] ?? "";

		}



	private static GetFileSuffixPriority( pFoundFileName: string , pTargetFileName: string ) : number
		{

			return pFoundFileName.toLowerCase() === pTargetFileName ? 0 : 10;

		}



	private static GetImageObject( pUrl: string , pTitle: string , pDescr: string , pWidth?: number , pHeight?: number ) : SchemaObject
		{

			const cCleanTitle = SeoText.GetCleanTitle(pTitle);
			const cImageAlt = SeoText.GetImageAlt(pTitle, pDescr);
			const cImage: SchemaObject = {
				"@type": "ImageObject",
				"@id": `${pUrl}#image`,
				"url": pUrl,
				"contentUrl": pUrl,
				"name": cCleanTitle || cImageAlt,
				"caption": cImageAlt,
				"description": cImageAlt,
				"inLanguage": "ar-EG"
			};

			if (pWidth) { cImage["width"] = pWidth; }
			if (pHeight) { cImage["height"] = pHeight; }

			return cImage;

		}



	private static GetImageProperty( pImages: SchemaObject[] ) : SchemaObject
		{

			if (pImages.length === 0) { return {}; }

			return {
				"image": pImages
			};

		}



	private static GetImageUrl( pImage?: SchemaObject ) : string
		{

			const cUrl = pImage?.["url"] ?? pImage?.["contentUrl"];

			return typeof cUrl === "string" ? cUrl : "";

		}



	private static GetImageSpecByName( pImageName: string ) : SchemaImageSpec
		{

			const cKnown = Schema.cDefaultSchemaImageSpecs.find((pSpec) => {
				return pSpec.FileName.toLowerCase() === pImageName.toLowerCase();
			});

			return cKnown ?? { FileName: pImageName };

		}



	private static JoinImagePath( pFolder: string , pFileName: string ) : string
		{

			if (Schema.IsExternalUrl(pFileName) || pFileName.startsWith("/")) { return pFileName; }
			if (!pFolder) { return pFileName; }

			return `${Schema.NormalizeFolder(pFolder)}${pFileName}`;

		}



	private static NormalizeFolder( pFolder: string ) : string
		{

			if (!pFolder) { return "/"; }

			const cStart = pFolder.startsWith("/") ? pFolder : `/${pFolder}`;

			return cStart.endsWith("/") ? cStart : `${cStart}/`;

		}



	private static GetFileName( pPath: string ) : string
		{

			const cParts = pPath.split("/");

			return cParts[cParts.length - 1] ?? pPath;

		}



	private static CanUseImagePath( pPath: string ) : boolean
		{

			if (Schema.IsExternalUrl(pPath)) { return true; }
			if (!pPath.startsWith("/")) { return false; }

			const cFilePath = join(process.cwd(), "public", pPath);

			return existsSync(cFilePath);

		}



	private static IsExternalUrl( pPath: string ) : boolean
		{

			return /^https?:\/\//i.test(pPath);

		}



	private static GetAbsoluteUrl( pPageUrl: string , pPath: string ) : string
		{

			if (Schema.IsExternalUrl(pPath)) { return pPath; }

			const cCleanPath = pPath.startsWith("/") ? pPath : `/${pPath}`;

			return new URL(cCleanPath, Schema.GetSiteOrigin(pPageUrl)).href;

		}



	private static NormalizePageUrl( pUrl: string ) : string
		{

			return SeoText.NormalizePageUrl(pUrl);

		}



	private static GetNumber( pValue: unknown ) : number | undefined
		{

			return typeof pValue === "number" ? pValue : undefined;

		}



	private static GetSiteOrigin( pUrl: string ) : string
		{

			const cPageUrl = Schema.NormalizePageUrl(pUrl);
			const cUrl = new URL(cPageUrl);

			return `${cUrl.protocol}//${cUrl.host}`;

		}



	private static GetBreadcrumbNode( pTitle: string , pUrl: string ) : SchemaObject
		{

			const cPageUrl = Schema.NormalizePageUrl(pUrl);
			const cUrl = new URL(cPageUrl);
			const cParts = cUrl.pathname
				.split("/")
				.map((pPart) => pPart.trim())
				.filter((pPart) => pPart.length > 0);
			const cOrigin = Schema.GetSiteOrigin(cPageUrl);
			const cItems: SchemaObject[] = [
				Schema.GetBreadcrumbItem(1, "الرئيسية", cOrigin)
			];
			let cPath = "";

			cParts.forEach((pPart, pIndex) => {
				cPath = `${cPath}/${pPart}`;
				const cIsLast = pIndex === cParts.length - 1;
				const cName = cIsLast ? pTitle : Schema.GetBreadcrumbName(pPart);

				cItems.push(Schema.GetBreadcrumbItem(
					pIndex + 2,
					cName,
					`${cOrigin}${cPath}`
				));
			});

			return {
				"@type": "BreadcrumbList",
				"@id": `${cPageUrl}#breadcrumb`,
				"name": `مسار ${pTitle}`,
				"itemListElement": cItems
			};

		}



	private static GetBreadcrumbItem( pPosition: number , pName: string , pUrl: string ) : SchemaObject
		{

			return {
				"@type": "ListItem",
				"position": pPosition,
				"name": pName,
				"item": pUrl
			};

		}



	private static GetBreadcrumbName( pSegment: string ) : string
		{

			const cName = Schema.cBreadcrumbNames[pSegment.toLowerCase()];

			if (cName) { return cName; }

			return pSegment
				.split("-")
				.filter((pPart) => pPart.length > 0)
				.map((pPart) => {
					return pPart.charAt(0).toUpperCase() + pPart.slice(1);
				})
				.join(" ");

		}



	private static GetAddress() : SchemaObject
		{

			return {
				"@type": "PostalAddress",
				"streetAddress": "1 Mostafa Refaat",
				"addressLocality": "Cairo",
				"postalCode": "11799",
				"addressCountry": "EG"
			};

		}



	private static GetGeo() : SchemaObject
		{

			return {
				"@type": "GeoCoordinates",
				"latitude": 30.1006993,
				"longitude": 31.3760563
			};

		}



	private static GetOpeningHours() : SchemaObject
		{

			return {
				"@type": "OpeningHoursSpecification",
				"dayOfWeek": [
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday",
					"Sunday"
				],
				"opens": "00:00",
				"closes": "23:59"
			};

		}



	private static StringifyGraph( pGraph: SchemaObject[] ) : string
		{

			return Schema.Stringify({
				"@context": "https://schema.org",
				"@graph": pGraph
			});

		}



	private static Stringify( pSchema: SchemaObject ) : string
		{

			return `\n${JSON.stringify(pSchema, null, "\t")}\n`;

		}
}