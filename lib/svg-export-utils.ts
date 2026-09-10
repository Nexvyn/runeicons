import React from "react";

import { renderToStaticMarkup } from "react-dom/server";

import { resolveAnimationType, resolveEasingValue } from "@/lib/editor/animation-engine";
import { buildPerPathAnimationCss, injectPathIndices } from "@/lib/editor/path-animation";
import { buildConicSegments } from "@/lib/gradient-utils";

import { STROKE_STYLE_MAP } from "./stroke-style";
import { CustomizationState, IconData } from "./types";

export type SvgPaintTarget = "stroke" | "fill" | "both";

const PAINTED_ELEMENT_PATTERN = /<(path|circle|rect|ellipse|line|polyline|polygon)([^>]*?)(\/?>)/gi;

export function applyTextureToSvgContent(content: string, patternId = "texture-pattern"): string {
  return content.replace(
    PAINTED_ELEMENT_PATTERN,
    (match, tag: string, attributes: string, end: string) => {
      let nextAttributes = attributes
        .replace(/\bstroke="(?!none|transparent)[^"]*"/gi, `stroke="url(#${patternId})"`)
        .replace(/\bfill="(?!none|transparent)[^"]*"/gi, `fill="url(#${patternId})"`);

      const hasPaint = /\b(?:stroke|fill)="/i.test(nextAttributes);
      if (!hasPaint) {
        nextAttributes += ` fill="url(#${patternId})"`;
      }

      return `<${tag}${nextAttributes}${end}`;
    },
  );
}

export function stripSvgStrokeStyleAttributes(content: string): string {
  return content.replace(
    PAINTED_ELEMENT_PATTERN,
    (match, tag: string, attributes: string, end: string) => {
      const nextAttributes = attributes
        .replace(/\s*stroke-linecap="[^"]*"/gi, "")
        .replace(/\s*stroke-linejoin="[^"]*"/gi, "")
        .replace(/\s*stroke-width="[^"]*"/gi, "");
      return `<${tag}${nextAttributes}${end}`;
    },
  );
}

export function colorizeSvgContent(
  content: string,
  iconType: string,
  colors: string[],
  useGradient: boolean,
  gradientTarget: SvgPaintTarget = "both",
): string {
  let result = content;
  const primaryColor = colors[0];
  const secondaryRaw = colors[1];
  const secondaryColor = secondaryRaw && secondaryRaw.trim().length > 0 ? secondaryRaw : undefined;
  const shouldColorize = !!primaryColor || !!secondaryColor || useGradient;

  if (!shouldColorize) return result;

  if (iconType === "duotone") {
    const tint = secondaryColor || "#9DB4F5";
    result = result
      .replace(/stroke="#DDDDDD"/gi, `stroke="${tint}"`)
      .replace(/fill="#DDDDDD"/gi, `fill="${tint}"`);
    const strongTarget = gradientTarget;
    if (useGradient) {
      if (strongTarget === "stroke" || strongTarget === "both") {
        result = result.replace(/stroke="#A4A5A6"/gi, 'stroke="url(#icon-gradient)"');
      } else if (primaryColor) {
        result = result.replace(/stroke="#A4A5A6"/gi, `stroke="${primaryColor}"`);
      }
      if (strongTarget === "fill" || strongTarget === "both") {
        result = result.replace(/fill="#A4A5A6"/gi, 'fill="url(#icon-gradient)"');
      } else if (primaryColor) {
        result = result.replace(/fill="#A4A5A6"/gi, `fill="${primaryColor}"`);
      }
    } else if (primaryColor) {
      result = result
        .replace(/stroke="#A4A5A6"/gi, `stroke="${primaryColor}"`)
        .replace(/fill="#A4A5A6"/gi, `fill="${primaryColor}"`);
    }
  } else if (iconType === "fill") {
    const ink = secondaryColor || "#1C1F21";
    result = result
      .replace(/fill="#1C1F21"/gi, `fill="${ink}"`)
      .replace(/stroke="#1C1F21"/gi, `stroke="${ink}"`);
    if (useGradient) {
      if (gradientTarget === "stroke" || gradientTarget === "both") {
        result = result.replace(/stroke="#DDDDDD"/gi, 'stroke="url(#icon-gradient)"');
      } else if (primaryColor) {
        result = result.replace(/stroke="#DDDDDD"/gi, `stroke="${primaryColor}"`);
      }
      if (gradientTarget === "fill" || gradientTarget === "both") {
        result = result.replace(/fill="#DDDDDD"/gi, 'fill="url(#icon-gradient)"');
      } else if (primaryColor) {
        result = result.replace(/fill="#DDDDDD"/gi, `fill="${primaryColor}"`);
      }
    } else if (primaryColor) {
      result = result
        .replace(/fill="#DDDDDD"/gi, `fill="${primaryColor}"`)
        .replace(/stroke="#DDDDDD"/gi, `stroke="${primaryColor}"`);
    }
  } else if (iconType === "pixelated") {
    const ink = primaryColor || "currentColor";
    result = result
      .replace(/\bfill="(?!none|transparent)[^"]*"/gi, `fill="${ink}"`)
      .replace(/\bstroke="(?!none|transparent)[^"]*"/gi, `stroke="${ink}"`);
  } else if (iconType === "glass") {
    const ink = primaryColor || "currentColor";
    result = result
      .replace(/stop-color="#575757"/gi, `stop-color="${ink}"`)
      .replace(/stop-color="#151515"/gi, `stop-color="${ink}" stop-opacity="0.85"`)
      .replace(/fill="#575757"/gi, `fill="${ink}"`)
      .replace(/fill="#151515"/gi, `fill="${ink}d9"`)
      .replace(/stroke="#575757"/gi, `stroke="${ink}"`)
      .replace(/stroke="#151515"/gi, `stroke="${ink}d9"`);
  }

  const gradientHandledInBranch = iconType === "duotone" || iconType === "fill";
  if (useGradient && !gradientHandledInBranch) {
    if (gradientTarget === "stroke" || gradientTarget === "both") {
      result = result.replace(
        /\bstroke="(?!none|transparent)[^"]*"/gi,
        'stroke="url(#icon-gradient)"',
      );
    }
    if (gradientTarget === "fill" || gradientTarget === "both") {
      result = result.replace(/\bfill="(?!none|transparent)[^"]*"/gi, 'fill="url(#icon-gradient)"');
    }
  }

  return result;
}

const assetDataUrlCache = new Map<string, string>();

async function fetchAssetAsDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const cached = assetDataUrlCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Asset fetch failed: ${response.status}`);
  }

  const mimeType =
    response.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  const dataUrl = `data:${mimeType};base64,${btoa(binary)}`;
  assetDataUrlCache.set(url, dataUrl);
  return dataUrl;
}

export async function generateStandaloneSvg(
  selectedIcon: IconData,
  state: CustomizationState,
): Promise<string> {
  const IconComponent = selectedIcon.icon;
  const iconUrl = selectedIcon.url;
  const effectiveIconType =
    selectedIcon.category === "custom" ? "normal" : (selectedIcon.iconType ?? state.iconType);

  // Styles with baked-in or non-vector rendering suppress the effects whose
  // controls are hidden in the panel, so stale values can't leak into output.
  const isStyleSuppressed = effectiveIconType === "pixelated" || effectiveIconType === "glass";
  const isTextureActive =
    state.texture.enabled && state.texture.selected !== "none" && !isStyleSuppressed;
  const effColors = effectiveIconType === "glass" ? ["", ""] : state.colors;
  const effGradient =
    effectiveIconType === "glass" ? false : state.iconGradient && !isTextureActive;
  const effNoiseOn = state.noise.enabled && state.noise.intensity > 0 && !isStyleSuppressed;
  const effShadowOuterOn =
    state.shadow.enabled && !state.shadow.inner && state.shadow.opacity > 0 && !isStyleSuppressed;
  const effShadowInnerOn = state.shadow.enabled && state.shadow.inner && !isStyleSuppressed;
  const strokeStyleKey = isStyleSuppressed ? "round" : (state.strokeStyle ?? "round");

  const gradientTarget = state.gradient.target ?? "both";
  const applyGradToStroke =
    !isTextureActive && effGradient && (gradientTarget === "stroke" || gradientTarget === "both");
  const applyGradToFill =
    !isTextureActive && effGradient && (gradientTarget === "fill" || gradientTarget === "both");
  const duotoneWash =
    effColors[1] && effColors[1].trim().length > 0
      ? effColors[1]
      : `${effColors[0] || "currentColor"}33`;
  const strokeColor = isTextureActive
    ? "url(#texture-pattern)"
    : applyGradToStroke
      ? "url(#icon-gradient)"
      : effColors[0] || "currentColor";
  const fillColor =
    applyGradToFill &&
    (effectiveIconType === "fill" ||
      effectiveIconType === "duotone" ||
      effectiveIconType === "normal")
      ? "url(#icon-gradient)"
      : effectiveIconType === "fill"
        ? effColors[0] || "currentColor"
        : effectiveIconType === "duotone"
          ? duotoneWash
          : "none";

  let innerContent = "";
  let iconViewBoxSize = 24;
  let currentViewBox = "0 0 24 24";

  if (iconUrl) {
    try {
      const { content, viewBox } = await fetchSvgInnerContentRaw(iconUrl);
      currentViewBox = viewBox;

      const viewBoxParts = (viewBox || "0 0 24 24").split(/\s+/).map(Number);
      if (viewBoxParts.length === 4) {
        iconViewBoxSize = Math.max(viewBoxParts[2], viewBoxParts[3]);
      }

      const renderAsDesigned =
        effectiveIconType === "duotone" ||
        effectiveIconType === "fill" ||
        effectiveIconType === "glass" ||
        effectiveIconType === "pixelated";

      let colorized = content;
      if (renderAsDesigned) {
        colorized = colorizeSvgContent(
          content,
          effectiveIconType,
          effColors,
          effGradient,
          gradientTarget,
        );
      } else if (effGradient) {
        const strokeValue = applyGradToStroke
          ? "url(#icon-gradient)"
          : effColors[0] || "currentColor";
        const fillValue = applyGradToFill ? "url(#icon-gradient)" : "none";
        colorized = content
          .replace(/\bstroke="(?!none|transparent)[^"]*"/gi, `stroke="${strokeValue}"`)
          .replace(/\bfill="(?!none|transparent)[^"]*"/gi, `fill="${fillValue}"`);
      } else if (effColors[0]) {
        const hasExplicitStrokes = /\bstroke="(?!none|transparent)[^"]*"/i.test(content);
        colorized = content.replace(
          /\bstroke="(?!none|transparent)[^"]*"/gi,
          `stroke="${effColors[0]}"`,
        );
        if (hasExplicitStrokes) {
          colorized = colorized.replace(/\bfill="(?!none|transparent)[^"]*"/gi, 'fill="none"');
        } else {
          colorized = colorized.replace(
            /\bfill="(?!none|transparent)[^"]*"/gi,
            `fill="${effColors[0]}"`,
          );
        }
      }

      if (isTextureActive) {
        colorized = applyTextureToSvgContent(colorized);
      }
      innerContent =
        effectiveIconType === "glass" ? colorized : stripSvgStrokeStyleAttributes(colorized);
    } catch {
      const portableIconUrl = await fetchAssetAsDataUrl(iconUrl).catch(() => iconUrl);
      const maskPaint = isTextureActive
        ? "url(#texture-pattern)"
        : effGradient
          ? "url(#icon-gradient)"
          : effColors[0] || "currentColor";
      const maskNoiseFilter = effNoiseOn ? ' filter="url(#noise-filter)"' : "";
      innerContent = `
        <defs>
          <mask id="custom-icon-mask">
            <image href="${portableIconUrl}" width="24" height="24" preserveAspectRatio="xMidYMid meet" />
          </mask>
        </defs>
        <rect width="24" height="24" fill="${maskPaint}" mask="url(#custom-icon-mask)"${maskNoiseFilter} />
      `;
    }
  } else if (IconComponent) {
    const iconMarkup = renderToStaticMarkup(
      React.createElement(IconComponent, {
        size: 24,
        strokeWidth: STROKE_STYLE_MAP[strokeStyleKey].strokeWidth,
        stroke: strokeColor,
        fill: isTextureActive ? strokeColor : fillColor,
      }),
    );
    innerContent = stripSvgStrokeStyleAttributes(
      iconMarkup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""),
    );
  }

  const animationType = resolveAnimationType(state.motion?.animationType);
  const easing = resolveEasingValue(state.motion?.easingId, state.motion?.customCubic);
  const duration = Math.max(0.2, state.motion?.duration ?? 2);
  const delay = Math.max(0, state.motion?.delay ?? 0);
  const iterationCount = (state.motion?.loop ?? true) ? "infinite" : "1";

  const isEnabled = state.motion?.enabled ?? false;
  const isGroupAnim =
    animationType === "bounce" || animationType === "shake" || animationType === "jump";
  const isPathAnim = animationType === "draw" || animationType === "stroke";

  let pathCount = 0;
  let taggedInnerContent = innerContent;
  if (isEnabled && isPathAnim) {
    const { tagged, count } = injectPathIndices(innerContent);
    taggedInnerContent = tagged;
    pathCount = count;
  }

  if (isEnabled && isPathAnim && pathCount > 0) {
    taggedInnerContent = taggedInnerContent.replace(
      /<(path|circle|rect|ellipse|line|polyline|polygon)([^>]*?)(\/?>)/gi,
      (match, tag, attrs, end) => {
        if (attrs.includes("pathLength")) return match;
        return `<${tag}${attrs} pathLength="1"${end}`;
      },
    );
  }

  const vbParts = currentViewBox.split(/\s+/).map(Number);
  const vbx = vbParts[0] || 0;
  const vby = vbParts[1] || 0;
  const vbw = vbParts[2] || iconViewBoxSize;
  const vbh = vbParts[3] || iconViewBoxSize;

  const iconCenter = { x: vbx + vbw / 2, y: vby + vbh / 2 };

  const normalizedTranslateX = (state.translateX / state.width) * vbw;
  const normalizedTranslateY = (state.translateY / state.height) * vbh;
  const flipScaleX = state.flipH ? -1 : 1;
  const flipScaleY = state.flipV ? -1 : 1;
  const finalTransform = [
    `translate(${iconCenter.x + normalizedTranslateX}, ${iconCenter.y + normalizedTranslateY})`,
    `rotate(${state.rotation})`,
    `scale(${flipScaleX}, ${flipScaleY})`,
    `translate(-${iconCenter.x}, -${iconCenter.y})`,
  ].join(" ");

  const paddingVB = (state.padding / state.width) * vbw;
  const iconScaleFactor = (vbw - 2 * paddingVB) / vbw;

  const textureHref = isTextureActive
    ? await fetchAssetAsDataUrl(`/textures/${state.texture.selected}.png`).catch(
        () => `/textures/${state.texture.selected}.png`,
      )
    : "";

  let defs = "";

  if (state.iconGradient) {
    const sortedStops = [...state.gradient.stops].sort((a, b) => a.position - b.position);
    const stops = sortedStops
      .map((s) => `<stop offset="${s.position}%" stop-color="${s.color || "#000000"}"/>`)
      .join("");
    const spreadMethod = state.gradient.spreadMethod ?? "pad";

    if (state.gradient.type === "linear") {
      const rad = (state.gradient.angle * Math.PI) / 180;
      const x1 = (iconCenter.x - (vbw / 2) * Math.sin(rad)).toFixed(3);
      const y1 = (iconCenter.y + (vbh / 2) * Math.cos(rad)).toFixed(3);
      const x2 = (iconCenter.x + (vbw / 2) * Math.sin(rad)).toFixed(3);
      const y2 = (iconCenter.y - (vbh / 2) * Math.cos(rad)).toFixed(3);
      defs += `<linearGradient id="icon-gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse" spreadMethod="${spreadMethod}">${stops}</linearGradient>`;
    } else if (state.gradient.type === "radial") {
      const cx = vbx + ((state.gradient.cx ?? 50) / 100) * vbw;
      const cy = vby + ((state.gradient.cy ?? 50) / 100) * vbh;
      const r = ((state.gradient.r ?? 50) / 100) * vbw;
      defs += `<radialGradient id="icon-gradient" cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${r.toFixed(3)}" gradientUnits="userSpaceOnUse" spreadMethod="${spreadMethod}">${stops}</radialGradient>`;
    } else {
      const cx = vbx + ((state.gradient.cx ?? 50) / 100) * vbw;
      const cy = vby + ((state.gradient.cy ?? 50) / 100) * vbh;
      const segs = buildConicSegments(state.gradient.stops, state.gradient.angle, cx, cy, 17);
      const polys = segs.map((s) => `<polygon points="${s.points}" fill="${s.color}"/>`).join("");
      defs += `<pattern id="icon-gradient" width="${vbw}" height="${vbh}" patternUnits="userSpaceOnUse">${polys}</pattern>`;
    }
  }

  if (effShadowInnerOn) {
    const innerBlur = (state.shadow.blur / state.width) * vbw;
    const innerDx = (state.shadow.offsetX / state.width) * vbw;
    const innerDy = (state.shadow.offsetY / state.height) * vbh;
    defs += `<filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${innerBlur.toFixed(3)}" result="blur"/>
      <feOffset in="blur" dx="${innerDx.toFixed(3)}" dy="${innerDy.toFixed(3)}" result="offsetBlur"/>
      <feComposite operator="out" in="SourceAlpha" in2="offsetBlur" result="inverse"/>
      <feFlood flood-color="black" flood-opacity="${state.shadow.opacity / 100}" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>`;
  }

  if (effShadowOuterOn) {
    const blurVB = (state.shadow.blur / state.width) * vbw;
    const dxVB = (state.shadow.offsetX / state.width) * vbw;
    const dyVB = (state.shadow.offsetY / state.height) * vbh;
    defs += `<filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="${dxVB.toFixed(3)}" dy="${dyVB.toFixed(3)}" stdDeviation="${blurVB.toFixed(3)}" flood-color="black" flood-opacity="${state.shadow.opacity / 100}"/>
    </filter>`;
  }

  if (state.blur > 0) {
    const blurStd = ((state.blur / state.width) * vbw).toFixed(3);
    defs += `<filter id="icon-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blurStd}" result="blur"/>
      <feComposite operator="in" in="blur" in2="SourceAlpha"/>
    </filter>`;
  }

  if (effNoiseOn) {
    const noiseOpacity = (state.noise.intensity / 100).toFixed(3);
    defs += `<filter id="noise-filter" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="grayNoise"/>
      <feColorMatrix in="grayNoise" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 ${noiseOpacity} 0" result="colorNoise"/>
      <feComposite operator="in" in="colorNoise" in2="SourceGraphic" result="maskedNoise"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="maskedNoise"/></feMerge>
    </filter>`;
  }

  if (state.iconType === "pixelated") {
    defs += `<filter id="pixelate" x="0%" y="0%" width="100%" height="100%">
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
        <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
        <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
      </feComponentTransfer>
    </filter>`;
  }

  if (isTextureActive) {
    defs += `<pattern id="texture-pattern" x="${vbx}" y="${vby}" width="${vbw}" height="${vbh}" patternUnits="userSpaceOnUse">
      <image href="${textureHref}" x="${vbx}" y="${vby}" width="${vbw}" height="${vbh}" opacity="${state.texture.opacity / 100}" preserveAspectRatio="xMidYMid slice"/>
    </pattern>`;
  }

  const SVG_KEYFRAMES: Record<string, string> = {
    bounce: `@keyframes svg-bounce {
    0%   { transform: translateY(0) scale(1,1); }
    30%  { transform: translateY(-22px) scale(0.92,1.08); }
    50%  { transform: translateY(0) scale(1.05,0.95); }
    70%  { transform: translateY(-8px) scale(0.98,1.02); }
    100% { transform: translateY(0) scale(1,1); }
  }`,
    shake: `@keyframes svg-shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    15% { transform: translateX(-8px) rotate(-3deg); }
    30% { transform: translateX(7px) rotate(2deg); }
    45% { transform: translateX(-5px) rotate(-1.5deg); }
    60% { transform: translateX(4px) rotate(1deg); }
    75% { transform: translateX(-2px) rotate(-0.5deg); }
    90% { transform: translateX(1px) rotate(0deg); }
  }`,
    jump: `@keyframes svg-jump {
    0%, 100% { transform: translateY(0) scale(1,1); }
    15% { transform: translateY(-30px) scale(0.88,1.12); }
    30% { transform: translateY(-48px) scale(1.06,0.94); }
    45% { transform: translateY(-24px) scale(0.94,1.06); }
    60% { transform: translateY(-6px) scale(1.03,0.97); }
    75% { transform: translateY(0) scale(0.98,1.02); }
    90% { transform: translateY(-3px) scale(1.01,0.99); }
  }`,
    draw: `@keyframes svg-draw {
    0%   { stroke-dashoffset: 1200; fill-opacity: 0; }
    70%  { stroke-dashoffset: 0; fill-opacity: 0; }
    100% { stroke-dashoffset: 0; fill-opacity: 1; }
  }`,
    stroke: `@keyframes svg-stroke {
    0%   { stroke-dashoffset: 1200; fill-opacity: 0; }
    55%  { stroke-dashoffset: 0; fill-opacity: 0; }
    85%  { fill-opacity: 0.5; }
    100% { stroke-dashoffset: 0; fill-opacity: 1; }
  }`,
  };

  let animationCss = "";
  const motionSupported = effectiveIconType !== "pixelated" && effectiveIconType !== "glass";
  if (isEnabled && motionSupported) {
    if (isPathAnim && pathCount > 0) {
      animationCss = buildPerPathAnimationCss(pathCount, state, {
        selectorPrefix: ".icon-anim-container",
        forExport: true,
        unitScale: iconViewBoxSize / 24,
      });
    } else if (isGroupAnim) {
      const originX = iconCenter.x.toFixed(3);
      const originY = iconCenter.y.toFixed(3);
      animationCss = `
    .icon-anim-group {
      transform-box: fill-box;
      transform-origin: ${originX}px ${originY}px;
      animation: svg-${animationType} ${duration}s ${easing} ${delay}s ${iterationCount} both;
    }
    ${SVG_KEYFRAMES[animationType] ?? ""}
    @media (prefers-reduced-motion: reduce) {
      .icon-anim-group { animation: none !important; transform: none !important; }
    }
  `;
    }
  }

  const rx = ((state.cornerRadius / state.width) * vbw).toFixed(3);

  let finalTaggedContent = taggedInnerContent;
  if (effNoiseOn) {
    finalTaggedContent = taggedInnerContent.replace(
      /<(path|circle|rect|ellipse|line|polyline|polygon)([^>]*?)(\/?>)/g,
      (match, tag, attrs, end) =>
        attrs.includes('filter="') ? match : `<${tag}${attrs} filter="url(#noise-filter)"${end}`,
    );
  }

  const backgroundFill = (state.backgroundColor || "transparent").replace(
    /[&"<>]/g,
    (character) =>
      ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[character] || character,
  );
  const preservesDesignedPaint = effectiveIconType === "glass" || effectiveIconType === "pixelated";

  const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Made with RuneIcon — https://runeicon.com -->
<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}" viewBox="${currentViewBox}" preserveAspectRatio="xMidYMid meet" fill="none">${defs ? `\n  <defs>${defs}</defs>` : ""}${animationCss ? `\n  <style><![CDATA[${animationCss}]]></style>` : ""}
  <rect x="${vbx}" y="${vby}" width="${vbw}" height="${vbh}" rx="${rx}" ry="${rx}" fill="${backgroundFill}"/>
  <g transform="translate(${vbx + paddingVB}, ${vby + paddingVB}) scale(${iconScaleFactor})"${
    effShadowOuterOn ? ' filter="url(#drop-shadow)"' : ""
  }>
    <g transform="${finalTransform}"${preservesDesignedPaint ? "" : ` stroke="${strokeColor}" fill="${fillColor}"`} stroke-width="${STROKE_STYLE_MAP[strokeStyleKey].strokeWidth}" stroke-linecap="${STROKE_STYLE_MAP[strokeStyleKey].strokeLinecap}" stroke-linejoin="${STROKE_STYLE_MAP[strokeStyleKey].strokeLinejoin}">
${
  effectiveIconType === "pixelated"
    ? `      <g filter="url(#pixelate)">
`
    : ""
}${
    state.blur > 0
      ? `      <g filter="url(#icon-blur)">
`
      : ""
  }${
    effShadowInnerOn
      ? `      <g filter="url(#inner-shadow)">
`
      : ""
  }      <g class="icon-anim-container icon-anim-group">
        ${finalTaggedContent}
      </g>
${effShadowInnerOn ? "      </g>\n" : ""}${state.blur > 0 ? "      </g>\n" : ""}${effectiveIconType === "pixelated" ? "      </g>\n" : ""}    </g>
  </g>
</svg>`.trim();

  return finalSvg;
}

function svgAttrToJsx(svg: string): string {
  return svg
    .replace(/\bclass=/g, "className=")
    .replace(/\bstroke-width=/g, "strokeWidth=")
    .replace(/\bstroke-linecap=/g, "strokeLinecap=")
    .replace(/\bstroke-linejoin=/g, "strokeLinejoin=")
    .replace(/\bfill-opacity=/g, "fillOpacity=")
    .replace(/\bstroke-opacity=/g, "strokeOpacity=")
    .replace(/\bfill-rule=/g, "fillRule=")
    .replace(/\bclip-rule=/g, "clipRule=")
    .replace(/\bstroke-dasharray=/g, "strokeDasharray=")
    .replace(/\bstroke-dashoffset=/g, "strokeDashoffset=")
    .replace(/\bstop-color=/g, "stopColor=")
    .replace(/\bflood-opacity=/g, "floodOpacity=")
    .replace(/\bclip-path=/g, "clipPath=")
    .replace(/<!--([\s\S]*?)-->/g, "{}");
}

export function buildComponentName(iconName: string): string {
  return (
    iconName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") + "Icon"
  );
}

function buildAnimationCss(state: CustomizationState, pathCount: number = 0): string {
  const isEnabled = state.motion?.enabled ?? false;
  if (!isEnabled) return "";
  if (state.iconType === "pixelated" || state.iconType === "glass") return "";

  const animationType = resolveAnimationType(state.motion?.animationType);
  const easing = resolveEasingValue(state.motion?.easingId, state.motion?.customCubic);
  const duration = Math.max(0.2, state.motion?.duration ?? 2);
  const delay = Math.max(0, state.motion?.delay ?? 0);
  const iterationCount = (state.motion?.loop ?? true) ? "infinite" : "1";
  const isGroupAnim =
    animationType === "bounce" || animationType === "shake" || animationType === "jump";
  const isPathAnim = animationType === "draw" || animationType === "stroke";

  if (isPathAnim && pathCount > 0) {
    return buildPerPathAnimationCss(pathCount, state, {
      selectorPrefix: ".rune-icon-anim-container",
      forExport: true,
    });
  }

  const RUNE_KEYFRAMES: Record<string, string> = {
    bounce: `@keyframes rune-bounce {
    0%   { transform: translateY(0) scale(1,1); }
    30%  { transform: translateY(-22px) scale(0.92,1.08); }
    50%  { transform: translateY(0) scale(1.05,0.95); }
    70%  { transform: translateY(-8px) scale(0.98,1.02); }
    100% { transform: translateY(0) scale(1,1); }
  }`,
    shake: `@keyframes rune-shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    15%  { transform: translateX(-8px) rotate(-3deg); }
    30%  { transform: translateX(7px) rotate(2deg); }
    45%  { transform: translateX(-5px) rotate(-1.5deg); }
    60%  { transform: translateX(4px) rotate(1deg); }
    75%  { transform: translateX(-2px) rotate(-0.5deg); }
    90%  { transform: translateX(1px) rotate(0deg); }
  }`,
    jump: `@keyframes rune-jump {
    0%, 100% { transform: translateY(0) scale(1,1); }
    15%  { transform: translateY(-30px) scale(0.88,1.12); }
    30%  { transform: translateY(-48px) scale(1.06,0.94); }
    45%  { transform: translateY(-24px) scale(0.94,1.06); }
    60%  { transform: translateY(-6px) scale(1.03,0.97); }
    75%  { transform: translateY(0) scale(0.98,1.02); }
    90%  { transform: translateY(-3px) scale(1.01,0.99); }
  }`,
  };

  return `
  .rune-icon-anim {
    transform-box: fill-box;
    transform-origin: 50% 50%;
    ${isGroupAnim ? `animation: rune-${animationType} ${duration}s ${easing} ${delay}s ${iterationCount} both;` : ""}
  }
  ${RUNE_KEYFRAMES[animationType] ?? ""}
  @media (prefers-reduced-motion: reduce) {
    .rune-icon-anim { animation: none !important; transform: none !important; }
  }
  `.trim();
}

async function fetchSvgInnerContent(url: string): Promise<{ content: string; viewBox: string }> {
  try {
    const res = await fetch(url);
    if (!res.ok)
      return { content: `<image href="${url}" width="24" height="24" />`, viewBox: "0 0 24 24" };
    const text = await res.text();
    const svgMatch = text.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/i);
    if (!svgMatch)
      return { content: `<image href="${url}" width="24" height="24" />`, viewBox: "0 0 24 24" };

    const attrs = svgMatch[1];
    const rawContent = svgMatch[2].trim();

    const viewBoxMatch = attrs.match(/viewBox=["']([^"']+)["']/i);
    let viewBox = viewBoxMatch ? viewBoxMatch[1] : "";
    if (!viewBox) {
      const wMatch = attrs.match(/width=["']([^"']+)["']/i);
      const hMatch = attrs.match(/height=["']([^"']+)["']/i);
      viewBox = wMatch && hMatch ? `0 0 ${wMatch[1]} ${hMatch[1]}` : "0 0 24 24";
    }

    const content = svgAttrToJsx(
      rawContent
        .replace(/stroke="(?!none|currentColor)[^"]*"/g, 'stroke="currentColor"')
        .replace(/fill="(?!none|currentColor)[^"]*"/g, 'fill="currentColor"'),
    );

    return { content, viewBox };
  } catch {
    return { content: `<image href="${url}" width="24" height="24" />`, viewBox: "0 0 24 24" };
  }
}

const svgFetchCache = new Map<string, { content: string; viewBox: string }>();

export async function fetchSvgInnerContentRaw(
  url: string,
): Promise<{ content: string; viewBox: string }> {
  const cached = svgFetchCache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`SVG fetch failed: ${res.status}`);
  const text = await res.text();

  const svgMatch = text.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/i);
  if (!svgMatch) throw new Error("Could not parse SVG content");

  const attrs = svgMatch[1];
  const content = svgMatch[2].trim();

  const viewBoxMatch = attrs.match(/viewBox=["']([^"']+)["']/i);
  let viewBox = viewBoxMatch ? viewBoxMatch[1] : "";

  if (!viewBox) {
    const widthMatch = attrs.match(/width=["']([^"']+)["']/i);
    const heightMatch = attrs.match(/height=["']([^"']+)["']/i);
    if (widthMatch && heightMatch) {
      viewBox = `0 0 ${widthMatch[1]} ${heightMatch[1]}`;
    } else {
      viewBox = "0 0 24 24";
    }
  }

  const result = { content, viewBox };
  svgFetchCache.set(url, result);
  return result;
}

export async function generatePng(
  selectedIcon: IconData,
  state: CustomizationState,
): Promise<Blob> {
  const { width, height } = state;

  const staticState: CustomizationState = state.motion?.enabled
    ? { ...state, motion: { ...state.motion, enabled: false } }
    : state;
  const svgStr = await generateStandaloneSvg(selectedIcon, staticState);

  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("No canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => {
        URL.revokeObjectURL(url);
        b ? resolve(b) : reject(new Error("PNG generation failed"));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG load failed"));
    };
    img.src = url;
  });
}

function buildGradientDefs(state: CustomizationState): string {
  if (!state.iconGradient) return "";
  const stops = [...state.gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `<stop offset="${s.position}%" stopColor="${s.color || "#000000"}"/>`)
    .join("\n            ");
  const spreadMethod = state.gradient.spreadMethod ?? "pad";

  if (state.gradient.type === "linear") {
    const rad = (state.gradient.angle * Math.PI) / 180;
    const cx = 12;
    const x1 = (cx - cx * Math.sin(rad)).toFixed(3);
    const y1 = (cx + cx * Math.cos(rad)).toFixed(3);
    const x2 = (cx + cx * Math.sin(rad)).toFixed(3);
    const y2 = (cx - cx * Math.cos(rad)).toFixed(3);
    return `\n        <defs>\n          <linearGradient id="icon-gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse" spreadMethod="${spreadMethod}">\n            ${stops}\n          </linearGradient>\n        </defs>`;
  }

  if (state.gradient.type === "radial") {
    const cx = ((state.gradient.cx ?? 50) / 100) * 24;
    const cy = ((state.gradient.cy ?? 50) / 100) * 24;
    const r = ((state.gradient.r ?? 50) / 100) * 24;
    return `\n        <defs>\n          <radialGradient id="icon-gradient" cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${r.toFixed(3)}" gradientUnits="userSpaceOnUse" spreadMethod="${spreadMethod}">\n            ${stops}\n          </radialGradient>\n        </defs>`;
  }

  const cx = ((state.gradient.cx ?? 50) / 100) * 24;
  const cy = ((state.gradient.cy ?? 50) / 100) * 24;
  const segs = buildConicSegments(state.gradient.stops, state.gradient.angle, cx, cy, 17);
  const polys = segs
    .map((s) => `<polygon points="${s.points}" fill="${s.color}"/>`)
    .join("\n            ");
  return `\n        <defs>\n          <pattern id="icon-gradient" width="24" height="24" patternUnits="userSpaceOnUse">\n            ${polys}\n          </pattern>\n        </defs>`;
}

