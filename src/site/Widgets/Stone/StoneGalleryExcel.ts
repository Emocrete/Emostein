import { readFileSync } from "node:fs";
import { posix } from "node:path";
import { inflateRawSync } from "node:zlib";

type ExcelValue = string | number | boolean | null;

type ExcelRow = {
	Number: number;
	Cells: Map<number, ExcelValue>;
};

export type StoneGalleryExcelItem = Record<string, ExcelValue | ExcelValue[]>;

export type StoneGalleryExcelResult = {
	Items: StoneGalleryExcelItem[];
	RowNumbers: number[];
	SheetName: string;
	HeaderRow: number;
};

export type StoneGalleryExcelImageMatch = {
	File: string;
	Candidates: string[];
};

type StoneGalleryExcelImageLookup = {
	RelativeWithExt: Map<string, string[]>;
	RelativeWithoutExt: Map<string, string[]>;
	BaseWithExt: Map<string, string[]>;
	BaseWithoutExt: Map<string, string[]>;
};

const cHeaderAliases = new Map<string, string>();

AddHeaderAliases("File", [
	"اسم الملف الرئيسي",
	"اسم الصورة الرئيسية",
	"الملف الرئيسي",
	"الصورة الرئيسية",
	"file",
	"image",
	"src",
]);
AddHeaderAliases("Active", ["إظهار في الجاليري", "اظهار في الجاليري", "عرض في الجاليري", "نشط", "active", "enabled"]);
AddHeaderAliases("Name", ["اسم الخامة", "اسم المنتج", "الاسم", "name", "title"]);
AddHeaderAliases("Type", ["نوع الخامة", "النوع", "type", "kind", "category"]);
AddHeaderAliases("Country", ["بلد المنشأ", "دولة المنشأ", "المنشأ", "country", "origin"]);
AddHeaderAliases("Color", ["اللون", "درجة اللون", "color"]);
AddHeaderAliases("Pattern", ["شكل العروق أو الحبيبات", "شكل العروق والحبيبات", "العروق أو الحبيبات", "النقشة", "pattern", "texture"]);
AddHeaderAliases("Description", ["الوصف", "وصف الخامة", "description", "desc", "body"]);
AddHeaderAliases("Uses", ["الاستخدامات", "أفضل استخدام", "الاستخدام", "uses", "use"]);
AddHeaderAliases("Finishes", ["التشطيبات", "تشطيب السطح", "التشطيب", "finishes", "finish", "surface finish"]);
AddHeaderAliases("Available", ["متوفر", "حالة التوفر", "available", "in stock"]);
AddHeaderAliases("Badge", ["الشارة", "شارة الكارت", "badge"]);
AddHeaderAliases("PriceFrom", ["السعر من", "بداية السعر", "price from", "start price"]);
AddHeaderAliases("PriceTo", ["السعر إلى", "السعر الي", "نهاية السعر", "price to", "end price"]);
AddHeaderAliases("PriceLevel", ["مستوى السعر", "فئة السعر", "price level", "budget"]);
AddHeaderAliases("Currency", ["العملة", "currency"]);
AddHeaderAliases("SlabFile", ["صورة اللوح", "اسم ملف اللوح", "slab file", "slab image"]);
AddHeaderAliases("ApplicationFile", ["صورة التنفيذ", "اسم ملف التنفيذ", "application file", "application image", "applied file"]);
AddHeaderAliases("Images", ["صور إضافية", "صور اضافية", "ملفات صور إضافية", "images", "extra images"]);
AddHeaderAliases("Tags", ["كلمات البحث", "وسوم البحث", "الكلمات المفتاحية", "tags", "keywords"]);
AddHeaderAliases("Id", ["معرف الخامة", "معرّف الخامة", "الكود", "id", "slug", "sku"]);
AddHeaderAliases("Alt", ["النص البديل للصورة", "وصف الصورة لمحركات البحث", "نص الصورة", "alt", "image alt"]);

