"use client";

import { useMemo, useRef, useState } from "react";
import type { EditorDocument } from "@/lib/editor/types";
import type { CustomizationState } from "@/lib/types";
import { resolveEditorPathPaint } from "@/lib/editor/svg";
import {
  simplifyPoints,
  pointsToSmoothPath,
  rectPath,
  ellipsePath,
  linePath,
  constrainShapePoint,
  type DrawPoint,
} from "@/components/editor/utils/draw-utils";
import type { DrawTool } from "@/components/editor/controls/EditorDrawToolbar";

interface EditorDrawCanvasProps {
  document: EditorDocument | null;
  state: CustomizationState;
  viewBox: string;
  onAddPath: (d: string, opts?: { fill?: string; stroke?: string }) => void;
  activeTool?: DrawTool;
  closePath?: boolean;
  fillMode?: boolean;
  onErasePath?: (pathId: string) => void;
  showReference?: boolean;
  referencePathIds?: Set<string>;
}

const MIN_POINTS_FOR_STROKE = 3;
const SIMPLIFY_TOLERANCE = 0.3;

const EMPTY_REFERENCE_IDS: Set<string> = new Set();

export function EditorDrawCanvas({
  document: editorDocument,
  state,
  viewBox,
  onAddPath,
  activeTool = "pen",
  closePath = false,
  fillMode = false,
  onErasePath,
  showReference = false,
  referencePathIds = EMPTY_REFERENCE_IDS,
}: EditorDrawCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rawPointsRef = useRef<DrawPoint[]>([]);
  const isDrawingRef = useRef(false);
  const shapeStartRef = useRef<DrawPoint | null>(null);
  const shiftPressedRef = useRef(false);

  const [drawingPoints, setDrawingPoints] = useState<DrawPoint[]>([]);
  const [shapeStart, setShapeStart] = useState<DrawPoint | null>(null);
  const [shapeEnd, setShapeEnd] = useState<DrawPoint | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const viewBoxParts = useMemo(() => viewBox.split(" ").map(Number), [viewBox]);
  const vbSize = Math.max(viewBoxParts[2] || 24, viewBoxParts[3] || 24);
  const vbPad = vbSize * 0.1;
  const paddedViewBox = `${(viewBoxParts[0] || 0) - vbPad} ${(viewBoxParts[1] || 0) - vbPad} ${(viewBoxParts[2] || 24) + vbPad * 2} ${(viewBoxParts[3] || 24) + vbPad * 2}`;
  const scaleFactor = vbSize / 250;

  const paths = editorDocument?.paths ?? [];

  const COMMIT_FILL = "currentColor";

  const isShapeTool =
    activeTool === "rect" || activeTool === "ellipse" || activeTool === "line";
  const isEraserTool = activeTool === "eraser";

  function clientToSvg(clientX: number, clientY: number): DrawPoint | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    const vbX = viewBoxParts[0] || 0;
    const vbY = viewBoxParts[1] || 0;
    const vbW = viewBoxParts[2] || 24;
    const vbH = viewBoxParts[3] || 24;
    return {
      x: Math.max(vbX, Math.min(vbX + vbW, pt.x)),
      y: Math.max(vbY, Math.min(vbY + vbH, pt.y)),
    };
  }

  function applyConstraint(start: DrawPoint, end: DrawPoint): DrawPoint {
    if (!shiftPressedRef.current || activeTool === "pen" || activeTool === "eraser") {
      return end;
    }
    return constrainShapePoint(start, end, activeTool);
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    if (isEraserTool) return; // eraser fires on path click (Stage 4)

    const point = clientToSvg(e.clientX, e.clientY);
    if (!point) return;

    shiftPressedRef.current = e.shiftKey;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    setIsDrawing(true);

    if (isShapeTool) {
      shapeStartRef.current = point;
      setShapeStart(point);
      setShapeEnd(point);
    } else {
      rawPointsRef.current = [point];
      setDrawingPoints([point]);
    }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDrawingRef.current) return;

    const point = clientToSvg(e.clientX, e.clientY);
    if (!point) return;

    shiftPressedRef.current = e.shiftKey;

    if (isShapeTool) {
      const start = shapeStartRef.current;
      if (!start) return;
      setShapeEnd(applyConstraint(start, point));
    } else {
      rawPointsRef.current.push(point);
      setDrawingPoints([...rawPointsRef.current]);
    }
  }

  function commitPenStroke() {
    const raw = rawPointsRef.current;
    rawPointsRef.current = [];
    setDrawingPoints([]);

    if (raw.length < MIN_POINTS_FOR_STROKE) return;

    const simplified = simplifyPoints(raw, SIMPLIFY_TOLERANCE);
    let d = pointsToSmoothPath(simplified);
    if (!d) return;
    if (closePath) d += " Z";

    onAddPath(d, {
      fill: fillMode ? COMMIT_FILL : "none",
    });
  }

  function commitShape() {
    const start = shapeStartRef.current;
    shapeStartRef.current = null;
    const endRaw = shapeEnd;
    setShapeStart(null);
    setShapeEnd(null);

    if (!start || !endRaw) return;
    const end = applyConstraint(start, endRaw);

    let d = "";
    let closed = true;
    if (activeTool === "rect") {
      d = rectPath(start, end, true);
    } else if (activeTool === "ellipse") {
      d = ellipsePath(start, end);
    } else if (activeTool === "line") {
      d = linePath(start, end);
      closed = false;
    }

    if (!d) return;

    onAddPath(d, {
      fill: fillMode && closed ? COMMIT_FILL : "none",
    });
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;
    setIsDrawing(false);

    if (isShapeTool) {
      commitShape();
    } else {
      commitPenStroke();
    }
  }

  const livePolyline = useMemo(() => {
    if (drawingPoints.length < 2) return "";
    return drawingPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }, [drawingPoints]);

  const shapePreviewD = useMemo(() => {
    if (!shapeStart || !shapeEnd) return "";
    if (activeTool === "rect") return rectPath(shapeStart, shapeEnd, true);
    if (activeTool === "ellipse") return ellipsePath(shapeStart, shapeEnd);
    if (activeTool === "line") return linePath(shapeStart, shapeEnd);
    return "";
  }, [shapeStart, shapeEnd, activeTool]);

  const cursor = isEraserTool
    ? "crosshair"
    : isDrawing
      ? "crosshair"
      : "crosshair";

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <svg
          ref={svgRef}
          viewBox={paddedViewBox}
          className="relative z-10 h-full w-full"
          style={{
            touchAction: "none",
            overflow: "hidden",
            cursor,
          }}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <g>
            {paths
              .filter((p) => {
                if (!p.visible) return false;
                const isReference = referencePathIds.has(p.id);
                if (isReference && !showReference) return false;
                return true;
              })
              .map((p) => {
                const paint = resolveEditorPathPaint(p, state);
                const isErasable = isEraserTool && !!onErasePath;
                const isReference = referencePathIds.has(p.id);
                const renderedOpacity = isReference
                  ? (p.opacity ?? 1) * 0.15
                  : p.opacity;

                return (
                  <path
                    key={p.id}
                    d={p.d}
                    fill={paint.fill}
                    stroke={paint.stroke}
                    strokeWidth={p.strokeWidth ?? 1.5}
                    strokeLinecap={p.strokeLinecap ?? "round"}
                    strokeLinejoin={p.strokeLinejoin ?? "round"}
                    opacity={renderedOpacity}
                    pointerEvents={isErasable ? "all" : "none"}
                    style={isErasable ? { cursor: "crosshair" } : undefined}
                    onClick={
                      isErasable
                        ? (e) => {
                            e.stopPropagation();
                            onErasePath?.(p.id);
                          }
                        : undefined
                    }
                  />
                );
              })}

            {livePolyline ? (
              <polyline
                points={livePolyline}
                fill="none"
                stroke="#1890ff"
                strokeWidth={2 * scaleFactor}
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            ) : null}

            {shapePreviewD ? (
              <path
                d={shapePreviewD}
                fill={
                  fillMode && activeTool !== "line"
                    ? "currentColor"
                    : "none"
                }
                fillOpacity={
                  fillMode && activeTool !== "line" ? 0.2 : 1
                }
                stroke="#1890ff"
                strokeWidth={2 * scaleFactor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${4 * scaleFactor} ${3 * scaleFactor}`}
                pointerEvents="none"
              />
            ) : null}
          </g>
        </svg>
      </div>
    </div>
  );
}