async function buildComponentCode(
  selectedIcon: IconData,
  state: CustomizationState,
  tsx: boolean,
): Promise<string> {
  const componentName = buildComponentName(selectedIcon.name);
  const standaloneSvg = await generateStandaloneSvg(selectedIcon, state);
  const scalableSvg = standaloneSvg
    .replace(/^<\?xml[^>]*>\s*/i, "")
    .replace(/<!--([\s\S]*?)-->\s*/g, "")
    .replace(/<svg\b([^>]*)>/i, (_match, attributes: string) => {
      const responsiveAttributes = attributes
        .replace(/\swidth="[^"]*"/i, "")
        .replace(/\sheight="[^"]*"/i, "");
      return `<svg${responsiveAttributes} width="100%" height="100%">`;
    });
  const escapedSvg = scalableSvg
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
  const propsInterface = tsx
    ? `interface ${componentName}Props {\n  size?: number | string;\n  className?: string;\n}\n\n`
    : "";
  const propsType = tsx ? `: ${componentName}Props` : "";

  return `import React from "react";

${propsInterface}const svgMarkup = \`${escapedSvg}\`;

export function ${componentName}({
  size = ${state.width},
  className = "",
}${propsType}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        lineHeight: 0,
      }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default ${componentName};`;
}

export async function generateJsxComponent(selectedIcon: IconData, state: CustomizationState) {
  return buildComponentCode(selectedIcon, state, false);
}

