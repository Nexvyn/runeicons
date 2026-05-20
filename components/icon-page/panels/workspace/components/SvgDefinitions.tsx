import { memo, useMemo } from "react";
import { CustomizationState } from "@/lib/types";
import { buildConicSegments } from "@/lib/gradient-utils";

interface SvgDefinitionsProps {
  state: CustomizationState;
}

export const SvgDefinitions = memo(function SvgDefinitions({ state }: SvgDefinitionsProps) {
  const spreadMethod = (state.gradient.spreadMethod ?? "pad") as "pad" | "reflect" | "repeat";
  const gCx = ((state.gradient.cx ?? 50) / 100) * 24;
  const gCy = ((state.gradient.cy ?? 50) / 100) * 24;
  const gR  = ((state.gradient.r  ?? 50) / 100) * 24;

  const sortedStops = useMemo(
    () => [...state.gradient.stops].sort((a, b) => a.position - b.position),
    [state.gradient.stops],
  );

  const conicSegments = useMemo(
    () =>
      state.gradient.type === "angular"
        ? buildConicSegments(state.gradient.stops, state.gradient.angle, gCx, gCy, 17)
        : [],
    [state.gradient.type, state.gradient.stops, state.gradient.angle, gCx, gCy],
  );

  return (
    <svg
      width="0"
      height="0"
      className="absolute invisible pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        {state.gradient.type === "linear" && (
          <linearGradient
            id="icon-gradient"
            x1={`${(12 - 12 * Math.sin((state.gradient.angle * Math.PI) / 180)).toFixed(3)}`}
            y1={`${(12 + 12 * Math.cos((state.gradient.angle * Math.PI) / 180)).toFixed(3)}`}
            x2={`${(12 + 12 * Math.sin((state.gradient.angle * Math.PI) / 180)).toFixed(3)}`}
            y2={`${(12 - 12 * Math.cos((state.gradient.angle * Math.PI) / 180)).toFixed(3)}`}
            gradientUnits="userSpaceOnUse"
            spreadMethod={spreadMethod}
          >
            {sortedStops.map((stop, i) => (
              <stop
                key={`stop-${i}-${stop.position}`}
                offset={`${Math.max(0, Math.min(100, stop.position))}%`}
                stopColor={stop.color || "#000000"} stopOpacity={1}
              />
            ))}
          </linearGradient>
        )}

        {state.gradient.type === "radial" && (
          <radialGradient
            id="icon-gradient"
            cx={gCx}
            cy={gCy}
            r={gR}
            gradientUnits="userSpaceOnUse"
            spreadMethod={spreadMethod}
          >
            {sortedStops.map((stop, i) => (
              <stop
                key={`stop-${i}-${stop.position}`}
                offset={`${Math.max(0, Math.min(100, stop.position))}%`}
                stopColor={stop.color || "#000000"} stopOpacity={1}
              />
            ))}
          </radialGradient>
        )}

        {state.gradient.type === "angular" && (
          <pattern id="icon-gradient" width="24" height="24" patternUnits="userSpaceOnUse">
            {conicSegments.map((seg, i) => (
              <polygon key={i} points={seg.points} fill={seg.color} />
            ))}
          </pattern>
        )}

        <filter id="inner-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={state.blur} result="blur" />
          <feComposite operator="in" in="blur" in2="SourceAlpha" />
        </filter>

        <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={state.shadow.blur} result="blur" />
          <feComposite operator="out" in="SourceAlpha" in2="blur" result="inverse" />
          <feFlood floodColor="black" floodOpacity={state.shadow.opacity / 100} result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>

        <filter id="noise-filter" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values={`0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 ${(state.noise.intensity / 100).toFixed(3)} 0`}
            result="colorNoise"
          />
          <feComposite operator="in" in="colorNoise" in2="SourceGraphic" result="maskedNoise" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="maskedNoise" />
          </feMerge>
        </filter>

        {state.iconType === "pixelated" && (
          <filter id="pixelate" x="0%" y="0%" width="100%" height="100%">
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1" />
              <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1" />
              <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1" />
            </feComponentTransfer>
          </filter>
        )}

        {state.iconType === "dither" && (
          <filter id="dither-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="alpha"
            />
            <feComposite operator="in" in="SourceGraphic" in2="alpha" />
          </filter>
        )}

        {state.texture.enabled && state.texture.selected !== "none" && (
          <filter id="texture-filter" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feImage 
              href={`/textures/${state.texture.selected}.png`} 
              result="tex" 
              width="256" 
              height="256"
              preserveAspectRatio="xMidYMid slice"
            />
            <feTile in="tex" result="tiledTex" />
            <feComposite operator="in" in="tiledTex" in2="SourceAlpha" result="maskedTex" />
            <feBlend in="maskedTex" in2="SourceGraphic" mode="multiply" result="blended" />
            <feComposite operator="arithmetic" k1="0" k2={state.texture.opacity / 100} k3={1 - state.texture.opacity / 200} k4="0" in="blended" in2="SourceGraphic" />
          </filter>
        )}
      </defs>
    </svg>
  );
});
