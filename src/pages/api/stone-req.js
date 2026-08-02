export const prerender = false;

const cTable = "StoneReq";
const cDefaultOpsKey = "Emocrete20015161";
const cMaxBodyBytes = 4 * 1024 * 1024;
const cMaxItems = 120;
const cMaxMeasurementsPerItem = 300;
const cAllowedStatuses = new Set(["draft", "submitted", "archived"]);
const cAllowedOpsStatuses = new Set(["new", "reviewed", "contacted", "priced", "closed", "ignored"]);

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			"access-control-allow-origin": "*",
			"access-control-allow-headers": "content-type,x-ops-key",
			"access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
		},
	});
}

function Env(pName) {
	const cValue = process.env[pName];
	return typeof cValue === "string" ? cValue.trim() : "";
}

function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue) { const cValue = Number(pValue); return Number.isFinite(cValue) ? cValue : 0; }
function Bool(pValue) { return pValue === true || ["1", "true", "yes", "on"].includes(Str(pValue).toLowerCase()); }
function IsUuid(pValue) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(Str(pValue)); }
function NewUuid() { return crypto.randomUUID(); }

function Config() {
	const cSupabaseUrl = Env("SUPABASE_URL");
	const cServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!cSupabaseUrl || !cServiceKey) throw new Error("Missing Supabase env vars");
	return { SupabaseUrl: cSupabaseUrl.replace(/\/$/, ""), ServiceKey: cServiceKey };
}

function CheckOpsKey(pRequest) {
	const cUrl = new URL(pRequest.url);
	const cGiven = Str(pRequest.headers.get("x-ops-key") || cUrl.searchParams.get("key"));
	return Boolean(cGiven) && cGiven === (Env("OPS_API_KEY") || cDefaultOpsKey);
}

async function ReadJson(pRequest) {
	const cText = await pRequest.text();
	if (!cText) return {};
	if (new TextEncoder().encode(cText).length > cMaxBodyBytes) throw new Error("Request body is too large");
	try { return JSON.parse(cText); }
	catch { throw new Error("Invalid JSON body"); }
}