export async function generateTsxComponent(selectedIcon: IconData, state: CustomizationState) {
  return buildComponentCode(selectedIcon, state, true);
}

export async function generateGsapComponent(
  selectedIcon: IconData,
  state: CustomizationState,
): Promise<string> {
  const componentName = buildComponentName(selectedIcon.name);
  const color = state.colors[0] || "#000000";

  let innerContent = "";
  let viewBox = "0 0 24 24";
  if (selectedIcon.url) {
    try {
      const res = await fetchSvgInnerContentRaw(selectedIcon.url);
      innerContent = res.content
        .replace(/\bstroke="(?!none)[^"]*"/g, `stroke="${color}"`)
        .replace(/\bfill="(?!none)[^"]*"/g, `fill="none"`);
      viewBox = res.viewBox;
    } catch {
      innerContent = "";
    }
  } else if (selectedIcon.icon) {
    const markup = renderToStaticMarkup(
      React.createElement(selectedIcon.icon, { size: 24, strokeWidth: 2 }),
    );
    const match = markup.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match) innerContent = match[1].trim();
  }

  return `
import React from 'react';

export function ${componentName}({ size = 24, color = '${color}' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${viewBox}"
      fill="none" stroke={color} strokeWidth={${STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeWidth}} strokeLinecap="${STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeLinecap}" strokeLinejoin="${STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeLinejoin}">
      ${innerContent}
    </svg>
  );
}

export default ${componentName};`.trim();
}

