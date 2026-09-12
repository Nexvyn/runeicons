import { type GeneratedIcon, type IconStyle } from "./icons.generated.js";
export { GENERATED_ICONS, ICON_COUNTS } from "./icons.generated.js";
export type { GeneratedIcon, IconStyle } from "./icons.generated.js";
/**
 * Extract the inner body of an SVG and normalize paint attributes to
 * `currentColor` so agents can recolor icons inline. This mirrors the
 * color behavior of runeicons.com copy/export.
 */
export declare function getSvgInner(icon: GeneratedIcon): string;
/** The icon's own viewBox (e.g. "0 0 24 24", "0 0 40 41" for pixelated). */
export declare function getViewBox(icon: GeneratedIcon): string;
/** Full standalone `<svg>...</svg>` source, recolored to currentColor. */
export declare function getSvgSource(icon: GeneratedIcon): string;
export interface SearchOptions {
    query?: string;
    category?: string;
    style?: IconStyle;
    limit?: number;
}
/** Case-insensitive match against id, name, category, and tags. */
export declare function searchIcons(options: SearchOptions): GeneratedIcon[];
export declare function findIcon(id: string): GeneratedIcon | undefined;
/** Sorted list of categories with per-style counts, e.g. for list_categories. */
export declare function listCategories(): Array<{
    category: string;
    total: number;
    byStyle: Record<IconStyle, number>;
}>;
/** Variants of the same glyph in the other core styles, if any. */
export declare function getRelatedStyles(icon: GeneratedIcon): Array<{
    style: IconStyle;
    id: string;
}>;
