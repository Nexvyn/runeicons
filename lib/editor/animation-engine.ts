export const ANIMATION_TYPES = [
  { id: "draw", label: "Draw" },
  { id: "stroke", label: "Stroke" },
  { id: "bounce", label: "Bounce" },
  { id: "shake", label: "Shake" },
  { id: "jump", label: "Jump" },
] as const;

export const EASING_PRESETS = [
  { id: "linear", label: "Linear", value: "linear" },
  { id: "ease-in", label: "Ease In", value: "ease-in" },
  { id: "ease-out", label: "Ease Out", value: "ease-out" },
  { id: "ease-in-out", label: "Ease In Out", value: "ease-in-out" },
  { id: "back-soft", label: "Back Soft", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  { id: "power2-out", label: "Power2 Out", value: "cubic-bezier(0.25, 1, 0.5, 1)" },
  { id: "expo-out", label: "Expo Out", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { id: "elastic-out", label: "Elastic Out", value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" },
  { id: "circ-out", label: "Circ Out", value: "cubic-bezier(0, 0.55, 0.45, 1)" },
  { id: "back-in", label: "Back In", value: "cubic-bezier(0.6, -0.28, 0.735, 0.045)" },
  { id: "anticipate", label: "Anticipate", value: "cubic-bezier(0.36, -0.64, 0.64, 1.36)" },
  { id: "custom", label: "Custom", value: "custom" },
] as const;

export function resolveAnimationType(type?: string): string {
  if (!type) return "draw";
  const found = ANIMATION_TYPES.find((t) => t.id === type);
  return found ? (found.id as string) : "draw";
}

export function resolveEasingValue(easingId?: string, customCubic?: string): string {
  if (easingId === "custom" && customCubic) return customCubic;
  const found = EASING_PRESETS.find((e) => e.id === (easingId || "ease-in-out"));
  if (found && found.value !== "custom") return found.value;
  return "cubic-bezier(0.34, 1.56, 0.64, 1)";
}