async function SupabaseRequest(pUrl, pServiceKey, pOptions = {}) {
	const cResponse = await fetch(pUrl, {
		...pOptions,
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`,
			...(pOptions.headers || {}),
		},
	});
	const cText = await cResponse.text();
	if (!cResponse.ok) throw new Error(cText || `Supabase HTTP ${cResponse.status}`);
	if (!cText) return null;
	try { return JSON.parse(cText); }
	catch { return cText; }
}

function SafeObject(pValue) {
	return pValue && typeof pValue === "object" && !Array.isArray(pValue) ? pValue : {};
}

function SafeArray(pValue, pMax = 1000) {
	return Array.isArray(pValue) ? pValue.slice(0, pMax) : [];
}

function CleanRequestData(pValue) {
	const cData = SafeObject(pValue);
	const cItems = SafeArray(cData.items, cMaxItems).map((pItem) => {
		const cValue = SafeObject(pItem);
		return {
			...cValue,
			measurements: SafeArray(cValue.measurements, cMaxMeasurementsPerItem),
			attachments: SafeArray(cValue.attachments, 12),
		};
	});
	const cUi = SafeObject(cData.ui);
	let cWorkingItem = cUi.workingItem ? SafeObject(cUi.workingItem) : null;
	if (cWorkingItem) {
		cWorkingItem = {
			...cWorkingItem,
			measurements: SafeArray(cWorkingItem.measurements, cMaxMeasurementsPerItem),
			attachments: SafeArray(cWorkingItem.attachments, 12),
		};
	}
	return {
		...cData,
		version: Math.max(1, Math.trunc(Num(cData.version) || 1)),
		items: cItems,
		ui: { ...cUi, workingItem: cWorkingItem },
	};
}

function ValidPhone(pValue) {
	return Str(pValue).replace(/\D/g, "").length >= 10;
}

function ValidMeasurement(pMeasurement) {
	const cValue = SafeObject(pMeasurement);
	return Num(cValue.quantity) > 0 && (Num(cValue.areaM2) > 0 || (Num(cValue.lengthCm) > 0 && Num(cValue.widthCm) > 0));
}

function Summarize(pData) {
	const cCustomer = SafeObject(pData.customer);
	const cProject = SafeObject(pData.project);
	const cLogistics = SafeObject(pData.logistics);
	const cItems = SafeArray(pData.items, cMaxItems);
	let cReadyCount = 0;
	let cTotalArea = 0;
	let cTotalPieces = 0;
	let cAttachmentCount = 0;
	const cMissing = [];
	const cItemSummaries = [];

	if (!Str(cCustomer.name)) cMissing.push("اسم العميل");
	if (!ValidPhone(cCustomer.phone)) cMissing.push("رقم الهاتف");
	if (!Str(cProject.city)) cMissing.push("المدينة أو المنطقة");
	if (!cItems.length) cMissing.push("الأصناف");

	for (const [cIndex, cItemRaw] of cItems.entries()) {
		const cItem = SafeObject(cItemRaw);
		const cMeasurements = SafeArray(cItem.measurements, cMaxMeasurementsPerItem);
		const cValid = cMeasurements.filter(ValidMeasurement);
		const cItemArea = cMeasurements.reduce((pSum, pMeasure) => {
			const cArea = Num(pMeasure.areaM2) || (Math.max(1, Num(pMeasure.quantity)) * Num(pMeasure.lengthCm) * Num(pMeasure.widthCm) / 10000);
			return pSum + Math.max(0, cArea);
		}, 0);
		const cItemPieces = cMeasurements.reduce((pSum, pMeasure) => ValidMeasurement(pMeasure) ? pSum + Math.max(1, Math.trunc(Num(pMeasure.quantity) || 1)) : pSum, 0);
		const cMaterial = SafeObject(cItem.material);
		const cReady = Boolean(Str(cItem.usageType) && SafeArray(cItem.services).length && Str(cMaterial.category) && cValid.length);
		if (cReady) cReadyCount++;
		cTotalArea += cItemArea;
		cTotalPieces += cItemPieces;
		cAttachmentCount += SafeArray(cItem.attachments, 12).length;
		cItemSummaries.push({
			id: Str(cItem.id),
			index: cIndex + 1,
			title: Str(cItem.title),
			usageType: Str(cItem.usageType),
			location: Str(cItem.location),
			material: [Str(cMaterial.category), Str(cMaterial.origin), Str(cMaterial.name || cMaterial.color), Str(cMaterial.thicknessCm) ? `${Str(cMaterial.thicknessCm)} سم` : ""].filter(Boolean).join(" • "),
			services: SafeArray(cItem.services, 20).map(Str).filter(Boolean),
			measurementCount: cMeasurements.length,
			validMeasurementCount: cValid.length,
			pieceCount: cItemPieces,
			areaM2: Math.round(cItemArea * 100) / 100,
			attachmentCount: SafeArray(cItem.attachments, 12).length,
			completionStatus: Str(cItem.completionStatus) || (cReady ? "estimate-ready" : cValid.length ? "draft" : "needs-measurement"),
			missingFields: SafeArray(cItem.missingFields, 20).map(Str).filter(Boolean),
		});
	}

	const cBaseTotal = 5 + cItems.length * 4;
	let cBaseDone = 0;
	if (Str(cCustomer.name)) cBaseDone++;
	if (ValidPhone(cCustomer.phone)) cBaseDone++;
	if (Str(cProject.city)) cBaseDone++;
	if (cItems.length) cBaseDone++;
	if (cItems.length && cReadyCount === cItems.length) cBaseDone++;
	for (const cItem of cItems) {
		const cMaterial = SafeObject(cItem.material);
		if (Str(cItem.usageType)) cBaseDone++;
		if (SafeArray(cItem.services).length) cBaseDone++;
		if (Str(cMaterial.category)) cBaseDone++;
		if (SafeArray(cItem.measurements).some(ValidMeasurement)) cBaseDone++;
	}

	return {
		customerName: Str(cCustomer.name),
		phone: Str(cCustomer.phone),
		whatsapp: Str(cCustomer.whatsapp),
		customerRole: Str(cCustomer.role),
		governorate: Str(cProject.governorate),
		city: Str(cProject.city),
		district: Str(cProject.district),
		projectType: Str(cProject.type),
		siteState: Str(cProject.siteState),
		executionTime: Str(cProject.executionTime),
		floor: Str(cLogistics.floor),
		elevator: Str(cLogistics.elevator),
		itemCount: cItems.length,
		readyItemCount: cReadyCount,
		completionPercent: Math.max(0, Math.min(100, Math.round((cBaseDone / Math.max(1, cBaseTotal)) * 100))),
		totalAreaM2: Math.round(cTotalArea * 100) / 100,
		totalPieces: cTotalPieces,
		attachmentCount: cAttachmentCount,
		missingFields: cMissing,
		itemSummaries: cItemSummaries,
	};
}

function PrepareOpsData(pData, pIncludeAttachmentBodies = false) {
	const cCopy = structuredClone(pData);
	if (cCopy.meta && typeof cCopy.meta === "object") delete cCopy.meta.resumeToken;
	if (pIncludeAttachmentBodies) return cCopy;
	const cStrip = (pItem) => {
		if (!pItem || !Array.isArray(pItem.attachments)) return;
		pItem.attachments = pItem.attachments.map((pAttachment) => {
			const cValue = SafeObject(pAttachment);
			const { dataUrl, ...cMeta } = cValue;
			return cMeta;
		});
	};
	for (const cItem of SafeArray(cCopy.items, cMaxItems)) cStrip(cItem);
	cStrip(cCopy.ui?.workingItem);
	return cCopy;
}

function MapOpsRow(pRow, pIncludeData = true, pIncludeAttachmentBodies = false) {
	const cData = SafeObject(pRow.request_data);
	return {
		id: Num(pRow.id),
		requestNo: Num(pRow.id),
		draftId: Str(pRow.draft_id),
		status: Str(pRow.status),
		opsStatus: Str(pRow.ops_status),
		opsNotes: Str(pRow.ops_notes),
		customerName: Str(pRow.customer_name),
		phone: Str(pRow.phone),
		whatsapp: Str(pRow.whatsapp),
		governorate: Str(pRow.governorate),
		city: Str(pRow.city),
		district: Str(pRow.district),
		projectType: Str(pRow.project_type),
		itemCount: Num(pRow.item_count),
		readyItemCount: Num(pRow.ready_item_count),
		completionPercent: Num(pRow.completion_percent),
		totalAreaM2: Num(pRow.total_area_m2),
		totalPieces: Num(pRow.total_pieces),
		attachmentCount: Num(pRow.attachment_count),
		sourcePage: Str(pRow.source_page),
		pageUrl: Str(pRow.page_url),
		clientUpdatedAt: Str(pRow.client_updated_at),
		submittedAt: Str(pRow.submitted_at),
		createdAt: Str(pRow.created_at),
		updatedAt: Str(pRow.updated_at),
		requestData: pIncludeData ? PrepareOpsData(cData, pIncludeAttachmentBodies) : undefined,
	};
}

async function FindDraft(pConfig, pDraftId) {
	const cUrl = new URL(`${pConfig.SupabaseUrl}/rest/v1/${cTable}`);
	cUrl.searchParams.set("draft_id", `eq.${pDraftId}`);
	cUrl.searchParams.set("select", "*");
	cUrl.searchParams.set("limit", "1");
	const cRows = await SupabaseRequest(cUrl.toString(), pConfig.ServiceKey);
	return Array.isArray(cRows) && cRows.length ? cRows[0] : null;
}

export async function OPTIONS() { return Json({ ok: true }); }

export async function POST({ request }) {
	try {
		const cBody = await ReadJson(request);
		const cAction = Str(cBody.action || "save").toLowerCase();
		if (!["save", "submit"].includes(cAction)) return Json({ ok: false, error: "Invalid action" }, 400);

		const cConfig = Config();
		const cDraftId = IsUuid(cBody.draftId) ? Str(cBody.draftId) : NewUuid();
		const cResumeToken = IsUuid(cBody.resumeToken) ? Str(cBody.resumeToken) : NewUuid();
		const cExisting = await FindDraft(cConfig, cDraftId);
		if (cExisting && Str(cExisting.resume_token) !== cResumeToken) return Json({ ok: false, error: "Invalid resume token" }, 403);
		if (cExisting && Str(cExisting.status) === "submitted" && cAction !== "submit") return Json({ ok: false, error: "Submitted requests cannot be edited" }, 409);

		const cData = CleanRequestData(cBody.requestData);
		const cSummary = Summarize(cData);
		if (cAction === "submit") {
			if (!cSummary.customerName) return Json({ ok: false, error: "Customer name is required" }, 400);
			if (!ValidPhone(cSummary.phone)) return Json({ ok: false, error: "Valid phone is required" }, 400);
			if (!cSummary.city) return Json({ ok: false, error: "Project city is required" }, 400);
			if (!cSummary.itemCount || !cSummary.itemSummaries.some((pItem) => pItem.validMeasurementCount > 0)) return Json({ ok: false, error: "At least one measured item is required" }, 400);
		}

		const cNow = new Date().toISOString();
		cData.meta = {
			...SafeObject(cData.meta),
			draftId: cDraftId,
			resumeToken: cResumeToken,
			status: cAction === "submit" ? "submitted" : "draft",
			sourcePage: Str(cBody.sourcePage),
			pageUrl: Str(cBody.pageUrl),
			updatedAt: cNow,
			...(cAction === "submit" ? { submittedAt: cNow } : {}),
		};

		const cRow = {
			draft_id: cDraftId,
			resume_token: cResumeToken,
			status: cAction === "submit" ? "submitted" : "draft",
			ops_status: cExisting ? Str(cExisting.ops_status || "new") : "new",
			customer_name: cSummary.customerName,
			phone: cSummary.phone,
			whatsapp: cSummary.whatsapp,
			governorate: cSummary.governorate,
			city: cSummary.city,
			district: cSummary.district,
			project_type: cSummary.projectType,
			item_count: cSummary.itemCount,
			ready_item_count: cSummary.readyItemCount,
			completion_percent: cSummary.completionPercent,
			total_area_m2: cSummary.totalAreaM2,
			total_pieces: cSummary.totalPieces,
			attachment_count: cSummary.attachmentCount,
			source_page: Str(cBody.sourcePage),
			page_url: Str(cBody.pageUrl),
			client_updated_at: Str(cData.meta.updatedAt) || cNow,
			request_data: cData,
			updated_at: cNow,
			last_saved_at: cNow,
			...(cAction === "submit" ? { submitted_at: cExisting?.submitted_at || cNow } : {}),
		};

		const cUrl = `${cConfig.SupabaseUrl}/rest/v1/${cTable}?on_conflict=draft_id`;
		const cRows = await SupabaseRequest(cUrl, cConfig.ServiceKey, {
			method: "POST",
			headers: { "content-type": "application/json", prefer: "resolution=merge-duplicates,return=representation" },
			body: JSON.stringify(cRow),
		});
		const cSaved = Array.isArray(cRows) ? cRows[0] : null;
		if (!cSaved) throw new Error("StoneReq save returned no row");
		return Json({
			ok: true,
			requestNo: Num(cSaved.id),
			draftId: Str(cSaved.draft_id),
			resumeToken: Str(cSaved.resume_token),
			status: Str(cSaved.status),
			updatedAt: Str(cSaved.updated_at),
			submittedAt: Str(cSaved.submitted_at),
			itemCount: Num(cSaved.item_count),
			completionPercent: Num(cSaved.completion_percent),
		});
	} catch (pError) {
		const cMessage = pError instanceof Error ? pError.message : String(pError);
		const cClient = /Invalid|Missing|required|too large|cannot be edited/i.test(cMessage);
		return Json({ ok: false, error: cMessage }, cClient ? 400 : 500);
	}
}

export async function GET({ request }) {
	try {
		const cConfig = Config();
		const cUrl = new URL(request.url);
		const cDraftId = Str(cUrl.searchParams.get("draftId"));
		const cToken = Str(cUrl.searchParams.get("token"));

		if (IsUuid(cDraftId) && IsUuid(cToken)) {
			const cRow = await FindDraft(cConfig, cDraftId);
			if (!cRow || Str(cRow.resume_token) !== cToken) return Json({ ok: false, error: "Draft not found" }, 404);
			return Json({
				ok: true,
				requestNo: Num(cRow.id),
				draftId: Str(cRow.draft_id),
				status: Str(cRow.status),
				requestData: SafeObject(cRow.request_data),
				updatedAt: Str(cRow.updated_at),
			});
		}

		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const cOpsDraftId = Str(cUrl.searchParams.get("opsDraftId"));
		if (IsUuid(cOpsDraftId)) {
			const cRow = await FindDraft(cConfig, cOpsDraftId);
			if (!cRow) return Json({ ok: false, error: "Request not found" }, 404);
			return Json({ ok: true, request: MapOpsRow(cRow, true, true) });
		}
		const cLimit = Math.max(1, Math.min(300, Math.trunc(Num(cUrl.searchParams.get("limit")) || 100)));
		const cStatus = Str(cUrl.searchParams.get("status"));
		const cOpsStatus = Str(cUrl.searchParams.get("opsStatus"));
		const cAfterId = Math.max(0, Math.trunc(Num(cUrl.searchParams.get("afterId"))));
		const cIncludeDrafts = Bool(cUrl.searchParams.get("includeDrafts"));
		const cQuery = new URL(`${cConfig.SupabaseUrl}/rest/v1/${cTable}`);
		cQuery.searchParams.set("select", "*");
		cQuery.searchParams.set("order", "id.desc");
		cQuery.searchParams.set("limit", String(cLimit));
		if (cAfterId) cQuery.searchParams.set("id", `gt.${cAfterId}`);
		if (cStatus && cAllowedStatuses.has(cStatus)) cQuery.searchParams.set("status", `eq.${cStatus}`);
		else if (!cIncludeDrafts) cQuery.searchParams.set("status", "eq.submitted");
		if (cOpsStatus && cAllowedOpsStatuses.has(cOpsStatus)) cQuery.searchParams.set("ops_status", `eq.${cOpsStatus}`);
		const cRows = await SupabaseRequest(cQuery.toString(), cConfig.ServiceKey);
		const cRequests = Array.isArray(cRows) ? cRows.map((pRow) => MapOpsRow(pRow, true)) : [];
		return Json({ ok: true, requests: cRequests, maxId: cRequests.reduce((pMax, pItem) => Math.max(pMax, Num(pItem.id)), 0), serverTime: new Date().toISOString() });
	} catch (pError) {
		return Json({ ok: false, error: pError instanceof Error ? pError.message : String(pError) }, 500);
	}
}

export async function PATCH({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);
		const cBody = await ReadJson(request);
		const cDraftId = Str(cBody.draftId);
		if (!IsUuid(cDraftId)) return Json({ ok: false, error: "Invalid draftId" }, 400);
		const cOpsStatus = Str(cBody.opsStatus);
		if (!cAllowedOpsStatuses.has(cOpsStatus)) return Json({ ok: false, error: "Invalid opsStatus" }, 400);
		const cConfig = Config();
		const cUrl = new URL(`${cConfig.SupabaseUrl}/rest/v1/${cTable}`);
		cUrl.searchParams.set("draft_id", `eq.${cDraftId}`);
		const cRows = await SupabaseRequest(cUrl.toString(), cConfig.ServiceKey, {
			method: "PATCH",
			headers: { "content-type": "application/json", prefer: "return=representation" },
			body: JSON.stringify({ ops_status: cOpsStatus, ops_notes: Str(cBody.opsNotes).slice(0, 4000), ops_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
		});
		const cSaved = Array.isArray(cRows) ? cRows[0] : null;
		if (!cSaved) return Json({ ok: false, error: "Request not found" }, 404);
		return Json({ ok: true, request: MapOpsRow(cSaved, true) });
	} catch (pError) {
		return Json({ ok: false, error: pError instanceof Error ? pError.message : String(pError) }, 500);
	}
}
