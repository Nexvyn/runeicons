import { ICONS, type IconEntry } from "./icons.generated";

export type { IconEntry };
export type IconType = keyof IconEntry["variants"];

export const ICON_TYPES: IconType[] = ["normal", "duotone", "fill", "pixelated", "glass"];

const BY_ID = new Map<string, IconEntry>(ICONS.map((icon) => [icon.id, icon]));

export function getIconById(id: string): IconEntry | undefined {
  return BY_ID.get(id);
}

export function availableTypes(icon: IconEntry): IconType[] {
  return ICON_TYPES.filter((type) => icon.variants[type]);
}

export function searchIcons(query: string, limit = Number.POSITIVE_INFINITY): IconEntry[] {
  const q = query.trim().toLowerCase();
  const matched = q
    ? ICONS.filter((icon) => icon.id.includes(q) || icon.name.toLowerCase().includes(q))
    : ICONS;
  return matched.slice(0, limit);
}

export function buildSvg(icon: IconEntry, type: IconType, size = 24): string | null {
  const variant = icon.variants[type];
  if (!variant) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${variant.viewBox}">${variant.markup}</svg>`;
}
