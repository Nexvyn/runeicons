"use client";

import { useCallback, useMemo } from "react";

import { EASING_PRESETS } from "@/lib/editor/animation-engine";
import { computeTotalDuration } from "@/lib/editor/path-animation";
import { type MotionPreset } from "@/lib/editor/motion-presets";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Scrubber } from "@/components/ui/scrubber";
import { Switch } from "@/components/ui/switch";

import type { CustomizationSectionProps } from "../types";
import type { PathAnimationOverride } from "@/lib/types";
import { BezierEditor } from "./bezier-editor";
import { Section } from "../components/Section";

type EasingId = (typeof EASING_PRESETS)[number]["id"];

const EASING_SIMPLE = EASING_PRESETS.filter((e) => e.id === "ease-in" || e.id === "ease-out" || e.id === "ease-in-out" || e.id === "custom");

const INTERACTION_MODES = [
  { id: "animate", label: "Animate" },
  { id: "hover", label: "Hover" },
  { id: "loading", label: "Loading" },
  { id: "success", label: "Success" },
  { id: "error", label: "Error" },
] as const;

type InteractionMode = (typeof INTERACTION_MODES)[number]["id"];

const MODE_DEFAULTS: Record<InteractionMode, Partial<{ loop: boolean; trigger: PathAnimationOverride["trigger"]; animationType: string }>> = {
  animate: { loop: false, trigger: "auto" },
  hover: { loop: false, trigger: "hover" },
  loading: { loop: true, trigger: "auto" },
  success: { loop: false, trigger: "once", animationType: "draw" },
  error: { loop: false, trigger: "once", animationType: "shake" },
};

function pathColor(i: number): string {
  return `hsl(${(i * 137) % 360}deg 65% 55%)`;
}

