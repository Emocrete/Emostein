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



