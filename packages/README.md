# Packages

Platform packages for Rune Icons. The JavaScript packages are part of the root pnpm workspace, so one `pnpm install` at the repository root installs all of them.

| Package                  | What it is                                     |
| :----------------------- | :--------------------------------------------- |
| `runeicons`              | Core, framework-free SVG data and helpers      |
| `runeicons-react`        | React component                                |
| `runeicons-vue`          | Vue 3 component                                |
| `runeicons-svelte`       | Svelte 5 component                             |
| `runeicons-astro`        | Astro component                                |
| `runeicons-vscode`       | VS Code extension                              |
| `runeicons-figma`        | Figma plugin                                   |
| `runeicons-mcp`          | MCP server for AI agents                       |
| `runeicons-react-native` | React Native package (standalone Yarn project) |
| `runeicons-flutter`      | Flutter package (Dart, standalone)             |

```sh
pnpm -r test                        # test every workspace package
pnpm --filter runeicons-react test  # test one package
```

`runeicons-react-native` and `runeicons-flutter` keep their own toolchains; see their READMEs. None of these folders are uploaded with the web deploy (see `.vercelignore`).
