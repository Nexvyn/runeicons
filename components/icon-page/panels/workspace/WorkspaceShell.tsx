"use client";

import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { IconLibraryPanel } from "@/components/icon-page/panels/icon-library";
import { ToolRail } from "@/components/icon-page/panels/outline";
import { PropertiesPanel } from "@/components/icon-page/panels/properties";
import { WorkspacePanel } from "./WorkspacePanel";
import { useWorkspaceSelection } from "./hooks/use-workspace-selection";
import { KeyboardShortcutsModal } from "@/components/icon-page/panels/outline/components/keyboard-shortcuts-modal";
import { generateStandaloneSvg } from "@/lib/svg-export-utils";
import { resolveLibraryIconType } from "@/lib/icons";
import { IconData } from "@/lib/types";
import { toast } from "sonner";
import { useCallback, useState } from "react";

export function WorkspaceShell() {
  const {
    state,
    handleChange,
    handleReset,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  } = useWorkspaceState();

  const {
    activeCategory,
    setActiveCategory,
    selectedIcon,
    trayIcons,
    handleIconSelect,
    handleRemoveFromTray,
    handleRemoveById,
  } = useWorkspaceSelection(state.customIcons, resolveLibraryIconType(state.iconType));

  const handleIconSelectWithTypeSync = useCallback(
    (icon: IconData) => {
      if (icon.iconType && icon.iconType !== state.iconType) {
        handleChange({ iconType: icon.iconType });
      }
      handleIconSelect(icon);
    },
    [handleChange, handleIconSelect, state.iconType],
  );

  const [showGrid, setShowGrid] = useState(true);

  const handleExport = () => {
    const configJSON = JSON.stringify(state, null, 2);
    const blob = new Blob([configJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customization-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Configuration exported");
  };

  const handleCopySvg = async () => {
    if (!selectedIcon) {
      toast.error("Select an icon first");
      return;
    }
    try {
      const svg = await generateStandaloneSvg(selectedIcon, state);
      await navigator.clipboard.writeText(svg);
      toast.success("SVG copied to clipboard");
    } catch {
      toast.error("Failed to copy SVG");
    }
  };



  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onCopySvg: handleCopySvg,
    onExport: handleExport,
    onReset: handleReset,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onToggleGrid: () => setShowGrid((prev) => !prev),
    onNextCategory: () => {
      const categories: any[] = [
        "all", "action", "accessibility", "commerce", "communication",
        "dev", "feedback", "files", "hardware", "layout", "media",
        "metrics", "misc", "navigation", "time", "users", "weather", "custom",
      ];
      const currentIndex = categories.indexOf(activeCategory);
      const nextIndex = (currentIndex + 1) % categories.length;
      setActiveCategory(categories[nextIndex]);
    },
    onPrevCategory: () => {
      const categories: any[] = [
        "all", "action", "accessibility", "commerce", "communication",
        "dev", "feedback", "files", "hardware", "layout", "media",
        "metrics", "misc", "navigation", "time", "users", "weather", "custom",
      ];
      const currentIndex = categories.indexOf(activeCategory);
      const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
      setActiveCategory(categories[prevIndex]);
    },
    onNextType: () => {
      const types: any[] = ["normal", "duotone", "fill", "pixelated", "glass"];
      const currentIndex = types.indexOf(state.iconType);
      const nextIndex = (currentIndex + 1) % types.length;
      handleChange({ iconType: types[nextIndex] });
    },
    onPrevType: () => {
      const types: any[] = ["normal", "duotone", "fill", "pixelated", "glass"];
      const currentIndex = types.indexOf(state.iconType);
      const prevIndex = (currentIndex - 1 + types.length) % types.length;
      handleChange({ iconType: types[prevIndex] });
    },
    onSelectTraySlot: (index) => {
      if (trayIcons[index]) {
        handleIconSelectWithTypeSync(trayIcons[index]);
        toast.success(`Selected ${trayIcons[index].name}`);
      }
    },
    trayIcons,
    canCopy: !!selectedIcon,
  });

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="relative z-[100] w-12 shrink-0" aria-label="Tool rail">
        <ToolRail
          activeType={state.iconType}
          onTypeChange={(type) => handleChange({ iconType: type })}
          onHelpClick={() => setShowHelp(true)}
        />
      </aside>

      <aside className="w-[320px] shrink-0" aria-label="Icon library">
        <IconLibraryPanel
          onIconSelect={handleIconSelectWithTypeSync}
          selectedIconId={selectedIcon?.id ?? null}
          selectedCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          customIcons={state.customIcons}
          iconType={resolveLibraryIconType(state.iconType)}
        />
      </aside>

      <WorkspacePanel
        state={state}
        trayIcons={trayIcons}
        selectedIcon={selectedIcon}
        onSelectIcon={handleIconSelectWithTypeSync}
        onRemoveFromTray={handleRemoveFromTray}
        onReset={handleReset}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onChange={handleChange}
        showGrid={showGrid}
        onGridToggle={() => setShowGrid(!showGrid)}
      />

      <aside
        className="w-[341px] shrink-0 border-l border-border bg-workspace-pattern overflow-y-auto relative"
        aria-label="Customization controls"
      >
        <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        <div className="relative z-10">
          <PropertiesPanel
            state={state}
            selectedIcon={selectedIcon}
            onIconSelect={handleIconSelectWithTypeSync}
            onDeleteIcon={handleRemoveById}
            onChange={handleChange}
            onReset={handleReset}
            />
        </div>
      </aside>

      <KeyboardShortcutsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
