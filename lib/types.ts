import type { LucideIcon } from "lucide-react";
import type { IconType } from "./icons";
import type { EASING_PRESETS } from "./editor/animation-engine";

export interface PathAnimationOverride {
  delay?: number;
  duration?: number;
  easingId?: string;
  customCubic?: string;
  pathTrimStart?: number;
  pathTrimEnd?: number;
  pathReverse?: boolean;
  loop?: boolean;
  fillTransition?: boolean;
  fillDelay?: number;
  trigger?: "auto" | "once" | "hover" | "click";
  scrubProgress?: number | null;
  enabled?: boolean;
  hidden?: boolean;
  animationType?: string;
}

export interface CustomizationState {
  colors: string[];
  numColors: number;
  scale: number;
  blur: number;
  motion: {
    enabled: boolean;
    animationType: string;
    duration: number;
    delay: number;
    easingId: string;
    customCubic: string;
    loop: boolean;
    replayNonce: number;
    pathTrimStart: number;
    pathTrimEnd: number;
    pathSequential: boolean;
    pathStaggerDelay: number;
    pathReverse: boolean;
    isPaused: boolean;
    scrubProgress: number | null;
    presetId: string | null;
    interactionMode: "animate" | "hover" | "loading" | "success" | "error";
    trigger: "auto" | "hover" | "click" | "once";
    autoReverse?: boolean;
    selectedPathIndex?: number;
    perPathAnimations?: Record<string, PathAnimationOverride>;
  };
  translateX: number;
  translateY: number;
  padding: number;
  cornerRadius: number;
  backgroundColor: string;
  flipH: boolean;
  flipV: boolean;
  rotation: number;
  width: number;
  height: number;
  lockAspect: boolean;
  iconGradient: boolean;
  shadow: {
    enabled: boolean;
    opacity: number;
    blur: number;
    offsetX: number;
    offsetY: number;
    inner: boolean;
  };
  noise: {
    enabled: boolean;
    intensity: number;
  };
  texture: {
    enabled: boolean;
    selected: string;
    opacity: number;
  };
  gradient: {
    type: "linear" | "radial" | "angular";
    angle: number;
    stops: Array<{ color: string; position: number }>;
    target: "stroke" | "fill" | "both";
    spreadMethod: "pad" | "repeat" | "reflect";
    cx: number;
    cy: number;
    r: number;
  };
  customIcons: Array<{ id: string; name: string; url: string }>;
  iconType: "normal" | "duotone" | "fill" | "pixelated" | "glass";
  strokeStyle: "round" | "sharp" | "soft" | "medium";
}

export interface IconData {
  id: string;
  name: string;
  icon?: LucideIcon;
  url?: string;
  category: IconCategory;
  tags: string[];
  iconType?: IconType;
}

export type IconCategory =
  | "all"
  | "outline"
  | "filled"
  | "duotone"
  | "brand"
  | "custom"
  | "action"
  | "shapes"
  | "emojis"
  | "food"
  | "accessibility"
  | "commerce"
  | "communication"
  | "dev"
  | "hardware"
  | "files"
  | "finance"
  | "layout"
  | "location"
  | "media"
  | "metrics"
  | "misc"
  | "navigation"
  | "feedback"
  | "system"
  | "time"
  | "users"
  | "weather";
export type Collection = "all" | "favorites" | "recent";

