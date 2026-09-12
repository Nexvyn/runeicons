/**
 * Rune Icons for React Native
 *
 * @see https://github.com/Nexvyn/runeicons/tree/main/packages/runeicons-react-native
 * @license Apache-2.0
 * @author Rune Icons <https://runeicons.com>
 */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import type { SVGPathData } from './generated/index';

export interface RuneIconProps {
  /**
   * The name of the icon to display
   */
  name: string;
  /**
   * The icon style: 'outline' (default), 'duotone', 'fill', 'pixelated', 'glass'
   */
  style?: 'outline' | 'duotone' | 'fill' | 'pixelated' | 'glass';
  /**
   * Icon size in pixels (default: 24)
   */
  size?: number;
  /**
   * Icon color (default: 'currentColor')
   */
  color?: string;
  /**
   * Whether the icon is disabled/transparent (for glass style only)
   */
  disabled?: boolean;
  /**
   * Extra SVG props to pass through to the root Svg element
   */
  [key: string]: any;
}

// Icon name to path mapping (generated at build time)
const iconPaths: Record<string, SVGPathData> = {};

// Populate icons dynamically - this will be replaced by the generated index
function initializeIcons() {
  try {
    // Dynamically import the generated icons
    // @ts-ignore - Generated file
    const icons = await import('./generated/index');
    Object.assign(iconPaths, icons as any);
  } catch (e) {
    console.warn('[RuneIcon] Could not load generated icons. Using shell component.');
  }
}

initializeIcons();

/**
 * RuneIcon - A wrapper component for displaying Rune Icons in React Native
 *
 * @example
 * ```tsx
 * import { RuneIcon } from 'runeicons-react-native';
 *
 * <RuneIcon name="arrow_down" size={24} color="#7c5cff" />
 * <RuneIcon name="home" size={32} style="fill" />
 * ```
 */
export const RuneIcon: React.FC<RuneIconProps> = ({ name, style = 'outline', size = 24, color = 'currentColor', disabled = false, ...svgProps }) => {
  const icon = iconPaths[name];

  if (!icon) {
    console.warn(`[RuneIcon] Icon "${name}" is not available`);
    return null;
  }

  const baseColor = disabled ? 'rgba(255,255,255,0.1)' : color;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={baseColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
      {...svgProps}
    >
      <Path d={icon.path} fill="none" />
    </Svg>
  );
};

/**
 * Create a custom icon component from path data
 *
 * @example
 * ```tsx
 * import { createIcon } from 'runeicons-react-native';
 *
 * const Star = createIcon("M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z");
 *
 * <Star size={24} color="#FFD700" />
 * ```
 */
export const createIcon = (path: string, name: string): React.FC<RuneIconProps> => {
  return ({ size = 24, color = 'currentColor', ...props }) => (
    <RuneIcon
      name={name}
      size={size}
      color={color}
      {...props as any}
      path={path}
    />
  ) as any;
};

// Export all generated icons by category
// These exports will be available when the package is published
// For now, export what we can dynamically
export const icons = iconPaths;

// Re-export type for convenience
export type { RuneIconProps, SVGPathData };

// Default export
export default RuneIcon;