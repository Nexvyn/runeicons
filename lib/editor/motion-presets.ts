import type { PathAnimationOverride } from "@/lib/types";

type MotionConfig = {
  animationType: string;
  duration: number;
  delay: number;
  easingId: string;
  loop: boolean;
  pathSequential: boolean;
  pathStaggerDelay: number;
  pathReverse: boolean;
  pathTrimStart: number;
  pathTrimEnd: number;
};

export interface MotionPreset {
  id: string;
  name: string;
  category: "reveal" | "attention" | "hover" | "loading";
  description: string;
  icon: string;
  interactionMode: "animate" | "hover" | "loading" | "success" | "error";
  config: Partial<MotionConfig>;
  buildPerPath?: (pathCount: number) => Record<string, PathAnimationOverride>;
}

export const MOTION_PRESETS: MotionPreset[] = [

  {
    id: "draw-in",
    name: "Draw In",
    category: "reveal",
    description: "Each path draws in smoothly",
    icon: "✏️",
    interactionMode: "animate",
    config: {
      animationType: "draw",
      duration: 1.2,
      delay: 0,
      easingId: "ease-in-out",
      loop: false,
      pathSequential: true,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "elastic-draw",
    name: "Elastic Draw",
    category: "reveal",
    description: "Draw with elastic overshoot bounce",
    icon: "🎯",
    interactionMode: "animate",
    config: {
      animationType: "draw",
      duration: 1.4,
      delay: 0,
      easingId: "elastic-out",
      loop: false,
      pathSequential: true,
      pathStaggerDelay: 0.1,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "stroke-reveal",
    name: "Stroke Reveal",
    category: "reveal",
    description: "Stroke draws then fill fades in",
    icon: "🖌️",
    interactionMode: "animate",
    config: {
      animationType: "stroke",
      duration: 1.0,
      delay: 0,
      easingId: "expo-out",
      loop: false,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "fade-stroke",
    name: "Quick Stroke",
    category: "reveal",
    description: "Fast stroke reveal with fill",
    icon: "⚡",
    interactionMode: "animate",
    config: {
      animationType: "stroke",
      duration: 0.6,
      delay: 0,
      easingId: "circ-out",
      loop: false,
      pathSequential: false,
      pathStaggerDelay: 0.05,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "cascade-draw",
    name: "Cascade",
    category: "reveal",
    description: "Paths cascade in one by one",
    icon: "🌊",
    interactionMode: "animate",
    config: {
      animationType: "draw",
      duration: 0.8,
      delay: 0,
      easingId: "power2-out",
      loop: false,
      pathSequential: true,
      pathStaggerDelay: 0.15,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "wave-draw",
    name: "Wave",
    category: "reveal",
    description: "Paths animate in a flowing wave",
    icon: "〰️",
    interactionMode: "animate",
    config: {
      animationType: "draw",
      duration: 0.9,
      delay: 0,
      easingId: "back-soft",
      loop: false,
      pathSequential: true,
      pathStaggerDelay: 0.12,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },

  {
    id: "bounce-in",
    name: "Bounce In",
    category: "attention",
    description: "Icon bounces in with spring",
    icon: "🏀",
    interactionMode: "animate",
    config: {
      animationType: "bounce",
      duration: 0.7,
      delay: 0,
      easingId: "back-soft",
      loop: false,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "attention-shake",
    name: "Attention Shake",
    category: "attention",
    description: "Quick shake to grab attention",
    icon: "🔔",
    interactionMode: "animate",
    config: {
      animationType: "shake",
      duration: 0.5,
      delay: 0,
      easingId: "power2-out",
      loop: false,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "heartbeat",
    name: "Heartbeat",
    category: "attention",
    description: "Continuous rhythmic pulse",
    icon: "💓",
    interactionMode: "loading",
    config: {
      animationType: "bounce",
      duration: 0.8,
      delay: 0,
      easingId: "ease-in-out",
      loop: true,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },

  {
    id: "pulse-loop",
    name: "Pulse Loop",
    category: "loading",
    description: "Continuous drawing loop",
    icon: "🔄",
    interactionMode: "loading",
    config: {
      animationType: "draw",
      duration: 1.5,
      delay: 0,
      easingId: "ease-in-out",
      loop: true,
      pathSequential: true,
      pathStaggerDelay: 0.1,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "spin-draw",
    name: "Spin Draw",
    category: "loading",
    description: "Draw in with jump spin loop",
    icon: "🌀",
    interactionMode: "loading",
    config: {
      animationType: "jump",
      duration: 1.0,
      delay: 0,
      easingId: "expo-out",
      loop: true,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "success-draw",
    name: "Success",
    category: "loading",
    description: "Single draw-in for confirmation",
    icon: "✅",
    interactionMode: "success",
    config: {
      animationType: "draw",
      duration: 0.8,
      delay: 0,
      easingId: "circ-out",
      loop: false,
      pathSequential: true,
      pathStaggerDelay: 0.06,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },

  {
    id: "hover-draw",
    name: "Hover Draw",
    category: "hover",
    description: "Draws on hover, erases on leave",
    icon: "👆",
    interactionMode: "hover",
    config: {
      animationType: "draw",
      duration: 0.6,
      delay: 0,
      easingId: "expo-out",
      loop: false,
      pathSequential: true,
      pathStaggerDelay: 0.06,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "hover-bounce",
    name: "Hover Bounce",
    category: "hover",
    description: "Bounces when hovered",
    icon: "🖱️",
    interactionMode: "hover",
    config: {
      animationType: "bounce",
      duration: 0.5,
      delay: 0,
      easingId: "back-soft",
      loop: false,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
  {
    id: "magnetic-hover",
    name: "Magnetic",
    category: "hover",
    description: "Subtle shake on hover",
    icon: "🧲",
    interactionMode: "hover",
    config: {
      animationType: "shake",
      duration: 0.3,
      delay: 0,
      easingId: "anticipate",
      loop: false,
      pathSequential: false,
      pathStaggerDelay: 0.08,
      pathReverse: false,
      pathTrimStart: 0,
      pathTrimEnd: 100,
    },
  },
];

export const PRESET_CATEGORIES: { id: MotionPreset["category"]; label: string }[] = [
  { id: "reveal", label: "Reveal" },
  { id: "attention", label: "Attention" },
  { id: "loading", label: "Loading" },
  { id: "hover", label: "Hover" },
];

export function getPresetById(id: string): MotionPreset | undefined {
  return MOTION_PRESETS.find((p) => p.id === id);
}

export function getPresetsByInteractionMode(mode: string): MotionPreset[] {
  const modeToCategory: Record<string, MotionPreset["category"][]> = {
    animate: ["reveal"],
    hover: ["hover"],
    loading: ["loading"],
    success: ["loading"],
    error: ["attention"],
  };
  const categories = modeToCategory[mode] ?? ["reveal"];
  return MOTION_PRESETS.filter((p) => categories.includes(p.category));
}

export const FEEL_PRESETS = [
  { id: "subtle", label: "Subtle", duration: 0.4, easingId: "ease-out", stagger: 0.04 },
  { id: "natural", label: "Natural", duration: 0.8, easingId: "expo-out", stagger: 0.08 },
  { id: "energetic", label: "Energetic", duration: 0.5, easingId: "back-soft", stagger: 0.06 },
  { id: "playful", label: "Playful", duration: 1.2, easingId: "elastic-out", stagger: 0.12 },
] as const;

export type FeelPresetId = (typeof FEEL_PRESETS)[number]["id"];
