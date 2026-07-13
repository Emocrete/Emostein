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

async function DeleteAttempt(pSupabaseUrl, pServiceKey, pTable, pColumn, pFilter) {
	const Url = new URL(`${pSupabaseUrl}/rest/v1/${pTable}`);
	Url.searchParams.set(pColumn, pFilter);
	const Res = await fetch(Url, {
		method: "DELETE",
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`,
			prefer: "return=minimal"
		}
	});
	const Text = await Res.text();
	return {
		ok: Res.ok,
		status: Res.status,
		table: pTable,
		filter: `${pColumn}=${pFilter}`,
		details: Text || (Res.ok ? "" : `HTTP ${Res.status}`)
	};
}

async function DeleteAllRows(pSupabaseUrl, pServiceKey, pTable, pCandidates, pRequired) {
	const Attempts = [];
	for (const Candidate of pCandidates) {
		const Result = await DeleteAttempt(
			pSupabaseUrl,
			pServiceKey,
			pTable,
			Candidate.column,
			Candidate.filter
		);
		Attempts.push(Result);
		if (Result.ok) return { table: pTable, deleted: true, filter: Result.filter };
	}

	const Detail = Attempts
		.map((Item) => `${Item.filter}: ${Item.details || `HTTP ${Item.status}`}`)
		.join(" | ");
	if (!pRequired) return { table: pTable, deleted: false, warning: Detail };
	throw new Error(`${pTable}: ${Detail || "تعذر حذف الصفوف"}`);
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);

		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) return Json({ ok: false, error: "Missing Supabase env vars" }, 500);

		const Results = [];
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "replay_chunks", [
			{ column: "session_id", filter: "not.is.null" },
			{ column: "created_at", filter: "not.is.null" }
		], false));
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "replay_sessions", [
			{ column: "id", filter: "not.is.null" },
			{ column: "created_at", filter: "not.is.null" }
		], false));
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "ops_presence", [
			{ column: "page_instance_id", filter: "not.is.null" },
			{ column: "visitor_id", filter: "not.is.null" },
			{ column: "last_seen_at", filter: "not.is.null" }
		], true));
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "ops_events", [
			{ column: "id", filter: "not.is.null" },
			{ column: "created_at", filter: "not.is.null" },
			{ column: "visitor_id", filter: "not.is.null" }
		], true));

		return Json({
			ok: true,
			deleted: true,
			warnings: Results.filter((Item) => Item.warning).map((Item) => `${Item.table}: ${Item.warning}`),
			results: Results
		});
	} catch (Ex) {
		return Json({
			ok: false,
			error: "Clear failed",
			message: Ex instanceof Error ? Ex.message : Str(Ex) || "تعذر مسح البيانات"
		}, 500);
	}
}