export function ReadStoneGalleryExcelFile(pFilePath: string, pSheetName = "الخامات"): StoneGalleryExcelResult {
	const cEntries = ReadZipEntries(readFileSync(pFilePath));
	const cWorkbookXml = GetRequiredEntry(cEntries, "xl/workbook.xml").toString("utf8");
	const cWorkbookRelsXml = GetRequiredEntry(cEntries, "xl/_rels/workbook.xml.rels").toString("utf8");
	const cSheets = ReadSheets(cWorkbookXml, cWorkbookRelsXml);
	if (cSheets.length === 0) throw new Error("ملف Excel لا يحتوي أي ورقة عمل قابلة للقراءة.");

	const cRequestedName = NormalizeKey(pSheetName);
	const cSheet = cSheets.find((pSheet) => NormalizeKey(pSheet.Name) === cRequestedName) || (pSheetName ? null : cSheets[0]);
	if (!cSheet) throw new Error(`ورقة "${pSheetName}" غير موجودة داخل ملف Excel. الأوراق الموجودة: ${cSheets.map((pSheet) => pSheet.Name).join("، ")}.`);

	const cSharedStrings = ReadSharedStrings(cEntries.get("xl/sharedStrings.xml"));
	const cWorksheet = GetRequiredEntry(cEntries, cSheet.EntryName).toString("utf8");
	const cRows = ReadWorksheetRows(cWorksheet, cSharedStrings);
	const cHeader = FindHeaderRow(cRows);
	if (!cHeader) {
		throw new Error("لم أجد صف العناوين. يجب أن يحتوي الصف على الأقل: اسم الملف الرئيسي، اسم الخامة، نوع الخامة.");
	}

	const cColumns = new Map<number, string>();
	for (const [cColumn, cValue] of cHeader.Cells) {
		const cField = cHeaderAliases.get(NormalizeKey(cValue));
		if (cField && ![...cColumns.values()].includes(cField)) cColumns.set(cColumn, cField);
	}

	const cItems: StoneGalleryExcelItem[] = [];
	const cRowNumbers: number[] = [];
	for (const cRow of cRows) {
		if (cRow.Number <= cHeader.Number) continue;
		const cItem: StoneGalleryExcelItem = {};
		for (const [cColumn, cField] of cColumns) {
			const cValue = cRow.Cells.get(cColumn);
			if (cValue !== undefined && cValue !== null && `${cValue}`.trim() !== "") cItem[cField] = NormalizeFieldValue(cField, cValue);
		}
		if (Object.keys(cItem).length === 0) continue;
		if (!ToBoolean(cItem.Active, true)) continue;
		delete cItem.Active;
		cItems.push(cItem);
		cRowNumbers.push(cRow.Number);
	}

	return { Items: cItems, RowNumbers: cRowNumbers, SheetName: cSheet.Name, HeaderRow: cHeader.Number };
}

export function CreateStoneGalleryExcelImageMatcher(pFiles: string[], pFolder = "") {
	const cLookup = BuildImageLookup(pFiles);
	return (pValue: unknown): StoneGalleryExcelImageMatch => MatchImage(pValue, cLookup, pFolder);
}

function BuildImageLookup(pFiles: string[]): StoneGalleryExcelImageLookup {
	const cLookup: StoneGalleryExcelImageLookup = {
		RelativeWithExt: new Map(),
		RelativeWithoutExt: new Map(),
		BaseWithExt: new Map(),
		BaseWithoutExt: new Map(),
	};

	for (const cRawFile of pFiles) {
		const cFile = `${cRawFile ?? ""}`.trim().replaceAll("\\", "/").replace(/^\/+/, "");
		if (!cFile) continue;
		const cRelative = NormalizeImageKey(cFile);
		const cBase = NormalizeImageKey(posix.basename(cFile));
		AddLookupValue(cLookup.RelativeWithExt, cRelative, cFile);
		AddLookupValue(cLookup.RelativeWithoutExt, StripFileExt(cRelative), cFile);
		AddLookupValue(cLookup.BaseWithExt, cBase, cFile);
		AddLookupValue(cLookup.BaseWithoutExt, StripFileExt(cBase), cFile);
	}

	return cLookup;
}

function AddLookupValue(pMap: Map<string, string[]>, pKey: string, pFile: string) {
	if (!pKey) return;
	const cValues = pMap.get(pKey) || [];
	if (!cValues.includes(pFile)) cValues.push(pFile);
	pMap.set(pKey, cValues);
}

