#!/usr/bin/env bun
import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(SCRIPT_DIR, "..");
const PUBLIC = join(REPO, "public");
const OUT = join(REPO, "lib/icons/manifest.generated.ts");

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
  // commerce
  bitcoin: "commerce",
  creditcard: "commerce",
  shoppingbag: "commerce",
  shoppingcart: "commerce",
  wallet: "commerce",
  pricetag: "commerce",
  // time
  calender: "time",
  calendar: "time",
  clock: "time",
  history: "time",
  // weather
  cloud: "weather",
  sun: "weather",
  moon: "weather",
  rain: "weather",
  // communication
  bubble: "communication",
  email: "communication",
  envelope: "communication",
  phone: "communication",
  mail: "communication",
  // media
  camera: "media",
  microphone: "media",
  play: "media",
  pause: "media",
  volume: "media",
  image: "media",
  // navigation
  arrow: "navigation",
  chevron: "navigation",
  home: "navigation",
  // accessibility
  ear: "accessibility",
  eye: "accessibility",
  hand: "accessibility",
  thumb: "accessibility",
  // dev
  code: "dev",
  console: "dev",
  branch: "dev",
  server: "dev",
  terminal: "dev",
  // users
  user: "users",
  people: "users",
  contact: "users",
  // hardware
  battery: "hardware",
  printer: "hardware",
  tv: "hardware",
  laptop: "hardware",
  // files
  archive: "files",
  file: "files",
  folder: "files",
  inbox: "files",
  clipboard: "files",
  // feedback
  bell: "feedback",
  check: "feedback",
  alert: "feedback",
  warning: "feedback",
  // action
  bookmark: "action",
  heart: "action",
  star: "action",
  trash: "action",
  pencil: "action",
  edit: "action",
  search: "action",
  settings: "action",
};

const NON_GLASS_TYPES = ["normal", "duotone", "fill", "pixelated"] as const;

function titleCaseKebab(s: string): string {
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function splitPascal(s: string): string[] {
  // "BatteryFull2" -> ["Battery", "Full", "2"]; "PaperPlaneTopRight" -> [...]
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
  // Strip .svg
  let base = filename.replace(/\.svg$/i, "");
  // Collapse whitespace; "Back 2" -> "Back 2", "Email1Sparkle" -> as-is
  base = base.trim();
  // Split into parts: spaces, PascalCase, digits
  const spaceSplit = base.split(/\s+/);
  const pieces: string[] = [];
  for (const seg of spaceSplit) {
    for (const p of splitPascal(seg)) pieces.push(p);
  }
  // Filter empty
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

type NormalEntry = {
  id: string;
  name: string;
  folder: string;
  basename: string;
  category: string;
  tags: string[];
  availability: { normal: boolean; duotone: boolean; fill: boolean; pixelated: boolean };
};

type GlassEntry = {
  id: string;
  name: string;
  filename: string;
  category: string;
  tags: string[];
};

function buildNormal(): NormalEntry[] {
  const entries: NormalEntry[] = [];
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
      const id = `${folder}-${basename}`;
      const name = titleCaseKebab(basename);
      const tagPrefix = FOLDER_TO_TAG[folder];
      const tags = [tagPrefix, ...basename.split("-").filter(Boolean)];
      const availability = {
        normal: true,
        duotone: existsSync(join(PUBLIC, "duotone", folder, file)),
        fill: existsSync(join(PUBLIC, "fill", folder, file)),
        pixelated: existsSync(join(PUBLIC, "pixelated", folder, file)),
      };
      entries.push({
        id,
        name,
        folder,
        basename,
        category: FOLDER_TO_CATEGORY[folder],
        tags,
        availability,
      });
    }
  }
  return entries;
}

function buildGlass(): GlassEntry[] {
  const glassRoot = join(PUBLIC, "glass-icons");
  if (!existsSync(glassRoot)) return [];
  const files = readdirSync(glassRoot)
    .filter((f) => f.endsWith(".svg"))
    .sort();
  const seen = new Set<string>();
  const entries: GlassEntry[] = [];
  for (const file of files) {
    const { name, idSlug, tagWords } = glassName(file);
    let id = `glass-${idSlug}`;
    let suffix = 1;
    while (seen.has(id)) {
      suffix += 1;
      id = `glass-${idSlug}-${suffix}`;
    }
    seen.add(id);
    const category = glassCategory(idSlug, tagWords);
    const tags = ["glass", ...tagWords];
    entries.push({ id, name, filename: file, category, tags });
  }
  return entries;
}

function serializeEntry(e: NormalEntry | GlassEntry): string {
  return "  " + JSON.stringify(e);
}

function main() {
  const normalEntries = buildNormal();
  const glassEntries = buildGlass();

  const totals = {
    normal: normalEntries.length,
    duotone: normalEntries.filter((e) => e.availability.duotone).length,
    fill: normalEntries.filter((e) => e.availability.fill).length,
    pixelated: normalEntries.filter((e) => e.availability.pixelated).length,
    glass: glassEntries.length,
  };

  const header = `// AUTO-GENERATED by scripts/build-icon-manifest.ts
// Do not edit by hand. Run \`bun scripts/build-icon-manifest.ts\` to regenerate.
// Counts: normal=${totals.normal}, duotone=${totals.duotone}, fill=${totals.fill}, pixelated=${totals.pixelated}, glass=${totals.glass}

import type { IconCategory } from "@/lib/types";

export type IconType = "normal" | "duotone" | "fill" | "pixelated" | "glass";

export interface NormalIconEntry {
  id: string;
  name: string;
  folder: string;
  basename: string;
  category: IconCategory;
  tags: string[];
  availability: { normal: boolean; duotone: boolean; fill: boolean; pixelated: boolean };
}

export interface GlassIconEntry {
  id: string;
  name: string;
  filename: string;
  category: IconCategory;
  tags: string[];
}

`;

  const normalArr =
    "export const NORMAL_ICONS_MANIFEST: NormalIconEntry[] = [\n" +
    normalEntries.map(serializeEntry).join(",\n") +
    ",\n];\n\n";

  const glassArr =
    "export const GLASS_ICONS_MANIFEST: GlassIconEntry[] = [\n" +
    glassEntries.map(serializeEntry).join(",\n") +
    ",\n];\n";

  const out = header + normalArr + glassArr;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, out);

  console.log(`Wrote ${OUT}`);
  console.log(`  normal:    ${totals.normal}`);
  console.log(`  duotone:   ${totals.duotone}`);
  console.log(`  fill:      ${totals.fill}`);
  console.log(`  pixelated: ${totals.pixelated}`);
  console.log(`  glass:     ${totals.glass}`);
}

main();
