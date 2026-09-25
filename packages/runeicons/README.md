# runeicons

The core [Rune Icons](https://runeicons.com) package: 350+ icons, 900+ variants across five styles (normal, duotone, fill, pixelated, and glass), shipped as plain SVG data with no framework dependency.

Use it directly in any JavaScript runtime, or as the data layer for your own components. Framework wrappers live alongside it in this repository (`runeicons-react`, `runeicons-vue`, `runeicons-svelte`, `runeicons-astro`, and others).

## Install

```sh
npm install runeicons
```

```sh
pnpm add runeicons
```

## Usage

```ts
import { buildSvg } from "runeicons";

document.querySelector("#home")!.innerHTML = buildSvg("tools-house", "fill", 32)!;
```

`buildSvg(icon, type, options)` returns an SVG string, or `null` if the icon has no variant in that style.

- `icon`: an icon id such as `"tools-house"`, or an entry from `ICONS`
- `type`: `"normal"` (default), `"duotone"`, `"fill"`, `"pixelated"`, or `"glass"`
- `options`: a size in pixels, or `{ size, className, title }`

Without a `title`, icons are marked `aria-hidden="true"`. With a `title`, they get `role="img"` and a `<title>` element for screen readers.

```ts
buildSvg("tools-house", "normal", { size: 20, className: "icon", title: "Home" });
```

Outline styles use `currentColor`, so icons pick up the text color of their parent. Glass icons ship their own gradients, and their ids are scoped per icon so several can sit on one page.

### Finding icons

```ts
import { availableTypes, getIconById, ICONS, listCategories, searchIcons } from "runeicons";

searchIcons("battery");
searchIcons("", { type: "glass", limit: 20 });
searchIcons("arrow", { category: "navigation" });

const house = getIconById("tools-house");
availableTypes(house!);
listCategories();
ICONS.length;
```

Each entry in `ICONS` has an `id`, `name`, `category`, `tags`, and a `variants` object holding the `viewBox` and inner `markup` for every style it is drawn in. Browse every id at [runeicons.com/icons](https://runeicons.com/icons).

## Development

From the repository root (requires [pnpm](https://pnpm.io) and [Bun](https://bun.sh)):

```sh
pnpm install
pnpm --filter runeicons test
pnpm --filter runeicons build
```

`scripts/build.ts` generates `src/icons.generated.ts` from the SVG sources in the repository's `public/` folder and the site's icon manifest. The generated file is not committed. The build script compiles to `dist/`, which is what gets published.

## License

The icons are licensed under the [Apache License 2.0](LICENSE). Copyright 2026 Rune Icons Team. Rune Icons: [runeicons.com](https://runeicons.com).
