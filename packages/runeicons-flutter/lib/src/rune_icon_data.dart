// Copyright 2026 Runeicons
// SPDX-License-Identifier: Apache-2.0

/// A visual style available in the Rune Icons library.
enum RuneIconStyle {
  /// The outline icon style.
  normal,

  /// The two-tone icon style.
  duotone,

  /// The solid icon style.
  fill,

  /// The pixel-art icon style.
  pixelated,

  /// The dimensional glass icon style.
  glass,
}

/// Metadata and bundled asset locations for a Rune icon.
final class RuneIconData {
  /// Creates immutable metadata for a Rune icon.
  const RuneIconData({
    required this.id,
    required this.name,
    required this.category,
    required this.tags,
    required this.defaultStyle,
    required this.assetPaths,
  });

  /// The stable Rune Icons catalog identifier.
  final String id;

  /// The human-readable icon name.
  final String name;

  /// The Rune Icons catalog category.
  final String category;

  /// Search terms associated with the icon.
  final List<String> tags;

  /// The style used when no style is passed to [assetPath].
  final RuneIconStyle defaultStyle;

  /// Package-relative SVG asset paths keyed by their available styles.
  final Map<RuneIconStyle, String> assetPaths;

  /// The styles that are available for this icon.
  Iterable<RuneIconStyle> get availableStyles => assetPaths.keys;

  /// Whether this icon has an asset for [style].
  bool supports(RuneIconStyle style) => assetPaths.containsKey(style);

  /// Returns the asset path for [style], or the default style when omitted.
  ///
  /// Throws an [ArgumentError] when the requested style is unavailable.
  String assetPath([RuneIconStyle? style]) {
    final resolvedStyle = style ?? defaultStyle;
    final path = assetPaths[resolvedStyle];
    if (path == null) {
      throw ArgumentError.value(
        resolvedStyle,
        'style',
        '$name does not provide the ${resolvedStyle.name} style',
      );
    }
    return path;
  }

  @override
  String toString() => 'RuneIconData($id)';
}
