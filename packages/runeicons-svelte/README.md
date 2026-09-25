# runeicons-svelte

Svelte 5 components for [Rune Icons](https://runeicons.com): 900+ icons in five styles: normal, duotone, fill, pixelated, and glass.

## Install

```sh
pnpm add runeicons-svelte
```

## Usage

```svelte
<script>
  import { RuneIcon } from "runeicons-svelte";
</script>

<RuneIcon name="tools-house" type="fill" size={32} />
```

`name` takes any icon id from the [icon browser](https://runeicons.com); `type` is one of `normal`, `duotone`, `fill`, `pixelated`, or `glass`, and defaults to `normal`. Icons render inline and inherit text color through `currentColor` where the style supports it. Glass icons ship their gradients and masks with unique id prefixes, so multiple icons coexist safely on one page.

Helpers are also available for custom rendering:

```ts
import { buildSvg, searchIcons } from "runeicons-svelte";
```

## Development

From the repository root (requires [pnpm](https://pnpm.io) and [Bun](https://bun.sh)):

```sh
pnpm install
pnpm --filter runeicons-svelte test
```

The test script regenerates icon data, typechecks the source, compiles the component, server-renders it, and runs the unit tests. Icon data is generated from the repository SVG sources in `public/` by `scripts/build.ts` into `src/icons.generated.ts`, which is not committed.

## License

Apache 2.0. Copyright 2026 Rune Icons Team. Icons come from the [runeicons](https://github.com/Nexvyn/runeicons) repository.
