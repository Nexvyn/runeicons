# runeicons-react-native

908 Rune Icons as [react-native-svg](https://github.com/software-mansion/react-native-svg) components — 354 icons drawn across five styles, generated from the SVG sources in this repo with [`@svgr/cli`](https://react-svgr.com/docs/cli/).

## Install

```sh
npm install runeicons-react-native react-native-svg
```

`react`, `react-native` and `react-native-svg` are peer dependencies. On Expo, install the SVG peer with `npx expo install react-native-svg` so the version matches your SDK.

## Usage

```tsx
import { ArrowUp, ChartPieFill, ArchiveGlass } from 'runeicons-react-native';

<ArrowUp />
<ArrowUp size={32} color="#4f46e5" strokeWidth={1.5} />
<ChartPieFill size={40} color="#1c1f21" secondaryColor="#e0e7ff" />
<ArchiveGlass size={64} />
```

Anything beyond the four props below is forwarded to the underlying `<Svg>`, so `opacity`, `transform`, `onPress` and `testID` work as usual.

### Tree-shaking

The package is side-effect free and ships ES modules with one module per icon, so importing from the root **tree-shakes to exactly the icons you use**. Bundled with esbuild, `import { ArrowUp } from 'runeicons-react-native'` produces a 580-byte chunk — byte-identical to importing that icon's module directly.

Metro does not tree-shake by default, so under bare React Native import the icon's own module instead:

```tsx
import ArrowUp from 'runeicons-react-native/arrow-up';
import ArrowUpDuotone from 'runeicons-react-native/arrow-up-duotone';
```

Every icon is reachable at `runeicons-react-native/<slug>`, where the slug is its file name — `arrow-up`, `arrow-up-duotone`, `chart-pie-fill`, `arrow-up-pixelated`, `archive-glass`.

#### React Native version support for subpath imports

Per-icon paths, and `runeicons-react-native/manifest` below, exist only through the `exports` field in `package.json`. Metro reads that field by default from React Native 0.79 (Metro 0.82, Expo SDK 53). Importing from the package root works on every supported version.

| React Native     | Subpath imports                                     |
| :--------------- | :-------------------------------------------------- |
| 0.79+ / Expo 53+ | Work as-is                                          |
| 0.72 – 0.78      | Turn on package exports in `metro.config.js`, below |
| 0.70 – 0.71      | Not available — import from the package root        |

```js
// metro.config.js (React Native 0.72 – 0.78)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  resolver: { unstable_enablePackageExports: true },
});
```

On Expo SDK 49–52, set the same flag on Expo's config instead:

```js
// metro.config.js (Expo SDK 49 – 52)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

Without it, Metro looks for a real `arrow-up.js` file in the package, finds none, and fails with `Unable to resolve module runeicons-react-native/arrow-up`.

### Browsing the set

```ts
import { RUNE_ICONS } from 'runeicons-react-native/manifest';

RUNE_ICONS.filter((icon) => icon.category === 'navigation');
// [{ id: 'arrows-arrow-down', name: 'Arrow Down', category: 'navigation', tags: [...],
//    styles: { normal: 'arrow-down', duotone: 'arrow-down-duotone', ... } }]
```

Ids match the ones the Rune Icons website uses, so an icon has one identity across web and native. The manifest sits on its own subpath, so importing an icon never pulls the catalogue into your bundle.

## Styles

The style is part of the component name, with `normal` as the unsuffixed default.

| Style       | Component          | Grid  | Count | Colour                     |
| :---------- | :----------------- | :---- | ----: | :------------------------- |
| `normal`    | `ArrowUp`          | 24×24 |   217 | `color`                    |
| `duotone`   | `ArrowUpDuotone`   | 24×24 |   215 | `color` + `secondaryColor` |
| `fill`      | `ArrowUpFill`      | 24×24 |   126 | `color` + `secondaryColor` |
| `pixelated` | `ArrowUpPixelated` | 40×40 |   215 | `color`                    |
| `glass`     | `ArchiveGlass`     | 24×24 |   135 | fixed — see below          |

## Props

| Prop             | Type               | Default          | Notes                                                             |
| :--------------- | :----------------- | :--------------- | :---------------------------------------------------------------- |
| `size`           | `number \| string` | `24`             | Sets width and height. An explicit `width`/`height` overrides it. |
| `color`          | `string`           | `'currentColor'` | Stroke of the drawn styles, pixel fill of `pixelated`.            |
| `secondaryColor` | `string`           | `'#DDDDDD'`      | Accent stroke and fill of `duotone` and `fill`.                   |
| `strokeWidth`    | `number \| string` | `2`              | Drawn styles only.                                                 |

`color` is also set on the root `<Svg>`, so any `currentColor` left in the artwork resolves to it. react-native-svg renders an unresolved `currentColor` as black.

The `secondaryColor` default is tuned for light backgrounds; on a dark surface it sits very close to the primary tone, so pass your own.

**Glass icons are not recolourable.** They are built from baked gradients, masks and Gaussian-blur filters, so they ignore `color`, `secondaryColor` and `strokeWidth` and take only `size` and standard `<Svg>` props.

## Example app

An Expo app that browses the whole set — search, style switcher, live size and colour controls, and per-icon import snippets:

```sh
yarn
yarn icons            # the components are generated, not committed
yarn example ios      # or: android, web
```

## How the icons are generated

`src/icons/` is **generated and not committed**. `yarn icons` runs two steps:

1. `scripts/prepare-svg.mjs` stages the repo's `public/**` SVGs into `svg/`, flattening them into kebab-case names that carry the style (so SVGR's filename-derived component names are unique), and swapping the themeable colours and the dominant stroke weight for sentinels.
2. `@svgr/cli` converts them to react-native-svg components, replacing those sentinels with the `color` / `secondaryColor` / `strokeWidth` props.

Sentinels are used rather than raw colour literals because the same literal means different things in different styles — `#A4A5A6` is the primary tone in duotone but an accent in fill, and `black` inside a glass icon's `<mask>` is a mask channel that must not be themed.

### The filter shim

SVGR's react-native transform carries a hard-coded list of supported elements that predates react-native-svg's filter support, so it silently **drops** `<filter>` and its primitives and leaves dangling `filter="url(#…)"` references — which would flatten the blur layers out of all 132 filtered glass icons. SVGR has been unmaintained since 2023, so `svgr/rn-filters.cjs` bridges the gap: a Babel plugin that runs before SVGR's preset, proxies the filter elements through elements SVGR does know, and restores them afterwards. `color-interpolation-filters` is dropped instead, since react-native-svg has no matching prop and its pipeline is already sRGB — the only value this artwork uses.

### Regenerating

```sh
yarn icons      # stage SVGs and run SVGR
yarn typecheck
yarn build      # bob: ESM + type definitions into lib/
```

The generator fails loudly on any SVG element or attribute it does not already know how to translate, rather than dropping it silently.

## Releasing

CI builds the icons on every PR touching the package or `public/`. Releases run from [`Nexvyn/runeicons`](https://github.com/Nexvyn/runeicons) only — the publish job skips forks, because npm provenance ties the package to the repository named in `package.json`. To publish, bump `version`, merge, and push a matching tag to `Nexvyn/runeicons`:

```sh
git tag runeicons-react-native@0.1.0
git push <nexvyn-remote> runeicons-react-native@0.1.0
```

`.github/workflows/publish-react-native.yml` regenerates the icons, verifies the tag matches `package.json`, and publishes to npm with provenance. It needs an `NPM_TOKEN` secret on the `npm-publish` environment of `Nexvyn/runeicons`.
