"use client";

import { useCallback } from "react";

import { useTheme } from "next-themes";

import { Scrubber } from "@/components/ui/scrubber";
import { DUOTONE_SECONDARY_DEFAULT } from "@/constants/workspace";
import { HexColor } from "@/lib/color-utils";
import { CustomizationState } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Section } from "../components/Section";
import { ColorRow } from "./color-section/color-row";

interface ColorSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
}

export function ColorSection({ state, onChange }: ColorSectionProps) {
  const { resolvedTheme } = useTheme();
  const adaptiveHex = (resolvedTheme === "dark" ? "#FFFFFF" : "#000000") as HexColor;
  const displayColor = (c: string | undefined): HexColor =>
    (c && c.length > 0 ? c : adaptiveHex) as HexColor;

  const handleSolidChange = useCallback(
    (hex: HexColor) => {
      const newColors = [...state.colors];
      newColors[0] = hex;
      onChange({ colors: newColors });
    },
    [state.colors, onChange],
  );

  const handleSecondaryColorChange = useCallback(
    (hex: HexColor) => {
      const newColors = [...state.colors];
      newColors[1] = hex;
      onChange({ colors: newColors });
    },
    [state.colors, onChange],
  );

  const isMultiColor = state.iconType === "duotone" || state.iconType === "fill";

  const handleGradientColorChange = useCallback(
    (index: number, hex: HexColor) => {
      const newStops = [...state.gradient.stops];
      newStops[index] = { ...newStops[index], color: hex };
      onChange({ gradient: { ...state.gradient, stops: newStops } });
    },
    [state.gradient, onChange],
  );

  const handleGradientPositionChange = useCallback(
    (index: number, position: number) => {
      const newStops = [...state.gradient.stops];
      newStops[index] = { ...newStops[index], position: Math.max(0, Math.min(100, position)) };
      onChange({ gradient: { ...state.gradient, stops: newStops } });
    },
    [state.gradient, onChange],
  );

  const handleAddStop = useCallback(() => {
    const stops = state.gradient.stops;
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let bestPos = 50;
    let maxGap = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        bestPos = (sorted[i].position + sorted[i + 1].position) / 2;
      }
    }
    onChange({
      gradient: {
        ...state.gradient,
        stops: [...stops, { color: stops[0].color, position: bestPos }],
      },
    });
  }, [state.gradient, onChange]);

  const handleRemoveStop = useCallback(
    (index: number) => {
      if (state.gradient.stops.length <= 2) return;
      const newStops = state.gradient.stops.filter((_, i) => i !== index);
      onChange({ gradient: { ...state.gradient, stops: newStops } });
    },
    [state.gradient, onChange],
  );

  const isGlass = state.iconType === "glass";
  const mode = state.iconGradient ? "gradient" : "solid";

  if (isGlass) {
    return null;
  }

  const target = state.gradient.target ?? "both";
  const sortedStopsForPreview = [...state.gradient.stops].sort((a, b) => a.position - b.position);
  const gradientPreviewStyle = {
    background:
      state.gradient.type === "radial"
        ? `radial-gradient(circle at ${state.gradient.cx ?? 50}% ${state.gradient.cy ?? 50}%, ${sortedStopsForPreview.map((s) => `${s.color} ${s.position}%`).join(", ")})`
        : state.gradient.type === "angular"
          ? `conic-gradient(from ${state.gradient.angle}deg at ${state.gradient.cx ?? 50}% ${state.gradient.cy ?? 50}%, ${sortedStopsForPreview.map((s) => `${s.color} ${s.position}%`).join(", ")})`
          : `linear-gradient(${state.gradient.angle}deg, ${sortedStopsForPreview.map((s) => `${s.color} ${s.position}%`).join(", ")})`,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] tracking-widest text-foreground/70 uppercase">Color</span>
        <div
          className="flex rounded-md border border-border/50 bg-muted/20 p-0.5"
          role="group"
          aria-label="Color mode"
        >
          <button
            onClick={() => onChange({ iconGradient: false })}
            className={cn(
              "relative rounded-sm px-2.5 py-1 text-[10px] tracking-tighter uppercase transition-all duration-150 outline-none",
              mode === "solid"
                ? "border border-border/60 bg-background text-foreground"
                : "text-foreground/40 hover:bg-background/40 hover:text-foreground",
            )}
          >
            Solid
          </button>
          <button
            onClick={() => onChange({ iconGradient: true })}
            className={cn(
              "relative rounded-sm px-2.5 py-1 text-[10px] tracking-tighter uppercase transition-all duration-150 outline-none",
              mode === "gradient"
                ? "border border-border/60 bg-background text-foreground"
                : "text-foreground/40 hover:bg-background/40 hover:text-foreground",
            )}
          >
            Gradient
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {mode === "solid" ? (
          <div key="solid" className="space-y-1.5">
            <ColorRow
              label={state.iconType === "fill" ? "Fill" : "Primary"}
              value={displayColor(state.colors[0])}
              onChange={handleSolidChange}
            />
            {isMultiColor && (
              <ColorRow
                label={state.iconType === "fill" ? "Stroke" : "Secondary"}
                value={displayColor(
                  state.colors[1] && state.colors[1].length > 0
                    ? state.colors[1]
                    : state.iconType === "fill"
                      ? "#1C1F21"
                      : DUOTONE_SECONDARY_DEFAULT,
                )}
                onChange={handleSecondaryColorChange}
              />
            )}
          </div>
        ) : (
          <div key="gradient" className="flex flex-col gap-3">
            <div className="space-y-1.5">
              {state.gradient.stops
                .map((stop, originalIndex) => ({ stop, originalIndex }))
                .sort((a, b) => a.stop.position - b.stop.position)
                .map(({ stop, originalIndex }, sortedIndex) => (
                  <div key={originalIndex} className="group relative">
                    <ColorRow
                      label={
                        sortedIndex === 0
                          ? "Start"
                          : sortedIndex === state.gradient.stops.length - 1
                            ? "End"
                            : `Stop ${sortedIndex + 1}`
                      }
                      value={stop.color as HexColor}
                      position={Math.round(stop.position)}
                      onChange={(val: HexColor) => handleGradientColorChange(originalIndex, val)}
                      onPositionChange={(pos) => handleGradientPositionChange(originalIndex, pos)}
                    />
                    {state.gradient.stops.length > 2 && (
                      <button
                        onClick={() => handleRemoveStop(originalIndex)}
                        className="text-destructive-foreground absolute -top-1 -right-1 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-background bg-destructive text-[8px] opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
            </div>

            <button
              onClick={handleAddStop}
              className="h-7 w-full rounded-sm border border-dashed border-border/60 text-[10px] tracking-widest text-foreground/50 transition-all hover:border-foreground/20 hover:bg-muted/10 hover:text-foreground"
            >
              / ADD STOP
            </button>

            <div className="space-y-3 border-t border-border/60 pt-3">
              <div className="flex h-[34px] w-full items-center justify-between rounded-sm border border-border/40 bg-muted/10 px-2 transition-all hover:border-foreground/20">
                <span className="ml-1 text-[10px] tracking-widest text-foreground/70 uppercase">
                  Projection
                </span>
                <div className="flex items-center gap-1">
                  {(["linear", "radial", "angular"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => onChange({ gradient: { ...state.gradient, type: t } })}
                      className={cn(
                        "h-5 rounded-sm px-2 text-[8px] tracking-tighter uppercase transition-all",
                        state.gradient.type === t
                          ? "bg-foreground text-background"
                          : "text-foreground/40 hover:bg-muted/20 hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {state.gradient.type === "linear" && (
                <Scrubber
                  label="Angle"
                  value={state.gradient.angle}
                  onChange={(v) => onChange({ gradient: { ...state.gradient, angle: v } })}
                  min={0}
                  max={360}
                />
              )}

              {(state.gradient.type === "radial" || state.gradient.type === "angular") && (
                <div className="space-y-2">
                  <Scrubber
                    label="Center X"
                    value={state.gradient.cx ?? 50}
                    onChange={(v) => onChange({ gradient: { ...state.gradient, cx: v } })}
                    min={0}
                    max={100}
                  />
                  <Scrubber
                    label="Center Y"
                    value={state.gradient.cy ?? 50}
                    onChange={(v) => onChange({ gradient: { ...state.gradient, cy: v } })}
                    min={0}
                    max={100}
                  />
                  {state.gradient.type === "radial" && (
                    <Scrubber
                      label="Radius"
                      value={state.gradient.r ?? 50}
                      onChange={(v) => onChange({ gradient: { ...state.gradient, r: v } })}
                      min={5}
                      max={150}
                    />
                  )}
                  {state.gradient.type === "angular" && (
                    <Scrubber
                      label="Angle"
                      value={state.gradient.angle}
                      onChange={(v) => onChange({ gradient: { ...state.gradient, angle: v } })}
                      min={0}
                      max={360}
                    />
                  )}
                </div>
              )}

              <div className="flex h-[34px] w-full items-center justify-between rounded-sm border border-border/40 bg-muted/10 px-2 transition-all hover:border-foreground/20">
                <span className="ml-1 text-[10px] tracking-widest text-foreground/70 uppercase">
                  Spread
                </span>
                <div className="flex items-center gap-1">
                  {(["pad", "repeat", "reflect"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => onChange({ gradient: { ...state.gradient, spreadMethod: m } })}
                      className={cn(
                        "h-5 rounded-sm px-2 text-[8px] tracking-tighter uppercase transition-all",
                        (state.gradient.spreadMethod ?? "pad") === m
                          ? "bg-foreground text-background"
                          : "text-foreground/40 hover:bg-muted/20 hover:text-foreground",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex h-[34px] w-full items-center justify-between rounded-sm border border-border/40 bg-muted/10 px-2 transition-all hover:border-foreground/20">
                <span className="ml-1 text-[10px] tracking-widest text-foreground/70 uppercase">
                  Apply To
                </span>
                <div className="flex items-center gap-1">
                  {(["stroke", "fill", "both"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => onChange({ gradient: { ...state.gradient, target: t } })}
                      className={cn(
                        "h-5 rounded-sm px-2 text-[8px] tracking-tighter uppercase transition-all",
                        target === t
                          ? "bg-foreground text-background"
                          : "text-foreground/40 hover:bg-muted/20 hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {mode === "gradient" && (
          <div className="group relative flex h-[34px] w-full items-center overflow-hidden rounded-sm border border-border/40 px-2 transition-all hover:border-foreground/20">
            <div
              className="absolute inset-0 opacity-100"
              style={{ background: gradientPreviewStyle.background }}
            />

            <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-32 bg-gradient-to-r from-background via-background/60 to-transparent" />

            <span className="relative z-10 ml-1 text-[10px] font-medium tracking-widest whitespace-nowrap text-foreground uppercase">
              Surface Preview
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
