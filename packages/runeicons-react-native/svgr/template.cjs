/**
 * Component template for every generated icon.
 *
 * Gives each icon the themeable prop signature the sentinels in
 * scripts/prepare-svg.mjs are substituted into, and drops SVGR's own
 * `SvgProps` type import in favour of the package's `RuneIconProps`.
 */
module.exports = function template(variables, { tpl }) {
  // SVGR adds `import type { SvgProps }`; we type the component ourselves.
  const imports = variables.imports.filter((node) => node.importKind !== 'type');

  // `SvgArrowUp` -> `ArrowUp`, purely so React devtools shows a clean name.
  const componentName = variables.componentName.replace(/^Svg/, '');

  return tpl`
${imports}
import type { RuneIconProps } from '../types';

const ${componentName} = ({
  size = 24,
  color = 'currentColor',
  secondaryColor = '#DDDDDD',
  strokeWidth = 2,
  ...props
}: RuneIconProps) => (
  ${variables.jsx}
);

export default ${componentName};
`;
};
