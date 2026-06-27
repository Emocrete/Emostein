type TAlign = "right" | "center" | "left";
type TValue = string | number;

interface TResponsiveValue<T> {
	L: T;
	P: T;
}

/** مواصفات خط */
interface TFontSpec {
	color: string;
	size: TValue;
	align?: TAlign;
	bold?: boolean;
	family?: string;
}

/** موضع أفقي/رأسي ريسبونسف */
interface TLocationSpec {
	x: TResponsiveValue<TValue>;
	y: TResponsiveValue<TValue>;
}

/** صورة ريسبونسف */
interface TImageSpec {
	src: TResponsiveValue<string>;
	width: TResponsiveValue<TValue>;
	height: TResponsiveValue<TValue>;
	alt: string;
	pos?: TLocationSpec;
}




/** Debug-only outline attributes for Astro widgets.
 * Debug  = outline the widget root itself.
 * DebugF = parent-level/debug family outline.
 * DebugG = grand-parent-level/debug group outline.
 */
interface DebugOutlineProps {
	Debug?: boolean | string;
	DebugF?: boolean | string;
	DebugG?: boolean | string;
	"data-debug"?: boolean | string;
	"data-debugF"?: boolean | string;
	"data-debugG"?: boolean | string;
}
