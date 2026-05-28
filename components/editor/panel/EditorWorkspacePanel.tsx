"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SvgDefinitions } from "@/components/icon-page/panels/workspace/components/SvgDefinitions";
import { WorkspaceGround } from "@/components/icon-page/panels/workspace/components/WorkspaceGround";
import {
  EditorActionBar,
  EDITOR_TRANSITION,
} from "@/components/editor/controls/EditorActionBar";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { CustomizationState } from "@/lib/types";
import type {
  EditorAssetSummary,
  EditorDocument,
} from "@/lib/editor/types";
import { createEditorSvgMarkup, cloneDocument } from "@/lib/editor/svg";
import { cn } from "@/lib/utils";
import { EditorPathCanvas } from "@/components/editor/canvas/EditorPathCanvas";
import { EditorDrawCanvas } from "@/components/editor/canvas/EditorDrawCanvas";
import { EditorCanvasStage } from "@/components/editor/canvas/EditorCanvasStage";
import { EditorMiniPreview } from "@/components/editor/preview/EditorMiniPreview";
import { EditorModeToggle } from "@/components/editor/controls/EditorModeToggle";
import { type DrawTool } from "@/components/editor/controls/EditorDrawToolbar";
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
  onCreateBlankIcon,
  onGlobalStateChange,
}: EditorWorkspacePanelProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [activeTool, setActiveTool] = useState<DrawTool>("pen");
  const [showReference, setShowReference] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleModeChange = (next: EditorMode) => {
    setEditorMode(next);
  };

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
      }
    : undefined;

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

  const exportDocument = useMemo(() => {
    const base = previewDocument ?? editorDocument;
    if (!base) return null;
    if (editorMode !== "draw" || referencePathIds.size === 0) return base;
    const next = cloneDocument(base);
    next.paths = next.paths.filter((p) => !referencePathIds.has(p.id));
    return next;
  }, [previewDocument, editorDocument, editorMode, referencePathIds]);

  const getEditorSvgContent = async (): Promise<string> => {
    if (!exportDocument) return "";
    return createEditorSvgMarkup(exportDocument, state);
  };

  const isTrayEmpty = trayAssets.length === 0;

  const editorCanvas = isTrayEmpty ? (
    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
      <p className="text-sm text-muted-foreground max-w-xs">
        Add icons from the sidebar to start editing.
      </p>
    </div>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={editorMode}
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0 } }
            : {
                opacity: 0,
                transition: {
                  duration: EDITOR_TRANSITION.canvasFadeExit,
                  ease: EDITOR_TRANSITION.easeOut,
                },
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: EDITOR_TRANSITION.canvasFade,
                ease: EDITOR_TRANSITION.easeOut,
              }
        }
      >
        {editorMode === "draw" ? (
          <EditorDrawCanvas
            document={editorDocument}
            state={state}
            viewBox={editorDocument?.viewBox ?? "0 0 24 24"}
            onAddPath={onAddPath}
            onErasePath={onErasePath}
            activeTool={activeTool}
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
        )}
      </motion.div>
    </AnimatePresence>
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

              <motion.foreignObject
                x={250}
                y={150}
                width={600}
                initial={false}
                animate={{ height: editorMode === "draw" ? 600 : 500 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration:
                          editorMode === "draw"
                            ? EDITOR_TRANSITION.canvas
                            : EDITOR_TRANSITION.canvasExit,
                        ease: EDITOR_TRANSITION.easeInOut,
                      }
                }
              >
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
                    <EditorCanvasStage
                      state={state}
                      className="absolute inset-0 z-10"
                    >
                      {editorCanvas}
                    </EditorCanvasStage>
                  </div>
                </div>
              </motion.foreignObject>

              <AnimatePresence initial={false}>
                {editorMode === "edit" && (
                  <motion.foreignObject
                    key="icon-tray"
                    x={250}
                    y={650}
                    width={600}
                    height={100}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0, transition: { duration: 0 } }
                        : {
                            opacity: 0,
                            transition: {
                              duration: EDITOR_TRANSITION.tray * 0.7,
                              ease: EDITOR_TRANSITION.easeOut,
                            },
                          }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: EDITOR_TRANSITION.tray,
                            ease: EDITOR_TRANSITION.easeOut,
                            delay: EDITOR_TRANSITION.trayDelay,
                          }
                    }
                  >
                    <div className="w-full h-full pointer-events-auto">
                      <EditorIconTray
                        assets={trayAssets}
                        selectedAssetId={selectedAssetId}
                        onAssetSelect={(asset) => onSelectAssetById(asset.id)}
                        onRemoveAsset={onRemoveAssetFromTray}
                        onCreateBlank={handleCreateBlank}
                      />
                    </div>
                  </motion.foreignObject>
                )}
              </AnimatePresence>
            </svg>
          </div>
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
          <EditorModeToggle
            mode={editorMode}
            onModeChange={handleModeChange}
          />
        </div>

        <div className="absolute bottom-9.5 left-1/2 -translate-x-1/2 z-10">
          <EditorActionBar
            state={state}
            onChange={onGlobalStateChange}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onReset={onResetAsset}
            showGrid={showGrid}
            onGridToggle={() => setShowGrid((prev) => !prev)}
            onGetSvgContent={getEditorSvgContent}
            editorMode={editorMode}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            showReference={showReference}
            onToggleReference={() => setShowReference((v) => !v)}
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
