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

function Str(pValue) {
	return String(pValue ?? "").trim();
}

function CheckOpsKey(pRequest) {
	const Url = new URL(pRequest.url);
	const Given = Str(pRequest.headers.get("x-ops-key") || Url.searchParams.get("key"));
	return Given && Given === (Env("OPS_API_KEY") || cDefaultOpsKey);
}

function IsMissingRelation(pStatus, pText) {
	return pStatus === 404 || /42P01|PGRST205|Could not find the table/i.test(Str(pText));
}

async function DeleteAllRows(pSupabaseUrl, pServiceKey, pTable, pIdentityColumn, pOptional = false) {
	const Url = new URL(`${pSupabaseUrl}/rest/v1/${pTable}`);
	Url.searchParams.set(pIdentityColumn, "not.is.null");
	const Res = await fetch(Url, {
		method: "DELETE",
		headers: {
			apikey: pServiceKey,
			authorization: `Bearer ${pServiceKey}`,
			prefer: "return=minimal"
		}
	});
	const Text = await Res.text();
	if (!Res.ok) {
		if (pOptional && IsMissingRelation(Res.status, Text)) return { table: pTable, skipped: true };
		throw new Error(`${pTable}: ${Text || `HTTP ${Res.status}`}`);
	}
	return { table: pTable, deleted: true };
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		if (!CheckOpsKey(request)) return Json({ ok: false, error: "Unauthorized" }, 401);

		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");
		if (!SupabaseUrl || !ServiceKey) {
			return Json({ ok: false, error: "Missing Supabase env vars" }, 500);
		}

		// لا نستخدم RPC هنا. النسخة السابقة كانت تدخل سجل تحكم بعد الحذف،
		// واستعلام RETURNING داخل الدالة سبب خطأ PostgreSQL 21000 في بعض المخططات.
		const Results = [];
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "replay_chunks", "session_id", true));
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "replay_sessions", "id", true));
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "ops_presence", "page_instance_id", true));
		Results.push(await DeleteAllRows(SupabaseUrl, ServiceKey, "ops_events", "id", false));

		return Json({ ok: true, deleted: true, results: Results });
	} catch (Ex) {
		return Json({
			ok: false,
			error: "Clear failed",
			message: Ex instanceof Error ? Ex.message : String(Ex)
		}, 500);
	}
}
