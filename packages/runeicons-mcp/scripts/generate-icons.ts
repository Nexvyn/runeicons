#!/usr/bin/env bun
// Generates the self-contained icon data for runeicons-mcp:
//   1. src/icons.generated.ts — searchable registry of every icon (all 5 styles)
//   2. assets/<style>/<file>.svg — snapshot of the SVGs bundled with the package
//
// Run from the repository root:  bun run generate  (inside packages/runeicons-mcp)
// The outputs are gitignored; `prepublishOnly` regenerates them before publishing.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PKG_DIR = join(SCRIPT_DIR, "..");
const REPO = join(PKG_DIR, "..", "..");
const PUBLIC = join(REPO, "public");

const STYLES = ["normal", "duotone", "fill", "pixelated"] as const;
type SvgStyle = (typeof STYLES)[number] | "glass";

// Mirrors scripts/build-icon-manifest.ts so categories stay consistent with the site.
const FOLDER_TO_CATEGORY: Record<string, string> = {
  arrows: "navigation",
  code: "dev",
  documents: "files",
  gadgets: "hardware",
  identity: "users",
  indicators: "feedback",
  layouts: "layout",
  messaging: "communication",
  metrics: "metrics",
  money: "commerce",
  nature: "weather",
  other: "misc",
  playback: "media",
  schedule: "time",
  senses: "accessibility",
  tools: "action",
};

const FOLDER_TO_TAG: Record<string, string> = {
  arrows: "navigation",
  code: "dev",
  documents: "files",
  gadgets: "hardware",
  identity: "users",
  indicators: "feedback",
  layouts: "layout",
  messaging: "communication",
  metrics: "metrics",
  money: "commerce",
  nature: "weather",
  other: "misc",
  playback: "media",
  schedule: "time",
  senses: "accessibility",
  tools: "actions",
};

const GLASS_CATEGORY_OVERRIDES: Record<string, string> = {
  bitcoin: "commerce",
  creditcard: "commerce",
  shoppingbag: "commerce",
  shoppingcart: "commerce",
  wallet: "commerce",
  pricetag: "commerce",
  calender: "time",
  calendar: "time",
  clock: "time",
  history: "time",
  cloud: "weather",
  sun: "weather",
  moon: "weather",
  rain: "weather",
  bubble: "communication",
  email: "communication",
  envelope: "communication",
  phone: "communication",
  mail: "communication",
  camera: "media",
  microphone: "media",
  play: "media",
  pause: "media",
  volume: "media",
  image: "media",
  arrow: "navigation",
  chevron: "navigation",
  home: "navigation",
  ear: "accessibility",
  eye: "accessibility",
  hand: "accessibility",
  thumb: "accessibility",
  code: "dev",
  console: "dev",
  branch: "dev",
  server: "dev",
  terminal: "dev",
  user: "users",
  people: "users",
  contact: "users",
  battery: "hardware",
  printer: "hardware",
  tv: "hardware",
  laptop: "hardware",
  archive: "files",
  file: "files",
  folder: "files",
  inbox: "files",
  clipboard: "files",
  bell: "feedback",
  check: "feedback",
  alert: "feedback",
  warning: "feedback",
  bookmark: "action",
  heart: "action",
  star: "action",
  trash: "action",
  pencil: "action",
  edit: "action",
  search: "action",
  settings: "action",
};

type GeneratedIcon = {
  id: string;
  name: string;
  style: SvgStyle;
  category: string;
  tags: string[];
  file: string;
};

