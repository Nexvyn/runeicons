# runeicons-mcp

An [MCP](https://modelcontextprotocol.io) server that gives AI agents access to the
[Rune Icons](https://runeicons.com) library — **900+ icons in 5 styles** (outline, duotone, fill,
pixelated, and glass) — so agents can search icons and drop ready-to-use SVG straight into your code.

All SVGs are bundled with the package (no network access needed at runtime) and recolored to
`currentColor`, so agents can restyle icons inline.

[![License](https://img.shields.io/badge/License-Apache_2.0-7c5cff?style=flat-square)](LICENSE)

## Install

```sh
npm install runeicons-mcp
# or run it directly
npx runeicons-mcp
```

Requires Node.js 18+.

## Client configuration

Add the server to any MCP-compatible client (Claude Desktop, Cursor, VS Code, …):

```json
{
  "mcpServers": {
    "runeicons": {
      "command": "npx",
      "args": ["-y", "runeicons-mcp"]
    }
  }
}
```

If you installed the package locally, point `command`/`args` at the binary instead:

```json
{
  "mcpServers": {
    "runeicons": {
      "command": "node",
      "args": ["/path/to/node_modules/runeicons-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### `search_icons`

Search the library by text, category, and style.

| Parameter  | Type     | Description                                                |
| :--------- | :------- | :--------------------------------------------------------- |
| `query`    | `string` | Matched against icon name, id, and tags (case-insensitive) |
| `category` | `string` | Filter by category, e.g. `navigation`                      |
| `style`    | `string` | One of `normal`, `duotone`, `fill`, `pixelated`, `glass`   |
| `limit`    | `number` | Max results (1–200, default 50)                            |

```text
search_icons { "query": "arrow", "style": "normal", "limit": 3 }

- arrows-arrow-down-left — "Arrow Down Left" (style: normal, category: navigation)
- arrows-arrow-down-right — "Arrow Down Right" (style: normal, category: navigation)
- arrows-arrow-down-to-line — "Arrow Down To Line" (style: normal, category: navigation)
```

### `get_icon`

Resolve one icon by id and get its full metadata plus ready-to-use SVG source.

| Parameter        | Type      | Description                                          |
| :--------------- | :-------- | :--------------------------------------------------- |
| `id`             | `string`  | Icon id from `search_icons`                          |
| `includeSvg`     | `boolean` | Include full SVG source (default `true`)             |
| `includeRelated` | `boolean` | List the same glyph in other styles (default `true`) |

```text
get_icon { "id": "arrows-arrow-down-left" }

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <path d="M17 7L7 17M7 7V17H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

SVGs use `currentColor`, so set `color` (CSS) or the `stroke`/`fill` attributes to recolor them.

### `list_categories`

List every category with per-style counts — useful for narrowing `search_icons` filters.

```text
category       total  normal  duotone  fill  pixelated  glass
navigation        76      24       24     2         24      2
...
```

## Development

From the repository root (requires [Bun](https://bun.sh)):

```sh
cd packages/runeicons-mcp
bun run generate   # rebuild src/icons.generated.ts + assets/ from public/
bun run build      # type-check and emit dist/
```

`bun run generate` scans the icon SVGs in the repository's `public/` directory and regenerates the
bundled registry, so the MCP package always mirrors the main icon set.

## License

Copyright 2026 Runeicons. Licensed under the [Apache 2.0 License](LICENSE).

Icon data and SVGs are part of [Rune Icons](https://runeicons.com) — free for commercial and
personal use. When using these icons, keep the upstream license and credit intact.
