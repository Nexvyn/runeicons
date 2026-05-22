"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { SvgDefinitions } from "@/components/icon-page/panels/workspace/components/SvgDefinitions";
import { WorkspaceGround } from "@/components/icon-page/panels/workspace/components/WorkspaceGround";
import { WorkspaceActionBar } from "@/components/icon-page/panels/workspace/components/WorkspaceActionBar";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { CustomizationState, IconData } from "@/lib/types";
import type {
  EditorAssetSummary,
  EditorDocument,
} from "@/lib/editor/types";
import { createEditorSvgMarkup, cloneDocument } from "@/lib/editor/svg";
import { cn } from "@/lib/utils";
import { EditorPathCanvas } from "@/components/editor/canvas/EditorPathCanvas";
import { EditorDrawCanvas } from "@/components/editor/canvas/EditorDrawCanvas";
import { EditorMiniPreview } from "@/components/editor/preview/EditorMiniPreview";
import { EditorModeToggle } from "@/components/editor/controls/EditorModeToggle";
import {
  EditorDrawToolbar,
  type DrawTool,
} from "@/components/editor/controls/EditorDrawToolbar";
import { EditorIconTray } from "@/components/editor/controls/EditorIconTray";
import { EditorSaveDialog } from "@/components/editor/dialogs/EditorSaveDialog";

interface EditorWorkspacePanelProps {
  state: CustomizationState;
  document: EditorDocument | null;
  trayAssets: EditorAssetSummary[];
  selectedAssetId: string | null;
  onSelectAssetById: (assetId: string) => void;
  onRemoveAssetFromTray: (assetId: string) => void;
  selectedPathId: string | null;
  selectedPath: EditorDocument["paths"][number] | null;
  onSelectPath: (pathId: string) => void;
  onCommitPathDraft: (pathId: string, d: string) => void;
  isModified: boolean;
  onResetAsset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveDialogOpen: boolean;
  onSaveDialogOpenChange: (open: boolean) => void;
  onSaveSnapshot: (name: string) => void;
  onAddPath: (d: string, opts?: { fill?: string; stroke?: string }) => void;
  onErasePath?: (pathId: string) => void;
  onSetPathsFill?: (pathIds: string[], fill: string) => void;
  onCreateBlankIcon?: () => string;
  onGlobalStateChange: (updates: Partial<CustomizationState>) => void;
}

type EditorMode = "edit" | "draw";

