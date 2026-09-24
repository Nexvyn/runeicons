#!/usr/bin/env bun
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { GLASS_ICONS_MANIFEST, NORMAL_ICONS_MANIFEST } from "../../../lib/icons/manifest.generated";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(PKG, "..", "..", "public");
const OUT = join(PKG, "src", "icons.generated.ts");

const TYPES = ["normal", "duotone", "fill", "pixelated"] as const;
const GLASS = "glass" as const;

type Variants = Partial<
  Record<(typeof TYPES)[number] | typeof GLASS, { viewBox: string; markup: string }>
>;

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

function extractBody(svg: string): { viewBox: string; inner: string } {
  const cleaned = svg.replace(/<\?xml[^?]*\?>\s*/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const openMatch = cleaned.match(/<svg\b([^>]*)>/);
  const attrs = openMatch ? openMatch[1] : "";
  const vbMatch = attrs.match(/viewBox\s*=\s*"([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";
  const kept: string[] = [];
  for (const name of ROOT_PAINT_ATTRS) {
    const m = attrs.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`));
    if (m) kept.push(`${name}="${m[1]}"`);
  }
  let inner = cleaned
    .replace(/<svg\b[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
  if (kept.length > 0) inner = `<g ${kept.join(" ")}>${inner}</g>`;
  return { viewBox, inner };
}

function prefixInnerIds(inner: string, symbolId: string): string {
  const ids = new Set<string>();
  for (const m of inner.matchAll(/\bid\s*=\s*"([^"]+)"/g)) {
    ids.add(m[1]);
  }
  let out = inner;
  for (const id of ids) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixed = `${symbolId}--${id}`;
    out = out
      .replace(new RegExp(`\\bid\\s*=\\s*"${safe}"`, "g"), `id="${prefixed}"`)
      .replace(new RegExp(`url\\(#${safe}\\)`, "g"), `url(#${prefixed})`)
      .replace(new RegExp(`"#${safe}"`, "g"), `"#${prefixed}"`);
  }
  return out;
}

function toCurrentColor(markup: string): string {
  return markup
    .replaceAll('stroke="black"', 'stroke="currentColor"')
    .replaceAll('fill="black"', 'fill="currentColor"');
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

function glassId(filename: string): { id: string; name: string } {
  const base = filename.replace(/\.svg$/i, "").trim();
  const pieces: string[] = [];
  for (const seg of base.split(/\s+/)) {
    for (const p of splitPascal(seg)) pieces.push(p);
  }
  const cleaned = pieces.filter((p) => p.length > 0);
  return { id: `glass-${cleaned.join("-").toLowerCase()}`, name: cleaned.join(" ") };
}

function displayName(id: string): string {
  const base = id.replace(/^glass-/, "");
  return base
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const byId = new Map<string, { name?: string; variants: Variants }>();

for (const type of TYPES) {
  const root = join(PUBLIC, type);
  for (const folder of readdirSync(root, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    for (const file of readdirSync(join(root, folder.name))) {
      if (!file.endsWith(".svg")) continue;
      const id = `${folder.name}-${file.replace(/\.svg$/i, "")}`;
      const { viewBox, inner } = extractBody(readFileSync(join(root, folder.name, file), "utf8"));
      const entry = byId.get(id) ?? { variants: {} };
      entry.variants[type] = { viewBox, markup: toCurrentColor(prefixInnerIds(inner, id)) };
      byId.set(id, entry);
    }
  }
}

for (const file of readdirSync(join(PUBLIC, "glass-icons"))) {
  if (!file.endsWith(".svg")) continue;
  const { id, name } = glassId(file);
  const { viewBox, inner } = extractBody(readFileSync(join(PUBLIC, "glass-icons", file), "utf8"));
  const entry = byId.get(id) ?? { variants: {} };
  entry.name = name;
  entry.variants[GLASS] = { viewBox, markup: prefixInnerIds(inner, id) };
  byId.set(id, entry);
}

const meta = new Map<string, { name: string; category: string; tags: string[] }>();
for (const entry of [...NORMAL_ICONS_MANIFEST, ...GLASS_ICONS_MANIFEST]) {
  meta.set(entry.id, { name: entry.name, category: entry.category, tags: entry.tags });
}

const icons = [...byId.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, e]) => {
    const m = meta.get(id);
    return {
      id,
      name: m?.name ?? e.name ?? displayName(id),
      category: m?.category ?? "misc",
      tags: m?.tags ?? [],
      variants: e.variants,
    };
  });

const header = `// AUTO-GENERATED from public/ SVG sources by scripts/build.ts. Do not edit by hand.
`;

const variantKeys = [...TYPES, GLASS];
const body = `export const ICONS: IconEntry[] = [
${icons.map((i) => "  " + JSON.stringify(i)).join(",\n")},
];

export type IconEntry = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  variants: {
${variantKeys.map((t) => `    ${t}?: { viewBox: string; markup: string };`).join("\n")}
  };
};
`;

writeFileSync(OUT, header + body);

const withCounts = variantKeys
  .map((t) => `${t}: ${icons.filter((i) => i.variants[t]).length}`)
  .join(", ");
console.log(`Wrote ${OUT} (${icons.length} icons: ${withCounts})`);
