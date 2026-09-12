// Copyright 2026 Runeicons
// SPDX-License-Identifier: Apache-2.0

import 'dart:convert';
import 'dart:io';

const _styles = ['normal', 'duotone', 'fill', 'pixelated'];

const _folderToCategory = <String, String>{
  'arrows': 'navigation',
  'code': 'dev',
  'documents': 'files',
  'gadgets': 'hardware',
  'identity': 'users',
  'indicators': 'feedback',
  'layouts': 'layout',
  'messaging': 'communication',
  'metrics': 'metrics',
  'money': 'commerce',
  'nature': 'weather',
  'other': 'misc',
  'playback': 'media',
  'schedule': 'time',
  'senses': 'accessibility',
  'tools': 'action',
};

const _folderToTag = <String, String>{
  'arrows': 'navigation',
  'code': 'dev',
  'documents': 'files',
  'gadgets': 'hardware',
  'identity': 'users',
  'indicators': 'feedback',
  'layouts': 'layout',
  'messaging': 'communication',
  'metrics': 'metrics',
  'money': 'commerce',
  'nature': 'weather',
  'other': 'misc',
  'playback': 'media',
  'schedule': 'time',
  'senses': 'accessibility',
  'tools': 'actions',
};

const _glassCategoryOverrides = <String, String>{
  'bitcoin': 'commerce',
  'creditcard': 'commerce',
  'shoppingbag': 'commerce',
  'shoppingcart': 'commerce',
  'wallet': 'commerce',
  'pricetag': 'commerce',
  'calender': 'time',
  'calendar': 'time',
  'clock': 'time',
  'history': 'time',
  'cloud': 'weather',
  'sun': 'weather',
  'moon': 'weather',
  'rain': 'weather',
  'bubble': 'communication',
  'email': 'communication',
  'envelope': 'communication',
  'phone': 'communication',
  'mail': 'communication',
  'camera': 'media',
  'microphone': 'media',
  'play': 'media',
  'pause': 'media',
  'volume': 'media',
  'image': 'media',
  'arrow': 'navigation',
  'chevron': 'navigation',
  'home': 'navigation',
  'ear': 'accessibility',
  'eye': 'accessibility',
  'hand': 'accessibility',
  'thumb': 'accessibility',
  'code': 'dev',
  'console': 'dev',
  'branch': 'dev',
  'server': 'dev',
  'terminal': 'dev',
  'user': 'users',
  'people': 'users',
  'contact': 'users',
  'battery': 'hardware',
  'printer': 'hardware',
  'tv': 'hardware',
  'laptop': 'hardware',
  'archive': 'files',
  'file': 'files',
  'folder': 'files',
  'inbox': 'files',
  'clipboard': 'files',
  'bell': 'feedback',
  'check': 'feedback',
  'alert': 'feedback',
  'warning': 'feedback',
  'bookmark': 'action',
  'heart': 'action',
  'star': 'action',
  'trash': 'action',
  'pencil': 'action',
  'edit': 'action',
  'search': 'action',
  'settings': 'action',
};

const _reservedWords = <String>{
  'abstract',
  'as',
  'assert',
  'async',
  'await',
  'base',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'covariant',
  'default',
  'deferred',
  'do',
  'dynamic',
  'else',
  'enum',
  'export',
  'extends',
  'extension',
  'external',
  'factory',
  'false',
  'final',
  'finally',
  'for',
  'function',
  'get',
  'hide',
  'if',
  'implements',
  'import',
  'in',
  'interface',
  'is',
  'late',
  'library',
  'macro',
  'mixin',
  'new',
  'null',
  'of',
  'on',
  'operator',
  'part',
  'required',
  'rethrow',
  'return',
  'sealed',
  'set',
  'show',
  'static',
  'super',
  'switch',
  'sync',
  'this',
  'throw',
  'true',
  'try',
  'typedef',
  'var',
  'void',
  'when',
  'while',
  'with',
  'yield',
};

void main() {
  final packageDirectory = File.fromUri(Platform.script).parent.parent;
  final repositoryDirectory = packageDirectory.parent.parent;
  final sourceDirectory = Directory(
    '${repositoryDirectory.path}${Platform.pathSeparator}public',
  );
  final assetsDirectory = Directory(
    '${packageDirectory.path}${Platform.pathSeparator}assets',
  );

  if (!sourceDirectory.existsSync()) {
    stderr
        .writeln('Unable to find the core icon set at ${sourceDirectory.path}');
    exitCode = 1;
    return;
  }

  if (assetsDirectory.existsSync()) {
    assetsDirectory.deleteSync(recursive: true);
  }

  final icons = _readCoreIcons(sourceDirectory, assetsDirectory);
  final glassIcons = _readGlassIcons(sourceDirectory, assetsDirectory);
  final allIcons = [...icons, ...glassIcons];

  final output = File(
    '${packageDirectory.path}${Platform.pathSeparator}lib'
    '${Platform.pathSeparator}src${Platform.pathSeparator}rune_icons.g.dart',
  );
  output.writeAsStringSync(_generateDart(allIcons));
  final formatResult = Process.runSync(
    Platform.resolvedExecutable,
    ['format', output.path],
  );
  if (formatResult.exitCode != 0) {
    stderr.write(formatResult.stderr);
    exitCode = formatResult.exitCode;
    return;
  }

  stdout
    ..writeln('Generated ${output.path}')
    ..writeln('  catalog entries: ${allIcons.length}')
    ..writeln('  normal: ${_countStyle(allIcons, 'normal')}')
    ..writeln('  duotone: ${_countStyle(allIcons, 'duotone')}')
    ..writeln('  fill: ${_countStyle(allIcons, 'fill')}')
    ..writeln('  pixelated: ${_countStyle(allIcons, 'pixelated')}')
    ..writeln('  glass: ${_countStyle(allIcons, 'glass')}');
}

