"use client";

import { useCallback, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  parseSvgPath,
  pointsToSvgPath,
  addControlPointsToAllAnchors,
  type ControlPoint,
} from "@/components/editor/utils/svg-path-utils";

const ROCKET_PATHS = [
  "M34.6981 57.4011L27.8523 50.5553H16.7764C12.9222 50.5553 10.5417 46.3507 12.5246 43.0459L18.5609 32.9855C21.2491 28.5051 26.091 25.7637 31.3161 25.7637H48.9254C61.401 12.1537 74.9144 2.69453 92.3142 1.18412C95.0423 0.94731 97.2939 3.19859 97.0569 5.92672C95.5466 23.3264 86.0876 36.8401 72.4774 49.3158V66.9248C72.4774 72.1499 69.736 76.9917 65.2556 79.6801L55.1952 85.7164C51.8904 87.6992 47.6858 85.3187 47.6858 81.4646V70.3887L41.1919 63.8949M34.6981 57.4011H24.0005C21.3304 57.4011 19.9907 60.6271 21.8753 62.5186L36.0668 76.7616C37.9551 78.6567 41.1919 77.3194 41.1919 74.6441V63.8949M34.6981 57.4011L41.1919 63.8949",
  "M27.8475 50.5553L48.9204 25.7637",
  "M72.4725 49.3154L47.6808 70.3883",
  "M72.4725 34.5817C77.3429 34.5817 81.2912 30.6334 81.2912 25.763C81.2912 20.8926 77.3429 16.9443 72.4725 16.9443C67.6021 16.9443 63.6539 20.8926 63.6539 25.763C63.6539 30.6334 67.6021 34.5817 72.4725 34.5817Z",
  "M8.83633 72.3978C2.95908 77.3347 1 91.9886 1 91.9886C1 91.9886 15.6539 90.0295 20.5908 84.1523C23.3727 80.861 23.3335 75.8066 20.2382 72.7504C18.7152 71.2968 16.7091 70.4569 14.6048 70.3918C12.5004 70.3267 10.4462 71.0411 8.83633 72.3978Z",
  "M15.6045 90.394C15.3693 91.5423 15.3066 91.9888 15.3066 91.9888C15.3066 91.9888 23.8064 90.8525 26.67 87.4435C28.2836 85.5344 28.2609 82.6027 26.4655 80.83C25.9088 80.2987 25.2731 80.0084 24.9395 79.915",
];

const VB = { x: -4, y: -4, w: 107, h: 101 };
const SCALE = Math.max(VB.w, VB.h) / 250;

function clonePoints(pts: ControlPoint[]) {
  return pts.map((p) => ({ ...p }));
}

function initAllPaths() {
  return ROCKET_PATHS.map((d) => {
    try {
      const pts = addControlPointsToAllAnchors(parseSvgPath(d));
      return { d: pointsToSvgPath(pts), points: pts };
    } catch {
      return { d, points: [] as ControlPoint[] };
    }
  });
}

const INITIAL_PATHS = initAllPaths();

export default function RocketInteractive() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState(INITIAL_PATHS);
  const [isModified, setIsModified] = useState(false);
  const dragRef = useRef<{ pathIdx: number; ptIdx: number } | null>(null);

  const toSvgCoords = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }, []);

  const onPointDown = (pathIdx: number, ptIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = { pathIdx, ptIdx };
  };

  const onReset = () => {
    setPaths(initAllPaths());
    setIsModified(false);
  };

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const coord = toSvgCoords(e);
    if (!coord || Number.isNaN(coord.x) || Number.isNaN(coord.y)) return;

    setPaths((prev) => {
      const next = [...prev];
      const entry = next[drag.pathIdx];
      const pts = clonePoints(entry.points);
      const pt = pts[drag.ptIdx];
      if (!pt) return prev;

      const dx = coord.x - pt.x;
      const dy = coord.y - pt.y;
      pts[drag.ptIdx] = { ...pt, x: coord.x, y: coord.y };

      if (!pt.isControl) {
        for (const offset of [-2, -1, 1, 2]) {
          const neighbor = pts[drag.ptIdx + offset];
          if (neighbor?.isControl) {
            pts[drag.ptIdx + offset] = { ...neighbor, x: neighbor.x + dx, y: neighbor.y + dy };
          }
        }
      }

      next[drag.pathIdx] = { d: pointsToSvgPath(pts), points: pts };
      return next;
    });
    setIsModified(true);
  }, [toSvgCoords]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const viewBox = `${VB.x} ${VB.y} ${VB.w} ${VB.h}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center lg:p-8 xl:p-12">
      {isModified && (
        <button
          type="button"
          onClick={onReset}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 ease-out"
          aria-label="Reset rocket"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full max-w-full max-h-full"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ touchAction: "none" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {paths.map((entry, pathIdx) => (
          <path
            key={pathIdx}
            d={entry.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={pathIdx <= 2 ? 2.33 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
        ))}

        {paths.map((entry, pathIdx) =>
          entry.points.map((pt, i) => {
            const isAnchor = !pt.isControl;

            const pts = entry.points;
            let anchorIdx = -1;
            if (pt.isControl) {
              for (let c = i - 1; c >= 0; c--) {
                if (!pts[c].isControl) { anchorIdx = c; break; }
              }
              if (anchorIdx === -1) {
                for (let c = i + 1; c < pts.length; c++) {
                  if (!pts[c].isControl) { anchorIdx = c; break; }
                }
              }
            }

            return (
              <g key={`p${pathIdx}-pt${i}`}>
                {pt.isControl && anchorIdx !== -1 && (
                  <line
                    x1={pts[anchorIdx].x}
                    y1={pts[anchorIdx].y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="rgba(37,99,235,0.4)"
                    strokeWidth={0.6 * SCALE}
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isAnchor ? 4 * SCALE : 2.8 * SCALE}
                  fill={isAnchor ? "#2563eb" : "#ff4d4f"}
                  stroke="white"
                  strokeWidth={0.8 * SCALE}
                  style={{ cursor: "move" }}
                  onMouseDown={(e) => onPointDown(pathIdx, i, e)}
                />
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
