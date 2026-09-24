import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GENERATED_ICONS } from "./icons.generated.js";
export { GENERATED_ICONS, ICON_COUNTS } from "./icons.generated.js";
const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
/** Root attribute set hoisted onto the root <svg> when returning the full SVG source. */
const ROOT_PAINT_ATTRS = [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-dasharray",
    "stroke-opacity",
    "fill-opacity",
    "fill-rule",
    "clip-rule",
    "opacity",
    "color",
];
const svgCache = new Map();
function readSvg(file) {
    const cached = svgCache.get(file);
    if (cached)
        return cached;
    const svg = readFileSync(join(PKG_DIR, "assets", file), "utf8").replace(/\r\n/g, "\n");
    svgCache.set(file, svg);
    return svg;
}
function svgAttrs(svg) {
    const openMatch = svg.match(/<svg\b([^>]*)>/);
    const rawAttrs = openMatch ? openMatch[1] : "";
    const vbMatch = rawAttrs.match(/viewBox\s*=\s*"([^"]+)"/);
    const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";
    const attrs = [];
    for (const name of ROOT_PAINT_ATTRS) {
        const m = rawAttrs.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`));
        if (m)
            attrs.push(`${name}="${m[1]}"`);
    }
    return { viewBox, attrs };
}
/**
 * Extract the inner body of an SVG and normalize paint attributes to
 * `currentColor` so agents can recolor icons inline. This mirrors the
 * color behavior of runeicons.com copy/export.
 */
export function getSvgInner(icon) {
    const svg = readSvg(icon.file);
    const inner = svg
        .replace(/<svg\b[^>]*>/, "")
        .replace(/<\/svg>\s*$/, "")
        .trim();
    return inner.replace(/(stroke|fill)="(?!none\b|currentColor\b|url\()[^"]*"/g, '$1="currentColor"');
}
/** The icon's own viewBox (e.g. "0 0 24 24", "0 0 40 41" for pixelated). */
export function getViewBox(icon) {
    return svgAttrs(readSvg(icon.file)).viewBox;
}
/** Full standalone `<svg>...</svg>` source, recolored to currentColor. */
export function getSvgSource(icon) {
    const { viewBox, attrs } = svgAttrs(readSvg(icon.file));
    const attrText = ['xmlns="http://www.w3.org/2000/svg"', `viewBox="${viewBox}"`, ...attrs].join(" ");
    return `<svg ${attrText}>\n  ${getSvgInner(icon)}\n</svg>`;
}
/** Case-insensitive match against id, name, category, and tags. */
export function searchIcons(options) {
    const query = options.query?.trim().toLowerCase() ?? "";
    const category = options.category?.trim().toLowerCase() ?? "";
    const limit = Math.max(1, Math.min(options.limit ?? 50, 200));
    const results = GENERATED_ICONS.filter((icon) => {
        if (options.style && icon.style !== options.style)
            return false;
        if (category && icon.category !== category)
            return false;
        if (!query)
            return true;
        if (icon.id.toLowerCase().includes(query))
            return true;
        if (icon.name.toLowerCase().includes(query))
            return true;
        if (icon.category.toLowerCase().includes(query))
            return true;
        return icon.tags.some((tag) => tag.toLowerCase().includes(query));
    });
    // Exact id or name matches first, then shortest id (closest to the query).
    results.sort((a, b) => {
        const aExact = a.id.toLowerCase() === query || a.name.toLowerCase() === query ? 0 : 1;
        const bExact = b.id.toLowerCase() === query || b.name.toLowerCase() === query ? 0 : 1;
        if (aExact !== bExact)
            return aExact - bExact;
        return a.id.length - b.id.length || a.id.localeCompare(b.id);
    });
    return results.slice(0, limit);
}
export function findIcon(id) {
    const needle = id.trim().toLowerCase();
    const matches = GENERATED_ICONS.filter((icon) => icon.id.toLowerCase() === needle);
    if (matches.length === 0)
        return undefined;
    // Default to the outline style when a glyph exists in several styles.
    return matches.find((icon) => icon.style === "normal") ?? matches[0];
}
/** Sorted list of categories with per-style counts, e.g. for list_categories. */
export function listCategories() {
    const categories = new Map();
    for (const icon of GENERATED_ICONS) {
        let entry = categories.get(icon.category);
        if (!entry) {
            entry = {
                total: 0,
                byStyle: { normal: 0, duotone: 0, fill: 0, pixelated: 0, glass: 0 },
            };
            categories.set(icon.category, entry);
        }
        entry.total += 1;
        entry.byStyle[icon.style] += 1;
    }
    return [...categories.entries()]
        .map(([category, value]) => ({ category, ...value }))
        .sort((a, b) => a.category.localeCompare(b.category));
}
/** Variants of the same glyph in the other core styles, if any. */
export function getRelatedStyles(icon) {
    if (icon.style === "glass")
        return [];
    return GENERATED_ICONS.filter((other) => other.id === icon.id && other.style !== icon.style).map((other) => ({ style: other.style, id: other.id }));
}
