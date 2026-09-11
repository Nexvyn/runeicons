#!/usr/bin/env bun
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import {
  NORMAL_ICONS_MANIFEST,
  GLASS_ICONS_MANIFEST,
} from "../lib/icons/manifest.generated";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(SCRIPT_DIR, "..");
const PUBLIC = join(REPO, "public");
const OUT_DIR = join(PUBLIC, "sprites");

type SpriteType = "normal" | "duotone" | "fill" | "pixelated" | "glass";

function extractBody(svg: string): { viewBox: string; inner: string } {
  const cleaned = svg.replace(/<\?xml[^?]*\?>\s*/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const openMatch = cleaned.match(/<svg\b([^>]*)>/);
  const attrs = openMatch ? openMatch[1] : "";
  const vbMatch = attrs.match(/viewBox\s*=\s*"([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";
  const inner = cleaned
    .replace(/<svg\b[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
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

function buildSprite(type: SpriteType): void {
  const symbols: string[] = [];
  if (type === "glass") {
    for (const e of GLASS_ICONS_MANIFEST) {
      const file = join(PUBLIC, "glass-icons", e.filename);
      if (!existsSync(file)) continue;
      const { viewBox, inner } = extractBody(readFileSync(file, "utf8"));
      symbols.push(
        `  <symbol id="${e.id}" viewBox="${viewBox}">${prefixInnerIds(inner, e.id)}</symbol>`,
      );
    }
  } else {
    for (const e of NORMAL_ICONS_MANIFEST) {
      if (!e.availability[type]) continue;
      const file = join(PUBLIC, type, e.folder, `${e.basename}.svg`);
      if (!existsSync(file)) continue;
      const { viewBox, inner } = extractBody(readFileSync(file, "utf8"));
      symbols.push(
        `  <symbol id="${e.id}" viewBox="${viewBox}">${prefixInnerIds(inner, e.id)}</symbol>`,
      );
    }
  }
  const out = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n${symbols.join("\n")}\n</svg>\n`;
  mkdirSync(OUT_DIR, { recursive: true });
  const outFile = join(OUT_DIR, `${type}.svg`);
  writeFileSync(outFile, out);
  console.log(`Wrote ${outFile} (${symbols.length} symbols)`);
}

function main() {
  for (const type of ["normal", "duotone", "fill", "pixelated", "glass"] as SpriteType[]) {
    buildSprite(type);
  }
}

main();
