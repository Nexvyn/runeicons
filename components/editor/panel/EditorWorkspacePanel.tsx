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
import { EditorPathCanvas } from "@/components/editor/canvas/EditorPathCanvas";
import { EditorDrawCanvas } from "@/components/editor/canvas/EditorDrawCanvas";
import { EditorMiniPreview } from "@/components/editor/preview/EditorMiniPreview";
import { EditorModeToggle } from "@/components/editor/controls/EditorModeToggle";
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
  onAddPath: (d: string) => void;
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
  onGlobalStateChange,
}: EditorWorkspacePanelProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
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

  const defaultSnapshotName = editorDocument
    ? `${editorDocument.name} Snapshot`
    : "Runeicons Snapshot";

  const exportDocument = previewDocument ?? editorDocument;

  // Minimal IconData shim so we can plug WorkspaceActionBar (from /icons) directly
  // into the editor. The bar only needs `name` (for download filename) and `id`;
  // SVG generation is overridden via `onGetSvgContent` below.
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
        {/* Geometric grid background — fills the full main, blends behind everything.
            Toggled by the Grid button in the toolbar. */}
        {showGrid ? (
          <div className="absolute inset-0 z-0">
            <WorkspaceGround />
          </div>
        ) : null}

        {/* Overlay SVG with the SAME viewBox/aspect/transform as WorkspaceGround,
            so foreignObject cells align pixel-perfect with the geometric grid cells. */}
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
              {/* Mini-preview — exactly the top-left cell (x=50..150, y=50..150) */}
              <foreignObject x={50} y={50} width={100} height={100}>
                <div className="w-full h-full pointer-events-auto">
                  <EditorMiniPreview
                    document={previewDocument}
                    state={state}
                    onPathClick={onSelectPath}
                  />
                </div>
              </foreignObject>

              {/* Editor canvas — spans cells (cols 2..7, rows 1..5) of the geometric grid:
                  x=250..850, y=150..650. Slotted between mini-preview row (ends y=150) and
                  tray row (starts y=650), horizontally aligned with the tray. Living inside
                  the same overlay SVG guarantees pixel-perfect alignment with the grid
                  cells regardless of how the workspace resizes. */}
              <foreignObject x={250} y={150} width={600} height={500}>
                <div className="w-full h-full pointer-events-auto relative">
                  {/* Sharp boundary indicator — separate layer so it does not get
                      softened by the canvas mask below. Square corners blend
                      cleanly with the geometric grid cells. */}
                  <div className="pointer-events-none absolute inset-0 border border-white/15 bg-white/2.5" />

                  {/* Editor canvas — soft-fades at the corners via radial mask so
                      paths that escape the boundary do not produce a hard cut. */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      maskImage:
                        "radial-gradient(circle at center, black 70%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(circle at center, black 70%, transparent 100%)",
                    }}
                  >
                    <div className="absolute inset-0 z-10">
                      {editorCanvas}
                    </div>
                  </div>
                </div>
              </foreignObject>

              {/* Icon tray — spans cells 2..7 (x=250..850, y=650..750), 6 cells wide,
                  perfectly centered on grid center (x=550). grid-cols-6 inside → 1 icon = 1 cell. */}
              <foreignObject x={250} y={650} width={600} height={100}>
                <div className="w-full h-full pointer-events-auto">
                  <EditorIconTray
                    assets={trayAssets}
                    selectedAssetId={selectedAssetId}
                    onAssetSelect={(asset) => onSelectAssetById(asset.id)}
                    onRemoveAsset={onRemoveAssetFromTray}
                  />
                </div>
              </foreignObject>
            </svg>
          </div>
        </div>

        {/* Toggle — floats over the grid (transparent surroundings) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
          <EditorModeToggle
            mode={editorMode}
            onModeChange={setEditorMode}
          />
        </div>

        {/* Floating action bar — shared /icons component (WorkspaceActionBar).
            SVG generation routed through `onGetSvgContent` since the editor uses a
            different document shape than IconData. Advanced exports hidden;
            "Save as Snapshot" injected via `additionalDropdownItems`. */}
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
