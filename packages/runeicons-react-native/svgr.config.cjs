/**
 * SVGR configuration.
 *
 * Input is `svg/`, staged by scripts/prepare-svg.mjs, which has already
 * flattened the names and swapped the themeable colours and stroke weight for
 * the sentinels replaced below.
 */
module.exports = {
  native: true,
  typescript: true,
  // tsconfig uses the automatic runtime; a classic `import * as React`
  // would be flagged by noUnusedLocals.
  jsxRuntime: 'automatic',
  outDir: 'src/icons',
  filenameCase: 'kebab',
  template: require('./svgr/template.cjs'),
  indexTemplate: require('./svgr/index-template.cjs'),

  // Sentinels -> props. See SENTINEL in scripts/prepare-svg.mjs.
  replaceAttrValues: {
    '#010101': '{color}',
    '#020202': '{secondaryColor}',
    'rune-sw': '{strokeWidth}',
  },

  svgProps: {
    width: '{size}',
    height: '{size}',
    // Lets any `currentColor` left in the artwork resolve to the icon's colour.
    color: '{color}',
  },

  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // Scaling depends entirely on viewBox, since width/height become `size`.
            removeViewBox: false,
            // Glass icons reference masks, filters and gradients by id. Minifying
            // ids to `a`, `b`, `c` per file would make them collide between icons
            // rendered together; the Figma ids are already unique across the set.
            cleanupIds: false,
            // Would rewrite `#DDDDDD` to `#ddd` and `black` to `#000`, defeating
            // the sentinel substitution below.
            convertColors: false,
            // Would round the `rune-sw` stroke-width sentinel away.
            cleanupNumericValues: false,
          },
        },
      },
      'removeXMLNS',
      // No matching prop on react-native-svg's <Filter>, and its pipeline is
      // sRGB already — which is the only value this artwork uses.
      { name: 'removeAttrs', params: { attrs: '(color-interpolation-filters)' } },
    ],
  },

  // Adds the SVG filter elements react-native-svg supports but SVGR does not
  // know about. See svgr/rn-filters.cjs.
  jsx: { babelConfig: { plugins: [require.resolve('./svgr/rn-filters.cjs')] } },
};
