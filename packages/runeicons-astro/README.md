# runeicons-astro

Astro components for [Rune Icons](https://runeicons.com): 900+ icons in five styles: normal, duotone, fill, pixelated, and glass.

## Install

```sh
bun add runeicons-astro
```

## Usage

```astro
---
import RuneIcon from "runeicons-astro/RuneIcon.astro";
---

<RuneIcon name="tools-house" type="fill" size={32} />
```

The component renders an inline SVG at build time, so no icon files are fetched at runtime. `name` takes any icon id from the [icon browser](https://runeicons.com); `type` is one of `normal`, `duotone`, `fill`, `pixelated`, or `glass`, and defaults to `normal`. Icons inherit text color through `currentColor` where the style supports it.

Helpers are also available for custom rendering:

```ts
import { buildSvg, searchIcons } from "runeicons-astro";
```

## Development

```sh
bun install
bun test
```

`bun test` regenerates icon data, typechecks the source, compiles the component with `@astrojs/compiler`, and runs the unit tests. Icon data is generated from the repository SVG sources in `public/` by `scripts/build.ts` into `src/icons.generated.ts`, which is not committed.

## License

Apache 2.0. Rune Icons is built by [Nexvyn](https://github.com/Nexvyn). Icons come from the [runeicons](https://github.com/Nexvyn/runeicons) repository.
