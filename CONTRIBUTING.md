# Contributing to Rune Icons

Welcome! Thank you for helping to make Rune Icons better. This guide covers setup, repository structure, key scripts, and how to submit contributions.

## Quick start

Requires [Node.js](https://nodejs.org) 20+, [pnpm](https://pnpm.io) 10, and [Bun](https://bun.sh). pnpm installs dependencies; the icon scripts and package tests run on Bun.

1. **Fork and clone** the repository:

   ```bash
   git clone https://github.com/Nexvyn/runeicons.git
   cd runeicons
   ```

   (Replace the URL with your fork when contributing via pull request.)

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start the development server**:

   ```bash
   pnpm dev
   ```

   The site will be available at [http://localhost:3000](http://localhost:3000).

## Repository structure

| Directory / File                   | Description                                                     |
| :--------------------------------- | :-------------------------------------------------------------- |
| `app/`                             | Next.js App Router pages, layout, and site metadata             |
| `components/`                      | React UI components, including the icon editor                  |
| `lib/icons/`                       | Icon registry — `index.ts` plus the generated manifest          |
| `lib/icons/manifest.generated.ts`  | **Generated file.** Built from `public/` — never edit by hand   |
| `public/normal/`                   | Outline-style icon SVGs, grouped by category folder             |
| `public/duotone/`                  | Duotone-style icon SVGs                                         |
| `public/fill/`                     | Fill-style icon SVGs                                            |
| `public/pixelated/`                | Pixelated-style icon SVGs                                       |
| `public/glass-icons/`              | Glass-style icon SVGs                                           |
| `scripts/build-icon-manifest.ts`   | Manifest generator — scans `public/` and writes the manifest    |
| `packages/`                        | Standalone platform packages, each with its own toolchain       |
| `packages/runeicons-react-native/` | React Native package — SVGR-generated icons, own yarn workspace |
| `docs/`                            | Architecture and behavior notes                                 |

> Never manually edit `lib/icons/manifest.generated.ts`. It is regenerated from the SVG files in `public/`.

## Key scripts

Run these from the repository root:

```bash
pnpm dev               # Start the dev server
pnpm build             # Production build
pnpm start             # Serve the production build
pnpm lint              # Lint with ESLint
pnpm format            # Format with Prettier
pnpm icons:manifest    # Regenerate the icon manifest from public/
pnpm icons:sprites     # Regenerate the per-style sprites in public/sprites/
pnpm icons:rn          # Regenerate the React Native icon components (see below)
pnpm -r test           # Run the tests of every package in packages/
```

`packages/runeicons-react-native` is a standalone Yarn project, so the root
`pnpm install` does not install its dependencies. Before running `icons:rn` for
the first time, set it up once:

```bash
cd packages/runeicons-react-native
corepack enable   # activates the Yarn version the package pins
yarn install
cd ../..
```

The icon components are generated, not committed, so a fresh install has none
until `pnpm icons:rn` has run.

## Contributing new icons

Rune Icons keeps strict design guidelines for consistency:

1. **Format**: SVGs must be built on a **24x24 px** viewBox.
2. **Colors**: Avoid hardcoded fill colors where possible. Use `currentColor` so users can recolor icons dynamically.
3. **Styles**: Provide the icon in each of the five styles (normal, duotone, fill, pixelated, glass) where applicable.
4. **Naming**: Use lowercase `kebab-case` file names and place the SVG in the matching category folder under each style directory (e.g. `public/normal/arrows/my-new-icon.svg`).
5. **Optimization**: Optimize SVGs (e.g. with `svgo`) to strip editor metadata and minimize path data.

Step-by-step:

1. Add your SVG files to the appropriate category folders under `public/normal/`, `public/duotone/`, `public/fill/`, `public/pixelated/`, and `public/glass-icons/`.
2. Regenerate the manifest, and the React Native components if you are keeping
   that package in step (after the one-time setup under
   [Key scripts](#key-scripts)):

   ```bash
   pnpm icons:manifest
   pnpm icons:sprites
   pnpm icons:rn
   ```

3. Run `pnpm dev` and verify the new icon appears in search with correct rendering in every style.

## Submitting code changes

1. **Create a branch**:

   ```bash
   git checkout -b feature/your-feature-name
   # OR
   git checkout -b fix/bug-description
   ```

2. **Make your changes** and verify lint and build pass:

   ```bash
   pnpm lint
   pnpm build
   ```

3. **Format** your changes:

   ```bash
   pnpm format
   ```

4. **Commit** using Conventional Commits:

   ```text
   feat: add my-new-icon
   fix: adjust alignment of close icon
   docs: improve contributing instructions
   ```

5. **Push and open a pull request** against the `main` branch. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

> No need to ask for the issue to be assigned. If an issue is open, just start and open a PR. It gets merged after review.
