"use client";

import { useCallback } from 'react';
import { CustomizationState } from "@/lib/types";
import { HexColor } from "@/lib/color-utils";
import { ColorRow } from './color-section/color-row';
import { cn } from "@/lib/utils";
import { Section } from "../components/Section";
import { Scrubber } from "@/components/ui/scrubber";

interface ColorSectionProps {
    state: CustomizationState;
    onChange: (updates: Partial<CustomizationState>) => void;
}

export function ColorSection({ state, onChange }: ColorSectionProps) {
    const handleSolidChange = useCallback((hex: HexColor) => {
        const newColors = [...state.colors];
        newColors[0] = hex;
        onChange({ colors: newColors });
    }, [state.colors, onChange]);

    const handleGradientColorChange = useCallback((index: number, hex: HexColor) => {
        const newStops = [...state.gradient.stops];
        newStops[index] = { ...newStops[index], color: hex };
        onChange({ gradient: { ...state.gradient, stops: newStops } });
    }, [state.gradient, onChange]);

    const handleGradientPositionChange = useCallback((index: number, position: number) => {
        const newStops = [...state.gradient.stops];
        newStops[index] = { ...newStops[index], position: Math.max(0, Math.min(100, position)) };
        onChange({ gradient: { ...state.gradient, stops: newStops } });
    }, [state.gradient, onChange]);

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
        onChange({ gradient: { ...state.gradient, stops: [...stops, { color: stops[0].color, position: bestPos }] } });
    }, [state.gradient, onChange]);

    const handleRemoveStop = useCallback((index: number) => {
        if (state.gradient.stops.length <= 2) return;
        const newStops = state.gradient.stops.filter((_, i) => i !== index);
        onChange({ gradient: { ...state.gradient, stops: newStops } });
    }, [state.gradient, onChange]);

    const mode = state.iconGradient ? 'gradient' : 'solid';
    const target = state.gradient.target ?? "both";
    const sortedStopsForPreview = [...state.gradient.stops].sort((a, b) => a.position - b.position);
    const gradientPreviewStyle = {
        background: state.gradient.type === 'radial'
            ? `radial-gradient(circle at ${state.gradient.cx ?? 50}% ${state.gradient.cy ?? 50}%, ${sortedStopsForPreview.map(s => `${s.color} ${s.position}%`).join(', ')})`
            : state.gradient.type === 'angular'
                ? `conic-gradient(from ${state.gradient.angle}deg at ${state.gradient.cx ?? 50}% ${state.gradient.cy ?? 50}%, ${sortedStopsForPreview.map(s => `${s.color} ${s.position}%`).join(', ')})`
                : `linear-gradient(${state.gradient.angle}deg, ${sortedStopsForPreview.map(s => `${s.color} ${s.position}%`).join(', ')})`
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-foreground/70">Color</span>
                <div className="flex bg-muted/20 rounded-md p-0.5 border border-border/50" role="group" aria-label="Color mode">
                    <button
                        onClick={() => onChange({ iconGradient: false })}
                        className={cn(
                            "relative px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-tighter transition-all duration-150 outline-none",
                            mode === 'solid' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-foreground/40 hover:text-foreground hover:bg-background/40"
                        )}
                    >
                        Solid
                    </button>
                    <button
                        onClick={() => onChange({ iconGradient: true })}
                        className={cn(
                            "relative px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-tighter transition-all duration-150 outline-none",
                            mode === 'gradient' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-foreground/40 hover:text-foreground hover:bg-background/40"
                        )}
                    >
                        Gradient
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {mode === 'solid' ? (
                    <div key="solid" className="space-y-1.5">
                        <ColorRow
                            label="Primary"
                            value={state.colors[0] as HexColor}
                            onChange={handleSolidChange}
                        />
                    </div>
                ) : (
                        <div key="gradient" className="flex flex-col gap-3">
                            <div className="space-y-1.5">
                                {state.gradient.stops.map((stop, i) => (
                                    <div key={i} className="group relative">
                                        <ColorRow
                                            label={i === 0 ? "Start" : i === state.gradient.stops.length - 1 ? "End" : `Stop ${i + 1}`}
                                            value={stop.color as HexColor}
                                            position={Math.round(stop.position)}
                                            onChange={(val: HexColor) => handleGradientColorChange(i, val)}
                                            onPositionChange={(pos) => handleGradientPositionChange(i, pos)}
                                        />
                                        {state.gradient.stops.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveStop(i)}
                                                className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-background shadow-sm z-20"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAddStop}
                                className="h-7 w-full border border-dashed border-border/60 hover:border-foreground/20 hover:bg-muted/10 rounded-sm text-[10px] tracking-widest text-foreground/50 hover:text-foreground transition-all"
                            >
                                / ADD STOP
                            </button>

                            <div className="space-y-3 pt-3 border-t border-border/60">
                                <div className="flex h-[34px] w-full items-center justify-between rounded-sm border border-border/40 bg-muted/10 px-2 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.08)] transition-all hover:border-foreground/20">
                                    <span className="text-[10px] tracking-widest text-foreground/70 uppercase ml-1">Projection</span>
                                    <div className="flex items-center gap-1">
                                        {(['linear', 'radial', 'angular'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => onChange({ gradient: { ...state.gradient, type: t } })}
                                                className={cn(
                                                    "h-5 rounded-sm px-2 text-[8px] uppercase tracking-tighter transition-all",
                                                    state.gradient.type === t 
                                                        ? "bg-foreground text-background" 
                                                        : "text-foreground/40 hover:text-foreground hover:bg-muted/20"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {state.gradient.type === 'linear' && (
                                    <Scrubber
                                        label="Angle"
                                        value={state.gradient.angle}
                                        onChange={(v) => onChange({ gradient: { ...state.gradient, angle: v } })}
                                        min={0}
                                        max={360}
                                    />
                                )}

                                {(state.gradient.type === 'radial' || state.gradient.type === 'angular') && (
                                    <div className="space-y-2">
                                        <Scrubber label="Center X" value={state.gradient.cx ?? 50} onChange={(v) => onChange({ gradient: { ...state.gradient, cx: v } })} min={0} max={100} />
                                        <Scrubber label="Center Y" value={state.gradient.cy ?? 50} onChange={(v) => onChange({ gradient: { ...state.gradient, cy: v } })} min={0} max={100} />
                                        {state.gradient.type === 'radial' && (
                                            <Scrubber label="Radius" value={state.gradient.r ?? 50} onChange={(v) => onChange({ gradient: { ...state.gradient, r: v } })} min={5} max={150} />
                                        )}
                                        {state.gradient.type === 'angular' && (
                                            <Scrubber label="Angle" value={state.gradient.angle} onChange={(v) => onChange({ gradient: { ...state.gradient, angle: v } })} min={0} max={360} />
                                        )}
                                    </div>
                                )}


                                <div className="flex h-[34px] w-full items-center justify-between rounded-sm border border-border/40 bg-muted/10 px-2 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.08)] transition-all hover:border-foreground/20">
                                    <span className="text-[10px] tracking-widest text-foreground/70 uppercase ml-1">Spread</span>
                                    <div className="flex items-center gap-1">
                                        {(['pad', 'repeat', 'reflect'] as const).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => onChange({ gradient: { ...state.gradient, spreadMethod: m } })}
                                                className={cn(
                                                    "h-5 rounded-sm px-2 text-[8px] uppercase tracking-tighter transition-all",
                                                    (state.gradient.spreadMethod ?? 'pad') === m 
                                                        ? "bg-foreground text-background" 
                                                        : "text-foreground/40 hover:text-foreground hover:bg-muted/20"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex h-[34px] w-full items-center justify-between rounded-sm border border-border/40 bg-muted/10 px-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-foreground/20">
                                    <span className="text-[10px] tracking-widest text-foreground/70 uppercase ml-1">Apply To</span>
                                    <div className="flex items-center gap-1">
                                        {(['stroke', 'fill', 'both'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => onChange({ gradient: { ...state.gradient, target: t } })}
                                                className={cn(
                                                    "h-5 rounded-sm px-2 text-[8px] uppercase tracking-tighter transition-all",
                                                    target === t 
                                                        ? "bg-foreground text-background" 
                                                        : "text-foreground/40 hover:text-foreground hover:bg-muted/20"
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
                {mode === 'gradient' && (
                    <div className="relative flex h-[34px] w-full items-center rounded-sm border border-border/40 px-2 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.08)] transition-all hover:border-foreground/20 overflow-hidden group">
                        <div 
                            className="absolute inset-0 opacity-100"
                            style={{ background: gradientPreviewStyle.background }}
                        />
                        
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/60 to-transparent pointer-events-none z-0" />
                        
                        <span className="relative z-10 text-[10px] uppercase tracking-widest text-foreground ml-1 whitespace-nowrap font-medium drop-shadow-sm">
                            Surface Preview
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
