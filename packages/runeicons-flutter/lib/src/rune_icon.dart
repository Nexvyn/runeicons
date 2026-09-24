// Copyright 2026 Runeicons
// SPDX-License-Identifier: Apache-2.0

import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'rune_icon_data.dart';

/// Renders a bundled Rune icon SVG.
class RuneIcon extends StatelessWidget {
  /// Creates a Rune icon.
  const RuneIcon(
    this.icon, {
    super.key,
    this.style,
    this.size = 24,
    this.width,
    this.height,
    this.color,
    this.colorFilter,
    this.blendMode = BlendMode.srcIn,
    this.fit = BoxFit.contain,
    this.alignment = Alignment.center,
    this.matchTextDirection = false,
    this.semanticLabel,
    this.excludeFromSemantics = false,
  }) : assert(
          color == null || colorFilter == null,
          'color and colorFilter cannot both be provided',
        );

  /// The icon to render.
  final RuneIconData icon;

  /// The visual style to render. Defaults to [RuneIconData.defaultStyle].
  final RuneIconStyle? style;

  /// The default width and height of the icon.
  final double? size;

  /// An optional width that overrides [size].
  final double? width;

  /// An optional height that overrides [size].
  final double? height;

  /// An optional color applied to every SVG paint using [blendMode].
  ///
  /// Leave this null to preserve the source colors, especially for duotone and
  /// glass icons.
  final Color? color;

  /// An optional advanced color filter applied to the SVG.
  final ColorFilter? colorFilter;

  /// The blend mode used when [color] creates a color filter.
  final BlendMode blendMode;

  /// How to inscribe the SVG into its bounds.
  final BoxFit fit;

  /// How to align the SVG within its bounds.
  final AlignmentGeometry alignment;

  /// Whether to mirror the icon in right-to-left text directions.
  final bool matchTextDirection;

  /// A semantic description for accessibility tools.
  final String? semanticLabel;

  /// Whether to hide this icon from the semantics tree.
  final bool excludeFromSemantics;

  @override
  Widget build(BuildContext context) {
    final effectiveColorFilter = colorFilter ??
        (color == null ? null : ColorFilter.mode(color!, blendMode));

    return SvgPicture.asset(
      icon.assetPath(style),
      package: 'runeicons',
      width: width ?? size,
      height: height ?? size,
      colorFilter: effectiveColorFilter,
      fit: fit,
      alignment: alignment,
      matchTextDirection: matchTextDirection,
      semanticsLabel: semanticLabel,
      excludeFromSemantics: excludeFromSemantics,
    );
  }
}
