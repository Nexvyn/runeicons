# runeicons-figma

Figma plugin for [Rune Icons](https://runeicons.com): search and insert 900+ icons in five styles: normal, duotone, fill, pixelated, and glass.

## Install

Build the plugin and import it into the Figma desktop app:

```sh
bun install
bun run build
```

In Figma: menu, Plugins, Development, Import plugin from manifest, pick `manifest.json` from this directory. For publishing, replace the placeholder `id` in `manifest.json` with the id Figma assigns your plugin.

## Usage

Run the plugin from the development menu or your published plugins. Search by name or id, pick a style, click an icon to place it on the canvas as an editable vector. No network access; the icon data ships inside the plugin bundle.

## Development

```sh
bun install
bun test
```

`bun test` regenerates icon data, bundles `dist/code.js` and `dist/ui.html`, typechecks the source, and runs the unit tests. Icon data is generated from the repository SVG sources in `public/` by `scripts/build.ts` into `src/icons.generated.ts`, which is not committed.

## License

Apache 2.0. Rune Icons is built by [Nexvyn](https://github.com/Nexvyn). Icons come from the [runeicons](https://github.com/Nexvyn/runeicons) repository.
