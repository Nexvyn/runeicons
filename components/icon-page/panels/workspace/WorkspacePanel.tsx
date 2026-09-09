"use client";
import * as m from "motion/react-m";
import { CustomizationState, IconData } from "@/lib/types";
import { PreviewArea } from "./components/PreviewArea";
import { SvgDefinitions } from "./components/SvgDefinitions";
import { WorkspaceActionBar } from "./components/WorkspaceActionBar";
export interface WorkspacePanelProps {
  state: CustomizationState;
  trayIcons: IconData[];
  selectedIcon: IconData | null;
  onSelectIcon: (icon: IconData) => void;
  onRemoveFromTray: (iconId: string) => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onChange: (updates: Partial<CustomizationState>) => void;
  showGrid: boolean;
  onGridToggle: () => void;
}
export function WorkspacePanel({
  state,
  trayIcons,
  selectedIcon,
  onSelectIcon,
  onRemoveFromTray,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onChange,
  showGrid,
  onGridToggle,
}: WorkspacePanelProps) {
  return (
    <>
      <SvgDefinitions state={state} />
      <main
        className="flex-1 flex flex-col relative min-h-0 min-w-[360px]"
        aria-label="Preview area"
      >
        <PreviewArea
          state={state}
          trayIcons={trayIcons}
          selectedIcon={selectedIcon}
          onSelectIcon={onSelectIcon}
          onRemoveFromTray={onRemoveFromTray}
          showGrid={showGrid}
        />
        <m.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="absolute bottom-9.5 left-1/2 -translate-x-1/2 z-40 will-change-transform"
        >
          <WorkspaceActionBar
            onReset={onReset}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            selectedIcon={selectedIcon}
            state={state}
            onChange={onChange}
            showGrid={showGrid}
            onGridToggle={onGridToggle}
          />
        </m.div>
      </main>
    </>
  );
}
