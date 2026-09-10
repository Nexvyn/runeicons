import { memo, useMemo } from "react";

import { buildConicSegments } from "@/lib/gradient-utils";
import { CustomizationState } from "@/lib/types";

interface SvgDefinitionsProps {
  state: CustomizationState;
}

export const SvgDefinitions = memo(function SvgDefinitions({ state }: SvgDefinitionsProps) {
  const spreadMethod = (state.gradient.spreadMethod ?? "pad") as "pad" | "reflect" | "repeat";
  const gCx = ((state.gradient.cx ?? 50) / 100) * 24;
  const gCy = ((state.gradient.cy ?? 50) / 100) * 24;
  const gR = ((state.gradient.r ?? 50) / 100) * 24;

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
    <svg width="0" height="0" className="pointer-events-none invisible absolute" aria-hidden="true">
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
                stopColor={stop.color || "#000000"}
                stopOpacity={1}
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
                stopColor={stop.color || "#000000"}
                stopOpacity={1}
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
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation={(state.shadow.blur / state.width) * 24}
            result="blur"
          />
          <feOffset
            in="blur"
            dx={(state.shadow.offsetX / state.width) * 24}
            dy={(state.shadow.offsetY / state.height) * 24}
            result="offsetBlur"
          />
          <feComposite operator="out" in="SourceAlpha" in2="offsetBlur" result="inverse" />
          <feFlood floodColor="black" floodOpacity={state.shadow.opacity / 100} result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>

        {state.shadow.enabled &&
          !state.shadow.inner &&
          state.shadow.opacity > 0 &&
          state.iconType !== "pixelated" &&
          state.iconType !== "glass" && (
            <filter id="drop-shadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow
                dx={(state.shadow.offsetX / Math.max(state.width, 1)) * 24}
                dy={(state.shadow.offsetY / Math.max(state.height, 1)) * 24}
                stdDeviation={(state.shadow.blur / Math.max(state.width, 1)) * 24}
                floodColor="black"
                floodOpacity={state.shadow.opacity / 100}
              />
            </filter>
          )}

        <filter
          id="noise-filter"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" result="grayNoise" />
          <feColorMatrix
            in="grayNoise"
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

        {state.texture.enabled && state.texture.selected !== "none" && (
          <pattern id="texture-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <image
              href={`/textures/${state.texture.selected}.png`}
              width="24"
              height="24"
              opacity={state.texture.opacity / 100}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        )}
      </defs>
    </svg>
  );
});
