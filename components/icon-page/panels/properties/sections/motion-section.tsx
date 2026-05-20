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

const EASING_QUICK = EASING_PRESETS.filter((e) => e.id !== "linear" && e.id !== "ease-in" && e.id !== "back-in" && e.id !== "custom");

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
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" strokeLinecap="round">
          {/* ghost path */}
          <path d="M4 22 C4 22 9 6 16 6 C23 6 28 22 28 22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" />
          {/* drawing in */}
          <path d="M4 22 C4 22 9 6 16 6 C23 6 28 22 28 22" stroke="currentColor" strokeWidth="1.5"
            style={{ strokeDasharray: 56, strokeDashoffset: 56, animation: "mta-draw 1.8s ease-in-out infinite" }} />
          {/* lead dot */}
          <circle cx="4" cy="22" r="2.2" fill="currentColor"
            style={{ animation: "mta-draw-dot 1.8s ease-in-out infinite" }} />
        </svg>
      ),
    },
    {
      type: "stroke" as const,
      label: "Stroke",
      preview: (
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" strokeLinecap="round">
          {/* ghost */}
          <path d="M4 22 C8 22 10 10 16 10 C22 10 24 22 28 22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" />
          {/* pulsing stroke */}
          <path d="M4 22 C8 22 10 10 16 10 C22 10 24 22 28 22" stroke="currentColor"
            style={{ animation: "mta-stroke 1.4s ease-in-out infinite" }} />
        </svg>
      ),
    },
    {
      type: "bounce" as const,
      label: "Bounce",
      preview: (
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" strokeLinecap="round">
          <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <circle cx="16" cy="16" r="3.5" fill="currentColor"
            style={{ animation: "mta-bounce 1s ease-in-out infinite", transformOrigin: "16px 22.5px" }} />
          <ellipse cx="16" cy="26.5" rx="3.5" ry="1" fill="currentColor" fillOpacity="0.2"
            style={{ animation: "mta-bounce-shadow 1s ease-in-out infinite" }} />
        </svg>
      ),
    },
    {
      type: "shake" as const,
      label: "Shake",
      preview: (
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" strokeLinecap="round">
          <rect x="13" y="13" width="6" height="6" rx="1.5" fill="currentColor"
            style={{ animation: "mta-shake 0.55s ease-in-out infinite", transformOrigin: "16px 16px" }} />
          {/* motion blur lines */}
          <line x1="5" y1="16" x2="9" y2="16" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
            style={{ animation: "mta-shake-trail-l 0.55s ease-in-out infinite" }} />
          <line x1="23" y1="16" x2="27" y2="16" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
            style={{ animation: "mta-shake-trail-r 0.55s ease-in-out infinite" }} />
        </svg>
      ),
    },
    {
      type: "jump" as const,
      label: "Jump",
      preview: (
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" strokeLinecap="round">
          <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M10 25 Q16 5 22 25" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="2 2" />
          <rect x="13" y="21" width="6" height="4" rx="1.5" fill="currentColor"
            style={{ animation: "mta-jump 1.1s cubic-bezier(.4,0,.6,1) infinite", transformOrigin: "16px 23px" }} />
        </svg>
      ),
    },
  ] as const;

  return (
    <Section
      title="Motion"
      headerAction={
        <Switch checked={isEnabled} onCheckedChange={(v) => handleGlobalChange({ enabled: v })} />
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

              <div className="flex items-center gap-1.5 px-1">
                <button
                  type="button"
                  aria-label="Play animation"
                  title="Play"
                  onClick={() => handleGlobalChange({ replayNonce: (motionState?.replayNonce ?? 0) + 1, isPaused: false, scrubProgress: null })}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-muted/15 transition-all"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button
                  type="button"
                  aria-label={isPaused ? "Resume animation" : "Pause animation"}
                  title={isPaused ? "Resume" : "Pause"}
                  onClick={() => handleGlobalChange({ isPaused: !isPaused, scrubProgress: null })}
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center transition-all",
                    isPaused ? "bg-foreground/8 text-foreground" : "text-foreground/40 hover:text-foreground hover:bg-muted/15"
                  )}
                >
                  {isPaused ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Reset animation"
                  title="Reset"
                  onClick={() => handleGlobalChange({ replayNonce: (motionState?.replayNonce ?? 0) + 1, isPaused: false, scrubProgress: null, selectedPathIndex: -1 })}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-muted/15 transition-all"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                </button>

                <div className="flex-1" />

                <button
                  type="button"
                  aria-label={`Auto reverse ${motionState?.autoReverse ? "on" : "off"}`}
                  aria-pressed={motionState?.autoReverse ?? false}
                  onClick={() => handleGlobalChange({ autoReverse: !(motionState?.autoReverse ?? false) })}
                  className={cn(
                    "h-6 px-2 rounded text-[9px] uppercase tracking-widest transition-colors",
                    motionState?.autoReverse ? "text-foreground" : "text-foreground/30 hover:text-foreground/55"
                  )}
                >
                  Auto
                </button>

                <button
                  type="button"
                  aria-label={`Loop ${motionState?.loop ? "on" : "off"}`}
                  aria-pressed={motionState?.loop ?? false}
                  onClick={() => handleGlobalChange({ loop: !motionState?.loop })}
                  className={cn(
                    "h-6 px-2 rounded text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1",
                    motionState?.loop ? "text-foreground" : "text-foreground/30 hover:text-foreground/55"
                  )}
                >
                  <span className={cn("h-1 w-1 rounded-full", motionState?.loop ? "bg-foreground" : "bg-foreground/20")} aria-hidden="true" />
                  Loop
                </button>
              </div>

              {selectedPathIdx === -1 && (
                <div className="space-y-1.5">
                  <Scrubber label="Duration" value={motionState?.duration ?? 2} onChange={(v) => handleGlobalChange({ duration: v, presetId: null })} min={0.1} max={5} step={0.05} />
                  <Scrubber label="Delay" value={motionState?.delay ?? 0} onChange={(v) => handleGlobalChange({ delay: v, presetId: null })} min={0} max={3} step={0.05} />
                </div>
              )}

              {isPathAnim && (
                <div className="space-y-1.5 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-foreground/35">Timeline</span>
                    <span className="text-[10px] text-foreground/25 tabular-nums">
                      {((scrubProgress ?? 0) / 100 * totalDuration).toFixed(1)}s / {totalDuration.toFixed(1)}s
                    </span>
                  </div>
                  <Scrubber
                    label=""
                    value={scrubProgress ?? 0}
                    min={0} max={100} step={0.5}
                    onChange={(v) => handleGlobalChange({ scrubProgress: v === 0 ? null : v, isPaused: v > 0 ? true : isPaused })}
                  />
                  {scrubProgress !== null && (
                    <button type="button" className="text-[9px] uppercase tracking-widest text-foreground/30 hover:text-foreground/60 transition-colors"
                      onClick={() => handleGlobalChange({ scrubProgress: null, isPaused: false })}>
                      Resume live
                    </button>
                  )}
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
                    <div className="text-[10px] uppercase tracking-widest text-foreground/35 px-1">Easing</div>
                    <div className="grid grid-cols-3 gap-1 px-1">
                      {EASING_QUICK.map((e) => {
                        const isActive = currentEasingId === e.id;
                        return (
                          <button key={e.id} type="button"
                            onClick={() => handleGlobalChange({ easingId: e.id, presetId: null })}
                            className={cn(
                              "h-7 rounded-sm text-[9px] uppercase tracking-tighter transition-all",
                              isActive ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10"
                            )}>
                            {e.label}
                          </button>
                        );
                      })}
                      <button type="button"
                        onClick={() => handleGlobalChange({ easingId: "custom", presetId: null })}
                        className={cn(
                          "h-7 rounded-sm text-[9px] uppercase tracking-tighter transition-all",
                          isCustomEasing ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10"
                        )}>
                        Custom
                      </button>
                    </div>
                    {isCustomEasing && (
                      <BezierEditor
                        value={motionState?.customCubic ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"}
                        onChange={(v) => handleGlobalChange({ customCubic: v, easingId: "custom", presetId: null })}
                      />
                    )}
                  </div>

                  {isPathAnim && (
                    <div className="space-y-1.5 pt-2 border-t border-border/20">
                      <Scrubber label="Start" value={motionState?.pathTrimStart ?? 0} onChange={(v) => handleGlobalChange({ pathTrimStart: v })} min={0} max={100} />
                      <Scrubber label="End" value={motionState?.pathTrimEnd ?? 100} onChange={(v) => handleGlobalChange({ pathTrimEnd: v })} min={0} max={100} />
                      <div className="flex items-center justify-between h-8 px-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/50">Sequential</span>
                        <Switch checked={motionState?.pathSequential ?? false} onCheckedChange={(v) => handleGlobalChange({ pathSequential: v })} />
                      </div>
                      {motionState?.pathSequential && (
                        <Scrubber label="Stagger" value={motionState?.pathStaggerDelay ?? 0.12} onChange={(v) => handleGlobalChange({ pathStaggerDelay: v })} min={0.01} max={0.5} step={0.01} />
                      )}
                      <div className="flex items-center justify-between h-8 px-1">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/50">Reverse</span>
                        <Switch checked={motionState?.pathReverse ?? false} onCheckedChange={(v) => handleGlobalChange({ pathReverse: v })} />
                      </div>
                    </div>
                  )}
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

                      <div className="grid grid-cols-3 gap-1 px-1">
                        {EASING_QUICK.map((e) => {
                          const isActive = (activeOverride.easingId ?? motionState?.easingId) === e.id;
                          return (
                            <button key={e.id} type="button"
                              onClick={() => handlePathOverrideUpdate(selectedPathIdx, { easingId: e.id })}
                              className={cn("h-7 rounded-sm text-[9px] uppercase tracking-tighter transition-all",
                                isActive ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10")}>
                              {e.label}
                            </button>
                          );
                        })}
                        <button type="button"
                          onClick={() => handlePathOverrideUpdate(selectedPathIdx, { easingId: "custom" })}
                          className={cn("h-7 rounded-sm text-[9px] uppercase tracking-tighter transition-all",
                            activeOverride.easingId === "custom" ? "bg-foreground text-background" : "text-foreground/35 hover:text-foreground/70 hover:bg-muted/10")}>
                          Custom
                        </button>
                      </div>
                      {activeOverride.easingId === "custom" && (
                        <BezierEditor
                          value={activeOverride.customCubic ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"}
                          onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { customCubic: v })}
                        />
                      )}

                      {isPathAnim && (
                        <div className="space-y-1.5 pt-2 border-t border-border/20">
                          <Scrubber label="Start" value={activeOverride.pathTrimStart ?? (motionState?.pathTrimStart ?? 0)} onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { pathTrimStart: v })} min={0} max={100} />
                          <Scrubber label="End" value={activeOverride.pathTrimEnd ?? (motionState?.pathTrimEnd ?? 100)} onChange={(v) => handlePathOverrideUpdate(selectedPathIdx, { pathTrimEnd: v })} min={0} max={100} />
                        </div>
                      )}

                      <div className="space-y-0 pt-1 border-t border-border/20">
                        {([
                          { key: "pathReverse", label: "Reverse (erase)" },
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

              <div className="flex items-center justify-end pt-2 border-t border-border/20">
                <button type="button"
                  className="text-[9px] uppercase tracking-widest text-foreground/25 hover:text-foreground/55 transition-colors"
                  onClick={() => handleGlobalChange({ perPathAnimations: {}, selectedPathIndex: -1, presetId: null })}>
                  Clear overrides
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
