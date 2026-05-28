import type { EditorIconPath } from "@/lib/editor/types";
import type { CustomizationState } from "@/lib/types";
import { resolveEditorPathPaint } from "@/lib/editor/svg";

export interface FloodFillArgs {
  paths: EditorIconPath[];
  state: CustomizationState;
  viewBox: string;
  clickSvg: { x: number; y: number };
  resolution?: number;
  alphaThreshold?: number;
}

interface FloodFillResult {
  mask: Uint8Array;
  touchesEdge: boolean;
  count: number;
}

interface Edge {
  from: number;
  to: number;
}

interface GridPoint {
  x: number;
  y: number;
}

const DEFAULT_RESOLUTION = 384;
const DEFAULT_ALPHA_THRESHOLD = 32;

export function floodFillToPath(args: FloodFillArgs): string | null {
  const resolution = args.resolution ?? DEFAULT_RESOLUTION;
  const alphaThreshold = args.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD;

  const parts = args.viewBox.split(" ").map(Number);
  const vbX = parts[0] || 0;
  const vbY = parts[1] || 0;
  const vbW = parts[2] || 24;
  const vbH = parts[3] || 24;

  const w = resolution;
  const h = resolution;

  const imageData = rasterizePaths(
    args.paths,
    args.state,
    vbX,
    vbY,
    vbW,
    vbH,
    w,
    h,
  );
  if (!imageData) return null;

  const gx0 = Math.floor(((args.clickSvg.x - vbX) / vbW) * w);
  const gy0 = Math.floor(((args.clickSvg.y - vbY) / vbH) * h);
  if (gx0 < 0 || gx0 >= w || gy0 < 0 || gy0 >= h) return null;

  if (pixelAlpha(imageData, gx0, gy0, w) >= alphaThreshold) return null;

  const { mask, touchesEdge, count } = scanlineFloodFill(
    imageData,
    gx0,
    gy0,
    w,
    h,
    alphaThreshold,
  );
  if (touchesEdge) return null;
  if (count === 0) return null;

  const edges = collectBoundaryEdges(mask, w, h);
  if (edges.length === 0) return null;

  const loops = chainEdges(edges);
  if (loops.length === 0) return null;

  return contoursToSvgPathD(loops, vbX, vbY, vbW, vbH, w, h);
}

function rasterizePaths(
  paths: EditorIconPath[],
  state: CustomizationState,
  vbX: number,
  vbY: number,
  vbW: number,
  vbH: number,
  w: number,
  h: number,
): ImageData | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, w, h);

  const scaleX = w / vbW;
  const scaleY = h / vbH;

  ctx.save();
  ctx.translate(-vbX * scaleX, -vbY * scaleY);
  ctx.scale(scaleX, scaleY);

  for (const path of paths) {
    if (!path.visible) continue;
    const paint = resolveEditorPathPaint(path, state);

    let p2d: Path2D;
    try {
      p2d = new Path2D(path.d);
    } catch {
      continue;
    }

    if (paint.fill && paint.fill !== "none") {
      ctx.fillStyle = "#000";
      ctx.fill(p2d, path.fillRule === "evenodd" ? "evenodd" : "nonzero");
    }
    if (paint.stroke && paint.stroke !== "none") {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = path.strokeWidth ?? 1.5;
      ctx.lineCap = (path.strokeLinecap ?? "round") as CanvasLineCap;
      ctx.lineJoin = (path.strokeLinejoin ?? "round") as CanvasLineJoin;
      ctx.stroke(p2d);
    }
  }

  ctx.restore();
  return ctx.getImageData(0, 0, w, h);
}

function pixelAlpha(img: ImageData, x: number, y: number, w: number): number {
  return img.data[(y * w + x) * 4 + 3];
}

