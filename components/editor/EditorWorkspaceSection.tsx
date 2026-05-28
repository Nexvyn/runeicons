"use client";

import { useCallback, useEffect, type MutableRefObject } from "react";
import type { EditorAssetSummary } from "@/lib/editor/types";
import type { CustomizationState } from "@/lib/types";
import { useEditorDocument } from "@/components/editor/hooks/useEditorDocument";
import { EditorWorkspacePanel } from "@/components/editor/panel/EditorWorkspacePanel";
import { selectAssetInStore } from "@/stores/editor-selection";

interface EditorWorkspaceSectionProps {
  assets: EditorAssetSummary[];
  state: CustomizationState;
  onGlobalStateChange: (updates: Partial<CustomizationState>) => void;
  resetDocumentRef: MutableRefObject<() => void>;
  onPathCountChange?: (count: number) => void;
}

export function EditorWorkspaceSection({
  assets,
  state,
  onGlobalStateChange,
  resetDocumentRef,
  onPathCountChange,
}: EditorWorkspaceSectionProps) {
  const doc = useEditorDocument(assets);

  useEffect(() => {
    resetDocumentRef.current = doc.resetCurrentAsset;
  });

  const pathCount = doc.document?.paths.length ?? 0;
  useEffect(() => {
    onPathCountChange?.(pathCount);
  }, [pathCount, onPathCountChange]);

  const handleSelectAssetById = useCallback(
    (assetId: string) => {
      const asset = assets.find((c) => c.id === assetId);
      if (asset) selectAssetInStore(asset.id);
    },
    [assets],
  );

  return (
    <EditorWorkspacePanel
      state={state}
      document={doc.document}
      trayAssets={doc.trayAssets}
      selectedAssetId={doc.selectedAssetId}
      onSelectAssetById={handleSelectAssetById}
      onRemoveAssetFromTray={doc.removeAssetFromTray}
      selectedPathId={doc.selectedPathId}
      selectedPath={doc.selectedPath}
      onSelectPath={doc.setSelectedPathId}
      onCommitPathDraft={doc.commitPathDraft}
      isModified={doc.isModified}
      onResetAsset={doc.resetCurrentAsset}
      onUndo={doc.handleUndo}
      onRedo={doc.handleRedo}
      canUndo={doc.canUndo}
      canRedo={doc.canRedo}
      saveDialogOpen={doc.saveDialogOpen}
      onSaveDialogOpenChange={doc.setSaveDialogOpen}
      onSaveSnapshot={doc.saveCurrentAsset}
      onAddPath={doc.addPath}
      onErasePath={doc.removePath}
      onCreateBlankIcon={doc.createBlankIcon}
      onGlobalStateChange={onGlobalStateChange}
    />
  );
}
