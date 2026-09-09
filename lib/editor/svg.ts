import type {
  EditorAssetSummary,
  EditorDocument,
  EditorIconAsset,
  EditorIconPath,
  EditorSupportedTag,
  EditorVariant,
} from "@/lib/editor/types";

const KNOWN_VARIANTS: readonly EditorVariant[] = [
  "normal",
  "duotone",
  "fill",
  "pixelated",
];
import type { CustomizationState } from "@/lib/types";
import { STROKE_STYLE_MAP, type StrokeStyle } from "@/lib/stroke-style";
import { normalizeEditorPathData } from "./path-data";
import { buildConicSegments } from "@/lib/gradient-utils";

type StackEntry = {
  inDefs: boolean;
  clipPath?: string;
};

const SUPPORTED_TAGS = new Set<EditorSupportedTag>(["path", "circle", "rect"]);
const DEF_TAGS = new Set([
  "defs",
  "clipPath",
  "linearGradient",
  "radialGradient",
  "mask",
  "filter",
  "pattern",
  "symbol",
  "marker",
]);
const IGNORED_TAGS = new Set(["svg", "g", "title", "desc"]);

function normalizeNumeric(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeEditorPaintValue(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function isDefaultEditorPaint(value?: string) {
  const normalizedValue = normalizeEditorPaintValue(value);

  return (
    !normalizedValue ||
    normalizedValue === "black" ||
    normalizedValue === "#000" ||
    normalizedValue === "#000000" ||
    normalizedValue === "#fff" ||
    normalizedValue === "#ffffff" ||
    normalizedValue === "currentcolor"
  );
}

function parseTagAttributes(input: string) {
  const attributes: Record<string, string> = {};
  const attributeRegex = /([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;

  let match: RegExpExecArray | null = null;
  while ((match = attributeRegex.exec(input)) !== null) {
    attributes[match[1]] = match[3] ?? match[4] ?? "";
  }

  if (attributes.style) {
    for (const declaration of attributes.style.split(";")) {
      const [rawName, rawValue] = declaration.split(":");
      if (!rawName || !rawValue) {
        continue;
      }

      const name = rawName.trim();
      const value = rawValue.trim();
      if (name && value && !(name in attributes)) {
        attributes[name] = value;
      }
    }
  }

  return attributes;
}

function slugToLabel(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePathData(value: string) {
  return normalizeEditorPathData(value);
}

function circleToPath(attributes: Record<string, string>) {
  const cx = normalizeNumeric(attributes.cx) ?? 0;
  const cy = normalizeNumeric(attributes.cy) ?? 0;
  const r = normalizeNumeric(attributes.r) ?? 0;
  const kappa = 0.552284749831;
  const c = r * kappa;

  return normalizePathData(
    [
      `M ${cx} ${cy - r}`,
      `C ${cx + c} ${cy - r}, ${cx + r} ${cy - c}, ${cx + r} ${cy}`,
      `C ${cx + r} ${cy + c}, ${cx + c} ${cy + r}, ${cx} ${cy + r}`,
      `C ${cx - c} ${cy + r}, ${cx - r} ${cy + c}, ${cx - r} ${cy}`,
      `C ${cx - r} ${cy - c}, ${cx - c} ${cy - r}, ${cx} ${cy - r}`,
      "Z",
    ].join(" "),
  );
}

function rectToPath(attributes: Record<string, string>) {
  const x = normalizeNumeric(attributes.x) ?? 0;
  const y = normalizeNumeric(attributes.y) ?? 0;
  const width = normalizeNumeric(attributes.width) ?? 0;
  const height = normalizeNumeric(attributes.height) ?? 0;
  const rx = Math.max(0, normalizeNumeric(attributes.rx) ?? 0);
  const ry = Math.max(0, normalizeNumeric(attributes.ry) ?? rx);

  if (!rx && !ry) {
    return normalizePathData(
      `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`,
    );
  }

  const safeRx = Math.min(rx, width / 2);
  const safeRy = Math.min(ry, height / 2);

  return normalizePathData(
    [
      `M ${x + safeRx} ${y}`,
      `L ${x + width - safeRx} ${y}`,
      `Q ${x + width} ${y} ${x + width} ${y + safeRy}`,
      `L ${x + width} ${y + height - safeRy}`,
      `Q ${x + width} ${y + height} ${x + width - safeRx} ${y + height}`,
      `L ${x + safeRx} ${y + height}`,
      `Q ${x} ${y + height} ${x} ${y + height - safeRy}`,
      `L ${x} ${y + safeRy}`,
      `Q ${x} ${y} ${x + safeRx} ${y}`,
      "Z",
    ].join(" "),
  );
}

function convertElementToPath(
  tagName: EditorSupportedTag,
  attributes: Record<string, string>,
  clipPath: string | undefined,
  id: string,
) {
  let d = "";

  if (tagName === "path") {
    if (!attributes.d) {
      return null;
    }
    d = normalizePathData(attributes.d);
  } else if (tagName === "circle") {
    d = circleToPath(attributes);
  } else {
    d = rectToPath(attributes);
  }

  const path: EditorIconPath = {
    id,
    d,
    fill: attributes.fill,
    stroke: attributes.stroke,
    strokeWidth: normalizeNumeric(attributes["stroke-width"]),
    strokeLinecap: attributes["stroke-linecap"] as EditorIconPath["strokeLinecap"],
    strokeLinejoin: attributes[
      "stroke-linejoin"
    ] as EditorIconPath["strokeLinejoin"],
    opacity: normalizeNumeric(attributes.opacity),
    fillOpacity: normalizeNumeric(attributes["fill-opacity"]),
    strokeOpacity: normalizeNumeric(attributes["stroke-opacity"]),
    mixBlendMode: attributes["mix-blend-mode"] as EditorIconPath["mixBlendMode"],
    fillRule: attributes["fill-rule"] as EditorIconPath["fillRule"],
    clipRule: attributes["clip-rule"] as EditorIconPath["clipRule"],
    filter: attributes.filter,
    clipPath: clipPath ?? attributes["clip-path"] ?? attributes.clipPath,
    mask: attributes.mask,
    visible: true,
    sourceTag: tagName,
  };

  return path;
}

function haveSameVisualAttributes(a: EditorIconPath, b: EditorIconPath) {
  return (
    a.fill === b.fill &&
    a.stroke === b.stroke &&
    a.strokeWidth === b.strokeWidth &&
    a.strokeLinecap === b.strokeLinecap &&
    a.strokeLinejoin === b.strokeLinejoin &&
    a.opacity === b.opacity &&
    a.fillOpacity === b.fillOpacity &&
    a.strokeOpacity === b.strokeOpacity &&
    a.mixBlendMode === b.mixBlendMode &&
    a.fillRule === b.fillRule &&
    a.clipRule === b.clipRule &&
    a.filter === b.filter &&
    a.clipPath === b.clipPath &&
    a.mask === b.mask
  );
}

function mergeConsecutivePaths(paths: EditorIconPath[]): EditorIconPath[] {
  if (paths.length <= 1) return paths;

  const merged: EditorIconPath[] = [{ ...paths[0] }];

  for (let i = 1; i < paths.length; i++) {
    const current = paths[i];
    const previous = merged[merged.length - 1];

    if (haveSameVisualAttributes(previous, current)) {
      previous.d = `${previous.d} ${current.d}`;
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function extractDefs(svgContent: string) {
  const defsMatch = svgContent.match(/<defs\b[^>]*>[\s\S]*?<\/defs>/i);
  return defsMatch?.[0];
}

export function parseEditorAsset(
  svgContent: string,
  filePath: string,
): EditorIconAsset {
  const sanitizedSvg = svgContent.replace(/<\?xml[\s\S]*?\?>/g, "").trim();
  const viewBoxMatch = sanitizedSvg.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 24 24";
  const defs = extractDefs(sanitizedSvg);

  const normalizedFilePath = filePath.replace(/\\/g, "/");
  const relativePath =
    normalizedFilePath.split("/public/")[1] ?? normalizedFilePath;
  const pathParts = relativePath.split("/");
  const category = pathParts[pathParts.length - 2] ?? "misc";
  const baseName = pathParts[pathParts.length - 1]?.replace(/\.svg$/i, "") ?? "Icon";
  const detectedVariant = pathParts[0] as EditorVariant | undefined;
  const variant: EditorVariant =
    detectedVariant && KNOWN_VARIANTS.includes(detectedVariant)
      ? detectedVariant
      : "normal";
  const name = slugToLabel(baseName);
  const categoryLabel = slugToLabel(category);
  const slug = `${category}/${baseName}`;
  const assetId = slug.replace(/[^a-zA-Z0-9/-]+/g, "-");

  const paths: EditorIconPath[] = [];
  const unsupportedElements = new Set<string>();
  const stack: StackEntry[] = [{ inDefs: false }];
  const tagRegex = /<\/?([a-zA-Z][\w:-]*)([^>]*)>/g;
  let match: RegExpExecArray | null = null;
  let pathIndex = 0;

  while ((match = tagRegex.exec(sanitizedSvg)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const lowerTag = tagName.toLowerCase();
    const isClosing = fullTag.startsWith("</");

    if (isClosing) {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    const isSelfClosing = fullTag.endsWith("/>");
    const attributes = parseTagAttributes(match[2]);
    const current = stack[stack.length - 1];
    const clipPath =
      attributes["clip-path"] ?? attributes.clipPath ?? current.clipPath;
    const inDefs = current.inDefs || DEF_TAGS.has(tagName) || DEF_TAGS.has(lowerTag);

    if (SUPPORTED_TAGS.has(lowerTag as EditorSupportedTag) && !inDefs) {
      const path = convertElementToPath(
        lowerTag as EditorSupportedTag,
        attributes,
        clipPath,
        `${assetId}-path-${pathIndex}`,
      );

      if (path) {
        paths.push(path);
        pathIndex += 1;
      }
    } else if (!IGNORED_TAGS.has(lowerTag) && !DEF_TAGS.has(lowerTag)) {
      unsupportedElements.add(tagName);
    }

    if (!isSelfClosing) {
      stack.push({
        inDefs,
        clipPath,
      });
    }
  }

  return {
    id: assetId,
    slug,
    name,
    category,
    categoryLabel,
    filePath: relativePath,
    viewBox,
    defs,
    rawSvg: sanitizedSvg,
    paths: mergeConsecutivePaths(paths),
    unsupportedElements: [...unsupportedElements],
    variant,
  };
}

function serializePathAttributes(
  path: EditorIconPath,
  paintOverrides: {
    stroke?: string;
    fill?: string;
  },
) {
  const attributes = [
    `d="${path.d}"`,
    `fill="${paintOverrides.fill ?? path.fill ?? "none"}"`,
    `stroke="${paintOverrides.stroke ?? path.stroke ?? "none"}"`,
  ];

  if (path.strokeWidth != null) {
    attributes.push(`stroke-width="${path.strokeWidth}"`);
  }
  if (path.strokeLinecap) {
    attributes.push(`stroke-linecap="${path.strokeLinecap}"`);
  }
  if (path.strokeLinejoin) {
    attributes.push(`stroke-linejoin="${path.strokeLinejoin}"`);
  }
  if (path.opacity != null) {
    attributes.push(`opacity="${path.opacity}"`);
  }
  if (path.fillOpacity != null) {
    attributes.push(`fill-opacity="${path.fillOpacity}"`);
  }
  if (path.strokeOpacity != null) {
    attributes.push(`stroke-opacity="${path.strokeOpacity}"`);
  }
  if (path.fillRule) {
    attributes.push(`fill-rule="${path.fillRule}"`);
  }
  if (path.clipRule) {
    attributes.push(`clip-rule="${path.clipRule}"`);
  }
  if (path.filter) {
    attributes.push(`filter="${path.filter}"`);
  }
  if (path.clipPath) {
    attributes.push(`clip-path="${path.clipPath}"`);
  }
  if (path.mask) {
    attributes.push(`mask="${path.mask}"`);
  }
  if (path.mixBlendMode) {
    attributes.push(`style="mix-blend-mode:${path.mixBlendMode}"`);
  }

  return attributes.join(" ");
}

function buildGradientDefs(
  state: CustomizationState,
  vbX: number,
  vbY: number,
  vbW: number,
  vbH: number,
) {
  if (!state.iconGradient || state.gradient.stops.length === 0) {
    return "";
  }

  // Mirrors the gradient coordinate math in lib/svg-export-utils.ts
  // (generateStandaloneSvg) and components/icon-page/panels/workspace/
  // components/SvgDefinitions.tsx (live preview), scaled to this
  // document's own viewBox instead of a hardcoded 24x24 canvas, and
  // switched on gradient.type instead of always emitting a linear
  // gradient in objectBoundingBox units.
  const centreX = vbX + vbW / 2;
  const centreY = vbY + vbH / 2;
  const stops = [...state.gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map(
      (stop) =>
        `<stop offset="${stop.position}%" stop-color="${stop.color || "#000000"}" />`,
    )
    .join("");
  const spreadMethod = state.gradient.spreadMethod ?? "pad";

  if (state.gradient.type === "radial") {
    const cx = vbX + ((state.gradient.cx ?? 50) / 100) * vbW;
    const cy = vbY + ((state.gradient.cy ?? 50) / 100) * vbH;
    const r = ((state.gradient.r ?? 50) / 100) * vbW;
    return `<radialGradient id="icon-gradient" cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${r.toFixed(3)}" gradientUnits="userSpaceOnUse" spreadMethod="${spreadMethod}">${stops}</radialGradient>`;
  }

  if (state.gradient.type === "angular") {
    const cx = vbX + ((state.gradient.cx ?? 50) / 100) * vbW;
    const cy = vbY + ((state.gradient.cy ?? 50) / 100) * vbH;
    const segs = buildConicSegments(state.gradient.stops, state.gradient.angle, cx, cy, 17);
    const polys = segs.map((s) => `<polygon points="${s.points}" fill="${s.color}"/>`).join("");
    return `<pattern id="icon-gradient" width="${vbW}" height="${vbH}" patternUnits="userSpaceOnUse">${polys}</pattern>`;
  }

  const angleInRadians = (state.gradient.angle * Math.PI) / 180;
  const x1 = (centreX - (vbW / 2) * Math.sin(angleInRadians)).toFixed(3);
  const y1 = (centreY + (vbH / 2) * Math.cos(angleInRadians)).toFixed(3);
  const x2 = (centreX + (vbW / 2) * Math.sin(angleInRadians)).toFixed(3);
  const y2 = (centreY - (vbH / 2) * Math.cos(angleInRadians)).toFixed(3);

  return `<linearGradient id="icon-gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse" spreadMethod="${spreadMethod}">${stops}</linearGradient>`;
}

function buildExportFilter(state: CustomizationState) {
  const shadowActive = state.shadow.enabled && state.shadow.opacity > 0;
  if (!state.blur && !shadowActive) {
    return "";
  }

  const blur = state.blur > 0 ? `<feGaussianBlur stdDeviation="${state.blur}" />` : "";
  const shadow = shadowActive
    ? `<feDropShadow dx="${state.shadow.offsetX}" dy="${state.shadow.offsetY}" stdDeviation="${state.shadow.blur}" flood-color="black" flood-opacity="${Math.max(0, Math.min(1, state.shadow.opacity / 100))}" />`
    : "";

  return `<filter id="editor-export-filter" x="-50%" y="-50%" width="200%" height="200%">${blur}${shadow}</filter>`;
}

const SECONDARY_TONES = new Set(["#dddddd", "#f3f3f3"]);
const PRIMARY_TONES = new Set(["#a4a5a6", "#1c1f21"]);

function nativeSecondaryPaint(iconType?: string): string {
  return iconType === "duotone" || iconType === "fill" ? "#DDDDDD" : "currentColor";
}

function toneSlot(
  paint: string | undefined,
  iconType?: string,
): "primary" | "secondary" | "raw" {
  const normalized = normalizeEditorPaintValue(paint);
  if (!normalized || normalized === "none" || normalized === "transparent") {
    return "raw";
  }
  if (
    SECONDARY_TONES.has(normalized) &&
    (iconType === "duotone" || iconType === "fill")
  ) {
    return "secondary";
  }
  if (PRIMARY_TONES.has(normalized) || isDefaultEditorPaint(paint)) {
    return "primary";
  }
  return "raw";
}

export function resolveEditorPathPaint(
  path: Pick<EditorIconPath, "stroke" | "fill">,
  state?: CustomizationState,
) {
  if (state?.iconGradient) {
    const target = state.gradient.target ?? "both";
    const gradientPaint = "url(#icon-gradient)";
    const applyToStroke = target === "stroke" || target === "both";
    const applyToFill = target === "fill" || target === "both";

    const stateColor = state.colors[0];
    const fallbackPaint =
      stateColor && !isDefaultEditorPaint(stateColor)
        ? stateColor
        : "currentColor";
    const secondaryRaw = state.colors[1];
    const secondaryPaint =
      secondaryRaw && secondaryRaw.trim().length > 0
        ? secondaryRaw
        : nativeSecondaryPaint(state.iconType);

    return {
      stroke:
        path.stroke && path.stroke !== "none"
          ? toneSlot(path.stroke, state.iconType) === "secondary"
            ? secondaryPaint
            : applyToStroke
              ? gradientPaint
              : fallbackPaint
          : path.stroke ?? "none",
      fill:
        path.fill && path.fill !== "none"
          ? toneSlot(path.fill, state.iconType) === "secondary"
            ? secondaryPaint
            : applyToFill
              ? gradientPaint
              : fallbackPaint
          : path.fill ?? "none",
    };
  }

  const stateColor = state?.colors[0];
  const defaultPaint =
    stateColor && !isDefaultEditorPaint(stateColor) ? stateColor : "currentColor";
  const secondaryRaw = state?.colors[1];
  const secondaryPaint =
    secondaryRaw && secondaryRaw.trim().length > 0
      ? secondaryRaw
      : nativeSecondaryPaint(state?.iconType);
  const paintFor = (value: string | undefined): string => {
    if (!value || value === "none") return value ?? "none";
    const slot = toneSlot(value, state?.iconType);
    if (slot === "secondary") return secondaryPaint;
    if (slot === "primary") return defaultPaint;
    return value;
  };

  return {
    stroke: paintFor(path.stroke),
    fill: paintFor(path.fill),
  };
}

export interface EditorPathStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round" | "butt" | "square";
  strokeLinejoin: "round" | "miter" | "bevel";
}

export function resolveEditorPathStyle(
  path: Pick<
    EditorIconPath,
    "stroke" | "fill" | "strokeWidth" | "strokeLinecap" | "strokeLinejoin"
  >,
  state?: CustomizationState,
): EditorPathStyle {
  const paint = resolveEditorPathPaint(path, state);
  const styleKey = (state?.strokeStyle ?? "round") as StrokeStyle;
  const styleDefaults = STROKE_STYLE_MAP[styleKey] ?? STROKE_STYLE_MAP.round;
  const stateDrivenStyle = Boolean(state?.strokeStyle);

  return {
    fill: paint.fill ?? "none",
    stroke: paint.stroke ?? "none",
    strokeWidth: stateDrivenStyle
      ? styleDefaults.strokeWidth
      : path.strokeWidth ?? styleDefaults.strokeWidth,
    strokeLinecap: stateDrivenStyle
      ? styleDefaults.strokeLinecap
      : path.strokeLinecap ?? styleDefaults.strokeLinecap,
    strokeLinejoin: stateDrivenStyle
      ? styleDefaults.strokeLinejoin
      : path.strokeLinejoin ?? styleDefaults.strokeLinejoin,
  };
}

export function cloneDocument(document: EditorDocument): EditorDocument {
  return {
    ...document,
    paths: document.paths.map((path) => ({ ...path })),
  };
}

export function documentFromAsset(asset: EditorAssetSummary): EditorDocument {
  return {
    assetId: asset.id,
    name: asset.name,
    category: asset.category,
    categoryLabel: asset.categoryLabel,
    sourceFilePath: asset.filePath,
    viewBox: asset.viewBox,
    defs: asset.defs,
    paths: asset.paths.map((path) => ({ ...path })),
  };
}

export function createEmptyEditorDocument(
  assetId: string,
  name = "Untitled",
  viewBox = "0 0 24 24",
): EditorDocument {
  return {
    assetId,
    name,
    category: "user",
    categoryLabel: "User",
    sourceFilePath: "",
    viewBox,
    defs: "",
    paths: [],
  };
}

export function createEmptyEditorAssetSummary(
  assetId: string,
  name = "Untitled",
  viewBox = "0 0 24 24",
): EditorAssetSummary {
  return {
    id: assetId,
    slug: assetId,
    name,
    category: "user",
    categoryLabel: "User",
    filePath: "",
    viewBox,
    defs: "",
    paths: [],
    variant: "normal",
  };
}

export function createEditorSvgMarkup(
  document: EditorDocument,
  state: CustomizationState,
) {
  // Anchor rotation/flip at the viewBox centre so they pivot about the icon
  // rather than the origin. `state.scale` is deliberately not applied here:
  // the editor preview does not apply it either, and honouring it would make
  // every export diverge from what the canvas shows.
  const [vbX, vbY, vbW, vbH] = (() => {
    const parts = (document.viewBox || "0 0 24 24").split(/\s+/).map(Number);
    return [
      parts[0] || 0,
      parts[1] || 0,
      parts[2] || 24,
      parts[3] || 24,
    ] as const;
  })();
  const gradientDefs = buildGradientDefs(state, vbX, vbY, vbW, vbH);
  const exportFilter = buildExportFilter(state);
  const defs = [document.defs, gradientDefs, exportFilter].filter(Boolean).join("");
  const centreX = vbX + vbW / 2;
  const centreY = vbY + vbH / 2;
  const flipScaleX = state.flipH ? -1 : 1;
  const flipScaleY = state.flipV ? -1 : 1;
  const hasTransform =
    state.translateX !== 0 ||
    state.translateY !== 0 ||
    state.rotation !== 0 ||
    state.flipH ||
    state.flipV;
  const transformParts = hasTransform
    ? [
        `translate(${centreX + state.translateX} ${centreY + state.translateY})`,
        state.rotation ? `rotate(${state.rotation})` : "",
        flipScaleX !== 1 || flipScaleY !== 1
          ? `scale(${flipScaleX} ${flipScaleY})`
          : "",
        `translate(${-centreX} ${-centreY})`,
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const groupAttributes = [
    transformParts ? `transform="${transformParts}"` : "",
    exportFilter ? `filter="url(#editor-export-filter)"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const visiblePaths = document.paths
    .filter((path) => path.visible)
    .map((path) => {
      const paint = resolveEditorPathPaint(path, state);
      return `<path ${serializePathAttributes(path, paint)} />`;
    })
    .join("");

  // The live editor canvas (EditorCanvasStage) wraps the SVG in a container
  // that applies padding, a background fill and a corner radius from state.
  // Mirror that here so the exported markup matches what the canvas shows,
  // the same way generateStandaloneSvg does for the /icons route.
  const paddingVB = state.width > 0 ? (state.padding / state.width) * vbW : 0;
  const iconScaleFactor = vbW > 0 ? (vbW - 2 * paddingVB) / vbW : 1;
  const hasPadding = paddingVB !== 0 && iconScaleFactor !== 1;
  const rx = ((state.cornerRadius / Math.max(state.width, 1)) * vbW).toFixed(3);
  const backgroundFill = (state.backgroundColor || "transparent").replace(
    /[&"<>]/g,
    (character) =>
      ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[character] ||
      character,
  );
  const hasBackground =
    backgroundFill !== "transparent" && backgroundFill !== "none";

  const iconGroup = `<g ${groupAttributes}>${visiblePaths}</g>`;
  const paddedContent = hasPadding
    ? `<g transform="translate(${(vbX + paddingVB).toFixed(3)}, ${(vbY + paddingVB).toFixed(3)}) scale(${iconScaleFactor.toFixed(6)})">${iconGroup}</g>`
    : iconGroup;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}" viewBox="${document.viewBox}" fill="none">`,
    defs ? `<defs>${defs.replace(/^<defs\b[^>]*>|<\/defs>$/g, "")}</defs>` : "",
    hasBackground
      ? `<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" rx="${rx}" ry="${rx}" fill="${backgroundFill}"/>`
      : "",
    paddedContent,
    "</svg>",
  ]
    .filter(Boolean)
    .join("");
}
