# Rune Icons

An open-source icon library where every glyph comes in five styles: outline, duotone, fill, pixelated, and glass.

**900+ icons** · free and open-source · copy any icon as SVG or JSX.

[![Website](https://img.shields.io/badge/Website-runeicons.com-7c5cff?style=flat-square)](https://runeicons.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-7c5cff?style=flat-square)](LICENSE)

[**Browse icons →**](https://runeicons.com) · [**Contributing →**](CONTRIBUTING.md)

## Features

- **Five styles per icon** — normal (outline), duotone, fill, pixelated, and glass.
- **Reshape in the browser** — tweak any path in the built-in editor, then copy it out as SVG or JSX.
- **Search and filter** — find icons by name, category, or tag.
- **Free for commercial and personal use** under the [Apache 2.0 License](LICENSE).

## Quick start

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/Nexvyn/runeicons.git
cd runeicons
bun install
bun dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                    | Description                                              |
| :------------------------- | :------------------------------------------------------- |
| `bun dev`                  | Start the Next.js development server                     |
| `bun run build`            | Production build                                         |
| `bun start`                | Serve the production build                               |
| `bun run lint`             | Lint with ESLint                                         |
| `bun run format`           | Format the codebase with Prettier                        |
| `bun run icons:manifest`   | Regenerate `lib/icons/manifest.generated.ts` from `public/` |

## Tech stack

Next.js 16 · React 19 · Tailwind CSS v4 · Bun

## Contributing

See the [contribution guidelines](CONTRIBUTING.md) for setup, repository structure, and how to add new icons.

## License

Rune Icons is free for commercial and personal use, licensed under the [Apache 2.0 License](LICENSE).

Copyright (c) 2026 Nexvyn 
