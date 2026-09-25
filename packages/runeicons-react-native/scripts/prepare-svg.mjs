#!/usr/bin/env node
/**
 * Stages the repo's SVG sources for SVGR.
 *
 * Two jobs:
 *
 * 1. **Naming.** Flattens `public/<style>/<category>/<name>.svg` (and the
 *    mixed-convention `public/glass-icons/*.svg`) into one directory of
 *    kebab-case files whose names carry the style, so SVGR's filename-derived
 *    component names come out unique: `arrow-up`, `arrow-up-duotone`,
 *    `archive-glass`.
 *
 * 2. **Theming.** Rewrites the hard-coded colours and the dominant stroke
 *    weight to sentinels. SVGR's `replaceAttrValues` then turns those into the
 *    `color` / `secondaryColor` / `strokeWidth` props. Sentinels are used
 *    rather than the raw values because the same literal means different
 *    things in different styles — `#A4A5A6` is the primary tone in duotone but
 *    an accent in fill, and `black` inside a glass icon's <mask> is a mask
 *    channel that must not be themed.
 *
 * Also writes `src/manifest.ts`, the icon metadata the package ships on its
 * `runeicons-react-native/manifest` subpath.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(SCRIPT_DIR, '..');
const REPO_ROOT = join(PACKAGE_ROOT, '..', '..');
const PUBLIC = join(REPO_ROOT, 'public');
const OUT = join(PACKAGE_ROOT, 'svg');

/** Sentinels consumed by `replaceAttrValues` in svgr.config.cjs. */
export const SENTINEL = {
  color: '#010101',
  secondaryColor: '#020202',
  strokeWidth: 'rune-sw',
};

// Kept in sync with scripts/build-icon-manifest.ts at the repo root.
const FOLDER_TO_CATEGORY = {
  arrows: 'navigation', code: 'dev', documents: 'files', gadgets: 'hardware',
  identity: 'users', indicators: 'feedback', layouts: 'layout',
  messaging: 'communication', metrics: 'metrics', money: 'commerce',
  nature: 'weather', other: 'misc', playback: 'media', schedule: 'time',
  senses: 'accessibility', tools: 'action',
};
const FOLDER_TO_TAG = { ...FOLDER_TO_CATEGORY, tools: 'actions' };

const GLASS_CATEGORY_OVERRIDES = {
  bitcoin: 'commerce', creditcard: 'commerce', shoppingbag: 'commerce',
  shoppingcart: 'commerce', wallet: 'commerce', pricetag: 'commerce',
  calender: 'time', calendar: 'time', clock: 'time', history: 'time',
  cloud: 'weather', sun: 'weather', moon: 'weather', rain: 'weather',
  bubble: 'communication', email: 'communication', envelope: 'communication',
  phone: 'communication', mail: 'communication',
  camera: 'media', microphone: 'media', play: 'media', pause: 'media',
  volume: 'media', image: 'media',
  arrow: 'navigation', chevron: 'navigation', home: 'navigation',
  ear: 'accessibility', eye: 'accessibility', hand: 'accessibility', thumb: 'accessibility',
  code: 'dev', console: 'dev', branch: 'dev', server: 'dev', terminal: 'dev',
  user: 'users', people: 'users', contact: 'users',
  battery: 'hardware', printer: 'hardware', tv: 'hardware', laptop: 'hardware',
  archive: 'files', file: 'files', folder: 'files', inbox: 'files', clipboard: 'files',
  bell: 'feedback', check: 'feedback', alert: 'feedback', warning: 'feedback',
  bookmark: 'action', heart: 'action', star: 'action', trash: 'action',
  pencil: 'action', edit: 'action', search: 'action', settings: 'action',
};

const DRAWN_STYLES = ['normal', 'duotone', 'fill', 'pixelated'];

/**
 * Literal colours to re-map, per style.
 *
 * These are the complete palettes found in the artwork. `white` is absent on
 * purpose: it is an opaque knockout, not a themeable tone. Glass has no entry
 * at all — its gradients, masks and blur layers are baked.
 */
const PALETTE = {
  normal: { black: 'color' },
  pixelated: { black: 'color' },
  duotone: {
    '#a4a5a6': 'color', black: 'color',
    '#dddddd': 'secondaryColor', '#d9d9d9': 'secondaryColor', '#f3f3f3': 'secondaryColor',
  },
  fill: {
    '#1c1f21': 'color', black: 'color',
    '#dddddd': 'secondaryColor', '#d9d9d9': 'secondaryColor', '#a4a5a6': 'secondaryColor',
  },
  glass: {},
};

const splitPascal = (s) => {
  const parts = [];
  let current = '';
  for (const ch of s) {
    const isUpper = ch >= 'A' && ch <= 'Z';
    const isDigit = ch >= '0' && ch <= '9';
    if (isUpper || (isDigit && current && !/\d$/.test(current))) {
      if (current) parts.push(current);
      current = ch;
    } else current += ch;
  }
  if (current) parts.push(current);
  return parts;
};

