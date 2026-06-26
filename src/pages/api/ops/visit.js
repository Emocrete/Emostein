export const prerender = false;

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

function Bool(pValue) {
	if (pValue === true) return true;
	const Value = Str(pValue).toLowerCase();
	return Value === "true" || Value === "1" || Value === "yes" || Value === "on" || Value === "important";
}

const cSyntheticUserAgentPattern = /(bot|crawl|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb)/i;

function SyntheticTrafficReason(pRequest, pBody = {}) {
	const UserAgent = Str(pRequest.headers.get("user-agent"));
	const Purpose = Str(pRequest.headers.get("purpose") || pRequest.headers.get("sec-purpose") || pRequest.headers.get("x-purpose")).toLowerCase();
	const Mode = Str(pRequest.headers.get("sec-fetch-mode")).toLowerCase();
	const Dest = Str(pRequest.headers.get("sec-fetch-dest")).toLowerCase();
	const BodySignal = Str(pBody.botSignal ?? pBody.bot_signal);
	const TrafficKind = Str(pBody.trafficKind ?? pBody.traffic_kind).toLowerCase();
	const Reasons = [];

	if (!UserAgent) Reasons.push("empty_ua");
	if (cSyntheticUserAgentPattern.test(UserAgent)) Reasons.push("ua_bot");
	if (Purpose.includes("prefetch") || Purpose.includes("preview")) Reasons.push("prefetch");
	if (Mode === "navigate" && Dest === "document" && Bool(pBody.synthetic)) Reasons.push("client_synthetic");
	if (BodySignal) Reasons.push(`client_${BodySignal}`);
	if (TrafficKind === "bot" || TrafficKind === "crawler" || TrafficKind === "synthetic") Reasons.push(`kind_${TrafficKind}`);

	return Reasons.join(",");
}


const cArabCountryCodes = new Set([
	"EG", "SA", "AE", "KW", "QA", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "PS", "MA", "DZ", "TN", "LY", "SD", "SO", "DJ", "KM", "MR"
]);

function Header(pRequest, ...pNames) {
	for (const Name of pNames) {
		const Value = Str(pRequest.headers.get(Name));
		if (Value) return Value;
	}
	return "";
}

function DecodeHeaderText(pValue) {
	const Value = Str(pValue);
	if (!Value) return "";

	try {
		return decodeURIComponent(Value.replace(/\+/g, "%20")).trim();
	} catch {
		return Value;
	}
}

