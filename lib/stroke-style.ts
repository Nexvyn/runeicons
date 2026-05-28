export type StrokeStyle = "round" | "sharp" | "soft" | "medium";

export const STROKE_STYLE_MAP = {
  round: { strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 2 },
  sharp: { strokeLinecap: "butt" as const, strokeLinejoin: "miter" as const, strokeWidth: 2 },
  soft: { strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.5 },
  medium: { strokeLinecap: "round" as const, strokeLinejoin: "bevel" as const, strokeWidth: 2 },
} as const;
