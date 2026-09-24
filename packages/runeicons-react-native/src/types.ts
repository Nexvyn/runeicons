import type { ReactElement } from 'react';
import type { SvgProps } from 'react-native-svg';

/**
 * The five styles Rune Icons is drawn in.
 *
 * `normal`, `duotone` and `fill` sit on a 24x24 grid, `pixelated` on 40x40,
 * and `glass` on 24x24 with baked-in gradients and blur filters.
 */
export type RuneIconStyle =
  'normal' | 'duotone' | 'fill' | 'pixelated' | 'glass';

/**
 * Props accepted by every icon.
 *
 * Anything else is forwarded to the underlying `<Svg>`, so `opacity`,
 * `transform`, `onPress` and `testID` work as usual.
 */
export interface RuneIconProps extends Omit<
  SvgProps,
  'width' | 'height' | 'color'
> {
  /**
   * Width and height, in density-independent pixels.
   *
   * @default 24
   */
  size?: number | string;

  /**
   * Primary colour: the stroke of `normal`, `duotone` and `fill` icons, and
   * the pixel fill of `pixelated` ones. Also set on the root `<Svg>`, so any
   * `currentColor` in the artwork resolves to it.
   *
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Accent colour, used by `duotone` and `fill` icons only.
   *
   * @default '#DDDDDD'
   */
  secondaryColor?: string;

  /**
   * Stroke weight for `normal`, `duotone` and `fill` icons. A few paths are
   * drawn at a deliberately finer weight and keep it.
   *
   * @default 2
   */
  strokeWidth?: number | string;
}

/** Any generated Rune icon. */
export type RuneIconComponent = (props: RuneIconProps) => ReactElement | null;

/** One icon's metadata, as shipped in `icons.json`. */
export interface RuneIconMeta {
  /** Stable id, shared with the Rune Icons website, e.g. `arrows-arrow-up`. */
  id: string;
  /** Human-readable label, e.g. `Arrow Up`. */
  name: string;
  category: string;
  tags: string[];
  /** Slug of this icon in each style it is drawn in, e.g. `{ normal: 'arrow-up' }`. */
  styles: Partial<Record<RuneIconStyle, string>>;
}