function GeoNorm(pValue) {
	return DecodeHeaderText(pValue)
		.toLowerCase()
		.replace(/[\u064B-\u065F\u0670]/g, "")
		.replace(/[إأآ]/g, "ا")
		.replace(/ى/g, "ي")
		.replace(/ة/g, "ه")
		.replace(/[^a-z0-9ا-ي]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function HasGeoWord(pText, pWords) {
	const Text = ` ${GeoNorm(pText)} `;
	return pWords.some((pWord) => {
		const Word = GeoNorm(pWord);
		if (!Word) return false;
		if (Text.includes(` ${Word} `)) return true;
		return Word.length > 2 && Text.includes(Word);
	});
}

function ClassifyGeo(pCountryCode, pRegion, pCity) {
	const CountryCode = Str(pCountryCode).toUpperCase();
	const Region = DecodeHeaderText(pRegion);
	const City = DecodeHeaderText(pCity);
	const All = `${City} ${Region}`;

	if (CountryCode === "EG") {
		if (HasGeoWord(All, ["c", "cai", "cairo", "cairo governorate", "al qahirah", "al qahirah governorate", "القاهرة", "القاهره", "محافظة القاهرة", "محافظه القاهره", "qahira"])) {
			return { Band: "cairo", Label: City || Region || "Cairo", BorderColor: "#00C853" };
		}

		if (HasGeoWord(All, ["gz", "giza", "giza governorate", "al jizah", "al jizah governorate", "jizah", "6th of october", "sixth of october", "october", "october city", "sheikh zayed", "zayed", "الجيزة", "الجيزه", "محافظة الجيزة", "محافظه الجيزه", "اكتوبر", "السادس من اكتوبر", "مدينة 6 اكتوبر", "مدينة اكتوبر", "الشيخ زايد", "زايد"])) {
			return { Band: "giza", Label: City || Region || "Giza", BorderColor: "#00D5FF" };
		}

		return { Band: "egypt", Label: City || Region || "Egypt", BorderColor: "#FFD740" };
	}

	if (cArabCountryCodes.has(CountryCode)) return { Band: "arab", Label: City || CountryCode || "Arab country", BorderColor: "#FF8A00" };
	return { Band: "world", Label: City || CountryCode || "Outside Arab region", BorderColor: "#FF3B30" };
}

function BuildGeo(pRequest, pBody = {}) {
	let CountryCode = Header(pRequest, "x-vercel-ip-country", "cf-ipcountry", "x-country-code").toUpperCase();
	const Region = Header(pRequest, "x-vercel-ip-country-region", "x-vercel-ip-region", "x-region", "x-country-region");
	const City = Header(pRequest, "x-vercel-ip-city", "x-city");
	const Timezone = Str(pBody.timezone ?? pBody.timeZone);

	if (!CountryCode && Timezone.toLowerCase() === "africa/cairo") CountryCode = "EG";

	const Classified = ClassifyGeo(CountryCode, Region, City);

	return {
		countryCode: CountryCode,
		region: DecodeHeaderText(Region),
		city: DecodeHeaderText(City),
		locationBand: Classified.Band,
		locationLabel: Classified.Label,
		locationBorderColor: Classified.BorderColor
	};
}

function NormalizeEventType(pBody) {
	const EventType = Str(pBody.eventType ?? pBody.event_type ?? pBody.type ?? pBody.event);
	return EventType || "page_open";
}

async function ReadBody(pRequest) {
	try {
		return await pRequest.json();
	} catch {
		return null;
	}
}

export async function OPTIONS() {
	return Json({ ok: true });
}

export async function POST({ request }) {
	try {
		const SupabaseUrl = Env("SUPABASE_URL");
		const ServiceKey = Env("SUPABASE_SERVICE_ROLE_KEY");

		if (!SupabaseUrl || !ServiceKey) {
			return Json({
				ok: false,
				error: "Missing Supabase env vars",
				hasSupabaseUrl: !!SupabaseUrl,
				hasServiceKey: !!ServiceKey
			}, 500);
		}

		const Body = await ReadBody(request);
		if (!Body || typeof Body !== "object") return Json({ ok: false, error: "Invalid JSON body" }, 400);

		const SyntheticReason = SyntheticTrafficReason(request, Body);
		if (SyntheticReason) {
			return Json({ ok: true, skipped: true, reason: "synthetic_traffic", syntheticReason: SyntheticReason });
		}

		const Geo = BuildGeo(request, Body);

		const Payload = {
			...Body,
			eventType: NormalizeEventType(Body),
			eventOn: Str(Body.eventOn ?? Body.event_on),
			pageInstanceId: Str(Body.pageInstanceId ?? Body.page_instance_id),
			widget: Str(Body.widget),
			label: Str(Body.label),
			value: Body.value ?? "",
			elapsedMs: Body.elapsedMs ?? Body.elapsed_ms ?? "",
			elapsedSec: Body.elapsedSec ?? Body.elapsed_sec ?? "",
			href: Str(Body.href),
			important: Bool(Body.important),
			notifyMobile: Bool(Body.notifyMobile ?? Body.notify_mobile ?? Body.notify),
			sound: Bool(Body.sound),
			locationCountryCode: Geo.countryCode,
			locationRegion: Geo.region,
			locationCity: Geo.city,
			locationBand: Geo.locationBand,
			locationLabel: Geo.locationLabel,
			locationBorderColor: Geo.locationBorderColor
		};

		const Row = {
			event_type: Payload.eventType,
			visitor_id: Str(Body.visitorId ?? Body.visitor_id),
			session_id: Str(Body.sessionId ?? Body.session_id),
			page_path: Str(Body.pagePath ?? Body.page_path),
			page_title: Str(Body.pageTitle ?? Body.page_title),
			referrer: Str(Body.referrer),
			screen: Str(Body.screen),
			language: Str(Body.language),
			timezone: Str(Body.timezone),
			user_agent: Str(request.headers.get("user-agent")),
			payload: Payload
		};

		const Res = await fetch(`${SupabaseUrl}/rest/v1/ops_events`, {
			method: "POST",
			headers: {
				"apikey": ServiceKey,
				"authorization": `Bearer ${ServiceKey}`,
				"content-type": "application/json",
				"prefer": "return=representation"
			},
			body: JSON.stringify(Row)
		});

		const Text = await Res.text();
		if (!Res.ok) return Json({ ok: false, error: Text }, 500);

		let Data = null;
		try {
			Data = JSON.parse(Text);
		} catch {
			Data = Text;
		}

		return Json({ ok: true, data: Data });
	} catch (Ex) {
		const Msg = Ex instanceof Error ? Ex.message : String(Ex);
		return Json({ ok: false, error: "Function crashed", message: Msg }, 500);
	}
}