List<_Icon> _readCoreIcons(Directory source, Directory assets) {
  final iconsByPath = <String, _Icon>{};

  for (final style in _styles) {
    final styleSource = Directory(
      '${source.path}${Platform.pathSeparator}$style',
    );
    final files = styleSource
        .listSync(recursive: true)
        .whereType<File>()
        .where((file) => file.path.toLowerCase().endsWith('.svg'))
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));

    final styleAssets = Directory(
      '${assets.path}${Platform.pathSeparator}$style',
    )..createSync(recursive: true);

    for (final file in files) {
      final relativePath = file.path
          .substring(styleSource.path.length + 1)
          .replaceAll(Platform.pathSeparator, '/');
      final pathWithoutExtension = relativePath.substring(
        0,
        relativePath.length - '.svg'.length,
      );
      final pathParts = pathWithoutExtension.split('/');
      if (pathParts.length != 2) {
        throw StateError('Expected category/icon.svg, found $relativePath');
      }

      final folder = pathParts.first;
      final basename = pathParts.last;
      final category = _folderToCategory[folder];
      final tagPrefix = _folderToTag[folder];
      if (category == null || tagPrefix == null) {
        throw StateError('Unknown Rune Icons category folder: $folder');
      }

      final id = '$folder-$basename';
      final icon = iconsByPath.putIfAbsent(
        pathWithoutExtension,
        () => _Icon(
          id: id,
          name: _titleCaseKebab(basename),
          category: category,
          tags: [
            tagPrefix,
            ...basename.split('-').where((tag) => tag.isNotEmpty)
          ],
          baseIdentifier: _dartIdentifier(basename),
          defaultStyle: style,
        ),
      );
      icon.assetPaths[style] = 'assets/$style/$id.svg';

      file.copySync(
        '${styleAssets.path}${Platform.pathSeparator}$id.svg',
      );
    }
  }

  final icons = iconsByPath.values.toList()
    ..sort((a, b) => a.id.compareTo(b.id));
  return icons;
}