export async function generateFramerComponent(
  selectedIcon: IconData,
  state: CustomizationState,
): Promise<string> {
  const componentName = buildComponentName(selectedIcon.name);
  const loop = state.motion?.loop ?? false;
  const duration = Math.max(0.2, state.motion?.duration ?? 2);
  const stagger = state.motion?.pathSequential ? (state.motion?.pathStaggerDelay ?? 0.08) : 0;
  const easing = resolveEasingValue(state.motion?.easingId, state.motion?.customCubic);

  let innerContent = "";
  let viewBox = "0 0 24 24";
  if (selectedIcon.url) {
    try {
      const res = await fetchSvgInnerContentRaw(selectedIcon.url);
      const color = state.colors[0] || "currentColor";
      innerContent = res.content
        .replace(/\bstroke="(?!none)[^"]*"/g, `stroke="${color}"`)
        .replace(/\bfill="(?!none)[^"]*"/g, `fill="none"`);
      viewBox = res.viewBox;
    } catch {
      innerContent = "";
    }
  } else if (selectedIcon.icon) {
    const markup = renderToStaticMarkup(
      React.createElement(selectedIcon.icon, { size: 24, strokeWidth: 2 }),
    );
    const match = markup.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match) innerContent = match[1].trim();
  }

  let fmEase: string;
  if (easing.startsWith("cubic-bezier")) {
    const m = easing.match(
      /cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/,
    );
    fmEase = m ? `[${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}]` : '"easeInOut"';
  } else {
    fmEase = '"easeInOut"';
  }

  const repeatStr = loop ? "Infinity" : "0";

  return `

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: ${stagger},
    },
  },
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: ${duration},
      ease: ${fmEase},
      repeat: ${repeatStr},
    },
  },
};

export function ${componentName}({
  color = '${state.colors[0] || "#000000"}',
  animate = true,
}) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="${viewBox}"
      fill="none"
      stroke={color}
      strokeWidth={${STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeWidth}}
      strokeLinecap="${STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeLinecap}"
      strokeLinejoin="${STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeLinejoin}"
      variants={containerVariants}
      initial="hidden"
      animate={animate ? 'visible' : 'hidden'}
    >
      ${innerContent
        .replace(/<(path|circle|rect|ellipse|line|polyline|polygon)(\s)/g, "<motion.$1$2")
        .replace(/<\/(path|circle|rect|ellipse|line|polyline|polygon)>/g, "</motion.$1>")
        .replace(/(<motion\.[a-z]+\s[^>]*?)(\/>)/g, "$1 variants={pathVariants}$2")}
    </motion.svg>
  );
}

export default ${componentName};`.trim();
}
