import type { IconData } from "@/lib/types";
import {
  NORMAL_ICONS_MANIFEST,
  GLASS_ICONS_MANIFEST,
  type IconType,
  type NormalIconEntry,
  type GlassIconEntry,
} from "./manifest.generated";

export type { IconType, NormalIconEntry, GlassIconEntry };
export { NORMAL_ICONS_MANIFEST, GLASS_ICONS_MANIFEST };

export type StateIconType =
  | "normal"
  | "duotone"
  | "fill"
  | "pixelated"
  | "glass";

const FILE_BACKED_TYPES = new Set<StateIconType>([
  "normal",
  "duotone",
  "fill",
  "pixelated",
  "glass",
]);

export function resolveLibraryIconType(state: StateIconType): IconType {
  return (FILE_BACKED_TYPES.has(state) ? state : "normal") as IconType;
}

export const EDITOR_SUPPORTED_TYPES = [
  "normal",
  "duotone",
  "fill",
  "pixelated",
] as const;

export type EditorSupportedIconType = (typeof EDITOR_SUPPORTED_TYPES)[number];

const EDITOR_SUPPORTED_SET = new Set<string>(EDITOR_SUPPORTED_TYPES);

export function resolveEditorIconType(
  state: StateIconType,
): EditorSupportedIconType {
  return (
    EDITOR_SUPPORTED_SET.has(state) ? state : "normal"
  ) as EditorSupportedIconType;
}

const NORMAL_BY_ID = new Map<string, NormalIconEntry>(
  NORMAL_ICONS_MANIFEST.map((e) => [e.id, e]),
);
const GLASS_BY_ID = new Map<string, GlassIconEntry>(
  GLASS_ICONS_MANIFEST.map((e) => [e.id, e]),
);

function toIconData(e: NormalIconEntry, iconType: Exclude<IconType, "glass">): IconData {
  return {
    id: e.id,
    name: e.name,
    url: `/${iconType}/${e.folder}/${e.basename}.svg`,
    category: e.category,
    tags: e.tags,
    iconType,
  };
}

function glassToIconData(e: GlassIconEntry): IconData {
  return {
    id: e.id,
    name: e.name,
    url: `/glass-icons/${e.filename}`,
    category: e.category,
    tags: e.tags,
    iconType: "glass",
  };
}

export function getIconsForType(iconType: IconType): IconData[] {
  if (iconType === "glass") {
    return GLASS_ICONS_MANIFEST.map(glassToIconData);
  }
  return NORMAL_ICONS_MANIFEST
    .filter((e) => e.availability[iconType])
    .map((e) => toIconData(e, iconType));
}

export function getIconUrlById(id: string, iconType: IconType): string | null {
  if (iconType === "glass") {
    const g = GLASS_BY_ID.get(id);
    return g ? `/glass-icons/${g.filename}` : null;
  }
  const n = NORMAL_BY_ID.get(id);
  if (!n || !n.availability[iconType]) return null;
  return `/${iconType}/${n.folder}/${n.basename}.svg`;
}

export function getIconDataById(id: string, iconType: IconType): IconData | null {
  if (iconType === "glass") {
    const g = GLASS_BY_ID.get(id);
    return g ? glassToIconData(g) : null;
  }
  const n = NORMAL_BY_ID.get(id);
  if (!n || !n.availability[iconType]) return null;
  return toIconData(n, iconType);
}

export function manifestIdToEditorAssetId(
  manifestId: string,
  iconType: EditorSupportedIconType,
): string | null {
  const entry = NORMAL_BY_ID.get(manifestId);
  if (!entry) return null;
  if (!entry.availability[iconType]) return null;
  return `${iconType}:${entry.folder}/${entry.basename}`;
}

export function editorAssetIdToManifest(
  editorAssetId: string,
): { id: string; iconType: EditorSupportedIconType } | null {
  const colonIndex = editorAssetId.indexOf(":");
  if (colonIndex < 0) return null;
  const variant = editorAssetId.slice(0, colonIndex);
  const slugPath = editorAssetId.slice(colonIndex + 1);
  if (!EDITOR_SUPPORTED_SET.has(variant)) return null;
  const slashIndex = slugPath.indexOf("/");
  if (slashIndex < 0) return null;
  const folder = slugPath.slice(0, slashIndex);
  const basename = slugPath.slice(slashIndex + 1);
  if (!folder || !basename) return null;
  const manifestId = `${folder}-${basename}`;
  if (!NORMAL_BY_ID.has(manifestId)) return null;
  return {
    id: manifestId,
    iconType: variant as EditorSupportedIconType,
  };
}
