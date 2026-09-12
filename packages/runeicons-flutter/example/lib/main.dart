// Copyright 2026 Runeicons
// SPDX-License-Identifier: Apache-2.0

import 'package:flutter/material.dart';
import 'package:runeicons/runeicons.dart';

void main() => runApp(const RuneIconsExample());

class RuneIconsExample extends StatelessWidget {
  const RuneIconsExample({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Rune Icons')),
        body: const Center(
          child: Wrap(
            spacing: 24,
            children: [
              RuneIcon(RuneIcons.heart, size: 40),
              RuneIcon(
                RuneIcons.heart,
                style: RuneIconStyle.duotone,
                size: 40,
              ),
              RuneIcon(
                RuneIcons.heart,
                style: RuneIconStyle.fill,
                size: 40,
              ),
              RuneIcon(
                RuneIcons.heart,
                style: RuneIconStyle.pixelated,
                size: 40,
              ),
              RuneIcon(RuneIcons.glassBookmark, size: 40),
            ],
          ),
        ),
      ),
    );
  }
}
