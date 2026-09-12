// Copyright 2026 Runeicons
// SPDX-License-Identifier: Apache-2.0

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:runeicons/runeicons.dart';

void main() {
  test('exports the complete generated catalog', () {
    expect(RuneIcons.all, hasLength(354));
    expect(
      RuneIcons.all.where((icon) => icon.supports(RuneIconStyle.normal)),
      hasLength(217),
    );
    expect(
      RuneIcons.all.where((icon) => icon.supports(RuneIconStyle.duotone)),
      hasLength(215),
    );
    expect(
      RuneIcons.all.where((icon) => icon.supports(RuneIconStyle.fill)),
      hasLength(126),
    );
    expect(
      RuneIcons.all.where((icon) => icon.supports(RuneIconStyle.pixelated)),
      hasLength(215),
    );
    expect(
      RuneIcons.all.where((icon) => icon.supports(RuneIconStyle.glass)),
      hasLength(135),
    );
  });

  test('looks up icons by their stable catalog ID', () {
    expect(RuneIcons.byId['arrows-arrow-left'], RuneIcons.arrowLeft);
    expect(RuneIcons.byId['glass-bookmark'], RuneIcons.glassBookmark);
    expect(RuneIcons.byId['missing'], isNull);
  });

  test('rejects unavailable styles', () {
    expect(
      () => RuneIcons.arrowLeft.assetPath(RuneIconStyle.fill),
      throwsArgumentError,
    );
  });

  test('every generated SVG is present in the package asset bundle', () async {
    for (final icon in RuneIcons.all) {
      for (final path in icon.assetPaths.values) {
        final bytes = await rootBundle.load('packages/runeicons/$path');
        expect(bytes.lengthInBytes, greaterThan(0), reason: path);
      }
    }
  });

  testWidgets('renders representative SVGs from every style', (tester) async {
    const samples = <RuneIconStyle, RuneIconData>{
      RuneIconStyle.normal: RuneIcons.heart,
      RuneIconStyle.duotone: RuneIcons.heart,
      RuneIconStyle.fill: RuneIcons.heart,
      RuneIconStyle.pixelated: RuneIcons.heart,
      RuneIconStyle.glass: RuneIcons.glassBookmark,
    };

    for (final sample in samples.entries) {
      await tester.pumpWidget(
        MaterialApp(
          home: RuneIcon(
            sample.value,
            style: sample.key,
            color: Colors.purple,
            semanticLabel: 'Favorite',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final picture = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(picture.width, 24);
      expect(picture.height, 24);
      expect(picture.semanticsLabel, 'Favorite');
      expect(tester.takeException(), isNull, reason: sample.key.name);
    }
  });
}