const titleCase = (words) =>
  words.filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Glass art is exported with mixed conventions: `BatteryFull2`, `home-round-door 2`. */
const glassWords = (filename) =>
  filename.replace(/\.svg$/i, '').trim().split(/[\s-]+/).flatMap(splitPascal).filter(Boolean);

/** Applies the theming sentinels to one SVG's markup. */
function theme(svg, style) {
  let out = svg;

  for (const [literal, role] of Object.entries(PALETTE[style])) {
    // Only touch paint attributes, so a colour word can never match elsewhere.
    const re = new RegExp(`(\\b(?:fill|stroke|stop-color)=")${literal}(")`, 'gi');
    out = out.replace(re, `$1${SENTINEL[role]}$2`);
  }

  // The dominant 2px weight becomes a prop; the few deliberately finer strokes
  // keep their designed value. Glass line work is left entirely alone.
  if (style !== 'glass') {
    out = out.replace(/stroke-width="2"/g, `stroke-width="${SENTINEL.strokeWidth}"`);
  }

  return out;
}

function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  /** @type {Map<string, {id: string, name: string, category: string, tags: string[], styles: Record<string,string>}>} */
  const icons = new Map();
  const slugs = new Set();

  const claim = (slug, from) => {
    if (slugs.has(slug)) throw new Error(`slug collision: ${slug} (${from})`);
    slugs.add(slug);
  };

  const record = (id, meta, style, slug) => {
    let entry = icons.get(id);
    if (!entry) {
      entry = { id, name: meta.name, category: meta.category, tags: meta.tags, styles: {} };
      icons.set(id, entry);
    }
    entry.styles[style] = slug;
  };

  for (const style of DRAWN_STYLES) {
    const root = join(PUBLIC, style);
    if (!existsSync(root)) throw new Error(`missing source directory: ${root}`);

    const folders = readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory() && FOLDER_TO_CATEGORY[e.name])
      .map((e) => e.name)
      .sort();

    for (const folder of folders) {
      for (const file of readdirSync(join(root, folder)).filter((f) => f.endsWith('.svg')).sort()) {
        const basename = file.replace(/\.svg$/i, '');
        const words = basename.split('-').filter(Boolean);
        const slug = style === 'normal' ? basename : `${basename}-${style}`;
        claim(slug, `${style}/${folder}/${file}`);

        writeFileSync(join(OUT, `${slug}.svg`), theme(readFileSync(join(root, folder, file), 'utf8'), style));
        record(`${folder}-${basename}`, {
          name: titleCase(words),
          category: FOLDER_TO_CATEGORY[folder],
          tags: [FOLDER_TO_TAG[folder], ...words],
        }, style, slug);
      }
    }
  }

  const glassRoot = join(PUBLIC, 'glass-icons');
  if (existsSync(glassRoot)) {
    const seenIds = new Set();
    for (const file of readdirSync(glassRoot).filter((f) => f.endsWith('.svg')).sort()) {
      const words = glassWords(file);
      const base = words.join('-').toLowerCase();

      // Same de-duplication rule as the website manifest, so ids line up.
      let id = `glass-${base}`;
      let suffix = 1;
      while (seenIds.has(id)) id = `glass-${base}-${++suffix}`;
      seenIds.add(id);

      const slug = `${id.replace(/^glass-/, '')}-glass`;
      claim(slug, `glass-icons/${file}`);

      const tagWords = words.map((w) => w.toLowerCase()).filter((w) => !/^\d+$/.test(w));
      const haystack = [base, ...tagWords];
      const hit = Object.keys(GLASS_CATEGORY_OVERRIDES).find((k) => haystack.some((w) => w.includes(k)));

      writeFileSync(join(OUT, `${slug}.svg`), theme(readFileSync(join(glassRoot, file), 'utf8'), 'glass'));
      record(id, {
        name: titleCase(words),
        category: hit ? GLASS_CATEGORY_OVERRIDES[hit] : 'misc',
        tags: ['glass', ...tagWords],
      }, 'glass', slug);
    }
  }

  const manifest = [...icons.values()].sort((a, b) => a.id.localeCompare(b.id));
  const entries = manifest.map((icon) => `  ${JSON.stringify(icon)},`).join('\n');
  writeFileSync(
    join(PACKAGE_ROOT, 'src', 'manifest.ts'),
    `// AUTO-GENERATED by scripts/prepare-svg.mjs — do not edit by hand.
import type { RuneIconMeta } from './types';

/** Metadata for all ${manifest.length} icons. Kept off the main entry point so
 * importing an icon never pulls the whole catalogue into your bundle. */
export const RUNE_ICONS: RuneIconMeta[] = [
${entries}
];
`,
  );

  const counts = Object.fromEntries(
    [...DRAWN_STYLES, 'glass'].map((s) => [s, manifest.filter((i) => i.styles[s]).length]),
  );
  console.log(`Staged ${slugs.size} SVGs into svg/`);
  console.log(`  ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  console.log(`  ${manifest.length} distinct icons in src/manifest.ts`);
}

main();
