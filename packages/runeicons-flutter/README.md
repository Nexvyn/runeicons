# Rune Icons for Flutter

Beautiful, open-source Rune Icons for Flutter. The package bundles every icon
from the core Rune Icons set, including normal, duotone, fill, pixelated, and
glass variants.

## Install

```sh
flutter pub add runeicons
```

## Usage

Import the package and pass an icon from `RuneIcons` to `RuneIcon`:

```dart
import 'package:flutter/material.dart';
import 'package:runeicons/runeicons.dart';

const RuneIcon(
  RuneIcons.arrowLeft,
  size: 24,
  color: Colors.indigo,
  semanticLabel: 'Back',
)
```

Choose a variant with `style`:

```dart
const Row(
  children: [
    RuneIcon(RuneIcons.heart),
    RuneIcon(RuneIcons.heart, style: RuneIconStyle.duotone),
    RuneIcon(RuneIcons.heart, style: RuneIconStyle.fill),
    RuneIcon(RuneIcons.heart, style: RuneIconStyle.pixelated),
    RuneIcon(RuneIcons.glassBookmark),
  ],
)
```

Each icon reports which variants it supports. This is useful when building an
icon picker or choosing a style dynamically:

```dart
final icon = RuneIcons.byId['identity-user-plus'];

if (icon != null && icon.supports(RuneIconStyle.fill)) {
  return RuneIcon(icon, style: RuneIconStyle.fill);
}
```

`RuneIcons.all` contains the complete catalog. `RuneIcons.byId` provides lookup
by the stable IDs used on [runeicons.com](https://runeicons.com).

If a requested style is unavailable, `RuneIcon` throws an `ArgumentError` so a
missing asset cannot silently change the intended design. Omit `style` to use
the icon's default style.

Glass catalog entries use a `glass` prefix, such as `RuneIcons.glassBookmark`,
and select the glass style by default. The package preserves their source SVGs;
currently, `flutter_svg` renders their shapes and gradients but omits unsupported
SVG filter effects such as blurred shadows.

## Regenerating the catalog

The checked-in assets and Dart catalog are generated from the repository's
`public/` icon directories:

```sh
cd packages/runeicons-flutter
dart run tool/generate.dart
```

Run the generator whenever the core icon set changes.

## License and credit

Rune Icons and this Flutter package are licensed under the
[Apache License 2.0](LICENSE). Icons are created and maintained by the
[Rune Icons contributors](https://github.com/Nexvyn/runeicons/graphs/contributors).
