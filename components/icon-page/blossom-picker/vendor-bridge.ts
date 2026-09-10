import {
  BAR_WIDTH,
  DEFAULT_COLORS,
  INNER_COLORS,
  SLIDER_OFFSET,
} from '@/components/icon-page/blossom-vendor/constants';
import type { BlossomColorPickerOptions } from '@/components/icon-page/blossom-vendor/BlossomColorPicker';
import type { BlossomColorPickerValue } from '@/components/icon-page/blossom-vendor/types';
import {
  hexToHsl,
  lightnessToSliderValue,
} from '@/components/icon-page/blossom-vendor/utils';
import { HexColor } from '@/lib/color-utils';

export function hexToPickerValue(
  hex: HexColor,
  alpha = 100,
  fallbackHue?: number,
): BlossomColorPickerValue {
  const { h: rawH, s, l } = hexToHsl(hex);
  // Near-white/near-black/gray hex values carry no real hue information
  // (hexToHsl degenerates to h=0, which collides with the red petal). When
  // the caller already knows the picker's hue, keep it instead of snapping
  // to whatever petal happens to sit nearest to that meaningless h=0.
  const h = s < 2 && fallbackHue !== undefined ? fallbackHue : rawH;
  const achromatic = s < 2;
  let closest = DEFAULT_COLORS[0];
  let closestIdx = 0;
  let minHueDist = Infinity;

  for (let i = 0; i < DEFAULT_COLORS.length; i++) {
    const color = DEFAULT_COLORS[i];
    const dist = Math.min(Math.abs(color.h - h), 360 - Math.abs(color.h - h));
    if (dist < minHueDist) {
      minHueDist = dist;
      closest = color;
      closestIdx = i;
    }
  }

  return {
    hue: closest.h,
    saturation: lightnessToSliderValue(l),
    lightness: l,
    originalSaturation: achromatic ? 0 : closest.s,
    alpha,
    layer: closestIdx < INNER_COLORS.length ? 'inner' : 'outer',
  };
}

export const VENDOR_PICKER_DEFAULTS: Pick<
  BlossomColorPickerOptions,
  | 'collapsible'
  | 'showAlphaSlider'
  | 'adaptivePositioning'
  | 'coreSize'
  | 'petalSize'
  | 'showCoreColor'
  | 'circularBarWidth'
  | 'sliderWidth'
  | 'sliderOffset'
  | 'animationDuration'
> = {
  collapsible: true,
  showAlphaSlider: true,
  adaptivePositioning: true,
  coreSize: 28,
  petalSize: 28,
  showCoreColor: true,
  circularBarWidth: BAR_WIDTH,
  sliderWidth: BAR_WIDTH,
  sliderOffset: SLIDER_OFFSET,
  animationDuration: 300,
};
