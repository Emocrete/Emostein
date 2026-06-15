let cLastStamp = "";
let cLastCount = 0;

function GetWidgetId(pPrefix) {
	const cNow = new Date();

	const cYear = String(cNow.getFullYear()).slice(-2);
	const cMonth = String(cNow.getMonth() + 1).padStart(2, "0");
	const cDay = String(cNow.getDate()).padStart(2, "0");

	const cHour = String(cNow.getHours()).padStart(2, "0");
	const cMinute = String(cNow.getMinutes()).padStart(2, "0");
	const cSecond = String(cNow.getSeconds()).padStart(2, "0");

	const cMs = String(cNow.getMilliseconds()).padStart(3, "0");

	const cStamp = `${cYear}${cMonth}${cDay}-${cHour}${cMinute}${cSecond}-${cMs}`;

	if (cStamp === cLastStamp) {
		cLastCount += 1;
	} else {
		cLastStamp = cStamp;
		cLastCount = 1;
	}

	const cCount = String(cLastCount).padStart(3, "0");

	return `${pPrefix}-${cStamp}-${cCount}`;
}

globalThis.GetWidgetId = GetWidgetId;