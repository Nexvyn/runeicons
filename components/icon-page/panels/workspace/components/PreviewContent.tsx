import { forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { CustomizationState, IconData } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  resolveAnimationType,
  resolveEasingValue,
} from "@/lib/editor/animation-engine";
import { fetchSvgInnerContentRaw } from "@/lib/svg-export-utils";
import { STROKE_STYLE_MAP } from "@/lib/stroke-style";

interface PreviewContentProps {
  state: CustomizationState;
  selectedIcon: IconData | null;
  boxShadow: string;
  supportsFilter: boolean;
  noiseFilter: string;
  blurFilter: string;
}

export const PreviewContent = memo(
  forwardRef<HTMLDivElement, PreviewContentProps>(
    ({ state, selectedIcon, boxShadow, supportsFilter, noiseFilter, blurFilter }, ref) => {
      const SelectedIconComponent = selectedIcon?.icon;
      const lucideWrapRef = useRef<HTMLDivElement>(null);
      const motionEnabled = state.motion?.enabled === true;
      const animationType = motionEnabled
        ? resolveAnimationType(state.motion?.animationType)
        : "none";
      const easingValue = resolveEasingValue(
        state.motion?.easingId,
        state.motion?.customCubic,
      );
      const motionDuration = Math.max(0.2, state.motion?.duration ?? 2);
      const motionDelay = Math.max(0, state.motion?.delay ?? 0);
      const iterationCount = state.motion?.loop ?? true ? "infinite" : "1";

      const [svgData, setSvgData] = useState<{ content: string; viewBox: string } | null>(null);

      useEffect(() => {
        if (selectedIcon?.url) {
          fetchSvgInnerContentRaw(selectedIcon.url)
            .then(setSvgData)
            .catch(() => setSvgData(null));
        } else {
          setSvgData(null);
        }
      }, [selectedIcon?.url]);

      const isDrawAnim = motionEnabled && (animationType === "draw" || animationType === "stroke");
      const effectiveIconType = selectedIcon?.iconType ?? state.iconType;
      const renderAsDesigned =
        effectiveIconType === "duotone" ||
        effectiveIconType === "fill" ||
        effectiveIconType === "glass" ||
        effectiveIconType === "pixelated";
      const renderRawFromPublic =
        effectiveIconType === "duotone" ||
        effectiveIconType === "fill" ||
        effectiveIconType === "glass";

      const colorizedSvgContent = useMemo(() => {
        if (!svgData) return null;

        const { content: svgContent } = svgData;

        if (renderAsDesigned) {
          if (isDrawAnim) {
            return svgContent.replace(
              /<(path|circle|rect|ellipse|line|polyline|polygon)(\s)/g,
              `<$1 pathLength="1" class="canvas-icon-draw-path"$2`,
            );
          }
          return svgContent;
        }

        const color = state.colors[0] || "currentColor";

        let baseColorized: string;
        if (state.iconGradient) {
          const gt = state.gradient.target ?? "both";
          const strokeVal = gt === "stroke" || gt === "both" ? "url(#icon-gradient)" : color;
          const fillVal =
            gt === "fill" || gt === "both" ? "url(#icon-gradient)" : "none";
          baseColorized = svgContent
            .replace(/\bstroke="(?!none)[^"]*"/g, `stroke="${strokeVal}"`)
            .replace(/\bfill="(?!none)[^"]*"/g, `fill="${fillVal}"`);
        } else {
          baseColorized = svgContent
            .replace(/\bstroke="(?!none)[^"]*"/g, `stroke="${color}"`)
            .replace(/\bfill="(?!none)[^"]*"/g, `fill="none"`);
        }

        let result = baseColorized
          .replace(/\s*stroke-linecap="[^"]*"/g, "")
          .replace(/\s*stroke-linejoin="[^"]*"/g, "")
          .replace(/\s*stroke-width="[^"]*"/g, "");

        if (isDrawAnim) {
          result = result.replace(
            /<(path|circle|rect|ellipse|line|polyline|polygon)(\s)/g,
            `<$1 pathLength="1" class="canvas-icon-draw-path"$2`,
          );
        }

        return result;
      }, [svgData, state.colors, state.iconGradient, state.gradient.target, effectiveIconType, state.strokeStyle, isDrawAnim, renderAsDesigned]);
      useEffect(() => {
        const container = lucideWrapRef.current;
        if (!container || !isDrawAnim) return;
        const paths = Array.from(
          container.querySelectorAll<SVGElement>("path, circle, rect, ellipse, line, polyline, polygon")
        );
        paths.forEach((el) => {
          el.setAttribute("pathLength", "1");
          el.classList.add("canvas-icon-draw-path");
        });
        return () => {
          paths.forEach((el) => {
            el.removeAttribute("pathLength");
            el.classList.remove("canvas-icon-draw-path");
          });
        };
      }, [isDrawAnim, selectedIcon?.id, state.motion?.replayNonce]);

      useEffect(() => {
        if (!motionEnabled || state.motion?.isPaused) return;
        const container = lucideWrapRef.current;
        if (!container) return;

        const globalTrigger = state.motion?.trigger ?? "auto";
        const hasGlobalHover = globalTrigger === "hover";
        const hasGlobalClick = globalTrigger === "click";

        if (!hasGlobalHover && !hasGlobalClick) return;

        const allEls = () =>
          Array.from(container.querySelectorAll<SVGElement>("path, circle, rect, ellipse, line, polyline, polygon"));

        const play = (els: SVGElement[]) =>
          els.forEach((el) => (el.style.animationPlayState = "running"));
        const pause = (els: SVGElement[]) =>
          els.forEach((el) => (el.style.animationPlayState = "paused"));

        const onEnter = () => { if (hasGlobalHover) play(allEls()); };
        const onLeave = () => { if (hasGlobalHover) pause(allEls()); };
        const onClick = () => {
          if (!hasGlobalClick) return;
          const targets = allEls();
          const isCurrentlyPaused = targets[0]?.style.animationPlayState !== "running";
          isCurrentlyPaused ? play(targets) : pause(targets);
        };

        if (hasGlobalHover) {
          container.addEventListener("mouseenter", onEnter);
          container.addEventListener("mouseleave", onLeave);
        }
        if (hasGlobalClick) container.addEventListener("click", onClick);

        return () => {
          container.removeEventListener("mouseenter", onEnter);
          container.removeEventListener("mouseleave", onLeave);
          container.removeEventListener("click", onClick);
        };
      }, [motionEnabled, state.motion?.trigger, state.motion?.replayNonce, state.motion?.isPaused]);

      const gradientCss = useMemo(() => {
        if (!state.iconGradient || !state.gradient.stops.length) return "";
        const sorted = [...state.gradient.stops].sort((a, b) => a.position - b.position);
        const stops = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
        const cx = state.gradient.cx ?? 50;
        const cy = state.gradient.cy ?? 50;

        if (state.gradient.type === "linear") {
          return `linear-gradient(${state.gradient.angle}deg, ${stops})`;
        } else if (state.gradient.type === "radial") {
          return `radial-gradient(circle at ${cx}% ${cy}%, ${stops})`;
        } else if (state.gradient.type === "angular") {
          return `conic-gradient(from ${state.gradient.angle}deg at ${cx}% ${cy}%, ${stops})`;
        }
        return "";
      }, [state.iconGradient, state.gradient]);

      const animationCss = useMemo(() => {
        if (animationType === "none") return "";

        const pauseState = state.motion?.isPaused ? "paused" : "running";
        const trimStart = (state.motion?.pathTrimStart ?? 0) / 100;
        const trimEnd = (state.motion?.pathTrimEnd ?? 100) / 100;
        const sequential = state.motion?.pathSequential ?? false;
        const stagger = sequential ? (state.motion?.pathStaggerDelay ?? 0.12) : 0;
        const reverse = state.motion?.pathReverse ?? false;

        if (animationType === "draw" || animationType === "stroke") {
          const strokeKeyframes = animationType === "stroke"
            ? `@keyframes canvas-svg-draw {
                0%   { stroke-dashoffset: 1; fill-opacity: 0; }
                55%  { stroke-dashoffset: ${reverse ? 1 - trimEnd : trimStart}; fill-opacity: 0; }
                85%  { fill-opacity: 0.5; }
                100% { stroke-dashoffset: ${reverse ? 1 - trimEnd : trimStart}; fill-opacity: 1; }
              }`
            : `@keyframes canvas-svg-draw {
                0%   { stroke-dashoffset: 1; fill-opacity: 0; }
                70%  { stroke-dashoffset: ${reverse ? 1 - trimEnd : trimStart}; fill-opacity: 0; }
                100% { stroke-dashoffset: ${reverse ? 1 - trimEnd : trimStart}; fill-opacity: 1; }
              }`;
          return `
            .canvas-icon-draw-path {
              stroke-dasharray: 1;
              stroke-dashoffset: 1;
              pathLength: 1;
              animation: canvas-svg-draw ${motionDuration}s ${easingValue} var(--draw-delay, ${motionDelay}s) ${iterationCount} both;
              animation-play-state: ${pauseState};
            }
            ${strokeKeyframes}
            ${Array.from({ length: 20 }, (_, i) =>
              `.canvas-icon-draw-path:nth-child(${i + 1}) { --draw-delay: ${motionDelay + i * stagger}s; }`
            ).join("\n")}
          `;
        }

        return `
          .canvas-icon-anim-bounce { animation: canvas-svg-bounce ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both; animation-play-state: ${pauseState}; }
          .canvas-icon-anim-shake  { animation: canvas-svg-shake  ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both; animation-play-state: ${pauseState}; }
          .canvas-icon-anim-jump   { animation: canvas-svg-jump   ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both; animation-play-state: ${pauseState}; }
          @keyframes canvas-svg-bounce {
            0%   { transform: translateY(0) scale(1,1); }
            30%  { transform: translateY(-22px) scale(0.92,1.08); }
            50%  { transform: translateY(0) scale(1.05,0.95); }
            70%  { transform: translateY(-8px) scale(0.98,1.02); }
            100% { transform: translateY(0) scale(1,1); }
          }
          @keyframes canvas-svg-shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            15% { transform: translateX(-8px) rotate(-3deg); }
            30% { transform: translateX(7px) rotate(2deg); }
            45% { transform: translateX(-5px) rotate(-1.5deg); }
            60% { transform: translateX(4px) rotate(1deg); }
            75% { transform: translateX(-2px) rotate(-0.5deg); }
            90% { transform: translateX(1px) rotate(0deg); }
          }
          @keyframes canvas-svg-jump {
            0%, 100% { transform: translateY(0) scale(1,1); }
            15% { transform: translateY(-30px) scale(0.88,1.12); }
            30% { transform: translateY(-48px) scale(1.06,0.94); }
            45% { transform: translateY(-24px) scale(0.94,1.06); }
            60% { transform: translateY(-6px) scale(1.03,0.97); }
            75% { transform: translateY(0) scale(0.98,1.02); }
            90% { transform: translateY(-3px) scale(1.01,0.99); }
          }
        `;
      }, [animationType, motionDuration, motionDelay, easingValue, iterationCount, state.motion?.isPaused, state.motion?.pathTrimStart, state.motion?.pathTrimEnd, state.motion?.pathSequential, state.motion?.pathStaggerDelay, state.motion?.pathReverse]);

      const gradientTarget = state.gradient.target ?? "both";
      const applyGradToStroke = state.iconGradient && (gradientTarget === "stroke" || gradientTarget === "both");
      const applyGradToFill = state.iconGradient && (gradientTarget === "fill" || gradientTarget === "both");
      const strokeAttrs = STROKE_STYLE_MAP[state.strokeStyle ?? "round"];

      return (
        <div
          ref={ref}
          className="relative flex flex-1 items-center justify-center overflow-hidden p-12"
        >
          <motion.div
            animate={{
              width: state.width,
              height: state.height,
              padding: state.padding,
              scale: state.scale,
              x: state.translateX,
              y: state.translateY,
              rotateZ: state.rotation,
              scaleX: state.flipH ? -1 : 1,
              scaleY: state.flipV ? -1 : 1,
              boxShadow: state.shadow.enabled && state.shadow.inner ? "none" : boxShadow,
              filter: [blurFilter, noiseFilter].filter(Boolean).join(" "),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              background: state.backgroundColor || "transparent",
              overflow:
                animationType === "bounce" ||
                animationType === "shake" ||
                animationType === "jump"
                  ? "visible"
                  : "hidden",
              borderRadius: state.cornerRadius,
              transition: "border-radius 0.2s ease",
              ...(!supportsFilter &&
                state.blur > 0 && {
                  opacity: 0.9,
                }),
            }}
            className="relative flex items-center justify-center"
            role="img"
            aria-label={
              selectedIcon
                ? `${selectedIcon.name} icon with customizations`
                : "Customizable preview element"
            }
          >

            {animationCss ? <style>{animationCss}</style> : null}

            <AnimatePresence mode="popLayout">
              {selectedIcon ? (
                <motion.div
                  key={`${selectedIcon.id}-${effectiveIconType}-${state.motion?.replayNonce ?? 0}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className={cn(
                    "flex h-full w-full items-center justify-center",
                    effectiveIconType === "isometric" &&
                      "[transform:rotateX(45deg)_rotateZ(-45deg)] transform",
                    effectiveIconType === "pixelated" &&
                      "[filter:url(#pixelate)] [image-rendering:pixelated]",
                    effectiveIconType === "dither" && "[filter:url(#dither-filter)]",
                  )}
                >
                  <div
                    ref={lucideWrapRef}
                    className={cn(
                      "h-full w-full canvas-icon-container",
                      animationType === "bounce" && "canvas-icon-anim-bounce",
                      animationType === "shake" && "canvas-icon-anim-shake",
                      animationType === "jump" && "canvas-icon-anim-jump",
                    )}
                  >
                    {colorizedSvgContent ? (
                      <svg
                        viewBox={svgData?.viewBox || "0 0 24 24"}
                        strokeWidth={
                          renderRawFromPublic ? undefined : strokeAttrs.strokeWidth
                        }
                        strokeLinecap={
                          renderRawFromPublic ? undefined : strokeAttrs.strokeLinecap
                        }
                        strokeLinejoin={
                          renderRawFromPublic ? undefined : strokeAttrs.strokeLinejoin
                        }
                        stroke={
                          renderAsDesigned
                            ? undefined
                            : applyGradToStroke
                              ? "url(#icon-gradient)"
                              : state.colors[0] || "currentColor"
                        }
                        fill="none"
                        className={cn(
                          "h-full w-full",
                          renderAsDesigned && !renderRawFromPublic && "dark:invert",
                        )}
                        style={{
                          transform: `rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
                          filter:
                            [
                              state.shadow.inner ? "url(#inner-shadow)" : null,
                              state.blur > 0 ? "url(#inner-blur)" : null,
                              state.noise.enabled ? "url(#noise-filter)" : null,
                              state.texture.enabled && state.texture.selected !== "none" ? "url(#texture-filter)" : null,
                            ]
                              .filter(Boolean)
                              .join(" ") || undefined,
                        }}
                        dangerouslySetInnerHTML={{ __html: colorizedSvgContent }}
                        aria-hidden="true"
                      />
                    ) : SelectedIconComponent ? (
                      (() => {
                        const LucideIcon = SelectedIconComponent as any;
                        return (
                          <LucideIcon
                            className={cn(renderAsDesigned && !renderRawFromPublic && "dark:invert")}
                            size="100%"
                            strokeWidth={strokeAttrs.strokeWidth}
                            strokeLinecap={strokeAttrs.strokeLinecap}
                            strokeLinejoin={strokeAttrs.strokeLinejoin}
                            stroke={applyGradToStroke ? "url(#icon-gradient)" : state.colors[0] || "currentColor"}
                            fill={
                              effectiveIconType === "fill"
                                ? (applyGradToFill ? "url(#icon-gradient)" : state.colors[0] || "currentColor")
                                : effectiveIconType === "duotone"
                                  ? (applyGradToFill ? "url(#icon-gradient)" : `${state.colors[0] || "currentColor"}33`)
                                  : "none"
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              transform: `rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
                              filter:
                                [
                                  state.shadow.inner ? "url(#inner-shadow)" : null,
                                  state.blur > 0 ? "url(#inner-blur)" : null,
                                  state.noise.enabled ? "url(#noise-filter)" : null,
                                  state.texture.enabled && state.texture.selected !== "none" ? "url(#texture-filter)" : null,
                                ]
                                  .filter(Boolean)
                                  .join(" ") || undefined,
                            }}
                            aria-hidden="true"
                          />
                        );
                      })()
                    ) : (
                      <div
                        className={cn(
                          "h-full w-full flex items-center justify-center",
                          renderAsDesigned && !renderRawFromPublic && "dark:invert",
                        )}
                        style={{
                          WebkitMaskImage: selectedIcon?.url ? `url(${selectedIcon.url})` : "none",
                          maskImage: selectedIcon?.url ? `url(${selectedIcon.url})` : "none",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          background: state.iconGradient
                            ? gradientCss
                            : state.colors[0] || "currentColor",
                          transform: `rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
                          filter:
                            [
                              state.shadow.inner ? "url(#inner-shadow)" : null,
                              state.blur > 0 ? "url(#inner-blur)" : null,
                              state.noise.enabled ? "url(#noise-filter)" : null,
                              state.texture.enabled && state.texture.selected !== "none" ? "url(#texture-filter)" : null,
                            ]
                              .filter(Boolean)
                              .join(" ") || undefined,
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm font-medium text-muted-foreground"
                >
                  <p>Select an icon</p>
                  <p className="mt-1 text-xs opacity-70">from the left panel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      );
    },
  ),
);

PreviewContent.displayName = "PreviewContent";