List<_Icon> _readGlassIcons(Directory source, Directory assets) {
  final sourceDirectory = Directory(
    '${source.path}${Platform.pathSeparator}glass-icons',
  );
  final assetDirectory = Directory(
    '${assets.path}${Platform.pathSeparator}glass',
  )..createSync(recursive: true);
  final files = sourceDirectory
      .listSync()
      .whereType<File>()
      .where((file) => file.path.toLowerCase().endsWith('.svg'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  final seenIds = <String>{};
  final icons = <_Icon>[];
  for (final file in files) {
    final filename = file.uri.pathSegments.last;
    final glassName = _glassName(filename);
    var id = 'glass-${glassName.idSlug}';
    var suffix = 1;
    while (!seenIds.add(id)) {
      suffix += 1;
      id = 'glass-${glassName.idSlug}-$suffix';
    }

    final icon = _Icon(
      id: id,
      name: glassName.name,
      category: _glassCategory(glassName.idSlug, glassName.tagWords),
      tags: ['glass', ...glassName.tagWords],
      baseIdentifier: _dartIdentifier(id),
      defaultStyle: 'glass',
    );
    icon.assetPaths['glass'] = 'assets/glass/$id.svg';
    icons.add(icon);
    file.copySync(
      '${assetDirectory.path}${Platform.pathSeparator}$id.svg',
    );
  }
  return icons;
}

String _generateDart(List<_Icon> icons) {
  final usedIdentifiers = <String>{'all', 'byId'};
  for (final icon in icons) {
    var identifier = icon.baseIdentifier;
    if (_reservedWords.contains(identifier.toLowerCase())) {
      identifier = '${identifier}Icon';
    }
    if (!usedIdentifiers.add(identifier)) {
      final categoryIdentifier = _upperCamel(icon.category);
      identifier = '$identifier$categoryIdentifier';
      var suffix = 1;
      final base = identifier;
      while (!usedIdentifiers.add(identifier)) {
        suffix += 1;
        identifier = '$base$suffix';
      }
    }
    icon.identifier = identifier;
  }

  final output = StringBuffer()
    ..writeln('// Copyright 2026 Runeicons')
    ..writeln('// SPDX-License-Identifier: Apache-2.0')
    ..writeln()
    ..writeln('// AUTO-GENERATED by tool/generate.dart. Do not edit by hand.')
    ..writeln()
    ..writeln("import 'rune_icon_data.dart';")
    ..writeln()
    ..writeln('/// The complete generated Rune Icons catalog.')
    ..writeln('abstract final class RuneIcons {');

  for (final icon in icons) {
    output
      ..writeln('  /// ${icon.name} (`${icon.id}`).')
      ..writeln(
          '  static const RuneIconData ${icon.identifier} = RuneIconData(')
      ..writeln('    id: ${jsonEncode(icon.id)},')
      ..writeln('    name: ${jsonEncode(icon.name)},')
      ..writeln('    category: ${jsonEncode(icon.category)},')
      ..writeln(
        '    tags: [${icon.tags.map(jsonEncode).join(', ')}],',
      )
      ..writeln('    defaultStyle: RuneIconStyle.${icon.defaultStyle},')
      ..writeln('    assetPaths: {');
    for (final style in [..._styles, 'glass']) {
      final path = icon.assetPaths[style];
      if (path != null) {
        output.writeln('      RuneIconStyle.$style: ${jsonEncode(path)},');
      }
    }
    output
      ..writeln('    },')
      ..writeln('  );')
      ..writeln();
  }

  output
    ..writeln('  /// Every icon in catalog order.')
    ..writeln('  static const List<RuneIconData> all = [');
  for (final icon in icons) {
    output.writeln('    ${icon.identifier},');
  }
  output
    ..writeln('  ];')
    ..writeln()
    ..writeln('  /// Icons keyed by their stable Rune Icons catalog ID.')
    ..writeln('  static const Map<String, RuneIconData> byId = {');
  for (final icon in icons) {
    output.writeln('    ${jsonEncode(icon.id)}: ${icon.identifier},');
  }
  output
    ..writeln('  };')
    ..writeln('}');
  return output.toString();
}

int _countStyle(List<_Icon> icons, String style) =>
    icons.where((icon) => icon.assetPaths.containsKey(style)).length;

String _titleCaseKebab(String value) => value
    .split('-')
    .where((word) => word.isNotEmpty)
    .map((word) => '${word[0].toUpperCase()}${word.substring(1)}')
    .join(' ');

String _dartIdentifier(String value) {
  final words = value.split(RegExp('[^A-Za-z0-9]+'))
    ..removeWhere((word) => word.isEmpty);
  if (words.isEmpty) {
    throw ArgumentError.value(
        value, 'value', 'Cannot create a Dart identifier');
  }
  final first = words.first.toLowerCase();
  final rest = words.skip(1).map(_upperCamel).join();
  final identifier = '$first$rest';
  return RegExp(r'^[0-9]').hasMatch(identifier)
      ? 'icon$identifier'
      : identifier;
}

String _upperCamel(String value) => value.isEmpty
    ? value
    : '${value[0].toUpperCase()}${value.substring(1).toLowerCase()}';

_GlassName _glassName(String filename) {
  final base =
      filename.replaceFirst(RegExp(r'\.svg$', caseSensitive: false), '').trim();
  final pieces = <String>[];
  for (final segment in base.split(RegExp(r'\s+'))) {
    pieces.addAll(_splitPascal(segment));
  }
  final cleaned = pieces.where((piece) => piece.isNotEmpty).toList();
  return _GlassName(
    name: cleaned.join(' '),
    idSlug: cleaned.join('-').toLowerCase(),
    tagWords: cleaned
        .map((word) => word.toLowerCase())
        .where((word) => !RegExp(r'^\d+$').hasMatch(word))
        .toList(),
  );
}

List<String> _splitPascal(String value) {
  final parts = <String>[];
  var current = '';
  for (final rune in value.runes) {
    final character = String.fromCharCode(rune);
    final isUppercase = RegExp('[A-Z]').hasMatch(character);
    final isDigit = RegExp('[0-9]').hasMatch(character);
    final currentEndsInDigit =
        current.isNotEmpty && RegExp(r'\d$').hasMatch(current);
    if (isUppercase || (isDigit && current.isNotEmpty && !currentEndsInDigit)) {
      if (current.isNotEmpty) {
        parts.add(current);
      }
      current = character;
    } else {
      current += character;
    }
  }
  if (current.isNotEmpty) {
    parts.add(current);
  }
  return parts;
}

String _glassCategory(String idSlug, List<String> tagWords) {
  final searchable = [idSlug, ...tagWords];
  for (final entry in _glassCategoryOverrides.entries) {
    if (searchable.any((word) => word.contains(entry.key))) {
      return entry.value;
    }
  }
  return 'misc';
}

final class _GlassName {
  const _GlassName({
    required this.name,
    required this.idSlug,
    required this.tagWords,
  });

  final String name;
  final String idSlug;
  final List<String> tagWords;
}

final class _Icon {
  _Icon({
    required this.id,
    required this.name,
    required this.category,
    required this.tags,
    required this.baseIdentifier,
    required this.defaultStyle,
  });

  final String id;
  final String name;
  final String category;
  final List<String> tags;
  final String baseIdentifier;
  final String defaultStyle;
  final Map<String, String> assetPaths = {};
  late String identifier;
}
