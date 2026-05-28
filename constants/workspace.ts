import { CustomizationState, IconData } from "@/lib/types";
import { getIconDataById } from "@/lib/icons";

export const MAX_TRAY_ITEMS = 6;

export const DEFAULT_STATE: CustomizationState = {
  colors: ["", ""],
  numColors: 2,
  scale: 1,
  blur: 0,
  motion: {
    enabled: false,
    animationType: "draw",
    duration: 2,
    delay: 0.12,
    easingId: "ease-in-out",
    customCubic: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    loop: true,
    replayNonce: 0,
    pathTrimStart: 0,
    pathTrimEnd: 100,
    pathSequential: false,
    pathStaggerDelay: 0.12,
    pathReverse: false,
    isPaused: false,
    scrubProgress: null,
    presetId: null,
    interactionMode: "animate" as const,
    trigger: "auto" as const,
    autoReverse: false,
  },
  translateX: 0,
  translateY: 0,
  padding: 4,
  cornerRadius: 12,
  backgroundColor: "transparent",
  flipH: false,
  flipV: false,
  rotation: 0,
  width: 128,
  height: 128,
  lockAspect: true,
  iconGradient: false,
  shadow: {
    enabled: false,
    opacity: 0,
    blur: 10,
    offsetX: 0,
    offsetY: 4,
    inner: false,
  },
  noise: {
    enabled: false,
    intensity: 20,
  },
  texture: {
    enabled: false,
    selected: "none",
    opacity: 50,
  },
  gradient: {
    type: "linear",
    angle: 135,
    stops: [
      { color: "#6366f1", position: 0 },
      { color: "#a855f7", position: 50 },
      { color: "#ec4899", position: 100 },
    ],
    target: "stroke" as const,
    spreadMethod: "pad" as const,
    cx: 50,
    cy: 50,
    r: 50,
  },
  customIcons: [],
  iconType: "normal",
  strokeStyle: "round",
};

const DEFAULT_PLUS = getIconDataById("indicators-plus", "normal");
export const DEFAULT_TRAY_ICONS: IconData[] = DEFAULT_PLUS
  ? [{ ...DEFAULT_PLUS, iconType: "normal" }]
  : [];
