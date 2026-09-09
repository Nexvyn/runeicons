import { CustomizationState } from "../types";
import { resolveEasingValue } from "./animation-engine";

export function injectPathIndices(svgHtml: string): { tagged: string; count: number } {
  let count = 0;
  const tagged = svgHtml.replace(
    /<(path|circle|rect|ellipse|line|polyline|polygon)([^>]*?)(\/?>)/gi,
    (match, tag, attrs, end) => {
      if (attrs.includes("data-path-idx")) return match;
      const newTag = `<${tag}${attrs} data-path-idx="${count}"${end}`;
      count++;
      return newTag;
    },
  );
  return { tagged, count };
}

export function computeTotalDuration(pathCount: number, state: CustomizationState): number {
  const { motion } = state;
  if (pathCount === 0) return motion.duration;
  let maxEnd = 0;
  for (let i = 0; i < pathCount; i++) {
    const override = motion.perPathAnimations?.[String(i)] || {};
    const duration = override.duration ?? motion.duration;
    const staggeredDelay = motion.pathSequential
      ? motion.delay + i * (motion.pathStaggerDelay ?? 0.12)
      : motion.delay;
    const delay = override.delay ?? staggeredDelay;
    const end = delay + duration;
    if (end > maxEnd) maxEnd = end;
  }
  return maxEnd;
}

export function buildPerPathAnimationCss(
  pathCount: number,
  state: CustomizationState,
  options: { selectorPrefix?: string; forExport?: boolean; unitScale?: number } = {},
): string {
  const { motion } = state;
  const { selectorPrefix = ".canvas-icon-container", forExport = false, unitScale = 1 } = options;
  if (state.iconType === "pixelated" || state.iconType === "glass") return "";
  const isDraw = motion.animationType === "draw";
  const isStroke = motion.animationType === "stroke";

  if (!isDraw && !isStroke) return "";

  const isPreview = selectorPrefix === ".canvas-icon-container";
  const globalScrub = !forExport ? (motion.scrubProgress ?? null) : null;
  const globalPaused = !forExport ? (motion.isPaused ?? false) : false;
  const totalDuration = computeTotalDuration(pathCount, state);

  let css = "";

  if (isPreview && motion.selectedPathIndex !== -1) {
    css += `
      ${selectorPrefix} [data-path-idx] {
        transition: opacity 0.2s ease-out;
      }
      ${selectorPrefix} [data-path-idx]:not([data-path-idx="${motion.selectedPathIndex}"]) {
        opacity: 0.15;
      }
    `;
  }

  for (let i = 0; i < pathCount; i++) {
    const override = motion.perPathAnimations?.[String(i)] || {};

    if (override.hidden) {
      css += `${selectorPrefix} [data-path-idx="${i}"] { opacity: 0 !important; animation: none !important; }\n`;
      continue;
    }

    const duration = override.duration ?? motion.duration;
    const staggeredDelay = motion.pathSequential
      ? motion.delay + i * (motion.pathStaggerDelay ?? 0.12)
      : motion.delay;
    const delay = override.delay ?? staggeredDelay;
    const easing = resolveEasingValue(
      override.easingId ?? motion.easingId,
      override.customCubic ?? motion.customCubic,
    );
    const pathTrimStart = override.pathTrimStart ?? motion.pathTrimStart;
    const pathTrimEnd = override.pathTrimEnd ?? motion.pathTrimEnd;
    const pathReverse = override.pathReverse ?? motion.pathReverse;
    const trigger = override.trigger ?? motion.trigger ?? "auto";
    const loop = trigger === "once" ? false : (override.loop ?? motion.loop);

    const animName = `icon-path-anim-${i}`;
    const iterationCount = loop ? "infinite" : "1";

    const s = pathTrimStart / 100;
    const e = pathTrimEnd / 100;
    const SPACE = 1500;
    const visLen = Math.max(1, (e - s) * SPACE);
    const initialOffset = (pathReverse ? s : e) * SPACE;
    const finalOffset = (pathReverse ? e : s) * SPACE;
    const dot = 6 * unitScale;
    const dotGap = 4.5 * unitScale;
    const flowTravel = (dot + dotGap) * 4;

    let playState: string;
    let effectiveDelay: string;

    const perPathScrub = !forExport ? (override.scrubProgress ?? null) : null;

    if (perPathScrub !== null) {
      const scrubTime = (perPathScrub / 100) * duration;
      const clampedTime = Math.max(0, Math.min(duration, scrubTime));
      effectiveDelay = `-${clampedTime}s`;
      playState = "paused";
    } else if (globalScrub !== null) {
      const globalScrubTime = (globalScrub / 100) * totalDuration;
      const localTime = globalScrubTime - delay;
      const clampedTime = Math.max(0, Math.min(duration, localTime));
      effectiveDelay = `-${clampedTime}s`;
      playState = "paused";
    } else if (globalPaused) {
      effectiveDelay = `${delay}s`;
      playState = "paused";
    } else if (trigger === "hover" || trigger === "click") {
      effectiveDelay = `${delay}s`;
      playState = "paused";
    } else {
      effectiveDelay = `${delay}s`;
      playState = "running";
    }

    css += isDraw
      ? `
      ${selectorPrefix} [data-path-idx="${i}"] {
        stroke-dasharray: ${visLen} ${SPACE};
        stroke-dashoffset: ${initialOffset};
        animation: ${animName} ${duration}s ${easing} ${effectiveDelay} ${iterationCount} both;
        animation-play-state: ${playState};
      }

      @keyframes ${animName} {
        0%   { stroke-dashoffset: ${initialOffset}; fill-opacity: ${pathReverse ? 1 : 0}; }
        70%  { stroke-dashoffset: ${finalOffset}; fill-opacity: 0; }
        100% { stroke-dashoffset: ${finalOffset}; fill-opacity: ${pathReverse ? 0 : 1}; }
      }`
      : `
      ${selectorPrefix} [data-path-idx="${i}"] {
        stroke-dasharray: ${dot} ${dotGap};
        stroke-dashoffset: 0;
        fill-opacity: ${pathReverse ? 1 : 0};
        animation: ${animName} ${duration}s ${easing} ${effectiveDelay} ${iterationCount} both;
        animation-play-state: ${playState};
      }

      @keyframes ${animName} {
        0%   { stroke-dashoffset: 0; fill-opacity: ${pathReverse ? 1 : 0}; }
        35%  { stroke-dashoffset: ${-flowTravel / 2}; fill-opacity: 1; }
        100% { stroke-dashoffset: ${-flowTravel}; fill-opacity: ${pathReverse ? 0 : 1}; }
      }
    `;

    if (override.fillTransition) {
      const fillDelay = delay + duration * 0.7;
      css += `
        ${selectorPrefix} [data-path-idx="${i}"] {
          transition: fill 0.4s ease-out ${fillDelay}s;
        }
      `;
    }

    css += `
      @media (prefers-reduced-motion: reduce) {
        ${selectorPrefix} [data-path-idx="${i}"] {
          animation: none !important;
          stroke-dashoffset: ${finalOffset} !important;
          fill-opacity: ${pathReverse ? 0 : 1} !important;
        }
      }
    `;
  }

  return css;
}
