# 🎨 Rune Icons for React Native

A React Native library containing 900+ high-quality icons with five styles: outline, duotone, fill, pixelated, and glass. Built with [`react-native-svg`](https://github.com/software-mansion/react-native-svg).

[![npm version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/runeicons-react-native)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

## Features

- 📦 **Android & iOS Support** - Fully compatible with Expo and bare React Native projects
- 🎨 **5 Icon Styles** - Normal (outline), duotone, fill, pixelated, and glass styles
- 🎯 **TypeScript Support** - Full type definitions included
- 🌈 **Customizable** - Resize, recolor, and style icons with props
- 🔧 **Dynamic Icon Creation** - Build custom icons with `createIcon()`
- 📱 **Performance Optimized** - SVG paths bundled and optimized

## Installation

### npm

```bash
npm install runeicons-react-native react-native-svg
```

### yarn

```bash
yarn add runeicons-react-native react-native-svg
```

### pnpm

```bash
pnpm add runeicons-react-native react-native-svg
```

### Expo

The package works with Expo but may require additional configuration depending on your Expo SDK version. See the note below about Expo.

## Basic Usage

```tsx
import React from 'react';
import { RuneIcon } from 'runeicons-react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Icon Examples:</Text>

      {/* Outline style (default) */}
      <RuneIcon name="arrow_down" size={24} color="#7c5cff" />

      {/* Custom size */}
      <RuneIcon name="home" size={32} />

      {/* Fill style */}
      <RuneIcon name="user" size={28} style="fill" color="#FFD700" />

      {/* Disabled (transparent) */}
      <RuneIcon name="pin" size={24} disabled />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});
```

## Alignments

```tsx
import React, { useState } from 'react';
import { RuneIcon } from 'runeicons-react-native';
import { View } from 'react-native';

// Different styles
const [style, setStyle] = useState<'outline' | 'duotone' | 'fill' | 'pixelated' | 'glass'>('outline');

<View style={styles.container}>
  {stylesArray.map((s) => (
    <RuneIcon
      key={s}
      name="home"
      size={24}
      style={s}
      color={s === 'fill' ? '#7c5cff' : undefined}
    />
  ))}
</View>
```

## Examples

### Bar Chart

```tsx
<RuneIcon name="bar_chart" size={32} color="#00C853" />
```

### Sun Icon

```tsx
<RuneIcon name="sun" size={28} color="#FFD700" />
```

### Shopping Cart

```tsx
<RuneIcon
  name="shopping_cart"
  size={24}
  color="#7c5cff"
  disabled={false}
/>
```

### Lens (circle)

```tsx
<RuneIcon
  name="lens"
  size={20}
  fill="#7c5cff"
  stroke="none"
/>
```

## Multiple Roots / Non-Multiple Roots

If an icon has multiple root elements (e.g., `<path>`, `<circle>`, `<rect>`) or non-multiple roots, you'll need the root SVG component:

```tsx
import { Svg, Paths } from 'react-native-svg';

// Example for a complex icon with multiple elements
const StarIcon = ({ size, color }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#FFA500" />
        </LinearGradient>
      </Defs>
      <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </Svg>
  );
}

<StarIcon size={28} />
```

## Creating Custom Icons

Use the `createIcon()` helper to build custom icons on the fly:

```tsx
import { createIcon } from 'runeicons-react-native';

// Create your custom star icon
const Star = createIcon(
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  'star'
);

export default function App() {
  return (
    <Star size={28} color="#FFD700" />
  );
}
```

## Completing the Icon Set

This package uses an automated build script that generates all 900+ icon paths from the source SVG files. To complete the icon set:

```bash
# Run from the parent directory
cd D:\code\os\runeicons
cd packages/runeicons-react-native
bun run scripts/build-icons.ts
```

This script:
1. Scans `../public/normal` for SVG files
2. Extracts path data
3. Generates TypeScript type definitions
4. Creates the icon registry

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Icon name (e.g., `arrow_down`, `home`) |
| `style` | `'outline' \| 'duotone' \| 'fill' \| 'pixelated' \| 'glass'` | `'outline'` | Icon style |
| `size` | `number` | `24` | Icon size in pixels |
| `color` | `string` | `'currentColor'` | Icon color (default uses component color) |
| `disabled` | `boolean` | `false` | Whether icon is disabled/transparent (glass style only) |
| `[key]` | `any` | - | Additional SVG props |

## TypeScript Integration

```tsx
import { RuneIcon } from 'runeicons-react-native';
import type { SVGPathData } from 'runeicons-react-native';

// Type-safe access
const iconData: SVGPathData = await import('runeicons-react-native/src/generated/index');

// Pass props with IntelliSense
<RuneIcon
  name="home"
  size={32}
  color="#7c5cff"
  style="fill"
/>
```

## Expo Notes

This package is designed for bare React Native projects. For Expo, you may need:

1. **SDK 50+** with updated Metro bundler configuration
2. **Update metro.config.js**:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeModules } = require('expo/native-modules');

const config = getDefaultConfig(__dirname);

module.exports = withNativeModules(__dirname, config);
```

3. **Clear cache**: `npx expo config --type introspect`

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create a branch: `git checkout -b feature/icon-name`
3. Run the build script to generate new icons: `bun run scripts/build-icons.ts`
4. Add icon(s) to the generated `src/generated/` file
5. Test your changes locally
6. Submit a pull request

## See Also

- 👋 [runeicons-react](../runeicons-react) - React components for the website
- 🌐 [runeicons.com](https://runeicons.com) - Full icon browser and editor
- Apache [2.0 License](../../LICENSE)

## License

Copyright © 2025 Rune Icons

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

**Made with ❤️ by the Rune Icons community**