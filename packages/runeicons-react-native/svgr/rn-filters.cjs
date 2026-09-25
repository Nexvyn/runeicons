/**
 * Teaches SVGR's react-native transform about SVG filters.
 *
 * @svgr/babel-plugin-transform-react-native-svg carries a hard-coded list of
 * elements react-native-svg supports. That list predates filter support (added
 * in react-native-svg 15) so it silently DROPS <filter> and its primitives,
 * leaving dangling filter="url(#…)" references behind.
 *
 * SVGR is unmaintained (last release 8.1.0, Aug 2023), so we bridge the gap:
 * before SVGR's preset runs, rename each filter element to an element SVGR does
 * know and that this icon set never uses; after it has run, rename the emitted
 * components to the real ones and fix the react-native-svg import.
 *
 * Babel runs plugins before presets, which is what makes the ordering work.
 */
const PROXY = {
  filter: { via: "symbol", component: "Symbol", real: "Filter" },
  feGaussianBlur: { via: "line", component: "Line", real: "FeGaussianBlur" },
  feFlood: { via: "polyline", component: "Polyline", real: "FeFlood" },
  feBlend: { via: "tspan", component: "TSpan", real: "FeBlend" },
};

const VIA_TO_REAL = new Map(Object.values(PROXY).map((p) => [p.component, p.real]));
const RESERVED = new Set(Object.values(PROXY).map((p) => p.via));

module.exports = function rnFilters({ types: t }) {
  const renameTo = (path, name) => {
    path.get("openingElement").get("name").replaceWith(t.jsxIdentifier(name));
    if (path.has("closingElement")) {
      path.get("closingElement").get("name").replaceWith(t.jsxIdentifier(name));
    }
  };

  return {
    name: "rune-rn-filters",
    visitor: {
      Program: {
        enter(path) {
          path.traverse({
            JSXElement(p) {
              const namePath = p.get("openingElement").get("name");
              if (!namePath.isJSXIdentifier()) return;
              const { name } = namePath.node;
              if (RESERVED.has(name)) {
                throw new Error(
                  `rune-rn-filters: <${name}> is reserved as a proxy for an SVG filter element. ` +
                    `An icon now uses it for real — pick a different proxy element.`,
                );
              }
              const proxy = PROXY[name];
              if (proxy) renameTo(p, proxy.via);
            },
          });
        },
        exit(path) {
          const used = new Set();
          path.traverse({
            JSXIdentifier(p) {
              const real = VIA_TO_REAL.get(p.node.name);
              // Only rewrite element positions, not attribute names.
              if (!real || p.parentPath.isJSXAttribute()) return;
              p.replaceWith(t.jsxIdentifier(real));
              used.add(real);
            },
            ImportDeclaration(p) {
              if (p.node.source.value !== "react-native-svg") return;
              for (const spec of p.node.specifiers) {
                if (!t.isImportSpecifier(spec)) continue;
                const real = VIA_TO_REAL.get(spec.imported.name);
                if (real) {
                  spec.imported = t.identifier(real);
                  spec.local = t.identifier(real);
                }
              }
            },
          });
        },
      },
    },
  };
};
