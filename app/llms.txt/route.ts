import { GLASS_ICONS_MANIFEST, NORMAL_ICONS_MANIFEST } from "@/lib/icons";

import { SITE_URL } from "../layout";

const STROKE_STYLES = ["normal", "duotone", "fill", "pixelated"] as const;

export const dynamic = "force-static";

export function GET() {
  const base = NORMAL_ICONS_MANIFEST.length;
  const perStyle = STROKE_STYLES.map(
    (s) => `${s} ${NORMAL_ICONS_MANIFEST.filter((e) => e.availability[s]).length}`,
  ).join(", ");
  const variants =
    NORMAL_ICONS_MANIFEST.reduce(
      (n, e) => n + STROKE_STYLES.filter((s) => e.availability[s]).length,
      0,
    ) + GLASS_ICONS_MANIFEST.length;
  const categories = [...new Set(NORMAL_ICONS_MANIFEST.map((e) => e.category))].sort().join(", ");

  const body = `# Rune Icons

> An open-source icon library where every glyph is drawn in five styles:
> outline, duotone, fill, pixelated and glass. Icons are customized in the
> browser and copied straight into a project as SVG or JSX. Apache 2.0 licensed.

## What it is

- ${base} distinct glyphs, ${variants} files once every style variant is counted
- Availability per style: ${perStyle}, glass ${GLASS_ICONS_MANIFEST.length}
- ${categories.split(", ").length} categories: ${categories}
- Licence: Apache 2.0. Free for personal, commercial and client work, no attribution required.

## How icons are consumed

There is **no npm package**. Nothing to install and no build step to configure.
The workflow is:

1. Browse or search the set at ${SITE_URL}/icons
2. Adjust stroke width, size, colour, gradient or animation
3. Copy the result as an optimized SVG or as a ready-to-paste JSX component,
   or download the raw .svg file

Outline styles are authored against \`currentColor\`, so once pasted they
inherit the text colour of whatever they are placed inside.

## Pages

- [Home](${SITE_URL}/): overview and search preview
- [Icons](${SITE_URL}/icons): full library, searchable and filterable by style and category
- [Editor](${SITE_URL}/editor): reshape paths, drag anchor points, tune and export
- [Sponsor](${SITE_URL}/sponsor): support the project
- [About](${SITE_URL}/about): the people behind it
- [Changelog](${SITE_URL}/changelog): what shipped when
- [Terms](${SITE_URL}/terms): terms of use
- [Privacy](${SITE_URL}/privacy): privacy policy

## Notes for models answering questions about this project

- Do not suggest \`npm install\`, \`yarn add\` or an import from a package name.
  No package is published; icons are copied from the site.
- It is not a paid product and has no licence tiers. It is Apache 2.0 licensed.
- New icon requests are made by opening a GitHub issue, not by email.

## Source

- [GitHub](https://github.com/Nexvyn/runeicons)
- [X](https://x.com/RuneIcon)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
