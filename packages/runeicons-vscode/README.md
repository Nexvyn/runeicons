# runeicons-vscode

VS Code extension for [Rune Icons](https://runeicons.com): autocomplete, hover preview, and a one-command insert for 900+ icons in five styles: normal, duotone, fill, pixelated, and glass.

## Install

```sh
pnpm install
pnpm --filter runeicons-vscode build
cd packages/runeicons-vscode
pnpm dlx @vscode/vsce package --no-dependencies
code --install-extension runeicons-vscode-0.1.0.vsix
```

## Features

- Autocomplete icon ids inside string literals, with a live preview of every available style
- Hover any icon id to see each style rendered
- Run `Rune Icons: Insert Icon` from the command palette to search by name or id and insert an inline SVG

## Usage

Open any JavaScript, TypeScript, HTML, Vue, Svelte, Astro, or JSON file and start typing an icon id inside quotes:

```ts
const icon = "tools-ho"; // completions offer tools-house, tools-horizontal-rule, ...
```

Hover the completed id to preview it. To insert a full SVG at the cursor, run `Rune Icons: Insert Icon` and pick an icon and a style.

## Development

```sh
pnpm install
pnpm --filter runeicons-vscode test
```

The test script regenerates icon data, bundles the extension, typechecks the source, and runs the unit tests. Icon data is generated from the repository SVG sources in `public/` by `scripts/build.ts` into `src/icons.generated.ts`, which is not committed.

## License

Apache 2.0. Copyright 2026 Rune Icons Team. Icons come from the [runeicons](https://github.com/Nexvyn/runeicons) repository.
