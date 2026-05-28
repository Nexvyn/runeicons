"use client";

import { memo, type ReactNode } from "react";
import type { CustomizationState } from "@/lib/types";
import { useCanvasStyles } from "@/hooks/use-canvas-styles";
import { cn } from "@/lib/utils";

interface EditorCanvasStageProps {
  state: CustomizationState;
  children: ReactNode;
  className?: string;
  applyContainerBox?: boolean;
}

export const EditorCanvasStage = memo(function EditorCanvasStage({
  state,
  children,
  className,
  applyContainerBox = true,
}: EditorCanvasStageProps) {
  const { transform, boxShadow, blurFilter, noiseFilter } =
    useCanvasStyles(state);

  const innerFilter =
    [
      state.shadow.inner ? "url(#inner-shadow)" : null,
      blurFilter || null,
      noiseFilter || null,
      state.texture.enabled && state.texture.selected !== "none"
        ? "url(#texture-filter)"
        : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const containerStyle: React.CSSProperties = {
    overflow: "hidden",
    borderRadius: state.cornerRadius,
    ...(applyContainerBox
      ? {
          padding: state.padding,
          background: state.backgroundColor || "transparent",
          boxShadow:
            state.shadow.enabled && state.shadow.inner ? "none" : boxShadow,
        }
      : null),
  };

  return (
    <div
      className={cn("flex h-full w-full items-center justify-center", className)}
      style={containerStyle}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          transform,
          transformOrigin: "center center",
          filter: innerFilter,
        }}
      >
        {children}
      </div>
    </div>
  );
});
