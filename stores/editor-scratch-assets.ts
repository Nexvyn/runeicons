"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EditorAssetSummary } from "@/lib/editor/types";

interface EditorScratchAssetsStore {
  scratchAssets: EditorAssetSummary[];
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  addScratchAsset: (asset: EditorAssetSummary) => void;
  removeScratchAsset: (assetId: string) => void;
  renameScratchAsset: (assetId: string, name: string) => void;
}

export const useEditorScratchAssetsStore = create<EditorScratchAssetsStore>()(
  persist(
    (set) => ({
      scratchAssets: [],
      hasHydrated: false,
      setHasHydrated: (hasHydrated) =>
        set((state) =>
          state.hasHydrated === hasHydrated ? state : { hasHydrated },
        ),
      addScratchAsset: (asset) =>
        set((state) => {
          if (state.scratchAssets.some((existing) => existing.id === asset.id)) {
            return state;
          }
          return { scratchAssets: [...state.scratchAssets, asset] };
        }),
      removeScratchAsset: (assetId) =>
        set((state) => {
          if (!state.scratchAssets.some((existing) => existing.id === assetId)) {
            return state;
          }
          return {
            scratchAssets: state.scratchAssets.filter(
              (existing) => existing.id !== assetId,
            ),
          };
        }),
      renameScratchAsset: (assetId, name) =>
        set((state) => ({
          scratchAssets: state.scratchAssets.map((existing) =>
            existing.id === assetId ? { ...existing, name } : existing,
          ),
        })),
    }),
    {
      name: "runeicons-editor-scratch-assets",
      version: 1,
      partialize: (state) => ({ scratchAssets: state.scratchAssets }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
