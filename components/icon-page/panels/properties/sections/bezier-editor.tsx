"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EASING_PRESETS } from "@/lib/editor/animation-engine";
import { cn } from "@/lib/utils";

interface BezierEditorProps {
  value: string;
  onChange: (v: string) => void;
}

function parseCubicBezier(value: string): [number, number, number, number] {
  const m = value.match(/cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/);
  if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
  return [0.25, 0.46, 0.45, 0.94];
}

function cubicBezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function buildCurvePath(x1: number, y1: number, x2: number, y2: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const px = cubicBezierPoint(t, 0, x1, x2, 1) * size;
    const py = size - cubicBezierPoint(t, 0, y1, y2, 1) * size;
    pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return pts.join(" ");
}

export function BezierEditor({ value, onChange }: BezierEditorProps) {
  const SIZE = 140;
  const PAD = 16;
  const INNER = SIZE - PAD * 2;

  const [params, setParams] = useState<[number, number, number, number]>(() => parseCubicBezier(value));
  const [dragging, setDragging] = useState<0 | 1 | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setParams(parseCubicBezier(value));
  }, [value]);

  const [x1, y1, x2, y2] = params;

  const toSvg = (nx: number, ny: number) => ({
    svgX: Math.max(4, Math.min(SIZE - 4, PAD + nx * INNER)),
    svgY: Math.max(4, Math.min(SIZE - 4, PAD + (1 - ny) * INNER)),
  });

  const fromSvg = (svgX: number, svgY: number) => ({
    nx: Math.max(0, Math.min(1, (svgX - PAD) / INNER)),
    ny: 1 - (svgY - PAD) / INNER,
  });

  const p1 = toSvg(x1, y1);
  const p2 = toSvg(x2, y2);

  const handlePointerDown = useCallback((handle: 0 | 1) => (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(handle);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;
    const { nx, ny } = fromSvg(svgX, svgY);
    const clamped = (v: number) => Math.max(-2, Math.min(3, v));

    const next = [...params] as [number, number, number, number];
    if (dragging === 0) { next[0] = Math.max(0, Math.min(1, nx)); next[1] = clamped(ny); }
    else { next[2] = Math.max(0, Math.min(1, nx)); next[3] = clamped(ny); }
    setParams(next);
    onChange(`cubic-bezier(${next.map((v) => +v.toFixed(3)).join(", ")})`);
  }, [dragging, params, onChange]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const curvePath = buildCurvePath(x1, y1, x2, y2, INNER);
  const curvePathOffset = `translate(${PAD}, ${PAD})`;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bezier Curve</div>

      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={cn("touch-none select-none mx-auto", dragging !== null && "cursor-grab")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
          <g stroke="currentColor" strokeOpacity="0.08" strokeWidth="1">
            {[0.25, 0.5, 0.75].map((f) => (
              <g key={f}>
                <line x1={PAD + f * INNER} y1={PAD} x2={PAD + f * INNER} y2={PAD + INNER} />
                <line x1={PAD} y1={PAD + f * INNER} x2={PAD + INNER} y2={PAD + f * INNER} />
              </g>
            ))}
          </g>

          <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

          <line x1={PAD} y1={PAD + INNER} x2={PAD + INNER} y2={PAD} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 3" />

          <g stroke="hsl(220 70% 60%)" strokeWidth="1" strokeOpacity="0.5">
            <line x1={PAD} y1={PAD + INNER} x2={p1.svgX} y2={p1.svgY} />
            <line x1={PAD + INNER} y1={PAD} x2={p2.svgX} y2={p2.svgY} />
          </g>

          <g transform={curvePathOffset}>
            <path d={curvePath} fill="none" stroke="hsl(220 80% 65%)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {([
            { point: p1, handle: 0 as const },
            { point: p2, handle: 1 as const },
          ] as const).map(({ point, handle }) => (
            <g key={handle}>
              <circle
                cx={point.svgX}
                cy={point.svgY}
                r={8}
                fill="transparent"
                className="cursor-grab"
                onPointerDown={handlePointerDown(handle)}
              />
              <circle
                cx={point.svgX}
                cy={point.svgY}
                r={4}
                fill="hsl(220 80% 65%)"
                stroke="white"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
            </g>
          ))}

          <circle cx={PAD} cy={PAD + INNER} r={3} fill="currentColor" fillOpacity="0.4" />
          <circle cx={PAD + INNER} cy={PAD} r={3} fill="currentColor" fillOpacity="0.4" />
        </svg>

      <input
        type="text"
        value={`cubic-bezier(${params.map((v) => +v.toFixed(3)).join(", ")})`}
        onChange={(e) => {
          const parsed = parseCubicBezier(e.target.value);
          setParams(parsed);
          onChange(`cubic-bezier(${parsed.map((v) => +v.toFixed(3)).join(", ")})`);
        }}
        className="w-full font-mono text-[10px] text-center bg-transparent border border-border/20 rounded px-2 py-1 focus:border-foreground/30 focus:outline-none transition-colors"
      />
    </div>
  );
}