function MatchImage(pValue: unknown, pLookup: StoneGalleryExcelImageLookup, pFolder: string): StoneGalleryExcelImageMatch {
	const cRawValue = `${pValue ?? ""}`.trim().replaceAll("\\", "/");
	if (!cRawValue) return { File: "", Candidates: [] };
	if (/^(https?:|data:|blob:)/i.test(cRawValue) || cRawValue.startsWith("/")) return { File: cRawValue, Candidates: [] };

	const cKey = NormalizeImageReference(cRawValue, pFolder);
	const cBaseKey = NormalizeImageKey(posix.basename(cKey));
	const cSearches: Array<[Map<string, string[]>, string]> = [
		[pLookup.RelativeWithExt, cKey],
		[pLookup.RelativeWithoutExt, StripFileExt(cKey)],
		[pLookup.BaseWithExt, cBaseKey],
		[pLookup.BaseWithoutExt, StripFileExt(cBaseKey)],
	];

	for (const [cMap, cSearchKey] of cSearches) {
		const cCandidates = cMap.get(cSearchKey) || [];
		if (cCandidates.length === 1) return { File: cCandidates[0], Candidates: [] };
		if (cCandidates.length > 1) return { File: "", Candidates: cCandidates };
	}

	return { File: "", Candidates: [] };
}

