import { useMemo } from "react";
import { CustomizationState } from "@/lib/types";

export function useCanvasStyles(state: CustomizationState) {
  const transform = useMemo(
    () =>
      `scale(${state.scale}) translateX(${state.translateX}px) translateY(${state.translateY}px) rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
    [
      state.scale,
      state.translateX,
      state.translateY,
      state.rotation,
      state.flipH,
      state.flipV,
    ],
  );

  const background = useMemo(() => {
    return state.colors[0] || "#ffffff";
  }, [state.colors]);

  const boxShadow = useMemo(
    () =>
      state.shadow.enabled && !state.shadow.inner && state.shadow.opacity > 0
        ? `${state.shadow.offsetX}px ${state.shadow.offsetY}px ${state.shadow.blur}px rgba(0, 0, 0, ${state.shadow.opacity / 100})`
        : "none",
    [
      state.shadow.enabled,
      state.shadow.inner,
      state.shadow.opacity,
      state.shadow.offsetX,
      state.shadow.offsetY,
      state.shadow.blur,
    ],
  );

  const supportsFilter = useMemo(
    () =>
      typeof CSS !== "undefined" &&
      CSS.supports &&
      CSS.supports("filter", "blur(1px)"),
    [],
  );

  const blurFilter = useMemo(
    () => (state.blur > 0 ? `url(#inner-blur)` : ""),
    [state.blur],
  );

  const noiseFilter = useMemo(
    () => (state.noise.enabled && state.noise.intensity > 0 ? "url(#noise-filter)" : ""),
    [state.noise.enabled, state.noise.intensity],
  );

  return {
    transform,
    background,
    boxShadow,
    supportsFilter,
    noiseFilter,
    blurFilter,
  };
}
