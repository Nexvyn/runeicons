/**
 * Design tokens, mirroring the Rune Icons website.
 *
 * The site is deliberately monochrome — every one of its OKLCH tokens has zero
 * chroma — so the app's chrome is ink and greys only, and the one place colour
 * appears is the swatch row, where it is the product being demonstrated rather
 * than decoration.
 */
export type Theme = {
  background: string;
  card: string;
  cardPressed: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  inverseText: string;
};

const light: Theme = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  cardPressed: '#F5F5F5',
  foreground: '#0A0A0A',
  muted: '#F5F5F5',
  mutedForeground: '#737373',
  border: '#E5E5E5',
  inverseText: '#FAFAFA',
};

const dark: Theme = {
  background: '#0A0A0A',
  card: '#171717',
  cardPressed: '#262626',
  foreground: '#FAFAFA',
  muted: '#171717',
  mutedForeground: '#A1A1A1',
  border: '#262626',
  inverseText: '#0A0A0A',
};

export const themes = { light, dark };

/** One radius scale, applied without exception. */
export const radius = { chip: 999, card: 16, tile: 12, input: 12 } as const;

/** 4pt spacing rhythm. */
export const space = (n: number) => n * 4;

/** Swatches for the `color` prop. Ink first, so the default reads as the default. */
export const SWATCHES = [
  '#0A0A0A',
  '#737373',
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#D97706',
] as const;

/** Swatches for `secondaryColor`, shown only for the two-tone styles. */
export const ACCENT_SWATCHES = [
  '#DDDDDD',
  '#A1A1A1',
  '#BFDBFE',
  '#BBF7D0',
  '#FECACA',
  '#FDE68A',
] as const;

export const SIZES = [20, 24, 32, 40] as const;