function scanlineFloodFill(
  img: ImageData,
  startX: number,
  startY: number,
  w: number,
  h: number,
  alphaThreshold: number,
): FloodFillResult {
  const mask = new Uint8Array(w * h);
  const stack: number[] = [];
  stack.push(startX, startY);
  let touchesEdge = false;
  let count = 0;

  const isFillable = (x: number, y: number): boolean => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    if (mask[y * w + x]) return false;
    return img.data[(y * w + x) * 4 + 3] < alphaThreshold;
  };

  while (stack.length > 0) {
    const sy = stack.pop()!;
    const sx = stack.pop()!;
    if (!isFillable(sx, sy)) continue;

    let xL = sx;
    while (xL > 0 && isFillable(xL - 1, sy)) xL--;
    let xR = sx;
    while (xR < w - 1 && isFillable(xR + 1, sy)) xR++;

    for (let x = xL; x <= xR; x++) {
      mask[sy * w + x] = 1;
      count++;
      if (x === 0 || x === w - 1 || sy === 0 || sy === h - 1) {
        touchesEdge = true;
      }
    }

    if (sy > 0) {
      let inSpan = false;
      for (let x = xL; x <= xR; x++) {
        const fillable = isFillable(x, sy - 1);
        if (fillable && !inSpan) {
          stack.push(x, sy - 1);
          inSpan = true;
        } else if (!fillable && inSpan) {
          inSpan = false;
        }
      }
    }
    if (sy < h - 1) {
      let inSpan = false;
      for (let x = xL; x <= xR; x++) {
        const fillable = isFillable(x, sy + 1);
        if (fillable && !inSpan) {
          stack.push(x, sy + 1);
          inSpan = true;
        } else if (!fillable && inSpan) {
          inSpan = false;
        }
      }
    }
  }

  return { mask, touchesEdge, count };
}

function cornerKey(cx: number, cy: number, w: number): number {
  return cy * (w + 1) + cx;
}

function decodeCorner(key: number, w: number): GridPoint {
  const stride = w + 1;
  return { x: key % stride, y: Math.floor(key / stride) };
}

function collectBoundaryEdges(
  mask: Uint8Array,
  w: number,
  h: number,
): Edge[] {
  const edges: Edge[] = [];
  const isFilled = (x: number, y: number): boolean => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return mask[y * w + x] === 1;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;

      if (!isFilled(x, y - 1)) {
        edges.push({
          from: cornerKey(x, y, w),
          to: cornerKey(x + 1, y, w),
        });
      }
      if (!isFilled(x + 1, y)) {
        edges.push({
          from: cornerKey(x + 1, y, w),
          to: cornerKey(x + 1, y + 1, w),
        });
      }
      if (!isFilled(x, y + 1)) {
        edges.push({
          from: cornerKey(x + 1, y + 1, w),
          to: cornerKey(x, y + 1, w),
        });
      }
      if (!isFilled(x - 1, y)) {
        edges.push({
          from: cornerKey(x, y + 1, w),
          to: cornerKey(x, y, w),
        });
      }
    }
  }
  return edges;
}

function chainEdges(edges: Edge[]): number[][] {
  const adj = new Map<number, number[]>();
  for (const e of edges) {
    const list = adj.get(e.from);
    if (list) list.push(e.to);
    else adj.set(e.from, [e.to]);
  }

  const loops: number[][] = [];
  while (adj.size > 0) {
    const startKey = adj.keys().next().value;
    if (startKey === undefined) break;

    const loop: number[] = [];
    let current: number | undefined = startKey;
    let steps = 0;
    const safety = edges.length + 8;

    while (current !== undefined && steps < safety) {
      loop.push(current);
      const nexts = adj.get(current);
      if (!nexts || nexts.length === 0) {
        adj.delete(current);
        break;
      }
      const next = nexts.shift()!;
      if (nexts.length === 0) adj.delete(current);
      if (next === startKey) break;
      current = next;
      steps++;
    }

    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}

function collapseCollinear(points: GridPoint[]): GridPoint[] {
  if (points.length < 3) return points;
  const result: GridPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const cross = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(cross) > 1e-6) result.push(curr);
  }
  result.push(points[points.length - 1]);
  return result;
}

function contoursToSvgPathD(
  loops: number[][],
  vbX: number,
  vbY: number,
  vbW: number,
  vbH: number,
  gridW: number,
  gridH: number,
): string {
  const toSx = (cx: number): number => vbX + (cx / gridW) * vbW;
  const toSy = (cy: number): number => vbY + (cy / gridH) * vbH;

  const parts: string[] = [];
  for (const loop of loops) {
    const corners = loop.map((k) => decodeCorner(k, gridW));
    const compact = collapseCollinear(corners);
    if (compact.length < 3) continue;

    let d = `M${toSx(compact[0].x).toFixed(2)} ${toSy(compact[0].y).toFixed(2)}`;
    for (let i = 1; i < compact.length; i++) {
      d += ` L${toSx(compact[i].x).toFixed(2)} ${toSy(compact[i].y).toFixed(2)}`;
    }
    d += " Z";
    parts.push(d);
  }
  return parts.join(" ");
}
