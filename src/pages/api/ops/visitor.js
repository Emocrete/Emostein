export const prerender = false;

const cDefaultOpsKey = "Emocrete20015161";

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}

function Env(pName) {
	const Value = process.env[pName];
	return typeof Value === "string" ? Value.trim() : "";
}

function Str(pValue) { return String(pValue ?? "").trim(); }

function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey);
}

async function ReadBody(pRequest) {
	try { return await pRequest.json(); }
	catch { return {}; }
}

async function DeleteRows(pSupabaseUrl, pServiceKey, pTable, pColumn, pValue, pRequired) {
	const Url = new URL(`${pSupabaseUrl}/rest/v1/${pTable}`);
	Url.searchParams.set(pColumn, `eq.${pValue}`);
	const Res = await fetch(Url, {
		method: "DELETE",
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`,
			prefer: "return=representation"
		}
	});
	const Text = await Res.text();
	if (Res.ok) {
		let DeletedCount = 0;
		try { const Rows = JSON.parse(Text); DeletedCount = Array.isArray(Rows) ? Rows.length : 0; } catch {}
		const VerifyUrl = new URL(`${pSupabaseUrl}/rest/v1/${pTable}`);
		VerifyUrl.searchParams.set("select", pColumn);
		VerifyUrl.searchParams.set(pColumn, `eq.${pValue}`);
		VerifyUrl.searchParams.set("limit", "1");
		const Verify = await fetch(VerifyUrl, { headers: { apikey: pServiceKey, authorization: `Bearer ${pServiceKey}` } });
		let Remaining = [];
		try { Remaining = JSON.parse(await Verify.text()); } catch {}
		if (!Verify.ok || (Array.isArray(Remaining) && Remaining.length)) throw new Error(`${pTable}: بقيت صفوف للزائر بعد الحذف`);
		return { table: pTable, deleted: true, deletedCount: DeletedCount, verifiedEmpty: true };
	}
	const Detail = Text || `HTTP ${Res.status}`;
	if (!pRequired) return { table: pTable, deleted: false, warning: Detail };
	throw new Error(`${pTable}: ${Detail}`);
}

async function DeleteVisitor(pRequest) {
	if (!CheckOpsKey(pRequest)) return Json({ ok: false, error: "Unauthorized" }, 401);
	const SupabaseUrl = Env("SUPABASE_URL");
	const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
	if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);

	const Url = new URL(pRequest.url);
	const Body = await ReadBody(pRequest);
	const VisitorId = Str(
		Body.visitorId ?? Body.visitor_id ??
		Url.searchParams.get("visitor_id") ?? Url.searchParams.get("visitorId")
	);
	if (!VisitorId) return Json({ ok: false, error: "Missing visitorId" }, 400);

	const Results = [];
	Results.push(await DeleteRows(SupabaseUrl, ServiceKey, "ops_presence", "visitor_id", VisitorId, true));
	Results.push(await DeleteRows(SupabaseUrl, ServiceKey, "ops_events", "visitor_id", VisitorId, true));
	const DeletedAt = new Date().toISOString();
	const MarkerRes = await fetch(`${SupabaseUrl}/rest/v1/ops_events`, {
		method: "POST",
		headers: { apikey: ServiceKey, authorization: `Bearer ${ServiceKey}`, "content-type": "application/json", prefer: "return=minimal" },
		body: JSON.stringify({
			event_type: "ops_delete_visitor", visitor_id: "system_delete", session_id: `delete_${Date.now()}`,
			page_path: "", page_title: "", payload: { targetVisitorId: VisitorId, deletedAt: DeletedAt, controlCommand: "ops_delete_visitor" }
		})
	});
	if (!MarkerRes.ok) throw new Error(`تعذر تثبيت منع الزائر المحذوف: ${await MarkerRes.text()}`);

	return Json({
		ok: true,
		visitorId: VisitorId,
		deleted: true,
		deletedAt: DeletedAt,
		warnings: Results.filter((Item) => Item.warning).map((Item) => `${Item.table}: ${Item.warning}`),
		results: Results
	});
}

export async function OPTIONS() { return Json({ ok: true }); }

export async function POST({ request }) {
	try { return await DeleteVisitor(request); }
	catch (Ex) {
		return Json({ ok: false, error: "Delete visitor failed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500);
	}
}

export async function DELETE({ request }) {
	try { return await DeleteVisitor(request); }
	catch (Ex) {
		return Json({ ok: false, error: "Delete visitor failed", message: Ex instanceof Error ? Ex.message : String(Ex) }, 500);
	}
}
