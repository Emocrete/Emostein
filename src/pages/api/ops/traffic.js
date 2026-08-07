export const prerender = false;

const cCache = new Map();
const cCacheMs = 6 * 60 * 60 * 1000;
const cLookupTimeoutMs = 2500;
const cBotPattern = /(bot|crawl|spider|slurp|googlebot|googleother|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|google-inspectiontool|apis-google|adsbot|mediapartners-google|lighthouse|chrome-lighthouse|pagespeed|headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|gtmetrix|pingdom|ahrefs|semrush|mj12bot|dotbot|petalbot|screaming frog|sitebulb|chatgpt-user|gptbot|oai-searchbot|claudebot|anthropic-ai|perplexitybot|bytespider|amazonbot|applebot|ccbot)/i;
const cDataCenterPattern = /(amazon|amazonaws|aws|google cloud|google llc|microsoft|azure|digitalocean|hetzner|ovh|oracle cloud|linode|akamai|cloudflare|fastly|vultr|contabo|leaseweb|choopa|quadranet|hostinger|hosting|data ?center|datacentre|server|colo|vpn|proxy)/i;
const cSourceWeights = { vercel: 0.65, ipapi: 1, ipwho: 1, freeipapi: 1.1, iplocationinfo: 1, ipinfo: 1.2, maxmind: 1.25 };
const cCorrelatedRadiusKm = 3;
const cInvalidGeoTextPattern = /\b(atlantic|pacific|indian ocean|ocean|sea|gulf of|mediterranean|red sea|arabian sea)\b|المحيط|البحر/i;
const cArabCountryCodes = new Set(["EG", "SA", "AE", "KW", "QA", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "PS", "MA", "DZ", "TN", "LY", "SD", "SO", "DJ", "KM", "MR"]);
const cCairoAreaNames = new Set([
	"nozha", "el nozha", "al nozha", "النزهه", "النزهة",
	"marg", "el marg", "al marg", "المرج",
	"nasr city", "madinet nasr", "مدينه نصر", "مدينة نصر",
	"heliopolis", "masr el gedida", "misr al jadidah", "مصر الجديده", "مصر الجديدة",
	"maadi", "el maadi", "المعادي",
	"zamalek", "الزمالك",
	"ain shams", "عين شمس",
	"matariya", "el matariya", "المطريه", "المطرية",
	"mokattam", "المقطم",
	"abbassia", "العباسيه", "العباسية",
	"sayeda zeinab", "السيده زينب", "السيدة زينب",
	"basatin", "البساتين",
	"dar el salam", "دار السلام",
	"new cairo", "القاهره الجديده", "القاهرة الجديدة",
	"tagamoa", "التجمع"
]);
const cGizaAreaNames = new Set([
	"dokki", "الدقي", "agouza", "العجوزه", "العجوزة", "mohandessin", "المهندسين",
	"haram", "el haram", "الهرم", "faisal", "فيصل", "imbaba", "امبابه", "إمبابة",
	"warraq", "el warraq", "الوراق", "boulaq el dakrour", "بولاق الدكرور", "omraniya", "العمرانيه", "العمرانية"
]);

function Json(pBody, pStatus = 200) {
	return new Response(JSON.stringify(pBody), {
		status: pStatus,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" }
	});
}

function Env(pName) {
	const Value = process.env[pName];
	return typeof Value === "string" ? Value.trim() : "";
}

function Str(pValue) { return String(pValue ?? "").trim(); }
function Num(pValue) {
	const Text = Str(pValue);
	if (!Text) return null;
	const Value = Number(Text);
	return Number.isFinite(Value) ? Value : null;
}
function Header(pRequest, pName) { return Str(pRequest.headers.get(pName)); }

function DecodeHeaderText(pValue) {
	const Value = Str(pValue);
	if (!Value) return "";
	try { return decodeURIComponent(Value.replace(/\+/g, "%20")).trim(); }
	catch { return Value; }
}

