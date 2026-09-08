"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Scrubber } from "@/components/ui/scrubber";
import { Switch } from "@/components/ui/switch";
import { EASING_PRESETS } from "@/lib/editor/animation-engine";
import { type MotionPreset } from "@/lib/editor/motion-presets";
import type { PathAnimationOverride } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Section } from "../components/Section";
import type { CustomizationSectionProps } from "../types";
import { BezierEditor } from "./bezier-editor";

gsap.registerPlugin(MotionPathPlugin, useGSAP);

type EasingId = (typeof EASING_PRESETS)[number]["id"];

const EASING_SIMPLE = EASING_PRESETS.filter(
  (e) => e.id === "ease-in" || e.id === "ease-out" || e.id === "ease-in-out" || e.id === "custom",
);

const INTERACTION_MODES = [
  { id: "animate", label: "Animate" },
  { id: "hover", label: "Hover" },
  { id: "loading", label: "Loading" },
  { id: "success", label: "Success" },
  { id: "error", label: "Error" },
] as const;

type InteractionMode = (typeof INTERACTION_MODES)[number]["id"];

const MODE_DEFAULTS: Record<
  InteractionMode,
  Partial<{ loop: boolean; trigger: PathAnimationOverride["trigger"]; animationType: string }>
> = {
  animate: { loop: false, trigger: "auto" },
  hover: { loop: false, trigger: "hover" },
  loading: { loop: true, trigger: "auto" },
  success: { loop: false, trigger: "once", animationType: "draw" },
  error: { loop: false, trigger: "once", animationType: "shake" },
};

const ALLOWED_ANIMATIONS: Record<
  string,
  ReadonlyArray<"draw" | "stroke" | "bounce" | "shake" | "jump">
> = {
  normal: ["draw", "stroke", "bounce", "shake", "jump"],
  duotone: ["draw", "stroke", "bounce", "shake", "jump"],
  fill: ["bounce", "shake", "jump"],
  pixelated: [],
  glass: [],
};

const EASING_CUBIC: Record<string, [number, number, number, number]> = {
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
  custom: [0.34, 1.56, 0.64, 1],
};

function easingCurvePoints(id: string, value: string): [number, number, number, number] {
  if (EASING_CUBIC[id]) return EASING_CUBIC[id];
  const m = value.match(
    /cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/,
  );
  if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
  return [0.42, 0, 0.58, 1];
}