const EASING_CUBIC: Record<string, [number, number, number, number]> = {
  "ease-in":     [0.42, 0, 1, 1],
  "ease-out":    [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  "linear":      [0, 0, 1, 1],
  "custom":      [0.34, 1.56, 0.64, 1],
};

function easingCurvePoints(id: string, value: string): [number, number, number, number] {
  if (EASING_CUBIC[id]) return EASING_CUBIC[id];
  const m = value.match(/cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/);
  if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
  return [0.42, 0, 0.58, 1];
}

function EasingCurve({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const S = 48;   // total svg size
  const PAD = 6;  // padding inside
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
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="pointer-events-none overflow-visible">
      <g stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5">
        {[0.25, 0.5, 0.75].map((f) => (
          <g key={f}>
            <line x1={PAD + f * I} y1={PAD} x2={PAD + f * I} y2={PAD + I} />
            <line x1={PAD} y1={PAD + f * I} x2={PAD + I} y2={PAD + f * I} />
          </g>
        ))}
      </g>
      <rect x={PAD} y={PAD} width={I} height={I} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
      <line x1={origin.sx} y1={origin.sy} x2={end.sx} y2={end.sy} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="2 2" />
      <g stroke="hsl(220 70% 65%)" strokeWidth="0.75" strokeOpacity="0.6">
        <line x1={origin.sx} y1={origin.sy} x2={p1.sx} y2={p1.sy} />
        <line x1={end.sx} y1={end.sy} x2={p2.sx} y2={p2.sy} />
      </g>
      <path d={pts.join(" ")} fill="none" stroke="hsl(220 80% 65%)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={origin.sx} cy={origin.sy} r={1.5} fill="currentColor" fillOpacity="0.4" />
      <circle cx={end.sx} cy={end.sy} r={1.5} fill="currentColor" fillOpacity="0.4" />
      <circle cx={p1.sx} cy={p1.sy} r={2.5} fill="hsl(220 80% 65%)" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
      <circle cx={p2.sx} cy={p2.sy} r={2.5} fill="hsl(220 80% 65%)" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
    </svg>
  );
}



export function MotionSection({ state, onChange, pathCount = 0 }: CustomizationSectionProps) {
  const motionState = state.motion;
  const isEnabled = motionState?.enabled ?? false;
  const selectedPathIdx = motionState?.selectedPathIndex ?? -1;
  const perPathOverrides = (motionState?.perPathAnimations ?? {}) as Record<string, PathAnimationOverride>;
  const isPaused = motionState?.isPaused ?? false;
  const scrubProgress = motionState?.scrubProgress ?? null;
  const interactionMode = (motionState?.interactionMode ?? "animate") as InteractionMode;
  const isPathAnim = (motionState?.animationType ?? "draw") === "draw" || motionState?.animationType === "stroke";

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
      perPathAnimations: (motionState?.perPathAnimations ?? {}) as Record<string, PathAnimationOverride>,
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

  const handlePathSelect = (index: number) => {
    handleGlobalChange({ selectedPathIndex: index });
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

  const handleOverrideEnable = (index: number, enabled: boolean) => {
    const nextOverrides = { ...perPathOverrides };
    if (enabled) {
      const staggeredDelay = motionState?.pathSequential
        ? (motionState?.delay ?? 0) + index * (motionState?.pathStaggerDelay ?? 0.12)
        : (motionState?.delay ?? 0);
      nextOverrides[String(index)] = {
        enabled: true,
        animationType: motionState?.animationType ?? "draw",
        duration: motionState?.duration ?? 2,
        delay: staggeredDelay,
        easingId: motionState?.easingId ?? "ease-in-out",
        customCubic: motionState?.customCubic,
        pathTrimStart: motionState?.pathTrimStart ?? 0,
        pathTrimEnd: motionState?.pathTrimEnd ?? 100,
        pathReverse: motionState?.pathReverse ?? false,
      };
    } else {
      delete nextOverrides[String(index)];
    }
    handleGlobalChange({ perPathAnimations: nextOverrides });
  };

  const handlePathOverrideUpdate = (index: number, updates: Partial<PathAnimationOverride>) => {
    const nextOverrides = { ...perPathOverrides };
    if (nextOverrides[String(index)]) {
      nextOverrides[String(index)] = { ...nextOverrides[String(index)], ...updates };
      handleGlobalChange({ perPathAnimations: nextOverrides });
    }
  };

  const handlePathVisibility = (index: number) => {
    const nextOverrides = { ...perPathOverrides };
    const existing = nextOverrides[String(index)] ?? {};
    nextOverrides[String(index)] = { ...existing, enabled: true, hidden: !existing.hidden };
    handleGlobalChange({ perPathAnimations: nextOverrides });
  };

  const activeOverride = selectedPathIdx >= 0 ? (perPathOverrides[String(selectedPathIdx)] ?? null) : null;

  const totalDuration = useMemo(() => {
    if (pathCount === 0) return motionState?.duration ?? 2;
    return computeTotalDuration(pathCount, state);
  }, [pathCount, state]);

  const pathTimings = useMemo(() => {
    if (!isPathAnim || pathCount === 0 || totalDuration <= 0) return [];
    return Array.from({ length: pathCount }, (_, i) => {
      const override = perPathOverrides[String(i)] || {};
      const duration = override.duration ?? (motionState?.duration ?? 2);
      const staggeredDelay = motionState?.pathSequential
        ? (motionState?.delay ?? 0) + i * (motionState?.pathStaggerDelay ?? 0.12)
        : (motionState?.delay ?? 0);
      const delay = override.delay ?? staggeredDelay;
      return {
        delay,
        duration,
        leftPct: (delay / totalDuration) * 100,
        widthPct: (duration / totalDuration) * 100,
        hasOverride: !!perPathOverrides[String(i)],
        hidden: !!(perPathOverrides[String(i)]?.hidden),
      };
    });
  }, [isPathAnim, pathCount, perPathOverrides, motionState, totalDuration]);

  const currentEasingId = (motionState?.easingId ?? "ease-in-out") as EasingId;
  const isCustomEasing = currentEasingId === "custom";

  const ANIM_TYPES = [
    {
      type: "draw" as const,
      label: "Draw",
      preview: (
        <svg viewBox="0 0 100 100" width="32" height="32" className="scale-[0.6] origin-center">
          <path fill="currentColor" d="m77.3 1.6c-2.7 0-5.3 1.9-6.2 4.9h-41.7v-3.7c0-0.7-0.6-1.3-1.3-1.3h-10.5c-0.7 0-1.5 0.6-1.5 1.4v10c0 0.7 0.6 1.4 1.4 1.4h3.7v71.4h-3.7c-0.7 0-1.4 0.7-1.4 1.4v10.4c0 0.8 0.6 1.4 1.4 1.4h10.5c0.8 0 1.4-0.6 1.4-1.4v-10.3c0-0.8-0.6-1.5-1.4-1.5h-3.8v-71.4h3.8c0.8 0 1.4-0.7 1.4-1.4v-3.7h9.9c14.3 0 29.9 3.7 31.6 20.1 0.7 7.6-2 20.6-17.2 23.7-2.2 0.5-4.4 0.7-6.8 0.7-0.6-2.8-3-5.3-6.3-5.3-3.2 0-6.4 2.8-6.4 6.5 0.1 3.7 2.8 6.3 6.4 6.3 1 0 2-0.2 3.1-0.7l21.3 26.2c-0.1 0.2-0.1 0.3-0.1 0.5v10.1c0 0.8 0.6 1.5 1.4 1.5h10.5c0.8 0 1.4-0.6 1.4-1.4v-10.2c0-0.8-0.6-1.5-1.4-1.5h-9.1l-22.1-27c0.6-0.7 1-1.5 1.2-2.3 2.5 0.1 4.8-0.1 7.3-0.6 12.8-2.2 19.7-12 19.6-24.4-0.1-8.8-5.5-17.8-16.8-22.2h14.1c0.6 2.6 3 4.9 6.2 4.9 3.1 0.1 6.6-2.4 6.6-6.3 0-3.2-2.5-6.2-6.5-6.2zm-50.7 94.5h-7.8v-7.6h7.8v7.6zm0-84.5h-7.8v-7.6h7.8v7.6zm14 46.9c-2.1 0-3.7-1.6-3.7-3.6 0-1.8 1.6-3.8 3.7-3.8 2 0 3.7 1.5 3.7 3.8 0 2-1.6 3.6-3.7 3.6zm34.9 30v7.5h-7.9v-7.5h7.9zm1.8-77.1c-2 0-3.7-1.7-3.7-3.6s1.7-3.7 3.7-3.7c1.9 0 3.6 1.6 3.6 3.6-0.1 2-1.6 3.7-3.6 3.7z" />
        </svg>
      ),
    },
    {
      type: "stroke" as const,
      label: "Stroke",
      preview: (
        <svg viewBox="0 0 150 124.2" width="40" height="40">
          <path fill="currentColor" d="m88.2 65.1c-1.1-0.1-2.1 0.5-2.5 1.3-1.7 21.2-20.7 45.2-49.5 45.2h-18.2c-0.9-3.5-4-6.6-8-6.6-4.5 0-7.8 3.5-8 8.1 0 4.5 3.5 8.7 8 8.7 3.8 0.1 7.2-2.2 8.1-6.4h18.1c27.5 0 49.2-19.6 52.8-48.4 0.1-0.9-0.2-1.7-0.8-1.9zm-78.2 53.4c-2.6 0-4.6-2.1-4.6-4.7s2-5.3 4.6-5.3 4.7 2.1 4.7 4.7c-0.1 2.6-2.1 5.3-4.7 5.3z" />
          <path fill="currentColor" d="m77.5 99.8c-0.4 0.2-0.7 0.6-0.6 0.9l2.8 10.8c0.2 0.7 1 0.9 1.4 0.4l8-7.8c0.4-0.4 0.2-1.3-0.5-1.3l-11.1-3z" />
          <path fill="currentColor" d="m140.2 2c-4.2 0-7.8 3.2-8 7.6s3.2 9.5 8 9.7c4.4 0.2 7.7-3.2 7.9-8 0.2-4.4-3.5-9.1-7.9-9.3zm-0.1 13.5c-2.6 0-4.7-2-4.7-4.6s2.1-5.3 4.7-5.3 4.6 2.1 4.6 4.7c0 2.5-2 5.2-4.6 5.2z" />
          <path fill="currentColor" d="m118.6 15c2.1-0.6 4.7-1.2 6.8-1.4 0.8-0.1 1.7-1 1.6-1.9-0.1-0.8-0.9-1.7-1.7-1.7-2.5 0.3-5 0.8-7.6 1.5-0.8 0.4-1.4 1.3-1 2.3 0.3 0.8 1 1.3 1.9 1.2z" />
          <path fill="currentColor" d="m104.1 22.1c0.6 0.3 1 0.3 1.2 0 1.5-1.1 3.7-2.5 5.8-3.6 0.8-0.3 1.2-1.3 0.8-2.4-0.3-0.8-1.3-1.5-2.3-1-2.2 1-4.1 2.3-6.6 4-0.9 1.3-0.6 2.7 1.1 3z" />
          <path fill="currentColor" d="m93.6 32.7c0.6 0 1.4-0.3 1.7-1 1-1.7 2.3-3.5 3.6-4.6 0.7-0.7 0.7-1.6 0-2.3-0.6-0.7-1.8-0.7-2.5 0-1.4 1.7-2.8 3.4-4.2 5.6-0.6 1.1 0.2 2.3 1.4 2.3z" />
          <path fill="currentColor" d="m88.4 46.9c0.8 0 1.5-0.5 1.8-1.3 0.4-2.2 0.9-4.3 1.7-6.7 0-0.8-0.5-2.1-1.7-2.3-0.8 0-1.4 0.4-1.6 1-0.8 2.2-1.4 4.5-1.9 7.4 0 1.1 0.9 1.9 1.7 1.9z" />
          <path fill="currentColor" d="m87.6 61.3c1 0 1.7-0.8 1.7-1.5 0-2.2 0-4.3 0.1-6.8 0-0.8-0.6-1.7-1.8-1.7-0.9 0-1.7 0.8-1.7 1.7-0.1 2.5-0.2 4.6-0.2 6.8 0 0.7 0.9 1.5 1.9 1.5z" />
        </svg>
      ),
    },
    {
      type: "bounce" as const,
      label: "Bounce",
      preview: (
        <svg viewBox="0 0 140 99" width="32" height="32">
          <path fill="currentColor" d="m106.4 16.9c-6.2 0.9-11.4 5.6-15.1 9.9-4.3 5.1-7.4 10.9-9.8 16.9-4.1 10.3-6.9 22.4-8.4 35.3-2.3-7.6-5.8-15.1-10.7-21.1-5.7-6.8-13.6-12.6-22.8-12.5-9.4-0.1-17 4.6-22.5 11.3-4 4.9-7.5 10-9.6 15.9-1.9 5.4-2.9 11.8-2.8 19.6 0.2 2.1 3.3 2.2 3.4 0 0.1-5.1 0.3-10.1 1.8-15.1 1.6-5.1 4.2-9.9 7.2-14.2 4.5-6.4 11.6-12.2 19.3-13.6 4.7-0.7 8.7-0.3 13 1.7 8.2 3.6 14 11.2 17.6 18.9 2.8 6 4.7 13 5.4 19.5 0.1 1 0.1 3.9 2.5 3.7 1.5-0.1 1.1-1.4 1-1.6 0.2-11.9 4.6-35.9 9.6-47.6 3.3-7.7 10.4-20.9 21.1-24 0.8 0.1 1.9-0.3 1.7-0.4 0.9-1.1 0.1-3-1.9-2.6z" />
          <path fill="currentColor" d="m123.8 5.2c-6.1-0.3-12.1 4.3-12.3 11.3-0.2 7.1 5.4 12.4 12.3 12.6 6.2 0.1 11.8-5 11.7-11.8 0-6.6-5.1-11.9-11.7-12.1z" />
        </svg>
      ),
    },
    {
      type: "shake" as const,
      label: "Shake",
      preview: (
        <svg viewBox="0 0 427.183 427.183" width="32" height="32" className="scale-[0.6] origin-center">
          <path fill="currentColor" d="M366.214,129.976h-21.621V57.313c0-24.708-20.102-44.809-44.81-44.809c-13.976,0-26.475,6.435-34.698,16.493 C258.68,12.07,242.31,0,223.167,0c-19.277,0-35.747,12.236-42.058,29.348c-8.225-9.96-20.664-16.318-34.56-16.318 c-24.708,0-44.809,20.101-44.809,44.809v0.563c-8.125-8.198-19.383-13.285-31.81-13.285c-24.708,0-44.809,20.101-44.809,44.809 v139.655c0,55.446,18.966,109.714,53.454,153.087v38.013c0,3.59,2.91,6.5,6.5,6.5s6.5-2.91,6.5-6.5v-40.3 c0-1.491-0.513-2.936-1.451-4.094c-33.534-41.359-52.003-93.46-52.003-146.707v-33.708c8.125,8.198,19.382,13.285,31.809,13.285 c16.71,0,31.303-9.2,39.006-22.795c7.992,12.324,21.861,20.5,37.612,20.5c16.212,0,30.44-8.654,38.308-21.585 c7.869,12.929,22.096,21.581,38.307,21.581c4.686,0,9.243-0.723,13.62-2.124c8.616,12.478,23.009,20.676,39.287,20.676h13.992v2.058 h-13c-47.421,0-86,38.58-86,86c0,3.59,2.91,6.5,6.5,6.5s6.5-2.91,6.5-6.5c0-40.252,32.748-73,73-73h19.5c3.59,0,6.5-2.91,6.5-6.5 v-8.558h39.326c3.59,0,6.5-2.91,6.5-6.5s-2.91-6.5-6.5-6.5h-66.318c-19.144,0-34.719-15.575-34.719-34.718 s15.575-34.718,34.719-34.718h90.143c12.598,0,22.846,10.249,22.846,22.846v90.861c0,36.452-17.734,70.829-47.439,91.958 l-0.291,0.207c-21.61,15.372-34.512,40.38-34.512,66.899c0,3.59,2.91,6.5,6.5,6.5s6.5-2.91,6.5-6.5 c0-22.319,10.858-43.368,29.047-56.306l0.291-0.207c33.127-23.563,52.904-61.899,52.904-102.551v-90.861 C402.06,146.056,385.98,129.976,366.214,129.976z M101.741,164.35c0,17.54-14.27,31.809-31.81,31.809 c-17.539,0-31.809-14.27-31.809-31.809V89.927c0-17.54,14.27-31.809,31.809-31.809c17.54,0,31.81,14.269,31.81,31.809V164.35z M146.549,193.864c-17.539,0-31.809-14.269-31.809-31.809V57.84c0-17.54,14.27-31.809,31.809-31.809S178.358,40.3,178.358,57.84 v0.001h-0.004v104.21c0,0.027,0.002,0.053,0.002,0.079C178.315,179.635,164.063,193.864,146.549,193.864z M228.353,177.694 c0,5.322,0.889,10.438,2.504,15.222c-2.494,0.62-5.064,0.945-7.693,0.945c-17.513,0-31.765-14.227-31.809-31.731 c0-0.025,0.002-0.05,0.002-0.075V44.809c0-17.54,14.27-31.809,31.809-31.809s31.809,14.269,31.809,31.809v90.098 C239.218,142.708,228.353,158.953,228.353,177.694z M267.975,130.677V57.313c0-17.54,14.27-31.809,31.81-31.809 c17.539,0,31.809,14.269,31.809,31.809v72.663h-55.521C273.311,129.976,270.609,130.224,267.975,130.677z" />
        </svg>
      ),
    },
    {
      type: "jump" as const,
      label: "Jump",
      preview: (
        <svg viewBox="0 0 120 105" width="40" height="40">
          <path fill="currentColor" d="m106.8 24.3h-0.6l-0.1-0.3c-0.5-2-3.1-2-2.6 1-3.5 1.3-6.5 4.8-6.5 9.5 0 5.3 4 11 10.6 11 5.3 0 9.8-4.3 9.8-10.7 0-5.3-4.3-10.5-10.6-10.5zm0.7 16.9c-3.4 0-6-2.4-6-6.4 0.3-3.2 2.6-6.3 6.5-6.3 2.6 0.3 5.4 2.5 5.4 6 0 3.3-2.8 6.3-5.9 6.7z" />
          <path fill="currentColor" d="m107.6 50.7c-4.6 0-11.4 0.5-11.4 2.2 0 1.8 6.9 2.2 11.4 2.2 4.3 0 10.3-0.6 10.4-2.1 0.4-1.5-4.4-2.3-10.4-2.3z" />
          <path fill="currentColor" d="m18.5 98.2c-8.4 0-16.5 0.6-16.5 2.3s8.5 2.4 16.5 2.4 17.3-0.5 17.3-2.3c0-1.6-6.3-2.4-17.3-2.4z" />
          <path fill="currentColor" d="m23.1 76.3c0.4 0 0.9-0.3 1-0.7l3.1-7c0.4-1.1-0.8-3-2.6-2l-3.2 7.2c-0.3 0.7 0.2 1.8 0.2 1.8-0.7-0.3-1.7-0.5-3.1-0.5-5.5 0-10.3 4.4-10.3 10.5 0 5 3.8 10.7 10.3 10.7 6.4 0 10.5-4.5 10.5-10.7 0-3.6-2.1-7.4-5.9-9.3zm-4.6 15.4c-3.5 0-6.1-2.5-6.1-6.1 0.1-3.1 2.5-5.8 6.1-5.9 2.6 0 6 2.1 6 5.9 0 3.4-2.7 6.1-6 6.1z" />
          <path fill="currentColor" d="m29 61.3c0.9 0.4 2 0 2.2-1l3.3-6.3c0.6-1.2-1.1-3-2.5-1.5l-3.8 7c-0.2 0.6 0.2 1.6 0.8 1.8z" />
          <path fill="currentColor" d="m36.6 46.7c0.6 0.6 1.9 0.8 2.4-0.2l3.5-6.2c1-1.5-0.9-3.7-2.5-2.1l-4.1 6.8c-0.4 0.7 0 1.5 0.7 1.7z" />
          <path fill="currentColor" d="m45.1 32.3c0.5 0.5 1.8 0.7 2.4-0.3l4-5.8c0.5-1.4-1.1-3.2-2.5-1.7l-4.5 6.1c-0.4 0.6 0 1.5 0.6 1.7z" />
          <path fill="currentColor" d="m54.5 19.7c0.6 0.6 1.9 0.8 2.4-0.1 1.6-1.8 4.6-5.1 4.6-5.1 1.1-1-0.5-3.7-2.3-2.2-1.7 1.7-4.7 5.2-4.7 5.2-0.7 0.7-0.4 1.7 0 2.2z" />
          <path fill="currentColor" d="m67.5 9.3c0.4 0 0.6 0 1-0.2 1.6-1.1 3.6-2.3 6-3.1 1.7-0.5 1.1-3.4-1-3.2-2.9 0.9-4.6 1.8-7 3.3-1.1 0.9-0.6 2.7 1 3v0.2z" />
          <path fill="currentColor" d="m82.6 5c2 0.1 4.3 0.5 6.5 1.6 2 1 3.4-1.6 1.5-2.8-2-0.8-3.6-1.6-7.6-2-1.9 0-2.1 2.7-0.4 3.2z" />
          <path fill="currentColor" d="m95.5 11.7c2.1 2.1 4 5 4.1 5.3 1 1.5 4 0.5 2.9-1.7-1-1.6-2.9-4.1-4.6-5.8-1.4-1.3-3.3 0.3-2.4 2.2z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <Section
      title="Motion"
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
                  "h-5 px-1.5 rounded text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1",
                  motionState?.loop ? "text-foreground" : "text-foreground/30 hover:text-foreground/55"
                )}
              >
                <span className={cn("h-1 w-1 rounded-full", motionState?.loop ? "bg-foreground" : "bg-foreground/20")} aria-hidden="true" />
                Loop
              </button>
              <button
                type="button"
                aria-label={isPaused ? "Push and play animation" : "Pause animation"}
                title={isPaused ? "Push & Play" : "Pause"}
                onClick={() => handleGlobalChange({ isPaused: !isPaused, scrubProgress: null })}
                className={cn(
                  "h-6 w-6 rounded-md flex items-center justify-center transition-all active:scale-90",
                  isPaused ? "bg-foreground/8 text-foreground hover:bg-foreground/15" : "text-foreground/40 hover:text-foreground hover:bg-muted/15"
                )}
              >
                {isPaused ? (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                ) : (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                )}
              </button>
              <button
                type="button"
                aria-label="Reset animation"
                title="Reset"
                onClick={() => handleGlobalChange({ replayNonce: (motionState?.replayNonce ?? 0) + 1, isPaused: false, scrubProgress: null, selectedPathIndex: -1 })}
                className="h-6 w-6 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-muted/15 transition-all"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              </button>
            </>
          )}
          <Switch
            checked={isEnabled}
            onCheckedChange={(v) =>
              handleGlobalChange(
                v
                  ? { enabled: true, isPaused: false, scrubProgress: null }
                  : { enabled: false }
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

              {selectedPathIdx === -1 && (
                <div className="flex justify-between px-1 pt-0.5">
                  {ANIM_TYPES.map(({ type, label, preview }) => {
                    const isActive = (motionState?.animationType ?? "draw") === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleGlobalChange({ animationType: type, presetId: null })}
                        className={cn(
                          "flex flex-col items-center gap-2 transition-all",
                          isActive ? "opacity-100" : "opacity-30 hover:opacity-60"
                        )}
                      >
                        {preview}
                        <div className={cn(
                          "h-0.5 rounded-full transition-all duration-300",
                          isActive ? "bg-foreground w-5" : "bg-foreground/15 w-1.5"
                        )} />
                        <span className={cn(
                          "text-[8px] uppercase tracking-widest transition-colors",
                          isActive ? "text-foreground/70" : "text-foreground/40"
                        )}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {isPathAnim && pathCount > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-foreground/35 px-1">
                    <span>Paths</span>
                    <span className="opacity-60 normal-case">{pathCount} layers</span>
                  </div>
                  <div className="rounded-sm border border-border/30 overflow-hidden">
                    <button type="button" onClick={() => handlePathSelect(-1)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all",
                        selectedPathIdx === -1
                          ? "bg-foreground/5 text-foreground"
                          : "text-foreground/35 hover:bg-muted/8 hover:text-foreground/70"
                      )}>
                      <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-foreground/20" />
                      <span className="text-[10px] uppercase tracking-widest flex-1">Global</span>
                      <span className="text-[9px] opacity-25">all paths</span>
                    </button>

                    {pathTimings.map((timing, i) => (
                      <div key={i}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 border-t border-border/10 transition-all",
                          selectedPathIdx === i ? "bg-foreground/5 text-foreground" : "text-foreground/35 hover:bg-muted/8 hover:text-foreground/70",
                          timing.hidden && "opacity-30"
                        )}>
                        <button type="button" className="flex items-center gap-2 flex-1 min-w-0" onClick={() => handlePathSelect(i)}>
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: pathColor(i) }} />
                          <span className="text-[10px] font-mono w-6 shrink-0">P{i}</span>
                          <div className="flex-1 h-0.5 bg-foreground/8 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{
                              marginLeft: `${Math.min(timing.leftPct, 90)}%`,
                              width: `${Math.max(timing.widthPct, 8)}%`,
                              background: pathColor(i),
                              opacity: 0.7,
                            }} />
                          </div>
                          {timing.hasOverride && !timing.hidden && <span className="text-[9px] text-foreground/40 shrink-0">●</span>}
                        </button>
                        <button type="button" onClick={() => handlePathVisibility(i)}
                          className="shrink-0 text-foreground/20 hover:text-foreground/60 transition-colors p-0.5"
                          title={timing.hidden ? "Show path" : "Hide path"}>
                          {timing.hidden ? (
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPathIdx === -1 ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="px-1">
                      <span className="text-[10px] uppercase tracking-widest text-foreground/35">Easing</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 px-1">
                      {EASING_SIMPLE.map((e) => {
                        const isActive = currentEasingId === e.id;
                        const [cx1, cy1, cx2, cy2] = easingCurvePoints(e.id, e.value);
                        return (
                          <button key={e.id} type="button"
                            onClick={() => handleGlobalChange({ easingId: e.id, presetId: null })}
                            className={cn(
                              "h-20 rounded-sm flex flex-col items-center justify-center gap-1 transition-all",
                              isActive ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10"
                            )}>
                            <EasingCurve x1={cx1} y1={cy1} x2={cx2} y2={cy2} />
                            <span className="text-[8px] uppercase tracking-tighter">{e.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {isCustomEasing && (
                      <BezierEditor
                        value={motionState?.customCubic ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"}
                        onChange={(v) => handleGlobalChange({ customCubic: v, easingId: "custom", presetId: null })}
                      />
                    )}
                  </div>

                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 py-1.5 border-t border-border/20">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: pathColor(selectedPathIdx) }} />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-mono" style={{ color: pathColor(selectedPathIdx) }}>Path {selectedPathIdx}</div>
                        <div className="text-[9px] uppercase tracking-tighter opacity-30">{activeOverride ? "Override active" : "Global settings"}</div>
                      </div>
                    </div>
                    <Switch checked={!!activeOverride} onCheckedChange={(v) => handleOverrideEnable(selectedPathIdx, v)} />
                  </div>

                  {activeOverride ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Scrubber label="Delay" value={activeOverride.delay ?? 0} onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { delay: v })} min={0} max={3} step={0.05} />
                        <Scrubber label="Duration" value={activeOverride.duration ?? (motionState?.duration ?? 2)} onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { duration: v })} min={0.1} max={5} step={0.1} />
                        {isPathAnim && (
                          <Scrubber label="Progress" value={activeOverride.scrubProgress ?? 0} onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { scrubProgress: v === 0 ? null : v })} min={0} max={100} step={1} />
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-1 px-1">
                        {EASING_SIMPLE.map((e) => {
                          const isActive = (activeOverride.easingId ?? motionState?.easingId) === e.id;
                          const [cx1, cy1, cx2, cy2] = easingCurvePoints(e.id, e.value);
                          return (
                            <button key={e.id} type="button"
                              onClick={() => handlePathOverrideUpdate(selectedPathIdx, { easingId: e.id })}
                              className={cn("h-20 rounded-sm flex flex-col items-center justify-center gap-1 transition-all",
                                isActive ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10")}>
                              <EasingCurve x1={cx1} y1={cy1} x2={cx2} y2={cy2} />
                              <span className="text-[8px] uppercase tracking-tighter">{e.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {activeOverride.easingId === "custom" && (
                        <BezierEditor
                          value={activeOverride.customCubic ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"}
                          onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { customCubic: v })}
                        />
                      )}

                      <div className="space-y-0 pt-1 border-t border-border/20">
                        {([
                          { key: "loop", label: "Loop" },
                          { key: "fillTransition", label: "Fill after draw" },
                        ] as const).map(({ key, label }) => {
                          const val = !!(activeOverride as Record<string, unknown>)[key];
                          return (
                            <div key={key} className="flex items-center justify-between h-8 px-1">
                              <span className="text-[10px] uppercase tracking-widest text-foreground/50">{label}</span>
                              <Switch checked={val} onCheckedChange={(v: boolean) => handlePathOverrideUpdate(selectedPathIdx, { [key]: v } as Partial<PathAnimationOverride>)} />
                            </div>
                          );
                        })}
                        {activeOverride.fillTransition && (
                          <Scrubber label="Fill delay" value={activeOverride.fillDelay ?? 0.5} onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { fillDelay: v })} min={0} max={2} step={0.05} />
                        )}
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-border/20">
                        <div className="text-[10px] uppercase tracking-widest text-foreground/35 px-1">Trigger</div>
                        <div className="grid grid-cols-4 gap-1 px-1">
                          {(["auto", "once", "hover", "click"] as const).map((t) => (
                            <button key={t} type="button"
                              onClick={() => handlePathOverrideUpdate(selectedPathIdx, { trigger: t })}
                              className={cn("h-7 rounded-sm text-[9px] uppercase tracking-tighter transition-all",
                                (activeOverride.trigger ?? "auto") === t ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10")}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-3">
                      <p className="text-[10px] uppercase tracking-widest opacity-25">Global settings active</p>
                      <Button variant="secondary" size="sm" className="h-7 text-[9px] uppercase tracking-widest px-4"
                        onClick={() => handleOverrideEnable(selectedPathIdx, true)}>
                        Enable Override
                      </Button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
