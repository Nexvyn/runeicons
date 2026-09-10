import { forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { renderToStaticMarkup } from "react-dom/server";

import { resolveEffectiveIconType, TYPE_EFFECT_SUPPORT } from "@/constants/workspace";
import { resolveAnimationType, resolveEasingValue } from "@/lib/editor/animation-engine";
import { buildPerPathAnimationCss, injectPathIndices } from "@/lib/editor/path-animation";
import { STROKE_STYLE_MAP } from "@/lib/stroke-style";
import {
  applyTextureToSvgContent,
  colorizeSvgContent,
  fetchSvgInnerContentRaw,
  stripSvgStrokeStyleAttributes,
} from "@/lib/svg-export-utils";
import { CustomizationState, IconData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PreviewContentProps {
  state: CustomizationState;
  selectedIcon: IconData | null;
  dropShadow: string;
  supportsFilter: boolean;
  noiseFilter: string;
  blurFilter: string;
}
export const PreviewContent = memo(
  forwardRef<HTMLDivElement, PreviewContentProps>(
    ({ state, selectedIcon, dropShadow, supportsFilter, noiseFilter, blurFilter }, ref) => {
      const SelectedIconComponent = selectedIcon?.icon;
      const lucideWrapRef = useRef<HTMLDivElement>(null);
      const motionEnabled = state.motion?.enabled === true;
      const animationType = motionEnabled
        ? resolveAnimationType(state.motion?.animationType)
        : "none";
      const easingValue = resolveEasingValue(state.motion?.easingId, state.motion?.customCubic);
      const motionDuration = Math.max(0.2, state.motion?.duration ?? 2);
      const motionDelay = Math.max(0, state.motion?.delay ?? 0);
      const iterationCount = (state.motion?.loop ?? true) ? "infinite" : "1";
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
      const effectiveIconType =
        selectedIcon?.category === "custom" ? "normal" : (selectedIcon?.iconType ?? state.iconType);
      const renderAsDesigned =
        effectiveIconType === "duotone" ||
        effectiveIconType === "fill" ||
        effectiveIconType === "glass" ||
        effectiveIconType === "pixelated";
      const renderRawFromPublic =
        effectiveIconType === "duotone" ||
        effectiveIconType === "fill" ||
        effectiveIconType === "glass";
      const isTextureActive =
        state.texture.enabled &&
        state.texture.selected !== "none" &&
        effectiveIconType !== "pixelated" &&
        effectiveIconType !== "glass";
      // Pixelated and glass have baked-in rendering: suppress the effects whose
      // controls are hidden in the panel so stale values can't leak in.
      const isStyleSuppressed = effectiveIconType === "pixelated" || effectiveIconType === "glass";
      const isPixelatedStyle = effectiveIconType === "pixelated";
      const paintColors = effectiveIconType === "glass" ? ["", ""] : state.colors;
      const useGradient =
        effectiveIconType === "glass" ? false : state.iconGradient && !isTextureActive;
      const noiseOn = state.noise.enabled && state.noise.intensity > 0 && !isStyleSuppressed;
      const shadowOuterOn =
        state.shadow.enabled &&
        !state.shadow.inner &&
        state.shadow.opacity > 0 &&
        !isStyleSuppressed;
      const shadowInnerOn = state.shadow.enabled && state.shadow.inner && !isStyleSuppressed;
      const svgPathCount = useMemo(
        () => (svgData ? injectPathIndices(svgData.content).count : (selectedIcon?.pathCount ?? 0)),
        [selectedIcon?.pathCount, svgData],
      );
      const colorizedSvgContent = useMemo(() => {
        if (!svgData) return null;
        const { content: svgContent } = svgData;

        let result = svgContent;
        if (renderAsDesigned) {
          result = colorizeSvgContent(
            svgContent,
            effectiveIconType,
            paintColors,
            useGradient,
            state.gradient.target ?? "both",
          );
        } else if (useGradient) {
          const target = state.gradient.target ?? "both";
          const strokeValue =
            target === "stroke" || target === "both"
              ? "url(#icon-gradient)"
              : paintColors[0] || "currentColor";
          const fillValue = target === "fill" || target === "both" ? "url(#icon-gradient)" : "none";
          result = svgContent
            .replace(/\bstroke="(?!none|transparent)[^"]*"/gi, `stroke="${strokeValue}"`)
            .replace(/\bfill="(?!none|transparent)[^"]*"/gi, `fill="${fillValue}"`);
        } else if (paintColors[0]) {
          const hasExplicitStrokes = /\bstroke="(?!none|transparent)[^"]*"/i.test(svgContent);
          result = svgContent.replace(
            /\bstroke="(?!none|transparent)[^"]*"/gi,
            `stroke="${paintColors[0]}"`,
          );
          result = result.replace(
            /\bfill="(?!none|transparent)[^"]*"/gi,
            hasExplicitStrokes ? 'fill="none"' : `fill="${paintColors[0]}"`,
          );
        } else {
          const hasExplicitStrokes = /\bstroke="(?!none|transparent)[^"]*"/i.test(svgContent);
          result = svgContent.replace(
            /\bstroke="(?!none|transparent)[^"]*"/gi,
            'stroke="currentColor"',
          );
          result = result.replace(
            /\bfill="(?!none|transparent)[^"]*"/gi,
            hasExplicitStrokes ? 'fill="none"' : 'fill="currentColor"',
          );
        }

        if (isTextureActive) {
          const viewBoxParts = svgData.viewBox.split(/\s+/).map(Number);
          const viewBoxX = viewBoxParts[0] || 0;
          const viewBoxY = viewBoxParts[1] || 0;
          const viewBoxWidth = viewBoxParts[2] || 24;
          const viewBoxHeight = viewBoxParts[3] || 24;
          const patternId = "preview-texture-pattern";
          result = applyTextureToSvgContent(result, patternId);
          result = `<defs><pattern id="${patternId}" x="${viewBoxX}" y="${viewBoxY}" width="${viewBoxWidth}" height="${viewBoxHeight}" patternUnits="userSpaceOnUse"><image href="/textures/${state.texture.selected}.png" x="${viewBoxX}" y="${viewBoxY}" width="${viewBoxWidth}" height="${viewBoxHeight}" opacity="${state.texture.opacity / 100}" preserveAspectRatio="xMidYMid slice"/></pattern></defs>${result}`;
        }
        if (effectiveIconType !== "glass") {
          result = stripSvgStrokeStyleAttributes(result);
        }
        if (noiseOn) {
          result = result.replace(
            /<(path|circle|rect|ellipse|line|polyline|polygon)([^>]*?)(\/?>)/gi,
            (match, tag, attrs, end) =>
              attrs.includes('filter="')
                ? match
                : `<${tag}${attrs} filter="url(#noise-filter)"${end}`,
          );
        }

        if (isDrawAnim) {
          result = injectPathIndices(result).tagged;
        }
        return result;
      }, [
        effectiveIconType,
        isDrawAnim,
        isTextureActive,
        noiseOn,
        paintColors,
        renderAsDesigned,
        state.gradient.target,
        state.texture.opacity,
        state.texture.selected,
        svgData,
        useGradient,
      ]);
      const gradientTarget = state.gradient.target ?? "both";
      const applyGradToStroke =
        useGradient && (gradientTarget === "stroke" || gradientTarget === "both");
      const applyGradToFill =
        useGradient && (gradientTarget === "fill" || gradientTarget === "both");
      const duotoneWash =
        paintColors[1] && paintColors[1].trim().length > 0
          ? paintColors[1]
          : `${paintColors[0] || "currentColor"}33`;
      const lucideStrokeValue = isTextureActive
        ? "url(#preview-texture-pattern)"
        : applyGradToStroke
          ? "url(#icon-gradient)"
          : paintColors[0] || "currentColor";
      const lucideFillValue = isTextureActive
        ? effectiveIconType === "normal"
          ? "none"
          : "url(#preview-texture-pattern)"
        : effectiveIconType === "fill"
          ? applyGradToFill
            ? "url(#icon-gradient)"
            : paintColors[0] || "currentColor"
          : effectiveIconType === "duotone"
            ? applyGradToFill
              ? "url(#icon-gradient)"
              : duotoneWash
            : "none";
      const lucideInnerContent = useMemo(() => {
        if (!SelectedIconComponent || svgData) return null;
        const LucideIcon = SelectedIconComponent as any;
        const markup = renderToStaticMarkup(
          <LucideIcon
            size={24}
            strokeWidth={STROKE_STYLE_MAP[state.strokeStyle ?? "round"].strokeWidth}
            stroke={lucideStrokeValue}
            fill={lucideFillValue}
          />,
        );
        let inner = stripSvgStrokeStyleAttributes(
          markup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""),
        );
        if (isTextureActive) {
          inner =
            `<defs><pattern id="preview-texture-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><image href="/textures/${state.texture.selected}.png" x="0" y="0" width="24" height="24" opacity="${state.texture.opacity / 100}" preserveAspectRatio="xMidYMid slice"/></pattern></defs>` +
            inner;
        }
        if (isDrawAnim) {
          inner = injectPathIndices(inner).tagged;
        }
        return inner;
      }, [
        SelectedIconComponent,
        isDrawAnim,
        isTextureActive,
        lucideFillValue,
        lucideStrokeValue,
        state.strokeStyle,
        state.texture.opacity,
        state.texture.selected,
        svgData,
      ]);
      useEffect(() => {
        if (!motionEnabled || state.motion?.isPaused) return;
        const container = lucideWrapRef.current;
        if (!container) return;

        const globalTrigger = state.motion?.trigger ?? "auto";
        const hasGlobalHover = globalTrigger === "hover";
        const hasGlobalClick = globalTrigger === "click";
        if (!hasGlobalHover && !hasGlobalClick) return;

        const getTargets = (): Array<HTMLElement | SVGElement> =>
          isDrawAnim
            ? Array.from(
                container.querySelectorAll<SVGElement>(
                  "path, circle, rect, ellipse, line, polyline, polygon",
                ),
              )
            : [container];
        const setPlayState = (playState: "running" | "paused") => {
          getTargets().forEach((element) => {
            element.style.animationPlayState = playState;
          });
        };
        const onEnter = () => {
          if (hasGlobalHover) setPlayState("running");
        };
        const onLeave = () => {
          if (hasGlobalHover) setPlayState("paused");
        };
        const onClick = () => {
          if (!hasGlobalClick) return;
          const firstTarget = getTargets()[0];
          setPlayState(firstTarget?.style.animationPlayState === "running" ? "paused" : "running");
        };

        setPlayState("paused");
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
      }, [
        isDrawAnim,
        motionEnabled,
        state.motion?.isPaused,
        state.motion?.replayNonce,
        state.motion?.trigger,
      ]);
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
        if (effectiveIconType === "pixelated" || effectiveIconType === "glass") return "";
        const interactiveTrigger =
          state.motion?.trigger === "hover" || state.motion?.trigger === "click";
        const pauseState = state.motion?.isPaused || interactiveTrigger ? "paused" : "running";
        if ((animationType === "draw" || animationType === "stroke") && svgPathCount > 0) {
          const vbSize = Number(svgData?.viewBox?.split(/\s+/)?.[2]) || 24;
          return buildPerPathAnimationCss(svgPathCount, state, {
            selectorPrefix: ".canvas-icon-container",
            unitScale: vbSize / 24,
          });
        }
        if (animationType === "draw" || animationType === "stroke") {
          return `
            .canvas-icon-container [data-path-idx] {
              stroke-dasharray: 1200;
              stroke-dashoffset: 1200;
              animation: canvas-svg-draw ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both;
              animation-play-state: ${pauseState};
            }
            @keyframes canvas-svg-draw {
              0% { stroke-dashoffset: 1200; fill-opacity: 0; }
              70% { stroke-dashoffset: 0; fill-opacity: 0; }
              100% { stroke-dashoffset: 0; fill-opacity: 1; }
            }
            @media (prefers-reduced-motion: reduce) {
              .canvas-icon-container [data-path-idx] { animation: none !important; stroke-dashoffset: 0 !important; fill-opacity: 1 !important; }
            }
          `;
        }
        return `
          .canvas-icon-anim-bounce { animation: canvas-svg-bounce ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both; animation-play-state: ${pauseState}; }
          .canvas-icon-anim-shake  { animation: canvas-svg-shake  ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both; animation-play-state: ${pauseState}; }
          .canvas-icon-anim-jump   { animation: canvas-svg-jump   ${motionDuration}s ${easingValue} ${motionDelay}s ${iterationCount} both; animation-play-state: ${pauseState}; }
          @keyframes canvas-svg-bounce {
            0%   { transform: translateY(0) scale(1,1); }
            30%  { transform: translateY(-17.2%) scale(0.92,1.08); }
            50%  { transform: translateY(0) scale(1.05,0.95); }
            70%  { transform: translateY(-6.25%) scale(0.98,1.02); }
            100% { transform: translateY(0) scale(1,1); }
          }
          @keyframes canvas-svg-shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            15% { transform: translateX(-6.25%) rotate(-3deg); }
            30% { transform: translateX(5.5%) rotate(2deg); }
            45% { transform: translateX(-3.9%) rotate(-1.5deg); }
            60% { transform: translateX(3.1%) rotate(1deg); }
            75% { transform: translateX(-1.6%) rotate(-0.5deg); }
            90% { transform: translateX(0.8%) rotate(0deg); }
          }
          @keyframes canvas-svg-jump {
            0%, 100% { transform: translateY(0) scale(1,1); }
            15% { transform: translateY(-23.4%) scale(0.88,1.12); }
            30% { transform: translateY(-37.5%) scale(1.06,0.94); }
            45% { transform: translateY(-18.75%) scale(0.94,1.06); }
            60% { transform: translateY(-4.7%) scale(1.03,0.97); }
            75% { transform: translateY(0) scale(0.98,1.02); }
            90% { transform: translateY(-2.3%) scale(1.01,0.99); }
          }
          @media (prefers-reduced-motion: reduce) {
            .canvas-icon-anim-bounce, .canvas-icon-anim-shake, .canvas-icon-anim-jump { animation: none !important; transform: none !important; }
          }
        `;
      }, [
        animationType,
        easingValue,
        iterationCount,
        motionDelay,
        motionDuration,
        state,
        svgPathCount,
      ]);
      const strokeAttrs =
        STROKE_STYLE_MAP[isStyleSuppressed ? "round" : (state.strokeStyle ?? "round")];
      const iconSvgFilter =
        (shadowInnerOn ? "url(#inner-shadow)" : null) ??
        (shadowOuterOn ? "url(#drop-shadow)" : null) ??
        undefined;
      const iconWrapperFilter =
        (effectiveIconType === "pixelated" ? "url(#pixelate)" : null) || undefined;
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
              boxShadow: "none",
              filter: [blurFilter].filter(Boolean).join(" "),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              background: isPixelatedStyle ? "transparent" : state.backgroundColor || "transparent",
              overflow:
                animationType === "bounce" ||
                animationType === "shake" ||
                animationType === "jump" ||
                shadowOuterOn
                  ? "visible"
                  : "hidden",
              borderRadius: isPixelatedStyle ? 0 : state.cornerRadius,
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
            {animationCss ? (
              <>
                <style>{animationCss}</style>
                <style>{`.canvas-icon-container [data-path-idx],.canvas-icon-anim-bounce,.canvas-icon-anim-shake,.canvas-icon-anim-jump{animation-play-state:${state.motion?.isPaused ? "paused" : "running"};}`}</style>
              </>
            ) : null}
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
                    effectiveIconType === "pixelated" && "[image-rendering:pixelated]",
                  )}
                  style={{ filter: iconWrapperFilter }}
                >
                  <div
                    ref={lucideWrapRef}
                    className={cn(
                      "canvas-icon-container h-full w-full",
                      animationType === "bounce" && "canvas-icon-anim-bounce",
                      animationType === "shake" && "canvas-icon-anim-shake",
                      animationType === "jump" && "canvas-icon-anim-jump",
                    )}
                  >
                    {colorizedSvgContent ? (
                      <svg
                        viewBox={svgData?.viewBox || "0 0 24 24"}
                        strokeWidth={strokeAttrs.strokeWidth}
                        strokeLinecap={strokeAttrs.strokeLinecap}
                        strokeLinejoin={strokeAttrs.strokeLinejoin}
                        stroke={
                          renderAsDesigned
                            ? undefined
                            : applyGradToStroke
                              ? "url(#icon-gradient)"
                              : paintColors[0] || "currentColor"
                        }
                        fill="none"
                        className={cn(
                          "h-full w-full",
                          renderAsDesigned && !renderRawFromPublic && "dark:invert",
                        )}
                        style={{ filter: iconSvgFilter }}
                        dangerouslySetInnerHTML={{ __html: colorizedSvgContent }}
                        aria-hidden="true"
                      />
                    ) : SelectedIconComponent && lucideInnerContent ? (
                      <svg
                        viewBox="0 0 24 24"
                        strokeWidth={strokeAttrs.strokeWidth}
                        strokeLinecap={strokeAttrs.strokeLinecap}
                        strokeLinejoin={strokeAttrs.strokeLinejoin}
                        stroke={lucideStrokeValue}
                        fill={lucideFillValue}
                        className={cn(
                          "h-full w-full",
                          renderAsDesigned && !renderRawFromPublic && "dark:invert",
                        )}
                        style={{ filter: iconSvgFilter }}
                        dangerouslySetInnerHTML={{ __html: lucideInnerContent }}
                        aria-hidden="true"
                      />
                    ) : SelectedIconComponent ? (
                      (() => {
                        const LucideIcon = SelectedIconComponent as any;
                        return (
                          <LucideIcon
                            className={cn(
                              renderAsDesigned && !renderRawFromPublic && "dark:invert",
                            )}
                            size="100%"
                            strokeWidth={strokeAttrs.strokeWidth}
                            strokeLinecap={strokeAttrs.strokeLinecap}
                            strokeLinejoin={strokeAttrs.strokeLinejoin}
                            stroke={
                              isTextureActive
                                ? "url(#texture-pattern)"
                                : applyGradToStroke
                                  ? "url(#icon-gradient)"
                                  : paintColors[0] || "currentColor"
                            }
                            fill={
                              isTextureActive
                                ? effectiveIconType === "normal"
                                  ? "none"
                                  : "url(#texture-pattern)"
                                : effectiveIconType === "fill"
                                  ? applyGradToFill
                                    ? "url(#icon-gradient)"
                                    : paintColors[0] || "currentColor"
                                  : effectiveIconType === "duotone"
                                    ? applyGradToFill
                                      ? "url(#icon-gradient)"
                                      : duotoneWash
                                    : "none"
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              filter: iconSvgFilter,
                            }}
                            aria-hidden="true"
                          />
                        );
                      })()
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{ filter: noiseOn ? "url(#noise-filter)" : undefined }}
                      >
                        <div
                          className={cn(
                            "flex h-full w-full items-center justify-center",
                            renderAsDesigned && !renderRawFromPublic && "dark:invert",
                          )}
                          style={{
                            WebkitMaskImage: selectedIcon?.url
                              ? `url(${selectedIcon.url})`
                              : "none",
                            maskImage: selectedIcon?.url ? `url(${selectedIcon.url})` : "none",
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                            background: isTextureActive
                              ? `url(/textures/${state.texture.selected}.png) center / cover`
                              : useGradient
                                ? gradientCss
                                : paintColors[0] || "currentColor",
                            opacity: isTextureActive ? state.texture.opacity / 100 : 1,
                            filter: iconSvgFilter,
                          }}
                          aria-hidden="true"
                        />
                      </div>
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
