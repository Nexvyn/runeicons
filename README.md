# Rune Icons

An open-source icon library where every glyph comes in five styles: outline, duotone, fill, pixelated, and glass.

**900+ icons** · free and open-source · copy any icon as SVG or JSX.

[![Website](https://img.shields.io/badge/Website-runeicons.com-7c5cff?style=flat-square)](https://runeicons.com)
[![License](https://img.shields.io/badge/Icons-Apache_2.0-7c5cff?style=flat-square)](LICENSE)

[**Browse icons →**](https://runeicons.com) · [**Contributing →**](CONTRIBUTING.md)

## Features

- **Five styles per icon**: normal (outline), duotone, fill, pixelated, and glass.
- **Reshape in the browser**: tweak any path in the built-in editor, then copy it out as SVG or JSX.
- **Search and filter**: find icons by name, category, or tag.
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

| Command                  | Description                                                 |
| :----------------------- | :---------------------------------------------------------- |
| `bun dev`                | Start the Next.js development server                        |
| `bun run build`          | Production build                                            |
| `bun start`              | Serve the production build                                  |
| `bun run lint`           | Lint with ESLint                                            |
| `bun run format`         | Format the codebase with Prettier                           |
| `bun run icons:manifest` | Regenerate `lib/icons/manifest.generated.ts` from `public/` |

## Tech stack

Next.js 16 · React 19 · Tailwind CSS v4 · Bun

## Contributing

See the [contribution guidelines](CONTRIBUTING.md) for setup, repository structure, and how to add new icons.

## License

Rune Icons uses two licenses. See [LICENSE](LICENSE) for the full terms.

**The icons: [Apache License 2.0](LICENSE)**

The icon SVGs in every style (`public/normal`, `public/duotone`, `public/fill`, `public/pixelated`, `public/glass-icons`, `public/sprites`), `lib/icons`, and the packages in `packages/` are free for personal and commercial use. No attribution is required.

**Everything else: Apache License 2.0 + Attribution + Commons Clause**

The landing page, UI components, animations, editor, and the rest of the website code:

- **Use it anywhere**, including commercial and client work.
- **Credit it**: projects that ship any part of it must credit the Rune Icons Team with a visible link to [runeicons.com](https://runeicons.com), such as in a footer, an about page, a credits screen, or a README.
- **Don't resell it**: the landing page designs, components, and animations may not be sold, sublicensed, or redistributed, whether alone, in a bundle, or as a port.

Copyright (c) 2026 Rune Icons Team.