function titleCaseKebab(s: string): string {
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function splitPascal(s: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (const ch of s) {
    const isUpper = ch >= "A" && ch <= "Z";
    const isDigit = ch >= "0" && ch <= "9";
    if (isUpper || (isDigit && current && !/\d$/.test(current))) {
      if (current) parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function glassName(filename: string): { name: string; idSlug: string; tagWords: string[] } {
  const base = filename.replace(/\.svg$/i, "").trim();
  const pieces: string[] = [];
  for (const seg of base.split(/\s+/)) {
    for (const p of splitPascal(seg)) pieces.push(p);
  }
  const cleaned = pieces.filter((p) => p.length > 0);
  const name = cleaned.join(" ");
  const idSlug = cleaned.join("-").toLowerCase();
  const tagWords = cleaned.map((w) => w.toLowerCase()).filter((w) => !/^\d+$/.test(w));
  return { name, idSlug, tagWords };
}

function glassCategory(idSlug: string, tagWords: string[]): string {
  const all = [idSlug, ...tagWords];
  for (const key of Object.keys(GLASS_CATEGORY_OVERRIDES)) {
    if (all.some((w) => w.includes(key))) return GLASS_CATEGORY_OVERRIDES[key];
  }
  return "misc";
}

function buildNormalIcons(): GeneratedIcon[] {
  const entries: GeneratedIcon[] = [];
  const normalRoot = join(PUBLIC, "normal");
  const folders = readdirSync(normalRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((f) => FOLDER_TO_CATEGORY[f])
    .sort();

  for (const folder of folders) {
    const files = readdirSync(join(normalRoot, folder))
      .filter((f) => f.endsWith(".svg"))
      .sort();

    for (const file of files) {
      const basename = file.replace(/\.svg$/i, "");
      const tags = [FOLDER_TO_TAG[folder], ...basename.split("-").filter(Boolean)];
      for (const style of STYLES) {
        if (!existsSync(join(PUBLIC, style, folder, file))) continue;
        entries.push({
          id: `${folder}-${basename}`,
          name: titleCaseKebab(basename),
          style,
          category: FOLDER_TO_CATEGORY[folder],
          tags,
          file: `${style}/${folder}/${file}`,
        });
      }
    }
  }
  return entries;
}

function buildGlassIcons(): GeneratedIcon[] {
  const glassRoot = join(PUBLIC, "glass-icons");
  if (!existsSync(glassRoot)) return [];
  const files = readdirSync(glassRoot)
    .filter((f) => f.endsWith(".svg"))
    .sort();

  const seen = new Set<string>();
  const entries: GeneratedIcon[] = [];
  for (const file of files) {
    const { name, idSlug, tagWords } = glassName(file);
    let id = `glass-${idSlug}`;
    let suffix = 1;
    while (seen.has(id)) {
      suffix += 1;
      id = `glass-${idSlug}-${suffix}`;
    }
    seen.add(id);
    entries.push({
      id,
      name,
      style: "glass",
      category: glassCategory(idSlug, tagWords),
      tags: ["glass", ...tagWords],
      file: `glass/${file}`,
    });
  }
  return entries;
}

function copyAssets(icons: GeneratedIcon[]): void {
  const assetsDir = join(PKG_DIR, "assets");
  rmSync(assetsDir, { recursive: true, force: true });
  for (const style of [...STYLES, "glass" as const]) {
    mkdirSync(join(assetsDir, style), { recursive: true });
  }
  for (const icon of icons) {
    const dest = join(assetsDir, icon.file);
    mkdirSync(dirname(dest), { recursive: true });
    // Glass SVGs live in public/glass-icons but ship under assets/glass.
    const src =
      icon.style === "glass"
        ? join(PUBLIC, "glass-icons", icon.file.slice("glass/".length))
        : join(PUBLIC, icon.file);
    copyFileSync(src, dest);
  }
}

function main(): void {
  const icons = [...buildNormalIcons(), ...buildGlassIcons()];
  if (icons.length === 0) {
    console.error("No icons found — run this script from the runeicons repository.");
    process.exit(1);
  }

  copyAssets(icons);

  const counts: Record<string, number> = {};
  for (const icon of icons) counts[icon.style] = (counts[icon.style] ?? 0) + 1;

  const body = icons
    .slice()
    .sort((a, b) => (a.id === b.id ? a.style.localeCompare(b.style) : a.id.localeCompare(b.id)))
    .map((icon) => `  ${JSON.stringify(icon)},`)
    .join("\n");

  const header = `// AUTO-GENERATED by packages/runeicons-mcp/scripts/generate-icons.ts
// Do not edit by hand. Run \`bun run generate\` in packages/runeicons-mcp to regenerate.
// Source of truth: the SVG files in \`public/\` at the repository root.
// Counts: total=${icons.length}, normal=${counts.normal ?? 0}, duotone=${counts.duotone ?? 0}, fill=${counts.fill ?? 0}, pixelated=${counts.pixelated ?? 0}, glass=${counts.glass ?? 0}

export type IconStyle = "normal" | "duotone" | "fill" | "pixelated" | "glass";

export interface GeneratedIcon {
  /** Unique id, e.g. "arrows-arrow-down-left" or "glass-archive". */
  id: string;
  /** Human-readable name, e.g. "Arrow Down Left". */
  name: string;
  /** Visual style of this variant. */
  style: IconStyle;
  /** Category bucket, e.g. "navigation". */
  category: string;
  /** Searchable keywords. */
  tags: string[];
  /** Path of the bundled SVG under assets/, e.g. "normal/arrows/arrow-down-left.svg". */
  file: string;
}

export const ICON_COUNTS = {
  total: ${icons.length},
  normal: ${counts.normal ?? 0},
  duotone: ${counts.duotone ?? 0},
  fill: ${counts.fill ?? 0},
  pixelated: ${counts.pixelated ?? 0},
  glass: ${counts.glass ?? 0},
} as const;

export const GENERATED_ICONS: GeneratedIcon[] = [
${body}
];
`;

  const outFile = join(PKG_DIR, "src", "icons.generated.ts");
  writeFileSync(outFile, header);

  console.log(`Wrote ${outFile}`);
  console.log(
    `  total=${icons.length} normal=${counts.normal ?? 0} duotone=${counts.duotone ?? 0} fill=${counts.fill ?? 0} pixelated=${counts.pixelated ?? 0} glass=${counts.glass ?? 0}`,
  );
  console.log(`Copied ${icons.length} SVGs into ${join(PKG_DIR, "assets")}`);
}

main();
