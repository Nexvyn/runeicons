"use client";

import { memo } from "react";
import type { CustomizationState } from "@/lib/types";
import type { EditorDocument } from "@/lib/editor/types";
import { EditorSvgPreview } from "@/components/editor/preview/EditorSvgPreview";
import { EditorCanvasStage } from "@/components/editor/canvas/EditorCanvasStage";

interface EditorMiniPreviewProps {
  document: EditorDocument | null;
  state: CustomizationState;
  onPathClick?: (pathId: string) => void;
}

export const EditorMiniPreview = memo(function EditorMiniPreview({
  document,
  state,
  onPathClick,
}: EditorMiniPreviewProps) {
  if (!document) return null;

  return (
    <div className="w-full h-full bg-background border border-border shadow-md flex items-center justify-center p-[12%] pointer-events-auto">
      <EditorCanvasStage state={state} applyContainerBox={false} applyZoomPan={false}>
        <EditorSvgPreview
          document={document}
          state={state}
          className="w-full h-full"
          onPathClick={onPathClick}
        />
      </EditorCanvasStage>
    </div>
  );
});