function EasingCurve({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const S = 48; // total svg size
  const PAD = 6; // padding inside
  const I = S - PAD * 2; // inner size

  const toSvg = (nx: number, ny: number) => ({
    sx: PAD + nx * I,
    sy: PAD + (1 - ny) * I,
  });

  const pts: string[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const mt = 1 - t;
    const nx = mt * mt * mt * 0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * 1;
    const ny = mt * mt * mt * 0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * 1;
    const sx = PAD + nx * I;
    const sy = PAD + (1 - ny) * I;
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }

  const p1 = toSvg(x1, y1);
  const p2 = toSvg(x2, y2);
  const origin = toSvg(0, 0);
  const end = toSvg(1, 1);

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      className="pointer-events-none overflow-visible"
    >
      <g stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5">
        {[0.25, 0.5, 0.75].map((f) => (
          <g key={f}>
            <line x1={PAD + f * I} y1={PAD} x2={PAD + f * I} y2={PAD + I} />
            <line x1={PAD} y1={PAD + f * I} x2={PAD + I} y2={PAD + f * I} />
          </g>
        ))}
      </g>
      <rect
        x={PAD}
        y={PAD}
        width={I}
        height={I}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="0.5"
      />
      <line
        x1={origin.sx}
        y1={origin.sy}
        x2={end.sx}
        y2={end.sy}
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <g stroke="hsl(220 70% 65%)" strokeWidth="0.75" strokeOpacity="0.6">
        <line x1={origin.sx} y1={origin.sy} x2={p1.sx} y2={p1.sy} />
        <line x1={end.sx} y1={end.sy} x2={p2.sx} y2={p2.sy} />
      </g>
      <path
        d={pts.join(" ")}
        fill="none"
        stroke="hsl(220 80% 65%)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx={origin.sx} cy={origin.sy} r={1.5} fill="currentColor" fillOpacity="0.4" />
      <circle cx={end.sx} cy={end.sy} r={1.5} fill="currentColor" fillOpacity="0.4" />
      <circle
        cx={p1.sx}
        cy={p1.sy}
        r={2.5}
        fill="hsl(220 80% 65%)"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.4"
      />
      <circle
        cx={p2.sx}
        cy={p2.sy}
        r={2.5}
        fill="hsl(220 80% 65%)"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

const dashFlow = (reduceMotion: boolean | null) => ({
  animate: { strokeDashoffset: [0, -16] as [number, number] },
  transition: { duration: 1, ease: "linear" as const, repeat: reduceMotion ? 0 : Infinity },
});

function DrawPreview() {
  const reduceMotion = useReducedMotion();
  return (
    <svg width="44" height="44" viewBox="0 0 80 109" fill="none">
      <motion.path
        d="M8.57031 92.6998V16.2633M63.4272 8.67383H15.9989C39.713 8.67375 63.8844 9.32435 65.7129 33.6106C66.4748 42.4649 62.0558 60.2821 38.2845 60.7158M34.2845 66.1368L59.4272 94.3262"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: reduceMotion ? 0 : Infinity,
          repeatType: "reverse",
          repeatDelay: 0.5,
        }}
      />
      <path
        d="M9.14258 92.5732C13.439 92.5732 16.7852 95.8587 16.7852 99.7471C16.7851 103.635 13.439 106.921 9.14258 106.921C4.84631 106.921 1.5001 103.635 1.5 99.7471C1.5 95.8587 4.84624 92.5734 9.14258 92.5732Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M9.14258 1.5C13.439 1.5 16.7852 4.78541 16.7852 8.67383C16.7851 12.5622 13.439 15.8477 9.14258 15.8477C4.84631 15.8475 1.5001 12.5621 1.5 8.67383C1.5 4.78548 4.84624 1.50012 9.14258 1.5Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M70.8574 1.5C75.1539 1.5 78.5 4.78541 78.5 8.67383C78.4999 12.5622 75.1538 15.8477 70.8574 15.8477C66.5612 15.8475 63.2149 12.5621 63.2148 8.67383C63.2148 4.78548 66.5611 1.50012 70.8574 1.5Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M65.1406 92.5732C69.4371 92.5732 72.7832 95.8587 72.7832 99.7471C72.7831 103.635 69.437 106.921 65.1406 106.921C60.8444 106.921 57.4982 103.635 57.498 99.7471C57.498 95.8587 60.8443 92.5734 65.1406 92.5732Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M30.8574 52.458C35.1539 52.458 38.5 55.7434 38.5 59.6318C38.4999 63.5202 35.1538 66.8057 30.8574 66.8057C26.5612 66.8055 23.2149 63.5201 23.2148 59.6318C23.2148 55.7435 26.5611 52.4581 30.8574 52.458Z"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

function StrokePreview() {
  const reduceMotion = useReducedMotion();
  const flow = dashFlow(reduceMotion);
  return (
    <svg width="44" height="44" viewBox="0 0 146 122" fill="none">
      <circle cx="9" cy="113" r="7.5" stroke="currentColor" strokeWidth="3" />
      <circle cx="137" cy="9" r="7.5" stroke="currentColor" strokeWidth="3" />
      <path
        d="M17 113.5C38 117 81.9 112.3 89.5 65.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d="M91.5 60C94 47 91.6303 18.6 128.43 11"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 8"
        animate={flow.animate}
        transition={flow.transition}
      />
    </svg>
  );
}

function ShakePreview() {
  const reduceMotion = useReducedMotion();
  return (
    <svg width="44" height="44" viewBox="0 0 97 109" fill="none" overflow="visible">
      <motion.path
        d="M87.0333 33.1647H81.5165V14.624C81.5165 8.31949 76.3872 3.19052 70.0827 3.19052C66.5166 3.19052 63.3274 4.83247 61.2292 7.39887C59.5949 3.07978 55.4179 0 50.5334 0C45.6147 0 41.4122 3.12214 39.8019 7.48843C37.7032 4.94704 34.5293 3.32473 30.9836 3.32473C24.6791 3.32473 19.5501 8.45371 19.5501 14.7582V14.9019C17.4769 12.8101 14.6043 11.5121 11.4335 11.5121C5.12897 11.5121 0 16.641 0 22.9455V58.5799C0 72.7275 4.83936 86.5745 13.6393 97.6416V107.341C13.6393 108.257 14.3818 108.999 15.2979 108.999C16.2139 108.999 16.9564 108.257 16.9564 107.341V97.058C16.9564 96.6776 16.8255 96.3089 16.5862 96.0134C8.02963 85.4602 3.31708 72.1661 3.31708 58.5796V49.9787C5.39025 52.0705 8.26259 53.3685 11.4335 53.3685C15.6972 53.3685 19.4207 51.021 21.3862 47.5521C23.4255 50.6967 26.9643 52.7829 30.9833 52.7829C35.12 52.7829 38.7504 50.5747 40.758 47.2753C42.7658 50.5742 46.396 52.7819 50.5324 52.7819C51.7281 52.7819 52.8908 52.5974 54.0077 52.2399C56.2061 55.4238 59.8786 57.5156 64.0321 57.5156H67.6023V58.0407H64.2853C52.1853 58.0407 42.3415 67.8848 42.3415 79.9845C42.3415 80.9005 43.084 81.643 44 81.643C44.9161 81.643 45.6586 80.9005 45.6586 79.9845C45.6586 69.7138 54.0146 61.3578 64.2853 61.3578H69.2609C70.1769 61.3578 70.9194 60.6153 70.9194 59.6993V57.5156H80.9538C81.8699 57.5156 82.6124 56.7731 82.6124 55.8571C82.6124 54.941 81.8699 54.1985 80.9538 54.1985H64.0321C59.1474 54.1985 55.1732 50.2244 55.1732 45.3399C55.1732 40.4554 59.1474 36.4812 64.0321 36.4812H87.033C90.2475 36.4812 92.8624 39.0964 92.8624 42.3106V65.4947C92.8624 74.7958 88.3374 83.5674 80.7579 88.9587L80.6836 89.0115C75.1696 92.9339 71.8775 99.3149 71.8775 106.081C71.8775 106.998 72.6201 107.74 73.5361 107.74C74.4521 107.74 75.1946 106.998 75.1946 106.081C75.1946 100.387 77.9652 95.0157 82.6063 91.7144L82.6805 91.6616C91.1332 85.6493 96.1795 75.8675 96.1795 65.4947V42.3106C96.1797 37.2676 92.0768 33.1647 87.0333 33.1647ZM19.5504 41.9355C19.5504 46.411 15.9092 50.0519 11.4337 50.0519C6.95847 50.0519 3.31734 46.4108 3.31734 41.9355V22.9458C3.31734 18.4703 6.95847 14.8294 11.4337 14.8294C15.9092 14.8294 19.5504 18.4703 19.5504 22.9458V41.9355ZM30.9836 49.4663C26.5083 49.4663 22.8672 45.8255 22.8672 41.3499V14.7585C22.8672 10.2829 26.5083 6.64207 30.9836 6.64207C35.4588 6.64207 39.0999 10.2829 39.0999 14.7585L39.0989 14.7587V41.3489C39.0989 41.3558 39.0994 41.3625 39.0994 41.3691C39.089 45.8357 35.4524 49.4663 30.9836 49.4663ZM51.8567 45.3404C51.8567 46.6984 52.0835 48.0038 52.4956 49.2244C51.8592 49.3826 51.2035 49.4656 50.5326 49.4656C46.064 49.4656 42.4275 45.8354 42.4163 41.3691C42.4163 41.3627 42.4168 41.3563 42.4168 41.3499V11.4335C42.4168 6.95796 46.0579 3.31708 50.5332 3.31708C55.0084 3.31708 58.6495 6.95796 58.6495 11.4335V34.4229C54.629 36.4134 51.8567 40.5584 51.8567 45.3404ZM61.9666 33.3435V14.624C61.9666 10.1485 65.6078 6.5076 70.0833 6.5076C74.5585 6.5076 78.1996 10.1485 78.1996 14.624V33.1647H64.0329C63.3282 33.1647 62.6387 33.228 61.9666 33.3435Z"
        fill="currentColor"
        style={{ transformBox: "view-box", transformOrigin: "15px 108px" }}
        animate={{ rotate: [-10, 10, -10] }}
        transition={{ duration: 1.6, ease: "easeInOut", repeat: reduceMotion ? 0 : Infinity }}
      />
    </svg>
  );
}

function JumpPreview() {
  const reduceMotion = useReducedMotion();
  const flow = dashFlow(reduceMotion);
  return (
    <svg width="44" height="44" viewBox="0 0 117 102" fill="none">
      <path
        d="M105.599 49.5C100.999 49.5 94.1992 50 94.1992 51.7C94.1992 53.5 101.099 53.9 105.599 53.9C109.899 53.9 115.899 53.3 115.999 51.8C116.399 50.3 111.599 49.5 105.599 49.5Z"
        fill="currentColor"
      />
      <path
        d="M16.5 97C8.1 97 0 97.6 0 99.3C0 101 8.5 101.7 16.5 101.7C24.5 101.7 33.8 101.2 33.8 99.4C33.8 97.8 27.5 97 16.5 97Z"
        fill="currentColor"
      />
      <circle cx="16" cy="84.9023" r="7.5" stroke="currentColor" strokeWidth="3" />
      <circle cx="104" cy="33.9023" r="7.5" stroke="currentColor" strokeWidth="3" />
      <motion.path
        d="M20 75.8982C22.5 62.8982 75 -46.0977 102 25.8982"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 8"
        animate={flow.animate}
        transition={flow.transition}
      />
    </svg>
  );
}

function BouncePreview() {
  const reduceMotion = useReducedMotion();
  const circleRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const circle = circleRef.current;
    const path = pathRef.current;
    if (!circle || !path) return;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    if (reduceMotion) {
      gsap.set(path, { strokeDashoffset: 0 });
      return;
    }
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(
      circle,
      {
        motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
        duration: 3,
        ease: "power1.inOut",
      },
      0,
    );
    tl.to(path, { strokeDashoffset: 0, duration: 3, ease: "power1.inOut" }, 0);
  }, [reduceMotion]);

  return (
    <svg width="44" height="44" viewBox="0 0 124 86" fill="none" overflow="visible">
      <path
        ref={pathRef}
        d="M1.5 84.5002C2.16667 70.5002 9 41.9002 31 39.5002C58.5 36.5002 69.5 76.0002 70 83.0002C70.5 90.0002 68.5 21 101.5 11"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle ref={circleRef} cx="114.5" cy="9" r="7.5" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export function MotionSection({ state, onChange, pathCount = 0 }: CustomizationSectionProps) {
  const motionState = state.motion;
  const isEnabled = motionState?.enabled ?? false;
  const perPathOverrides = (motionState?.perPathAnimations ?? {}) as Record<
    string,
    PathAnimationOverride
  >;
  const isPaused = motionState?.isPaused ?? false;
  const scrubProgress = motionState?.scrubProgress ?? null;
  const interactionMode = (motionState?.interactionMode ?? "animate") as InteractionMode;

  const buildMotionState = useCallback(
    (updates: Partial<typeof state.motion>) => ({
      enabled: motionState?.enabled ?? false,
      animationType: motionState?.animationType ?? "draw",
      duration: motionState?.duration ?? 2,
      delay: motionState?.delay ?? 0.12,
      easingId: motionState?.easingId ?? "ease-in-out",
      customCubic: motionState?.customCubic ?? "cubic-bezier(0.34, 1.56, 0.64, 1)",
      loop: motionState?.loop ?? true,
      replayNonce: motionState?.replayNonce ?? 0,
      pathTrimStart: motionState?.pathTrimStart ?? 0,
      pathTrimEnd: motionState?.pathTrimEnd ?? 100,
      pathSequential: motionState?.pathSequential ?? false,
      pathStaggerDelay: motionState?.pathStaggerDelay ?? 0.12,
      pathReverse: motionState?.pathReverse ?? false,
      selectedPathIndex: motionState?.selectedPathIndex ?? -1,
      perPathAnimations: (motionState?.perPathAnimations ?? {}) as Record<
        string,
        PathAnimationOverride
      >,
      isPaused: motionState?.isPaused ?? false,
      scrubProgress: motionState?.scrubProgress ?? null,
      presetId: motionState?.presetId ?? null,
      interactionMode: (motionState?.interactionMode ?? "animate") as InteractionMode,
      trigger: (motionState?.trigger ?? "auto") as "auto" | "hover" | "click" | "once",
      autoReverse: motionState?.autoReverse ?? false,
      ...updates,
    }),
    [motionState],
  );

  const handleGlobalChange = (updates: Partial<typeof state.motion>) => {
    onChange({ motion: buildMotionState(updates) });
  };

  const applyPreset = (preset: MotionPreset) => {
    const modeDefaults = MODE_DEFAULTS[preset.interactionMode] ?? {};
    const perPath = preset.buildPerPath?.(pathCount) ?? {};
    handleGlobalChange({
      ...preset.config,
      ...modeDefaults,
      presetId: preset.id,
      interactionMode: preset.interactionMode,
      perPathAnimations: perPath,
      selectedPathIndex: -1,
      isPaused: false,
      scrubProgress: null,
      replayNonce: (motionState?.replayNonce ?? 0) + 1,
    });
  };

  const handleInteractionModeChange = (mode: InteractionMode) => {
    const defaults = MODE_DEFAULTS[mode];
    handleGlobalChange({
      interactionMode: mode,
      ...defaults,
      presetId: null,
    });
  };

  const currentEasingId = (motionState?.easingId ?? "ease-in-out") as EasingId;
  const isCustomEasing = currentEasingId === "custom";

  const ANIM_TYPES = [
    { type: "draw" as const, label: "Draw", preview: <DrawPreview /> },
    { type: "stroke" as const, label: "Stroke", preview: <StrokePreview /> },
    { type: "bounce" as const, label: "Bounce", preview: <BouncePreview /> },
    { type: "shake" as const, label: "Shake", preview: <ShakePreview /> },
    { type: "jump" as const, label: "Jump", preview: <JumpPreview /> },
  ] as const;

  const allowedAnims =
    pathCount === 0
      ? (["bounce", "shake", "jump"] as const)
      : (ALLOWED_ANIMATIONS[state.iconType] ?? ALLOWED_ANIMATIONS.normal);
  const visibleAnimTypes = ANIM_TYPES.filter((a) => allowedAnims.includes(a.type));

  useEffect(() => {
    const current = motionState?.animationType ?? "draw";
    if (
      allowedAnims.length > 0 &&
      !allowedAnims.includes(current as (typeof allowedAnims)[number])
    ) {
      handleGlobalChange({ animationType: allowedAnims[0], presetId: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.iconType]);

  return (
    <Section
      title="Animation"
      headerAction={
        <div className="flex items-center gap-1.5">
          {isEnabled && (
            <>
              <button
                type="button"
                aria-label={`Loop ${motionState?.loop ? "on" : "off"}`}
                aria-pressed={motionState?.loop ?? false}
                onClick={() => handleGlobalChange({ loop: !motionState?.loop })}
                className={cn(
                  "flex h-5 items-center gap-1 rounded px-1.5 text-[9px] tracking-widest uppercase transition-colors",
                  motionState?.loop
                    ? "text-foreground"
                    : "text-foreground/30 hover:text-foreground/55",
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    motionState?.loop ? "bg-foreground" : "bg-foreground/20",
                  )}
                  aria-hidden="true"
                />
                Loop
              </button>
              <button
                type="button"
                aria-label={isPaused ? "Push and play animation" : "Pause animation"}
                title={isPaused ? "Push & Play" : "Pause"}
                onClick={() => handleGlobalChange({ isPaused: !isPaused, scrubProgress: null })}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md transition-all active:scale-90",
                  isPaused
                    ? "bg-foreground/8 text-foreground hover:bg-foreground/15"
                    : "text-foreground/40 hover:bg-muted/15 hover:text-foreground",
                )}
              >
                {isPaused ? (
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                aria-label="Reset animation"
                title="Reset"
                onClick={() =>
                  handleGlobalChange({
                    replayNonce: (motionState?.replayNonce ?? 0) + 1,
                    isPaused: false,
                    scrubProgress: null,
                    selectedPathIndex: -1,
                  })
                }
                className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/40 transition-all hover:bg-muted/15 hover:text-foreground"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </button>
            </>
          )}
          <Switch
            checked={isEnabled}
            onCheckedChange={(v) =>
              handleGlobalChange(
                v ? { enabled: true, isPaused: false, scrubProgress: null } : { enabled: false },
              )
            }
          />
        </div>
      }
    >
      <style>{`
        .motion-preview-line-base { stroke-dasharray: 1; stroke-dashoffset: 1; }
        .motion-preview-line-draw { animation: motion-preview-line-draw 1.2s ease-in-out infinite both; }
        @keyframes motion-preview-line-draw { 0% { stroke-dashoffset: 1; opacity: 0.2; } 70% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 1; } }

        @keyframes mta-draw { 0%,10% { stroke-dashoffset: 56; } 75% { stroke-dashoffset: 0; } 90%,100% { stroke-dashoffset: 0; } }
        @keyframes mta-draw-dot {
          0%,10% { transform: translate(0px, 0px); }
          25%    { transform: translate(6px, -10px); }
          50%    { transform: translate(12px, -16px); }
          75%    { transform: translate(18px, -10px); }
          90%,100% { transform: translate(24px, 0px); }
        }
        @keyframes mta-stroke {
          0%,100% { stroke-width: 1; opacity: 0.35; }
          50%     { stroke-width: 4; opacity: 1; }
        }
        @keyframes mta-bounce {
          0%,15%  { transform: translateY(-8px) scaleX(0.9) scaleY(1.15); }
          45%     { transform: translateY(6px) scaleX(1.35) scaleY(0.55); }
          60%     { transform: translateY(-4px) scaleX(0.95) scaleY(1.1); }
          80%     { transform: translateY(6px) scaleX(1.2) scaleY(0.65); }
          100%    { transform: translateY(-8px) scaleX(0.9) scaleY(1.15); }
        }
        @keyframes mta-bounce-shadow {
          0%,15%  { transform: scaleX(0.5); opacity: 0.1; }
          45%     { transform: scaleX(1.4); opacity: 0.35; }
          80%     { transform: scaleX(1.2); opacity: 0.28; }
          100%    { transform: scaleX(0.5); opacity: 0.1; }
        }
        @keyframes mta-shake {
          0%,100% { transform: translateX(0) rotate(0deg); }
          15%     { transform: translateX(-6px) rotate(-4deg); }
          30%     { transform: translateX(6px) rotate(4deg); }
          45%     { transform: translateX(-4px) rotate(-2deg); }
          60%     { transform: translateX(4px) rotate(2deg); }
          75%     { transform: translateX(-2px); }
        }
        @keyframes mta-shake-trail-l {
          0%,50%,100% { opacity: 0; }
          20%          { opacity: 0.4; }
        }
        @keyframes mta-shake-trail-r {
          0%,50%,100% { opacity: 0; }
          40%          { opacity: 0.4; }
        }
        @keyframes mta-jump {
          0%,5%   { transform: translateY(0) scaleX(1.3) scaleY(0.6); }
          15%     { transform: translateY(-18px) scaleX(0.85) scaleY(1.2); }
          45%     { transform: translateY(-20px) scaleX(0.85) scaleY(1.2); }
          75%     { transform: translateY(-8px) scaleX(0.9) scaleY(1.1); }
          90%,100%{ transform: translateY(0) scaleX(1.3) scaleY(0.6); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-preview-line-draw, .motion-preview-line-base { animation: none !important; }
        }
      `}</style>

      <AnimatePresence initial={false}>
        {isEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-1 pb-2">
              {allowedAnims.length === 0 ? null : (
                <>
                  <div
                    className={cn(
                      "flex px-1 pt-0.5",
                      visibleAnimTypes.length > 3 ? "justify-between" : "justify-start gap-7",
                    )}
                  >
                    {visibleAnimTypes.map(({ type, label, preview }) => {
                      const isActive = (motionState?.animationType ?? "draw") === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            handleGlobalChange({ animationType: type, presetId: null })
                          }
                          className={cn(
                            "flex flex-col items-center gap-2 transition-all",
                            isActive ? "opacity-100" : "opacity-30 hover:opacity-60",
                          )}
                        >
                          {preview}
                          <div
                            className={cn(
                              "h-0.5 rounded-full transition-all duration-300",
                              isActive ? "w-5 bg-foreground" : "w-1.5 bg-foreground/15",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[8px] tracking-widest uppercase transition-colors",
                              isActive ? "text-foreground/70" : "text-foreground/40",
                            )}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3 px-1">
                    <Scrubber
                      label="Duration"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={motionState?.duration ?? 2}
                      onChange={(val) =>
                        handleGlobalChange({ duration: Math.round(val * 10) / 10, presetId: null })
                      }
                      showInput={false}
                      rightSlot={
                        <span className="text-[10px] tracking-widest text-foreground/70 uppercase">
                          {(motionState?.duration ?? 2).toFixed(1)}s
                        </span>
                      }
                    />
                    <div className="flex w-full items-center justify-between px-2">
                      <span className="ml-1 text-[10px] tracking-widest text-foreground/70 uppercase select-none">
                        Loop
                      </span>
                      <Switch
                        checked={motionState?.loop ?? true}
                        onCheckedChange={(v) => handleGlobalChange({ loop: v, presetId: null })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="px-1">
                        <span className="text-[10px] tracking-widest text-foreground/35 uppercase">
                          Easing
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 px-1">
                        {EASING_SIMPLE.map((e) => {
                          const isActive = currentEasingId === e.id;
                          const [cx1, cy1, cx2, cy2] = easingCurvePoints(e.id, e.value);
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => handleGlobalChange({ easingId: e.id, presetId: null })}
                              className={cn(
                                "flex h-20 flex-col items-center justify-center gap-1 rounded-sm transition-all",
                                isActive
                                  ? "bg-foreground text-background"
                                  : "text-foreground/35 hover:bg-muted/10 hover:text-foreground/70",
                              )}
                            >
                              <EasingCurve x1={cx1} y1={cy1} x2={cx2} y2={cy2} />
                              <span className="text-[8px] tracking-tighter uppercase">
                                {e.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {isCustomEasing && (
                        <BezierEditor
                          value={motionState?.customCubic ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"}
                          onChange={(v) =>
                            handleGlobalChange({
                              customCubic: v,
                              easingId: "custom",
                              presetId: null,
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
