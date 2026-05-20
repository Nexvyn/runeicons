"use client";

import { memo } from "react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import { Plus, X } from "lucide-react";
import type { EditorAssetSummary } from "@/lib/editor/types";
import { cn } from "@/lib/utils";
import { EditorSvgPreview } from "@/components/editor/preview/EditorSvgPreview";

const TRAY_ITEM = {
  initialScale: 0.9,
  initialY:     8,
  exitY:       -8,
  spring: { type: "spring" as const, stiffness: 400, damping: 28 },
};

interface EditorIconTrayProps {
  assets: EditorAssetSummary[];
  selectedAssetId: string | null;
  onAssetSelect: (asset: EditorAssetSummary) => void;
  onRemoveAsset: (assetId: string) => void;
}

export const EditorIconTray = memo(function EditorIconTray({
  assets,
  selectedAssetId,
  onAssetSelect,
  onRemoveAsset,
}: EditorIconTrayProps) {
  const emptySlots = Math.max(0, 6 - assets.length - 1);

  return (
    <div className="relative z-10 grid grid-cols-6 w-full h-full">
      <AnimatePresence mode="popLayout" initial={false}>
        {assets.map((asset) => {
          const isSelected = asset.id === selectedAssetId;
          return (
            <m.div
              key={asset.id}
              layout
              initial={{
                opacity: 0,
                scale: TRAY_ITEM.initialScale,
                y: TRAY_ITEM.initialY,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: TRAY_ITEM.initialScale,
                y: TRAY_ITEM.exitY,
              }}
              transition={TRAY_ITEM.spring}
              className="group flex items-center justify-center will-change-transform"
            >
              <div className="relative">
                <button
                  type="button"
                  className={cn(
                    "w-11 h-11 rounded-lg border flex items-center justify-center p-2",
                    "transition-[colors,transform,box-shadow] duration-150 ease-out hover:scale-105 active:scale-[0.97]",
                    "bg-card shadow-sm cursor-pointer",
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-border",
                  )}
                  onClick={() => onAssetSelect(asset)}
                  aria-label={`Select ${asset.name}`}
                >
                  <EditorSvgPreview document={asset} className="h-full w-full" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAsset(asset.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-150 ease-out flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 z-10"
                  aria-label={`Remove ${asset.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </m.div>
          );
        })}
      </AnimatePresence>

      {assets.length < 6 ? (
        <div className="flex items-center justify-center">
          <div className="w-11 h-11 rounded-lg border border-dashed border-border/30 flex items-center justify-center text-muted-foreground/20">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      ) : null}

      {Array.from({ length: emptySlots }).map((_, idx) => (
        <div key={`pad-${idx}`} />
      ))}
    </div>
  );
});
