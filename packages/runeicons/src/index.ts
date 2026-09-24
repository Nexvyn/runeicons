import { type IconEntry, ICONS } from "./icons.generated.js";

export { ICONS };
export type { IconEntry };
export type IconType = keyof IconEntry["variants"];
export type IconVariant = NonNullable<IconEntry["variants"][IconType]>;

export const ICON_TYPES: IconType[] = ["normal", "duotone", "fill", "pixelated", "glass"];

const BY_ID = new Map<string, IconEntry>(ICONS.map((icon) => [icon.id, icon]));

export function getIconById(id: string): IconEntry | undefined {
  return BY_ID.get(id);
}

export function availableTypes(icon: IconEntry): IconType[] {
  return ICON_TYPES.filter((type) => icon.variants[type]);
}

export function listCategories(): string[] {
  return [...new Set(ICONS.map((icon) => icon.category))].sort();
}

export interface SearchOptions {
  type?: IconType;
  category?: string;
  limit?: number;
}

export function searchIcons(query: string, options: SearchOptions | number = {}): IconEntry[] {
  const {
    type,
    category,
    limit = Number.POSITIVE_INFINITY,
  } = typeof options === "number" ? { limit: options } : options;
  const q = query.trim().toLowerCase();
  return ICONS.filter((icon) => {
    if (type && !icon.variants[type]) return false;
    if (category && icon.category !== category) return false;
    if (!q) return true;
    return (
      icon.id.includes(q) ||
      icon.name.toLowerCase().includes(q) ||
      icon.tags.some((tag) => tag.includes(q))
    );
  }).slice(0, limit);
}

export interface BuildSvgOptions {
  size?: number;
  className?: string;
  title?: string;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function buildSvg(
  icon: IconEntry | string,
  type: IconType = "normal",
  options: BuildSvgOptions | number = {},
): string | null {
  const entry = typeof icon === "string" ? getIconById(icon) : icon;
  const variant = entry?.variants[type];
  if (!variant) return null;
  const { size = 24, className, title } = typeof options === "number" ? { size: options } : options;
  const attrs = [
    'xmlns="http://www.w3.org/2000/svg"',
    `width="${size}"`,
    `height="${size}"`,
    `viewBox="${variant.viewBox}"`,
    className ? `class="${escapeAttr(className)}"` : "",
    title ? 'role="img"' : 'aria-hidden="true"',
  ]
    .filter(Boolean)
    .join(" ");
  const label = title ? `<title>${escapeAttr(title)}</title>` : "";
  return `<svg ${attrs}>${label}${variant.markup}</svg>`;
}
