/**
 * Creem product routing for sponsor amounts.
 *
 * Presets ($5 / $20 / $100) map to dedicated products with units=1
 * so per-tier sales are visible in the Creem dashboard.
 *
 * Anything else (Custom) routes to a $1 base product where the
 * total charge is determined by `units = amount`.
 */

const PRESETS: Record<number, string | undefined> = {
  5: process.env.NEXT_PUBLIC_CREEM_PRODUCT_5,
  20: process.env.NEXT_PUBLIC_CREEM_PRODUCT_20,
  100: process.env.NEXT_PUBLIC_CREEM_PRODUCT_100,
};

const CUSTOM_PRODUCT_ID = process.env.NEXT_PUBLIC_CREEM_PRODUCT_CUSTOM ?? "";

export interface CheckoutTarget {
  productId: string;
  units: number;
}

export function getCheckoutForAmount(amount: number): CheckoutTarget | null {
  if (!Number.isFinite(amount) || amount < 1) return null;

  const preset = PRESETS[amount];
  if (preset) return { productId: preset, units: 1 };

  if (!CUSTOM_PRODUCT_ID) return null;
  return { productId: CUSTOM_PRODUCT_ID, units: Math.floor(amount) };
}
