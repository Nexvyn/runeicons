"use client";

import { memo, useRef, useEffect } from "react";
import type { EditorDocument } from "@/lib/editor/types";
import type { CustomizationState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { resolveEditorPathStyle } from "@/lib/editor/svg";

function stripDefsWrapper(defs?: string) {
  if (!defs) {
    return "";
  }

  return defs
    .replace(/^<defs\b[^>]*>/i, "")
    .replace(/<\/defs>$/i, "")
    .trim();
}

const SvgDefs = memo(function SvgDefs({ markup }: { markup: string }) {
  const ref = useRef<SVGDefsElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = markup;
    }
  }, [markup]);
  return <defs ref={ref} />;
});

interface EditorSvgPreviewProps {
  document: Pick<EditorDocument, "viewBox" | "defs" | "paths">;
  state?: CustomizationState;
  className?: string;
  onPathClick?: (pathId: string) => void;
}

export const EditorSvgPreview = memo(function EditorSvgPreview({
  document,
  state,
  className,
  onPathClick,
}: EditorSvgPreviewProps) {
  const defsMarkup = stripDefsWrapper(document.defs);

  return (
    <svg
      viewBox={document.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      style={{ overflow: "hidden" }}
      aria-hidden="true"
    >
      {defsMarkup ? <SvgDefs markup={defsMarkup} /> : null}
      {document.paths
        .filter((path) => path.visible)
        .map((path) => {
          const style = resolveEditorPathStyle(path, state);
          return (
            <path
              key={path.id}
              d={path.d}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeLinecap={style.strokeLinecap}
              strokeLinejoin={style.strokeLinejoin}
              opacity={path.opacity}
              fillOpacity={path.fillOpacity}
              strokeOpacity={path.strokeOpacity}
              fillRule={path.fillRule}
              clipRule={path.clipRule}
              filter={path.filter}
              clipPath={path.clipPath}
              mask={path.mask}
              style={{
                ...(path.mixBlendMode
                  ? { mixBlendMode: path.mixBlendMode }
                  : undefined),
                ...(onPathClick ? { cursor: "pointer" } : undefined),
              }}
              onClick={
                onPathClick
                  ? (e) => {
                      e.stopPropagation();
                      onPathClick(path.id);
                    }
                  : undefined
              }
            />
          );
        })}
    </svg>
  );
});