export function EditorWorkspacePanel({
  state,
  document: editorDocument,
  trayAssets,
  selectedAssetId,
  onSelectAssetById,
  onRemoveAssetFromTray,
  selectedPathId,
  selectedPath,
  onSelectPath,
  onCommitPathDraft,
  onResetAsset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  saveDialogOpen,
  onSaveDialogOpenChange,
  onSaveSnapshot,
  onAddPath,
  onErasePath,
  onSetPathsFill,
  onCreateBlankIcon,
  onGlobalStateChange,
}: EditorWorkspacePanelProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [activeTool, setActiveTool] = useState<DrawTool>("pen");
  const [closePath, setClosePath] = useState(false);
  const [fillMode, setFillMode] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const [referencePathIds, setReferencePathIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [prevMode, setPrevMode] = useState<EditorMode>(editorMode);
  const [prevAssetId, setPrevAssetId] = useState<string | null>(
    editorDocument?.assetId ?? null,
  );
  const currentAssetId = editorDocument?.assetId ?? null;
  const modeChanged = prevMode !== editorMode;
  const assetChanged = prevAssetId !== currentAssetId;
  if (modeChanged || assetChanged) {
    if (modeChanged) setPrevMode(editorMode);
    if (assetChanged) setPrevAssetId(currentAssetId);
    if (editorMode === "draw") {
      setReferencePathIds(
        new Set((editorDocument?.paths ?? []).map((p) => p.id)),
      );
    }
  }

  const handleCreateBlank = onCreateBlankIcon
    ? () => {
        onCreateBlankIcon();
        setEditorMode("draw");
      }
    : undefined;

  const handleFillModeToggle = () => {
    const next = !fillMode;
    setFillMode(next);
    if (!onSetPathsFill || !editorDocument) return;
    const userPathIds = editorDocument.paths
      .filter((p) => !referencePathIds.has(p.id))
      .map((p) => p.id);
    if (userPathIds.length === 0) return;
    onSetPathsFill(userPathIds, next ? "currentColor" : "none");
  };
  const [showGrid, setShowGrid] = useState(true);
  const [previewPathDraft, setPreviewPathDraft] = useState<{
    assetId: string;
    pathId: string;
    d: string;
  } | null>(null);

  const activePreviewPathDraft = useMemo(() => {
    if (
      !previewPathDraft ||
      !editorDocument ||
      !selectedPathId ||
      previewPathDraft.assetId !== editorDocument.assetId ||
      previewPathDraft.pathId !== selectedPathId
    ) {
      return null;
    }

    return editorDocument.paths.some((path) => path.id === previewPathDraft.pathId)
      ? previewPathDraft
      : null;
  }, [editorDocument, previewPathDraft, selectedPathId]);

  const previewDocument = useMemo(() => {
    if (!editorDocument || !activePreviewPathDraft) {
      return editorDocument;
    }

    const nextDocument = cloneDocument(editorDocument);
    nextDocument.paths = nextDocument.paths.map((path) =>
      path.id === activePreviewPathDraft.pathId
        ? { ...path, d: activePreviewPathDraft.d }
        : path,
    );
    return nextDocument;
  }, [activePreviewPathDraft, editorDocument]);

  const miniPreviewDocument = useMemo(() => {
    if (editorMode !== "draw" || !previewDocument) return previewDocument;
    const next = cloneDocument(previewDocument);
    next.paths = next.paths
      .filter((p) => {
        const isReference = referencePathIds.has(p.id);
        return !isReference || showReference;
      })
      .map((p) =>
        referencePathIds.has(p.id)
          ? { ...p, opacity: (p.opacity ?? 1) * 0.15 }
          : p,
      );
    return next;
  }, [previewDocument, editorMode, showReference, referencePathIds]);

  const defaultSnapshotName = editorDocument
    ? `${editorDocument.name} Snapshot`
    : "Runeicons Snapshot";

  const exportDocument = previewDocument ?? editorDocument;

  const iconShim = useMemo<IconData | null>(() => {
    if (!exportDocument) return null;
    return {
      id: exportDocument.assetId,
      name: exportDocument.name ?? "runeicons-editor",
      category: "all",
      tags: [],
    };
  }, [exportDocument]);

  const getEditorSvgContent = async (): Promise<string> => {
    if (!exportDocument) return "";
    return createEditorSvgMarkup(exportDocument, state);
  };

  const editorCanvas =
    editorMode === "draw" ? (
      <EditorDrawCanvas
        document={editorDocument}
        state={state}
        viewBox={editorDocument?.viewBox ?? "0 0 24 24"}
        onAddPath={onAddPath}
        onErasePath={onErasePath}
        activeTool={activeTool}
        closePath={closePath}
        fillMode={fillMode}
        showReference={showReference}
        referencePathIds={referencePathIds}
      />
    ) : (
      <EditorPathCanvas
        state={state}
        path={selectedPath}
        allPaths={editorDocument?.paths}
        viewBox={editorDocument?.viewBox ?? "0 0 24 24"}
        onSelectPath={onSelectPath}
        onPreviewChange={(nextPath) => {
          if (selectedPathId && editorDocument) {
            setPreviewPathDraft({
              assetId: editorDocument.assetId,
              pathId: selectedPathId,
              d: nextPath,
            });
          }
        }}
        onCommitChange={(nextPath) => {
          if (selectedPathId) {
            setPreviewPathDraft(null);
            onCommitPathDraft(selectedPathId, nextPath);
          }
        }}
      />
    );

  return (
    <>
      <SvgDefinitions state={state} />
      <main className="flex-1 flex flex-col relative overflow-hidden" aria-label="Editor workspace">
        {showGrid ? (
          <div className="absolute inset-0 z-0">
            <WorkspaceGround />
          </div>
        ) : null}

        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center -translate-y-10">
            <svg
              width="1100"
              height="800"
              viewBox="0 0 1100 800"
              preserveAspectRatio="xMidYMid meet"
              className="max-w-full max-h-full w-auto h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <foreignObject x={50} y={50} width={100} height={100}>
                <div className="w-full h-full pointer-events-auto">
                  <EditorMiniPreview
                    document={miniPreviewDocument}
                    state={state}
                    onPathClick={onSelectPath}
                  />
                </div>
              </foreignObject>

              <foreignObject x={250} y={150} width={600} height={500}>
                <div className="w-full h-full pointer-events-auto relative">
                  <div className="pointer-events-none absolute inset-0 border border-white/15 bg-white/2.5" />

                  <div
                    className={cn(
                      "absolute inset-0",
                      editorMode === "edit" && "overflow-hidden",
                    )}
                    style={
                      editorMode === "edit"
                        ? {
                            maskImage:
                              "radial-gradient(circle at center, black 70%, transparent 100%)",
                            WebkitMaskImage:
                              "radial-gradient(circle at center, black 70%, transparent 100%)",
                          }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 z-10">
                      {editorCanvas}
                    </div>
                  </div>
                </div>
              </foreignObject>

              {editorMode === "edit" ? (
                <foreignObject x={250} y={650} width={600} height={100}>
                  <div className="w-full h-full pointer-events-auto">
                    <EditorIconTray
                      assets={trayAssets}
                      selectedAssetId={selectedAssetId}
                      onAssetSelect={(asset) => onSelectAssetById(asset.id)}
                      onRemoveAsset={onRemoveAssetFromTray}
                      onCreateBlank={handleCreateBlank}
                    />
                  </div>
                </foreignObject>
              ) : null}
            </svg>
          </div>
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
          <EditorModeToggle
            mode={editorMode}
            onModeChange={setEditorMode}
          />
        </div>

        {editorMode === "draw" ? (
          <div className="absolute top-1/2 left-3 -translate-y-1/2 z-30">
            <EditorDrawToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              closePath={closePath}
              onClosePathToggle={() => setClosePath((v) => !v)}
              fillMode={fillMode}
              onFillModeToggle={handleFillModeToggle}
              showReference={showReference}
              onToggleReference={() => setShowReference((v) => !v)}
            />
          </div>
        ) : null}

        <div className="absolute bottom-9.5 left-1/2 -translate-x-1/2 z-10">
          <WorkspaceActionBar
            state={state}
            onChange={onGlobalStateChange}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onReset={onResetAsset}
            showGrid={showGrid}
            onGridToggle={() => setShowGrid((prev) => !prev)}
            selectedIcon={iconShim}
            onGetSvgContent={getEditorSvgContent}
            hideAdvancedExports
            additionalDropdownItems={
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                onClick={() => onSaveDialogOpenChange(true)}
              >
                <Save className="h-4 w-4 text-white/40" />
                <span>Save as Snapshot</span>
              </DropdownMenuItem>
            }
          />
        </div>
      </main>

      <EditorSaveDialog
        open={saveDialogOpen}
        onOpenChange={onSaveDialogOpenChange}
        defaultName={defaultSnapshotName}
        onSave={onSaveSnapshot}
      />
    </>
  );
}
