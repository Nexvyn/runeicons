"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeaderPanel } from "@/components/icon-page/panels/header";
import { ToolRail } from "@/components/icon-page/panels/outline";
import { KeyboardShortcutsModal } from "@/components/icon-page/panels/outline/components/keyboard-shortcuts-modal";
import { PropertiesPanel } from "@/components/icon-page/panels/properties";
import { IconLibraryPanel } from "@/components/icon-page/panels/icon-library";
import type { EditorAssetSummary } from "@/lib/editor/types";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { useLocalStorageSyncEffect } from "@/hooks/use-localstorage-sync";
import {
  useEditorSelectionStore,
  selectAssetInStore,
} from "@/stores/editor-selection";
import {
  EDITOR_SUPPORTED_TYPES,
  editorAssetIdToManifest,
  getIconDataById,
  manifestIdToEditorAssetId,
  resolveEditorIconType,
} from "@/lib/icons";
import type { IconCategory, IconData } from "@/lib/types";
import { EditorWorkspaceSection } from "@/components/editor/EditorWorkspaceSection";

const MAX_TRAY_ITEMS = 6;

interface EditorShellProps {
  assets: EditorAssetSummary[];
}

export function EditorShell({ assets }: EditorShellProps) {
  useLocalStorageSyncEffect();
  const { state, handleChange, handleReset } = useWorkspaceState({
    enableKeyboardShortcuts: false,
  });
  const resetDocumentRef = useRef<() => void>(() => {});
  const [selectedPathCount, setSelectedPathCount] = useState(0);

  const editorIconType = resolveEditorIconType(state.iconType);

  const hasInitRef = useRef(false);
  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;
    const initialAssets = assets.filter(
      (asset) => asset.variant === editorIconType,
    );
    const seedAssets = initialAssets.length > 0 ? initialAssets : assets;
    useEditorSelectionStore.setState({
      selectedAssetId: seedAssets[0]?.id ?? null,
      trayAssetIds: seedAssets.slice(0, MAX_TRAY_ITEMS).map((a) => a.id),
    });
  }, [assets, editorIconType]);

  const selectedAssetId = useEditorSelectionStore((s) => s.selectedAssetId);

  const [activeCategory, setActiveCategory] = useState<IconCategory>("all");
  const [showHelp, setShowHelp] = useState(false);

  const handleFullReset = useCallback(() => {
    handleReset();
    resetDocumentRef.current();
  }, [handleReset]);

  const handleLibrarySelect = useCallback(
    (icon: IconData) => {
      const targetType = icon.iconType
        ? resolveEditorIconType(icon.iconType)
        : editorIconType;
      const editorId = manifestIdToEditorAssetId(icon.id, targetType);
      if (!editorId) return;
      if (targetType !== state.iconType) {
        handleChange({ iconType: targetType });
      }
      selectAssetInStore(editorId);
    },
    [editorIconType, handleChange, state.iconType],
  );

  const handleTypeChange = useCallback(
    (nextType: typeof state.iconType) => {
      handleChange({ iconType: nextType });
      const clamped = resolveEditorIconType(nextType);
      const mapped = selectedAssetId
        ? editorAssetIdToManifest(selectedAssetId)
        : null;
      if (mapped) {
        const nextEditorId = manifestIdToEditorAssetId(mapped.id, clamped);
        if (nextEditorId && nextEditorId !== selectedAssetId) {
          selectAssetInStore(nextEditorId);
        }
      }
    },
    [handleChange, selectedAssetId],
  );

  const librarySelectedId = useMemo(() => {
    if (!selectedAssetId) return null;
    const mapped = editorAssetIdToManifest(selectedAssetId);
    return mapped?.id ?? null;
  }, [selectedAssetId]);

  const selectedIconForPanel = useMemo(() => {
    if (!selectedAssetId) return null;
    const mapped = editorAssetIdToManifest(selectedAssetId);
    if (!mapped) return null;
    const iconData = getIconDataById(mapped.id, mapped.iconType);
    if (!iconData) return null;
    return {
      ...iconData,
      iconType: mapped.iconType,
      pathCount: selectedPathCount,
    };
  }, [selectedAssetId, selectedPathCount]);

  const handleDeleteCustomIcon = useCallback((_id: string) => {
  }, []);

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background px-8 text-center lg:hidden">
        <p className="text-lg font-medium text-foreground">Please switch to a laptop</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          This needs a bigger screen to work properly.
        </p>
      </div>
      <div className="hidden h-screen flex-col bg-background lg:flex">
      <HeaderPanel />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-12 shrink-0" aria-label="Tool rail">
          <ToolRail
            activeType={state.iconType}
            onTypeChange={handleTypeChange}
            onHelpClick={() => setShowHelp(true)}
            supportedTypes={EDITOR_SUPPORTED_TYPES}
          />
        </aside>

        <aside className="w-[320px] shrink-0" aria-label="Icon library">
          <IconLibraryPanel
            onIconSelect={handleLibrarySelect}
            selectedIconId={librarySelectedId}
            selectedCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            customIcons={state.customIcons}
            iconType={editorIconType}
          />
        </aside>

        <EditorWorkspaceSection
          assets={assets}
          state={state}
          onGlobalStateChange={handleChange}
          resetDocumentRef={resetDocumentRef}
          onFullReset={handleFullReset}
          onPathCountChange={setSelectedPathCount}
        />

        <aside
          className="w-[341px] shrink-0 border-l border-border bg-workspace-pattern overflow-y-auto relative"
          aria-label="Customization controls"
        >
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
          <div className="relative z-10">
            <PropertiesPanel
              state={state}
              selectedIcon={selectedIconForPanel}
              onIconSelect={handleLibrarySelect}
              onDeleteIcon={handleDeleteCustomIcon}
              onChange={handleChange}
              onReset={handleFullReset}
            />
          </div>
        </aside>

        <KeyboardShortcutsModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </div>
    </div>
    </>
  );
}
