"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { EditorIconPath } from "@/lib/editor/types";
import type { CustomizationState } from "@/lib/types";
import {
  addControlPointsToAllAnchors,
  parseSvgPath,
  pointsToSvgPath,
  type ControlPoint,
} from "@/components/editor/utils/svg-path-utils";
import { ensureEditorPathEditable } from "@/lib/editor/path-data";
import { resolveEditorPathPaint } from "@/lib/editor/svg";

interface EditorPathCanvasProps {
  state: CustomizationState;
  path: EditorIconPath | null;
  allPaths?: EditorIconPath[];
  viewBox: string;
  onPreviewChange: (d: string) => void;
  onCommitChange: (d: string) => void;
  onSelectPath?: (pathId: string) => void;
}

function cloneControlPoints(points: ControlPoint[]) {
  return points.map((point) => ({ ...point }));
}

export function EditorPathCanvas({
  state,
  path,
  allPaths,
  viewBox,
  onPreviewChange,
  onCommitChange,
  onSelectPath,
}: EditorPathCanvasProps) {
  const editorRef = useRef<SVGSVGElement>(null);

  const controlPointsRef = useRef<ControlPoint[]>([]);
  const currentEditPathRef = useRef("");
  const historyRef = useRef<ControlPoint[][]>([]);
  const historyIndexRef = useRef(0);
  const draggedPointIndexRef = useRef(-1);

  const onPreviewChangeRef = useRef(onPreviewChange);
  const onCommitChangeRef = useRef(onCommitChange);
  useEffect(() => {
    onPreviewChangeRef.current = onPreviewChange;
    onCommitChangeRef.current = onCommitChange;
  });

  const rafIdRef = useRef(0);

  interface CanvasState {
    controlPoints: ControlPoint[];
    currentEditPath: string;
    error: string | null;
  }

  type CanvasAction =
    | { type: "flush"; controlPoints: ControlPoint[]; currentEditPath: string }
    | { type: "setError"; error: string | null }
    | { type: "reset"; controlPoints: ControlPoint[]; currentEditPath: string; error: string | null };

  const [canvas, dispatchCanvas] = useReducer(
    (state: CanvasState, action: CanvasAction): CanvasState => {
      switch (action.type) {
        case "flush":
          return { ...state, controlPoints: action.controlPoints, currentEditPath: action.currentEditPath };
        case "setError":
          return { ...state, error: action.error };
        case "reset":
          return { controlPoints: action.controlPoints, currentEditPath: action.currentEditPath, error: action.error };
      }
    },
    { controlPoints: [], currentEditPath: "", error: null },
  );
  const { controlPoints, currentEditPath, error } = canvas;
  const [draggedPointIndex, setDraggedPointIndex] = useState<number>(-1);
  const [hoverPointIndex, setHoverPointIndex] = useState<number | null>(null);

  const viewBoxParts = useMemo(
    () => viewBox.split(" ").map(Number),
    [viewBox],
  );
  const vbSize = Math.max(viewBoxParts[2] || 24, viewBoxParts[3] || 24);
  const scaleFactor = vbSize / 250;
  const vbPad = vbSize * 0.35;
  const paddedViewBox = `${(viewBoxParts[0] || 0) - vbPad} ${(viewBoxParts[1] || 0) - vbPad} ${(viewBoxParts[2] || 24) + vbPad * 2} ${(viewBoxParts[3] || 24) + vbPad * 2}`;

  const backgroundPaths = useMemo(() => {
    if (!allPaths || !path) return [];
    return allPaths.filter((p) => p.id !== path.id && p.visible);
  }, [allPaths, path]);

  const flushCanvasState = (
    nextPoints: ControlPoint[],
    nextPath: string,
  ) => {
    controlPointsRef.current = nextPoints;
    currentEditPathRef.current = nextPath;
    dispatchCanvas({ type: "flush", controlPoints: nextPoints, currentEditPath: nextPath });
  };

  const flushHistoryState = (
    nextHistory: ControlPoint[][],
    nextHistoryIndex: number,
  ) => {
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistoryIndex;
  };

  const cancelPendingRaf = () => {
    if (rafIdRef.current !== 0) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
  };

  const scheduleRafFlush = () => {
    if (rafIdRef.current !== 0) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = 0;
      dispatchCanvas({ type: "flush", controlPoints: controlPointsRef.current, currentEditPath: currentEditPathRef.current });
      if (draggedPointIndexRef.current !== -1) {
        onPreviewChangeRef.current(currentEditPathRef.current);
      }
    });
  };

  useEffect(() => cancelPendingRaf, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!path?.d) {
      controlPointsRef.current = [];
      currentEditPathRef.current = "";
      dispatchCanvas({ type: "reset", controlPoints: [], currentEditPath: "", error: null });
      flushHistoryState([], 0);
      return;
    }

    try {
      const normalized = ensureEditorPathEditable(path.d);
      const points = addControlPointsToAllAnchors(parseSvgPath(normalized));
      const nextPath = pointsToSvgPath(points);
      controlPointsRef.current = points;
      currentEditPathRef.current = nextPath;
      dispatchCanvas({ type: "reset", controlPoints: points, currentEditPath: nextPath, error: null });
      flushHistoryState([cloneControlPoints(points)], 0);
    } catch (caughtError) {
      controlPointsRef.current = [];
      currentEditPathRef.current = path.d;
      dispatchCanvas({
        type: "reset",
        controlPoints: [],
        currentEditPath: path.d,
        error: `Could not edit this path: ${
          caughtError instanceof Error ? caughtError.message : "Unknown error"
        }`,
      });
      flushHistoryState([], 0);
    }
  }, [path?.d, path?.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const startDrag = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    draggedPointIndexRef.current = index;
    setDraggedPointIndex(index);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!editorRef.current) return;

    const svg = editorRef.current;
    const transformMatrix = svg.getScreenCTM();
    if (!transformMatrix) return;

    const dragIdx = draggedPointIndexRef.current;
    if (dragIdx === -1) return;

    const svgPoint = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      transformMatrix.inverse(),
    );
    const nextX = svgPoint.x;
    const nextY = svgPoint.y;

    if (Number.isNaN(nextX) || Number.isNaN(nextY)) return;

    const nextPoints = cloneControlPoints(controlPointsRef.current);
    const currentPoint = nextPoints[dragIdx];
    if (!currentPoint) return;

    const dx = nextX - currentPoint.x;
    const dy = nextY - currentPoint.y;
    nextPoints[dragIdx] = { ...currentPoint, x: nextX, y: nextY };

    if (!currentPoint.isControl) {
      if (dragIdx > 0 && nextPoints[dragIdx - 1]?.isControl) {
        nextPoints[dragIdx - 1] = {
          ...nextPoints[dragIdx - 1],
          x: nextPoints[dragIdx - 1].x + dx,
          y: nextPoints[dragIdx - 1].y + dy,
        };
      }
      if (
        dragIdx < nextPoints.length - 1 &&
        nextPoints[dragIdx + 1]?.isControl
      ) {
        nextPoints[dragIdx + 1] = {
          ...nextPoints[dragIdx + 1],
          x: nextPoints[dragIdx + 1].x + dx,
          y: nextPoints[dragIdx + 1].y + dy,
        };
      }
    }

    controlPointsRef.current = nextPoints;
    currentEditPathRef.current = pointsToSvgPath(nextPoints);
    scheduleRafFlush();
  };

  const endDrag = () => {
    cancelPendingRaf();

    if (
      draggedPointIndexRef.current !== -1 &&
      controlPointsRef.current.length > 0
    ) {
      dispatchCanvas({ type: "flush", controlPoints: controlPointsRef.current, currentEditPath: currentEditPathRef.current });
      const nextHistory = [
        ...historyRef.current.slice(0, historyIndexRef.current + 1),
        cloneControlPoints(controlPointsRef.current),
      ];
      flushHistoryState(nextHistory, nextHistory.length - 1);
      onCommitChangeRef.current(currentEditPathRef.current);
    }

    draggedPointIndexRef.current = -1;
    setDraggedPointIndex(-1);
  };

  const removePoint = (index: number) => {
    if (controlPointsRef.current.length <= 2) return;

    const nextPoints = controlPointsRef.current.filter(
      (_, pointIndex) => pointIndex !== index,
    );
    const nextPath = pointsToSvgPath(nextPoints);
    const nextHistory = [
      ...historyRef.current.slice(0, historyIndexRef.current + 1),
      cloneControlPoints(nextPoints),
    ];

    flushCanvasState(nextPoints, nextPath);
    flushHistoryState(nextHistory, nextHistory.length - 1);
    onCommitChangeRef.current(nextPath);
  };

  if (!path) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Click a path on the canvas to edit it.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {error ? (
        <div className="h-full flex items-center justify-center p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="absolute inset-0">
          <svg
            ref={editorRef}
            viewBox={paddedViewBox}
            className="relative z-10 h-full w-full"
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            style={{ touchAction: "none", overflow: "hidden" }}
            onContextMenu={(event) => event.preventDefault()}
            preserveAspectRatio="xMidYMid meet"
          >
            <g>
              {backgroundPaths.map((bp) => {
                const paint = resolveEditorPathPaint(bp, state);

                return (
                  <path
                    key={bp.id}
                    d={bp.d}
                    fill={paint.fill}
                    stroke={paint.stroke}
                    strokeWidth={bp.strokeWidth ?? 1.5}
                    strokeLinecap={bp.strokeLinecap ?? "round"}
                    strokeLinejoin={bp.strokeLinejoin ?? "round"}
                    fillRule={bp.fillRule}
                    clipRule={bp.clipRule}
                    opacity={0.35}
                    style={{ cursor: onSelectPath ? "pointer" : undefined }}
                    onClick={
                      onSelectPath
                        ? (e) => {
                            e.stopPropagation();
                            onSelectPath(bp.id);
                          }
                        : undefined
                    }
                  />
                );
              })}

              {(() => {
                const paint = resolveEditorPathPaint(path, state);

                return (
                  <path
                    d={currentEditPath}
                    fill={paint.fill}
                    stroke={paint.stroke}
                    strokeWidth={path.strokeWidth ?? 1.5}
                    strokeLinecap={path.strokeLinecap ?? "round"}
                    strokeLinejoin={path.strokeLinejoin ?? "round"}
                    fillRule={path.fillRule}
                    clipRule={path.clipRule}
                  />
                );
              })()}

              {controlPoints.map((point, index) => {
                const isAnchor = !point.isControl;
                const isHovered = index === hoverPointIndex;
                const isDragging = index === draggedPointIndex;
                let anchorIndex = -1;

                if (point.isControl) {
                  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
                    if (!controlPoints[cursor].isControl) {
                      anchorIndex = cursor;
                      break;
                    }
                  }

                  if (anchorIndex === -1) {
                    for (
                      let cursor = index + 1;
                      cursor < controlPoints.length;
                      cursor += 1
                    ) {
                      if (!controlPoints[cursor].isControl) {
                        anchorIndex = cursor;
                        break;
                      }
                    }
                  }
                }

                return (
                  <g key={`${path.id}-point-${index}`}>
                    {point.isControl && anchorIndex !== -1 ? (
                      <line
                        x1={controlPoints[anchorIndex].x}
                        y1={controlPoints[anchorIndex].y}
                        x2={point.x}
                        y2={point.y}
                        stroke="rgba(37,99,235,0.5)"
                        strokeWidth={0.8 * scaleFactor}
                      />
                    ) : null}
                    {/* Hover ring */}
                    {isHovered && !isDragging ? (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={(isAnchor ? 8 : 6) * scaleFactor}
                        fill="none"
                        stroke={isAnchor ? "#3b82f6" : "#ff7875"}
                        strokeWidth={0.3 * scaleFactor}
                        pointerEvents="none"
                      />
                    ) : null}
                    {/* Shadow halo */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={(isAnchor ? 7 : 5) * scaleFactor}
                      fill="black"
                      opacity={0.15}
                      pointerEvents="none"
                    />
                    {/* Control point */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isAnchor ? 5 * scaleFactor : 3.5 * scaleFactor}
                      fill={
                        isAnchor
                          ? isDragging
                            ? "#1d4ed8"
                            : isHovered
                              ? "#3b82f6"
                              : "#2563eb"
                          : isDragging
                            ? "#e11d48"
                            : "#ff4d4f"
                      }
                      stroke="white"
                      strokeWidth={1 * scaleFactor}
                      onMouseOver={() => setHoverPointIndex(index)}
                      onMouseOut={() => setHoverPointIndex(null)}
                      onMouseDown={(event) => startDrag(index, event)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        removePoint(index);
                      }}
                      style={{ cursor: "move" }}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