function GeoNorm(pValue) {
	return DecodeHeaderText(pValue).toLowerCase()
		.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
		.replace(/[\u064B-\u065F\u0670]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
		.replace(/[^a-z0-9ا-ي]+/g, " ").replace(/\s+/g, " ").trim();
}

function ClientIp(pRequest) {
	const Forwarded = Header(pRequest, "x-forwarded-for").split(",")[0].trim();
	return Forwarded || Header(pRequest, "x-real-ip") || Header(pRequest, "cf-connecting-ip");
}

function HeaderReason(pRequest) {
	const UserAgent = Header(pRequest, "user-agent");
	const Purpose = Str(Header(pRequest, "purpose") || Header(pRequest, "sec-purpose") || Header(pRequest, "x-purpose")).toLowerCase();
	if (cBotPattern.test(UserAgent)) return "known_automation_user_agent";
	if (Purpose.includes("prefetch") || Purpose.includes("preview") || Purpose.includes("prerender")) return "automated_fetch";
	return "";
}

function GeoSource(pSource, pData = {}) {
	return {
		source: pSource,
		countryCode: Str(pData.countryCode).toUpperCase(),
		country: Str(pData.country),
		region: DecodeHeaderText(pData.region),
		regionCode: Str(pData.regionCode),
		city: DecodeHeaderText(pData.city),
		locality: DecodeHeaderText(pData.locality),
		postal: Str(pData.postal),
		latitude: Num(pData.latitude),
		longitude: Num(pData.longitude),
		timezone: Str(pData.timezone),
		accuracyRadiusKm: Num(pData.accuracyRadiusKm),
		asn: Str(pData.asn),
		org: Str(pData.org),
		hostname: Str(pData.hostname),
		networkType: Str(pData.networkType),
		isAnonymous: pData.isAnonymous === true,
		isHosting: pData.isHosting === true,
		isMobile: pData.isMobile === true,
		configured: pData.configured !== false
	};
}

function VercelGeoSource(pRequest) {
	const CountryCode = Header(pRequest, "x-vercel-ip-country");
	const Region = Header(pRequest, "x-vercel-ip-country-region") || Header(pRequest, "x-vercel-ip-region");
	const City = Header(pRequest, "x-vercel-ip-city");
	if (!CountryCode && !Region && !City) return null;
	return GeoSource("vercel", {
		countryCode: CountryCode,
		region: Region,
		city: City,
		postal: Header(pRequest, "x-vercel-ip-postal-code"),
		latitude: Header(pRequest, "x-vercel-ip-latitude"),
		longitude: Header(pRequest, "x-vercel-ip-longitude"),
		timezone: Header(pRequest, "x-vercel-ip-timezone")
	});
}

async function CachedLookup(pKey, pLoader) {
	const Cached = cCache.get(pKey);
	if (Cached && Date.now() - Cached.at < cCacheMs) return Cached.value ? { ...Cached.value, cacheHit: true } : null;
	try {
		const Value = await pLoader();
		cCache.set(pKey, { at: Date.now(), value: Value });
		return Value ? { ...Value, cacheHit: false } : null;
	} catch {
		cCache.set(pKey, { at: Date.now(), value: null });
		return null;
	}
}

async function FetchJson(pUrl, pOptions = {}) {
	const Res = await fetch(pUrl, {
		...pOptions,
		headers: { accept: "application/json", ...(pOptions.headers || {}) },
		signal: AbortSignal.timeout(cLookupTimeoutMs)
	});
	if (!Res.ok) throw new Error(`HTTP ${Res.status}`);
	return await Res.json();
}

async function LookupIpApi(pIp) {
	if (!pIp) return null;
	return await CachedLookup(`ipapi:${pIp}`, async () => {
		const Data = await FetchJson(`https://ipapi.co/${encodeURIComponent(pIp)}/json/`);
		if (!Data || Data.error) return null;
		return GeoSource("ipapi", {
			countryCode: Data.country_code,
			country: Data.country_name,
			region: Data.region,
			regionCode: Data.region_code,
			city: Data.city,
			postal: Data.postal,
			latitude: Data.latitude,
			longitude: Data.longitude,
			timezone: Data.timezone,
			asn: Data.asn,
			org: Data.org,
			hostname: Data.hostname
		});
	});
}

async function LookupIpWho(pIp) {
	if (!pIp) return null;
	return await CachedLookup(`ipwho:${pIp}`, async () => {
		const Data = await FetchJson(`https://ipwho.is/${encodeURIComponent(pIp)}`);
		if (!Data || Data.success === false) return null;
		return GeoSource("ipwho", {
			countryCode: Data.country_code,
			country: Data.country,
			region: Data.region,
			regionCode: Data.region_code,
			city: Data.city,
			postal: Data.postal,
			latitude: Data.latitude,
			longitude: Data.longitude,
			timezone: Data.timezone?.id,
			asn: Data.connection?.asn,
			org: Data.connection?.org || Data.connection?.isp,
			networkType: Data.type
		});
	});
}

async function LookupFreeIpApi(pIp) {
	if (!pIp) return null;
	return await CachedLookup(`freeipapi:${pIp}`, async () => {
		const Data = await FetchJson(`https://free.freeipapi.com/api/json/${encodeURIComponent(pIp)}`);
		if (!Data || !Data.countryCode) return null;
		const Timezones = Array.isArray(Data.timeZones) ? Data.timeZones : [];
		return GeoSource("freeipapi", {
			countryCode: Data.countryCode,
			country: Data.countryName,
			region: Data.regionName,
			regionCode: Data.regionCode,
			city: Data.cityName,
			postal: Data.zipCode,
			latitude: Data.latitude,
			longitude: Data.longitude,
			timezone: Timezones.length === 1 ? Timezones[0] : "",
			asn: Data.asn ? `AS${String(Data.asn).replace(/^AS/i, "")}` : "",
			org: Data.asnOrganization,
			isAnonymous: Data.isProxy === true
		});
	});
}

async function LookupIpLocationInfo(pIp) {
	if (!pIp) return null;
	return await CachedLookup(`iplocationinfo:${pIp}`, async () => {
		const Data = await FetchJson(`https://iplocation.info/${encodeURIComponent(pIp)}`);
		if (!Data || !Data.country_code) return null;
		return GeoSource("iplocationinfo", {
			countryCode: Data.country_code,
			country: Data.country,
			region: Data.region,
			regionCode: Data.region_code,
			city: Data.city,
			postal: Data.postal_code,
			latitude: Data.lat,
			longitude: Data.lon,
			timezone: Data.timezone,
			asn: Data.asn,
			org: Data.organization || Data.isp,
			hostname: Data.hostname
		});
	});
}

async function LookupIpInfo(pIp) {
	const Token = Env("IPINFO_TOKEN");
	if (!pIp || !Token) return null;
	return await CachedLookup(`ipinfo:${pIp}`, async () => {
		const Data = await FetchJson(`https://api.ipinfo.io/lookup/${encodeURIComponent(pIp)}?token=${encodeURIComponent(Token)}`);
		if (!Data || !Data.geo) return null;
		return GeoSource("ipinfo", {
			countryCode: Data.geo.country_code,
			country: Data.geo.country,
			region: Data.geo.region,
			regionCode: Data.geo.region_code,
			city: Data.geo.city,
			postal: Data.geo.postal_code,
			latitude: Data.geo.latitude,
			longitude: Data.geo.longitude,
			timezone: Data.geo.timezone,
			accuracyRadiusKm: Data.geo.radius,
			asn: Data.as?.asn,
			org: Data.as?.name,
			hostname: Data.hostname,
			networkType: Data.as?.type,
			isAnonymous: Data.is_anonymous === true || Data.anonymous?.is_proxy === true || Data.anonymous?.is_vpn === true,
			isHosting: Data.is_hosting === true,
			isMobile: Data.is_mobile === true
		});
	});
}

async function LookupMaxMind(pIp) {
	const AccountId = Env("MAXMIND_ACCOUNT_ID");
	const LicenseKey = Env("MAXMIND_LICENSE_KEY");
	if (!pIp || !AccountId || !LicenseKey || typeof Buffer === "undefined") return null;
	return await CachedLookup(`maxmind:${pIp}`, async () => {
		const Auth = Buffer.from(`${AccountId}:${LicenseKey}`).toString("base64");
		const Data = await FetchJson(`https://geoip.maxmind.com/geoip/v2.1/city/${encodeURIComponent(pIp)}`, { headers: { authorization: `Basic ${Auth}` } });
		if (!Data) return null;
		const Subdivision = Array.isArray(Data.subdivisions) && Data.subdivisions.length ? Data.subdivisions[0] : null;
		return GeoSource("maxmind", {
			countryCode: Data.country?.iso_code,
			country: Data.country?.names?.en,
			region: Subdivision?.names?.en,
			regionCode: Subdivision?.iso_code,
			city: Data.city?.names?.en,
			postal: Data.postal?.code,
			latitude: Data.location?.latitude,
			longitude: Data.location?.longitude,
			timezone: Data.location?.time_zone,
			accuracyRadiusKm: Data.location?.accuracy_radius,
			asn: Data.traits?.autonomous_system_number ? `AS${Data.traits.autonomous_system_number}` : "",
			org: Data.traits?.autonomous_system_organization,
			networkType: Data.traits?.user_type,
			isAnonymous: Data.traits?.is_anonymous_proxy === true,
			isHosting: Data.traits?.user_type === "hosting",
			isMobile: Data.traits?.user_type === "cellular"
		});
	});
}

function DistanceKm(pA, pB) {
	if (!pA || !pB || !Number.isFinite(pA.latitude) || !Number.isFinite(pA.longitude) || !Number.isFinite(pB.latitude) || !Number.isFinite(pB.longitude)) return null;
	const ToRad = (Value) => Value * Math.PI / 180;
	const DLat = ToRad(pB.latitude - pA.latitude);
	const DLon = ToRad(pB.longitude - pA.longitude);
	const Lat1 = ToRad(pA.latitude);
	const Lat2 = ToRad(pB.latitude);
	const A = Math.sin(DLat / 2) ** 2 + Math.cos(Lat1) * Math.cos(Lat2) * Math.sin(DLon / 2) ** 2;
	return 6371 * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
}

function HasAnyGeoWord(pText, pWords) {
	const Text = ` ${GeoNorm(pText)} `;
	for (const WordRaw of pWords) {
		const Word = GeoNorm(WordRaw);
		if (Word && (Text.includes(` ${Word} `) || (Word.length > 3 && Text.includes(Word)))) return true;
	}
	return false;
}

function CanonicalEgyptGovernorate(pRegion, pRegionCode, pCity) {
	const Region = Str(pRegion);
	const Code = Str(pRegionCode).toUpperCase();
	const All = `${Region} ${pCity || ""}`;
	if (Code === "C" || Code === "CAI" || HasAnyGeoWord(All, ["cairo", "cairo governorate", "al qahirah", "القاهرة", "القاهره"])) return "Cairo";
	if (Code === "GZ" || Code === "GIZ" || HasAnyGeoWord(All, ["giza", "giza governorate", "al jizah", "jizah", "الجيزة", "الجيزه"])) return "Giza";
	if (HasAnyGeoWord(All, ["qalyubia", "qalubia", "القليوبية", "القليوبيه"])) return "Qalyubia";
	if (HasAnyGeoWord(All, ["alexandria", "الاسكندرية", "الإسكندرية"])) return "Alexandria";
	return Region;
}

function IsKnownArea(pValue, pGovernorate) {
	const Key = GeoNorm(pValue);
	if (!Key) return false;
	if (GeoNorm(pGovernorate) === "cairo") return cCairoAreaNames.has(Key);
	if (GeoNorm(pGovernorate) === "giza") return cGizaAreaNames.has(Key);
	return false;
}

function IsInvalidGeoSource(pSource) {
	if (!pSource) return "missing_source";
	const Text = `${pSource.city || ""} ${pSource.locality || ""} ${pSource.region || ""}`.trim();
	if (cInvalidGeoTextPattern.test(Text)) return "waterbody_or_non_city_label";
	if (Number.isFinite(pSource.latitude) && Number.isFinite(pSource.longitude)) {
		if (Math.abs(pSource.latitude) < 0.000001 && Math.abs(pSource.longitude) < 0.000001) return "zero_coordinates";
		if (Math.abs(pSource.latitude) > 90 || Math.abs(pSource.longitude) > 180) return "invalid_coordinates";
	}
	if (!pSource.countryCode && !pSource.country && (pSource.city || pSource.region || pSource.locality)) return "missing_country";
	return "";
}

function PrepareGeoSource(pSource) {
	const Source = { ...pSource };
	const RejectionReason = IsInvalidGeoSource(Source);
	Source.voteEligible = !RejectionReason;
	Source.rejectionReason = RejectionReason;
	Source.governorate = "";
	Source.area = "";
	Source.areaType = "";

	if (!Source.voteEligible) return Source;

	const CountryCode = Str(Source.countryCode).toUpperCase();
	let Governorate = Str(Source.region);
	let City = Str(Source.city);
	let Area = Str(Source.locality);
	let AreaType = Area ? "locality" : "";

	if (CountryCode === "EG") {
		Governorate = CanonicalEgyptGovernorate(Source.region, Source.regionCode, Source.city);
		const GovKey = GeoNorm(Governorate);
		const CityKey = GeoNorm(City);

		if (Area && GeoNorm(Area) === CityKey) {
			Area = "";
			AreaType = "";
		}

		if (!Area && IsKnownArea(City, Governorate)) {
			Area = City;
			AreaType = "district";
			City = GovKey === "cairo" ? "Cairo" : GovKey === "giza" ? "Giza" : "";
		}

		if (GovKey === "cairo" && HasAnyGeoWord(City, ["cairo", "al qahirah", "القاهرة", "القاهره"])) City = "Cairo";
		if (GovKey === "giza" && HasAnyGeoWord(City, ["giza", "al jizah", "jizah", "الجيزة", "الجيزه"])) City = "Giza";
	}

	Source.governorate = Governorate;
	Source.city = City;
	Source.area = Area;
	Source.areaType = AreaType;
	return Source;
}

function EffectiveVoteScore(pSources, pUseCorrelation) {
	if (!pUseCorrelation) return pSources.reduce((Total, Source) => Total + (cSourceWeights[Source.source] || 1), 0);
	const Clusters = [];
	for (const Source of pSources) {
		let Cluster = null;
		for (const Existing of Clusters) {
			const Distance = DistanceKm(Source, Existing.anchor);
			if (Distance != null && Distance <= cCorrelatedRadiusKm) {
				Cluster = Existing;
				break;
			}
		}
		if (!Cluster) {
			Cluster = { anchor: Source, sources: [] };
			Clusters.push(Cluster);
		}
		Cluster.sources.push(Source);
	}
	let Score = 0;
	for (const Cluster of Clusters) {
		const Weights = Cluster.sources.map((Source) => cSourceWeights[Source.source] || 1).sort((A, B) => B - A);
		if (!Weights.length) continue;
		Score += Weights[0];
		for (let Index = 1; Index < Weights.length; Index++) Score += Weights[Index] * 0.25;
	}
	return Score;
}

function VoteList(pSources, pField, pFilter = null, pUseCorrelation = true) {
	const Votes = new Map();
	for (const Source of pSources) {
		if (!Source || Source.voteEligible === false || (pFilter && !pFilter(Source))) continue;
		const Raw = Str(Source[pField]);
		const Key = pField === "countryCode" ? Raw.toUpperCase() : GeoNorm(Raw);
		if (!Key) continue;
		const Existing = Votes.get(Key) || { key: Key, value: Raw, sources: [], score: 0, coordinateClusters: 0 };
		Existing.sources.push(Source);
		Votes.set(Key, Existing);
	}
	const Result = [];
	for (const Vote of Votes.values()) {
		Vote.score = EffectiveVoteScore(Vote.sources, pUseCorrelation);
		const Clusters = [];
		if (pUseCorrelation) {
			for (const Source of Vote.sources) {
				let Matched = false;
				for (const Anchor of Clusters) {
					const Distance = DistanceKm(Source, Anchor);
					if (Distance != null && Distance <= cCorrelatedRadiusKm) {
						Matched = true;
						break;
					}
				}
				if (!Matched) Clusters.push(Source);
			}
		}
		Vote.coordinateClusters = pUseCorrelation ? Math.max(1, Clusters.length) : Vote.sources.length;
		Result.push({
			key: Vote.key,
			value: Vote.value,
			score: Math.round(Vote.score * 10000) / 10000,
			sources: Vote.sources.map((Source) => Source.source),
			coordinateClusters: Vote.coordinateClusters
		});
	}
	return Result.sort((A, B) => B.score - A.score || B.coordinateClusters - A.coordinateClusters || B.sources.length - A.sources.length);
}

function WeightedCoordinate(pSources, pCountryCode, pGovernorate = "") {
	const Candidates = (pSources || []).filter((Source) => {
		if (!Source || Source.voteEligible === false) return false;
		if (pCountryCode && Source.countryCode !== pCountryCode) return false;
		if (pGovernorate && GeoNorm(Source.governorate) !== GeoNorm(pGovernorate)) return false;
		return Number.isFinite(Source.latitude) && Number.isFinite(Source.longitude);
	});
	if (!Candidates.length) return { latitude: null, longitude: null, sources: [] };

	const Clusters = [];
	for (const Source of Candidates) {
		let Cluster = null;
		for (const Existing of Clusters) {
			const Distance = DistanceKm(Source, Existing.anchor);
			if (Distance != null && Distance <= cCorrelatedRadiusKm) {
				Cluster = Existing;
				break;
			}
		}
		if (!Cluster) {
			Cluster = { anchor: Source, sources: [] };
			Clusters.push(Cluster);
		}
		Cluster.sources.push(Source);
	}
	Clusters.sort((A, B) => EffectiveVoteScore(B.sources, true) - EffectiveVoteScore(A.sources, true));
	const Winner = Clusters[0];
	let Lat = 0;
	let Lon = 0;
	let Total = 0;
	for (const Source of Winner.sources) {
		const Weight = cSourceWeights[Source.source] || 1;
		Lat += Source.latitude * Weight;
		Lon += Source.longitude * Weight;
		Total += Weight;
	}
	return {
		latitude: Total ? Lat / Total : null,
		longitude: Total ? Lon / Total : null,
		sources: Winner.sources.map((Source) => Source.source)
	};
}

function LocationBand(pCountryCode, pGovernorate, pCity) {
	const CountryCode = Str(pCountryCode).toUpperCase();
	const Governorate = Str(pGovernorate);
	const City = Str(pCity);
	if (CountryCode === "EG") {
		const GovKey = GeoNorm(Governorate);
		if (GovKey === "cairo") return { band: "cairo", borderColor: "#00C853" };
		if (GovKey === "giza") return { band: "giza", borderColor: "#00D5FF" };
		if (HasAnyGeoWord(City, ["cairo", "al qahirah", "القاهرة", "القاهره"])) return { band: "cairo", borderColor: "#00C853" };
		if (HasAnyGeoWord(City, ["giza", "6th of october", "october", "sheikh zayed", "الجيزة", "اكتوبر", "الشيخ زايد"])) return { band: "giza", borderColor: "#00D5FF" };
		return { band: "egypt", borderColor: "#FFD740" };
	}
	if (cArabCountryCodes.has(CountryCode)) return { band: "arab", borderColor: "#FF8A00" };
	return { band: "world", borderColor: "#FF3B30" };
}

function ConfidenceFromVote(pVote, pMinimumSources = 2) {
	if (!pVote) return "none";
	const Count = pVote.sources?.length || 0;
	if (Count >= 3 && pVote.coordinateClusters >= 2) return "high";
	if (Count >= pMinimumSources) return "medium";
	return "low";
}

function ResolveIpLocation(pSources) {
	const Sources = (pSources || []).filter(Boolean).map(PrepareGeoSource);
	const Eligible = Sources.filter((Source) => Source.voteEligible !== false);
	if (!Eligible.length) return {
		method: "ip_unverified",
		verified: false,
		confidence: "low",
		countryConfidence: "low",
		governorateConfidence: "none",
		cityConfidence: "none",
		areaConfidence: "none",
		countryCode: "",
		governorate: "",
		region: "",
		city: "",
		area: "",
		areaType: "",
		band: "",
		label: "",
		borderColor: "",
		sourceCount: Sources.length,
		rejectedSources: Sources.filter((Source) => Source.voteEligible === false).map((Source) => ({ source: Source.source, reason: Source.rejectionReason }))
	};

	const CountryVotes = VoteList(Eligible, "countryCode", null, false);
	const CountryVote = CountryVotes[0] || null;
	const CountryCode = Str(CountryVote?.value).toUpperCase();
	const MatchingCountry = (Source) => !CountryCode || Source.countryCode === CountryCode;
	const GovernorateVotes = VoteList(Eligible, "governorate", MatchingCountry, true);
	const GovernorateVote = GovernorateVotes[0] || null;
	const Governorate = Str(GovernorateVote?.value);
	const MatchingGovernorate = (Source) => MatchingCountry(Source) && (!Governorate || GeoNorm(Source.governorate) === GeoNorm(Governorate));
	const CityVotes = VoteList(Eligible, "city", MatchingGovernorate, true);
	const CityVote = CityVotes[0] || null;
	const AreaVotes = VoteList(Eligible, "area", MatchingGovernorate, true);
	const AreaVote = AreaVotes[0] || null;

	const CountryAgreement = CountryVote?.sources?.length || 0;
	const IndependentCountrySources = (CountryVote?.sources || []).filter((Name) => Name !== "vercel").length;
	const CountryVerified = CountryAgreement >= 2 && IndependentCountrySources >= 1;
	const GovernorateVerified = CountryVerified && (GovernorateVote?.sources?.length || 0) >= 2;
	const CityVerified = GovernorateVerified && (CityVote?.sources?.length || 0) >= 2;

	if (!CountryVerified) {
		return {
			method: "ip_unverified",
			verified: false,
			confidence: "low",
			countryConfidence: "low",
			governorateConfidence: "none",
			cityConfidence: "none",
			areaConfidence: "none",
			countryCode: "",
			governorate: "",
			region: "",
			city: "",
			area: "",
			areaType: "",
			band: "",
			label: "",
			borderColor: "",
			candidateCountryCode: CountryCode,
			candidateGovernorate: Governorate,
			candidateRegion: Governorate,
			candidateCity: Str(CityVote?.value),
			candidateArea: Str(AreaVote?.value),
			sourceCount: Sources.length,
			countryCandidates: CountryVotes.slice(0, 5),
			governorateCandidates: GovernorateVotes.slice(0, 5),
			regionCandidates: GovernorateVotes.slice(0, 5),
			cityCandidates: CityVotes.slice(0, 5),
			areaCandidates: AreaVotes.slice(0, 5),
			rejectedSources: Sources.filter((Source) => Source.voteEligible === false).map((Source) => ({ source: Source.source, reason: Source.rejectionReason })),
			sources: Sources,
			note: "Only one or conflicting IP geolocation sources were available; do not treat this as verified physical location"
		};
	}

	let City = CityVerified ? Str(CityVote?.value) : "";
	if (!City && GovernorateVerified) City = Governorate;

	let Area = GovernorateVerified ? Str(AreaVote?.value) : "";
	let AreaType = "";
	let AreaAgreementSources = AreaVote?.sources || [];
	let AreaConfidenceVote = AreaVote;
	const AreaSource = Eligible.find((Source) => Source.source === AreaVote?.sources?.[0] && GeoNorm(Source.area) === GeoNorm(Area));
	if (Area) AreaType = Str(AreaSource?.areaType || "locality");

	// Preserve a useful sub-governorate place even when providers disagree on the exact city.
	// Example: Giza is verified as the governorate while one provider says Sheikh Zayed and another says Giza.
	// The card can then show Giza as the parent classification and Sheikh Zayed as the extra locality box.
	const CandidateCity = Str(CityVote?.value);
	if (!Area && GovernorateVerified && !CityVerified && CandidateCity && GeoNorm(CandidateCity) !== GeoNorm(Governorate)) {
		Area = CandidateCity;
		AreaType = "locality_candidate";
		AreaAgreementSources = CityVote?.sources || [];
		AreaConfidenceVote = CityVote;
	}

	const Coordinates = WeightedCoordinate(Eligible, CountryCode, GovernorateVerified ? Governorate : "");
	const Band = LocationBand(CountryCode, GovernorateVerified ? Governorate : "", City);

	const GovernorateConfidence = GovernorateVerified ? ConfidenceFromVote(GovernorateVote) : "low";
	const CityConfidence = CityVerified ? ConfidenceFromVote(CityVote) : "low";
	const AreaConfidence = Area ? ConfidenceFromVote(AreaConfidenceVote, 2) : "none";
	const OverallConfidence = CityVerified ? CityConfidence : GovernorateVerified ? GovernorateConfidence : "country_only";

	return {
		method: "ip_consensus",
		verified: true,
		governorateVerified: GovernorateVerified,
		cityVerified: CityVerified,
		confidence: OverallConfidence,
		countryConfidence: ConfidenceFromVote(CountryVote),
		governorateConfidence: GovernorateConfidence,
		cityConfidence: CityConfidence,
		areaConfidence: AreaConfidence,
		countryCode: CountryCode,
		governorate: GovernorateVerified ? Governorate : "",
		region: GovernorateVerified ? Governorate : "",
		city: City,
		area: Area,
		areaType: AreaType,
		band: Band.band,
		label: City || (GovernorateVerified ? Governorate : CountryCode),
		borderColor: Band.borderColor,
		latitude: Coordinates.latitude,
		longitude: Coordinates.longitude,
		sourceCount: Sources.length,
		independentCountrySourceCount: IndependentCountrySources,
		countryCandidates: CountryVotes.slice(0, 5),
		governorateCandidates: GovernorateVotes.slice(0, 5),
		regionCandidates: GovernorateVotes.slice(0, 5),
		cityCandidates: CityVotes.slice(0, 5),
		areaCandidates: AreaVotes.slice(0, 5),
		countryAgreementSources: CountryVote?.sources || [],
		governorateAgreementSources: GovernorateVote?.sources || [],
		regionAgreementSources: GovernorateVote?.sources || [],
		cityAgreementSources: CityVote?.sources || [],
		areaAgreementSources: AreaAgreementSources,
		coordinateSources: Coordinates.sources,
		rejectedSources: Sources.filter((Source) => Source.voteEligible === false).map((Source) => ({ source: Source.source, reason: Source.rejectionReason })),
		sources: Sources,
		note: "IP-derived location is a hierarchical multi-provider estimate of the public network egress; country and governorate are resolved before city and area"
	};
}

async function RunProvider(pName, pLoader) {
	const StartedAt = Date.now();
	try {
		const Source = await pLoader();
		return { source: pName, ok: !!Source, durationMs: Math.max(0, Date.now() - StartedAt), result: Source || null };
	} catch (Error) {
		return { source: pName, ok: false, durationMs: Math.max(0, Date.now() - StartedAt), error: Str(Error?.message || Error), result: null };
	}
}

async function LookupIpSources(pRequest, pIp, pFull = true) {
	const Vercel = VercelGeoSource(pRequest);
	const ProviderStatus = [{ source: "vercel", ok: !!Vercel, durationMs: 0, configured: true }];
	if (!pFull) return { sources: [Vercel].filter(Boolean), providers: ProviderStatus };
	const Results = await Promise.all([
		RunProvider("ipapi", () => LookupIpApi(pIp)),
		RunProvider("ipwho", () => LookupIpWho(pIp)),
		RunProvider("freeipapi", () => LookupFreeIpApi(pIp)),
		RunProvider("iplocationinfo", () => LookupIpLocationInfo(pIp)),
		RunProvider("ipinfo", () => LookupIpInfo(pIp)),
		RunProvider("maxmind", () => LookupMaxMind(pIp))
	]);
	for (const Result of Results) {
		ProviderStatus.push({ source: Result.source, ok: Result.ok, durationMs: Result.durationMs, configured: Result.source === "ipinfo" ? !!Env("IPINFO_TOKEN") : Result.source === "maxmind" ? (!!Env("MAXMIND_ACCOUNT_ID") && !!Env("MAXMIND_LICENSE_KEY")) : true, error: Result.error || "" });
	}
	return { sources: [Vercel, ...Results.map((Item) => Item.result)].filter(Boolean), providers: ProviderStatus };
}


function RequestDiagnostics(pRequest, pIp, pSources, pResolved, pStartedAt, pLookupMs, pProviderStatus = []) {
	let Url;
	try { Url = new URL(pRequest.url); } catch { Url = null; }
	const DiagnosticSources = Array.isArray(pResolved?.sources) ? pResolved.sources : (pSources || []).map(PrepareGeoSource);
	const Network = DiagnosticSources.find((Item) => Item?.org || Item?.asn || Item?.hostname) || null;
	const IpText = Str(pIp);
	const IpVersion = IpText.includes(":") ? "IPv6" : IpText ? "IPv4" : "";
	return {
		serverReceivedAt: new Date(pStartedAt).toISOString(),
		serverCompletedAt: new Date().toISOString(),
		serverDurationMs: Math.max(0, Date.now() - pStartedAt),
		networkLookupMs: Math.max(0, Number(pLookupMs) || 0),
		method: Str(pRequest.method),
		requestPath: Url ? `${Url.pathname}${Url.search}` : "",
		clientIp: Str(pIp),
		clientIpVersion: IpVersion,
		forwardedFor: Header(pRequest, "x-forwarded-for"),
		realIp: Header(pRequest, "x-real-ip"),
		cfConnectingIp: Header(pRequest, "cf-connecting-ip"),
		host: Header(pRequest, "host"),
		forwardedHost: Header(pRequest, "x-forwarded-host"),
		forwardedProto: Header(pRequest, "x-forwarded-proto"),
		referer: Header(pRequest, "referer"),
		userAgent: Header(pRequest, "user-agent"),
		accept: Header(pRequest, "accept"),
		acceptLanguage: Header(pRequest, "accept-language"),
		acceptEncoding: Header(pRequest, "accept-encoding"),
		purpose: Str(Header(pRequest, "purpose") || Header(pRequest, "sec-purpose") || Header(pRequest, "x-purpose")),
		secChUa: Header(pRequest, "sec-ch-ua"),
		secChUaPlatform: Header(pRequest, "sec-ch-ua-platform"),
		secChUaMobile: Header(pRequest, "sec-ch-ua-mobile"),
		secFetchSite: Header(pRequest, "sec-fetch-site"),
		secFetchMode: Header(pRequest, "sec-fetch-mode"),
		secFetchDest: Header(pRequest, "sec-fetch-dest"),
		secFetchUser: Header(pRequest, "sec-fetch-user"),
		vercel: {
			id: Header(pRequest, "x-vercel-id"),
			country: Header(pRequest, "x-vercel-ip-country"),
			region: Header(pRequest, "x-vercel-ip-country-region") || Header(pRequest, "x-vercel-ip-region"),
			city: DecodeHeaderText(Header(pRequest, "x-vercel-ip-city")),
			latitude: Header(pRequest, "x-vercel-ip-latitude"),
			longitude: Header(pRequest, "x-vercel-ip-longitude"),
			timezone: Header(pRequest, "x-vercel-ip-timezone"),
			postalCode: Header(pRequest, "x-vercel-ip-postal-code")
		},
		cloudflare: {
			ray: Header(pRequest, "cf-ray"),
			country: Header(pRequest, "cf-ipcountry")
		},
		network: Network,
		geoSources: DiagnosticSources,
		geoProviderStatus: pProviderStatus || [],
		resolvedIpLocation: pResolved,
		geoProviderConfiguration: {
			vercel: true,
			ipapi: true,
			ipwho: true,
			freeipapi: true,
			iplocationinfo: true,
			ipinfo: !!Env("IPINFO_TOKEN"),
			maxmind: !!Env("MAXMIND_ACCOUNT_ID") && !!Env("MAXMIND_LICENSE_KEY"),
			browserBigDataCloud: true,
			browserDeviceGeolocation: "used only when browser permission is already granted; no permission prompt is triggered"
		}
	};
}

export async function GET({ request }) {
	const StartedAt = Date.now();
	const Ip = ClientIp(request);
	const Url = new URL(request.url);
	const Phase = Str(Url.searchParams.get("phase") || "gate").toLowerCase();
	const HeaderBlock = HeaderReason(request);
	if (HeaderBlock) return Json({
		ok: true,
		track: false,
		reason: HeaderBlock,
		phase: Phase,
		diagnostics: RequestDiagnostics(request, Ip, [], null, StartedAt, 0, [])
	});

	if (Phase !== "location") {
		const Quick = await LookupIpSources(request, Ip, false);
		const Resolved = ResolveIpLocation(Quick.sources);
		const Diagnostics = RequestDiagnostics(request, Ip, Quick.sources, Resolved, StartedAt, 0, Quick.providers);
		Diagnostics.networkAutomationHint = false;
		Diagnostics.networkDecision = "observe_only";
		return Json({ ok: true, track: true, phase: "gate", reason: "accepted_headers", diagnostics: Diagnostics });
	}

	const LookupStartedAt = Date.now();
	const Lookup = await LookupIpSources(request, Ip, true);
	const LookupMs = Date.now() - LookupStartedAt;
	const Resolved = ResolveIpLocation(Lookup.sources);
	const Diagnostics = RequestDiagnostics(request, Ip, Lookup.sources, Resolved, StartedAt, LookupMs, Lookup.providers);
	const NetworkText = Lookup.sources.map((Item) => `${Item?.org || ""} ${Item?.hostname || ""} ${Item?.networkType || ""}`).join(" ");
	const NetworkAutomationHint = Boolean(NetworkText && cDataCenterPattern.test(NetworkText));
	Diagnostics.networkAutomationHint = NetworkAutomationHint;
	Diagnostics.networkDecision = "observe_only";

	return Json({
		ok: true,
		track: true,
		phase: "location",
		reason: NetworkAutomationHint ? "observed_automation_network" : (Lookup.sources.length > 1 ? "location_enriched" : "location_sources_limited"),
		diagnostics: Diagnostics
	});
}