function NormalizeImageReference(pValue: string, pFolder: string) {
	let cValue = SafeDecodeURIComponent(pValue).replaceAll("\\", "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
	if (cValue.toLowerCase().startsWith("public/")) cValue = cValue.slice(7);
	const cFolder = `${pFolder ?? ""}`.trim().replaceAll("\\", "/").replace(/^public\//i, "").replace(/^\/+|\/+$/g, "");
	if (cFolder && NormalizeImageKey(cValue).startsWith(`${NormalizeImageKey(cFolder)}/`)) cValue = cValue.slice(cFolder.length + 1);
	return NormalizeImageKey(cValue);
}

function NormalizeImageKey(pValue: string) {
	return `${pValue ?? ""}`
		.trim()
		.normalize("NFKC")
		.toLocaleLowerCase("ar")
		.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
		.replaceAll("\u00A0", " ")
		.replaceAll("\\", "/")
		.replace(/\/+/g, "/")
		.replace(/^\.\/+/, "")
		.replace(/^\/+|\/+$/g, "");
}

function StripFileExt(pValue: string) {
	return pValue.replace(/\.[^.\/]+$/, "");
}

function SafeDecodeURIComponent(pValue: string) {
	try {
		return decodeURIComponent(pValue);
	} catch {
		return pValue;
	}
}

function AddHeaderAliases(pField: string, pAliases: string[]) {
	for (const cAlias of pAliases) cHeaderAliases.set(NormalizeKey(cAlias), pField);
}

function NormalizeFieldValue(pField: string, pValue: ExcelValue): ExcelValue | ExcelValue[] {
	if (pField === "Images") return ToList(pValue);
	if (pField === "Available") return ToBoolean(pValue, true);
	if (pField === "PriceFrom" || pField === "PriceTo") return ToNumber(pValue);
	return typeof pValue === "string" ? pValue.trim() : pValue;
}

function FindHeaderRow(pRows: ExcelRow[]) {
	for (const cRow of pRows.slice(0, 30)) {
		const cFields = new Set(
			[...cRow.Cells.values()]
				.map((pValue) => cHeaderAliases.get(NormalizeKey(pValue)))
				.filter((pValue): pValue is string => Boolean(pValue)),
		);
		if (cFields.has("File") && cFields.has("Name") && cFields.size >= 3) return cRow;
	}
	return null;
}

function ReadSheets(pWorkbookXml: string, pRelationshipsXml: string) {
	const cRelationships = new Map<string, string>();
	for (const cMatch of pRelationshipsXml.matchAll(/<(?:[\w.-]+:)?Relationship\b([^>]*?)\/?\s*>/gi)) {
		const cAttributes = ReadAttributes(cMatch[1]);
		if (cAttributes.Id && cAttributes.Target) cRelationships.set(cAttributes.Id, cAttributes.Target);
	}

	const cSheets: Array<{ Name: string; EntryName: string }> = [];
	for (const cMatch of pWorkbookXml.matchAll(/<(?:[\w.-]+:)?sheet\b([^>]*?)\/?\s*>/gi)) {
		const cAttributes = ReadAttributes(cMatch[1]);
		const cName = cAttributes.name || "";
		const cRelationshipId = cAttributes["r:id"] || "";
		const cTarget = cRelationships.get(cRelationshipId) || "";
		if (!cName || !cTarget) continue;
		const cEntryName = cTarget.startsWith("/") ? cTarget.replace(/^\/+/, "") : posix.normalize(posix.join("xl", cTarget));
		cSheets.push({ Name: cName, EntryName: cEntryName });
	}
	return cSheets;
}

function ReadSharedStrings(pEntry?: Buffer) {
	if (!pEntry) return [];
	const cXml = pEntry.toString("utf8");
	const cStrings: string[] = [];
	for (const cMatch of cXml.matchAll(/<(?:[\w.-]+:)?si\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?si>/gi)) cStrings.push(ReadRichText(cMatch[1]));
	return cStrings;
}

function ReadWorksheetRows(pXml: string, pSharedStrings: string[]): ExcelRow[] {
	const cRows: ExcelRow[] = [];
	let cFallbackRowNumber = 0;
	for (const cRowMatch of pXml.matchAll(/<(?:[\w.-]+:)?row\b([^>]*)>([\s\S]*?)<\/(?:[\w.-]+:)?row>/gi)) {
		const cRowAttributes = ReadAttributes(cRowMatch[1]);
		const cRowNumber = Math.max(1, Number.parseInt(cRowAttributes.r || "", 10) || cFallbackRowNumber + 1);
		cFallbackRowNumber = cRowNumber;
		const cCells = new Map<number, ExcelValue>();
		let cFallbackColumn = 0;

		for (const cCellMatch of cRowMatch[2].matchAll(/<(?:[\w.-]+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:[\w.-]+:)?c>)/gi)) {
			const cCellAttributes = ReadAttributes(cCellMatch[1]);
			const cReference = cCellAttributes.r || "";
			const cColumn = cReference ? ColumnIndex(cReference) : cFallbackColumn;
			cFallbackColumn = cColumn + 1;
			cCells.set(cColumn, ReadCellValue(cCellAttributes.t || "", cCellMatch[2] || "", pSharedStrings));
		}

		cRows.push({ Number: cRowNumber, Cells: cCells });
	}
	return cRows;
}

function ReadCellValue(pType: string, pBody: string, pSharedStrings: string[]): ExcelValue {
	if (pType === "inlineStr") return ReadRichText(pBody);
	const cValueMatch = /<(?:[\w.-]+:)?v\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?v>/i.exec(pBody);
	const cRawValue = cValueMatch ? DecodeXml(cValueMatch[1]) : "";
	if (pType === "s") return pSharedStrings[Number.parseInt(cRawValue, 10)] ?? "";
	if (pType === "str" || pType === "d" || pType === "e") return cRawValue;
	if (pType === "b") return cRawValue === "1" || cRawValue.toLowerCase() === "true";
	if (!cRawValue) return "";
	const cNumber = Number(cRawValue);
	return Number.isFinite(cNumber) ? cNumber : cRawValue;
}

function ReadRichText(pXml: string) {
	return [...pXml.matchAll(/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/gi)].map((pMatch) => DecodeXml(pMatch[1])).join("");
}

function ReadAttributes(pValue: string) {
	const cResult: Record<string, string> = {};
	for (const cMatch of pValue.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) cResult[cMatch[1]] = DecodeXml(cMatch[2] ?? cMatch[3] ?? "");
	return cResult;
}

function ReadZipEntries(pBuffer: Buffer) {
	const cEntries = new Map<string, Buffer>();
	const cEndRecord = FindEndOfCentralDirectory(pBuffer);
	const cEntryCount = pBuffer.readUInt16LE(cEndRecord + 10);
	let cOffset = pBuffer.readUInt32LE(cEndRecord + 16);

	for (let cIndex = 0; cIndex < cEntryCount; cIndex += 1) {
		if (pBuffer.readUInt32LE(cOffset) !== 0x02014b50) throw new Error("تركيب ملف Excel المضغوط غير صالح.");
		const cFlags = pBuffer.readUInt16LE(cOffset + 8);
		const cMethod = pBuffer.readUInt16LE(cOffset + 10);
		const cCompressedSize = pBuffer.readUInt32LE(cOffset + 20);
		const cFileNameLength = pBuffer.readUInt16LE(cOffset + 28);
		const cExtraLength = pBuffer.readUInt16LE(cOffset + 30);
		const cCommentLength = pBuffer.readUInt16LE(cOffset + 32);
		const cLocalHeaderOffset = pBuffer.readUInt32LE(cOffset + 42);
		const cFileName = pBuffer.toString(cFlags & 0x0800 ? "utf8" : "utf8", cOffset + 46, cOffset + 46 + cFileNameLength).replaceAll("\\", "/");

		if (pBuffer.readUInt32LE(cLocalHeaderOffset) !== 0x04034b50) throw new Error("تعذر قراءة أحد ملفات Excel الداخلية.");
		const cLocalNameLength = pBuffer.readUInt16LE(cLocalHeaderOffset + 26);
		const cLocalExtraLength = pBuffer.readUInt16LE(cLocalHeaderOffset + 28);
		const cDataStart = cLocalHeaderOffset + 30 + cLocalNameLength + cLocalExtraLength;
		const cCompressedData = pBuffer.subarray(cDataStart, cDataStart + cCompressedSize);
		if (cMethod === 0) cEntries.set(cFileName, Buffer.from(cCompressedData));
		else if (cMethod === 8) cEntries.set(cFileName, inflateRawSync(cCompressedData));
		else throw new Error(`طريقة ضغط غير مدعومة داخل ملف Excel: ${cMethod}.`);

		cOffset += 46 + cFileNameLength + cExtraLength + cCommentLength;
	}
	return cEntries;
}

function FindEndOfCentralDirectory(pBuffer: Buffer) {
	const cMinimumOffset = Math.max(0, pBuffer.length - 65_557);
	for (let cOffset = pBuffer.length - 22; cOffset >= cMinimumOffset; cOffset -= 1) {
		if (pBuffer.readUInt32LE(cOffset) === 0x06054b50) return cOffset;
	}
	throw new Error("الملف ليس مصنف Excel بصيغة xlsx أو أنه تالف.");
}

function GetRequiredEntry(pEntries: Map<string, Buffer>, pName: string) {
	const cEntry = pEntries.get(pName);
	if (!cEntry) throw new Error(`ملف Excel الداخلي المطلوب غير موجود: ${pName}.`);
	return cEntry;
}

function ColumnIndex(pReference: string) {
	const cLetters = /^[A-Z]+/i.exec(pReference)?.[0]?.toUpperCase() || "A";
	let cIndex = 0;
	for (const cChar of cLetters) cIndex = cIndex * 26 + cChar.charCodeAt(0) - 64;
	return Math.max(0, cIndex - 1);
}

function NormalizeKey(pValue: unknown) {
	return `${pValue ?? ""}`
		.trim()
		.toLocaleLowerCase("ar")
		.normalize("NFKC")
		.replace(/[أإآ]/g, "ا")
		.replace(/ى/g, "ي")
		.replace(/ة/g, "ه")
		.replace(/[\u064B-\u065F\u0670]/g, "")
		.replace(/[\s_\-–—()[\]{}:؛،,.\/\\]+/g, "");
}

function DecodeXml(pValue: string) {
	return pValue
		.replace(/&#x([0-9a-f]+);/gi, (_, pHex) => String.fromCodePoint(Number.parseInt(pHex, 16)))
		.replace(/&#([0-9]+);/g, (_, pNumber) => String.fromCodePoint(Number.parseInt(pNumber, 10)))
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&apos;", "'")
		.replaceAll("&amp;", "&");
}

function ToList(pValue: unknown) {
	return `${pValue ?? ""}`.split(/\r?\n|\||،|,/g).map((pItem) => pItem.trim()).filter(Boolean);
}

function ToBoolean(pValue: unknown, pDefault = false) {
	if (pValue === undefined || pValue === null || `${pValue}`.trim() === "") return pDefault;
	if (typeof pValue === "boolean") return pValue;
	const cValue = `${pValue}`.trim().toLowerCase();
	return ["true", "1", "yes", "نعم", "متوفر", "متاح", "نشط", "عرض"].includes(cValue);
}

function ToNumber(pValue: unknown) {
	const cNumber = Number.parseFloat(`${pValue ?? ""}`.replaceAll(",", ""));
	return Number.isFinite(cNumber) && cNumber >= 0 ? cNumber : 0;
}
