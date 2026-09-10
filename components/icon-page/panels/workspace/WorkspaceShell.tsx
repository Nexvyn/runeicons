"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { IconLibraryPanel } from "@/components/icon-page/panels/icon-library";
import { KeyboardShortcutsModal } from "@/components/icon-page/panels/outline/components/keyboard-shortcuts-modal";
import { ToolRail } from "@/components/icon-page/panels/outline";
import { PropertiesPanel } from "@/components/icon-page/panels/properties";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import {
  getIconDataById,
  resolveLibraryIconType,
  type StateIconType,
} from "@/lib/icons";
import { fetchSvgInnerContentRaw, generateStandaloneSvg } from "@/lib/svg-export-utils";
import type { IconCategory, IconData } from "@/lib/types";

import { WorkspacePanel } from "./WorkspacePanel";
import { useWorkspaceSelection } from "./hooks/use-workspace-selection";

const CATEGORIES: IconCategory[] = [
  "all",
  "action",
  "accessibility",
  "commerce",
  "communication",
  "dev",
  "feedback",
  "files",
  "hardware",
  "layout",
  "media",
  "metrics",
  "misc",
  "navigation",
  "time",
  "users",
  "weather",
  "custom",
];

const ICON_TYPES: StateIconType[] = [
  "normal",
  "duotone",
  "fill",
  "pixelated",
  "glass",
];

export function WorkspaceShell() {
  const {
    state,
    handleChange,
    handleReset,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    hasLoadedFromStorage,
  } = useWorkspaceState({ enableKeyboardShortcuts: false });

  const {
    activeCategory,
    setActiveCategory,
    selectedIcon,
    setSelectedIcon,
    trayIcons,
    handleIconSelect,
    handleRemoveFromTray,
    handleRemoveById,
  } = useWorkspaceSelection(
    state.customIcons,
    resolveLibraryIconType(state.iconType),
    hasLoadedFromStorage,
  );

  const handleIconSelectWithTypeSync = useCallback(
    (icon: IconData) => {
      if (icon.category === "custom") {
        if (state.iconType !== "normal") {
          handleChange({ iconType: "normal" });
        }
        handleIconSelect({ ...icon, iconType: "normal" });
        return;
      }
      if (icon.iconType && icon.iconType !== state.iconType) {
        handleChange({ iconType: icon.iconType });
      }
      handleIconSelect(icon);
    },
    [handleChange, handleIconSelect, state.iconType],
  );

  const handleTypeChange = useCallback(
    (nextType: StateIconType) => {
      const customIcon = selectedIcon
        ? state.customIcons.find((icon) => icon.id === selectedIcon.id)
        : undefined;
      if (customIcon || selectedIcon?.category === "custom") {
        if (state.iconType !== "normal") {
          handleChange({ iconType: "normal" });
        }
        if (selectedIcon) {
          handleIconSelect({
            ...selectedIcon,
            url: customIcon?.url ?? selectedIcon.url,
            iconType: "normal",
          });
        }
        return;
      }
      handleChange({ iconType: nextType });
      if (!selectedIcon) return;

      const libraryType = resolveLibraryIconType(nextType);
      const nextIcon = getIconDataById(selectedIcon.id, libraryType);
      if (nextIcon) {
        handleIconSelect(nextIcon);
      } else {
        setSelectedIcon(null);
        toast.info("That icon is not available in this style");
      }
    },
    [
      handleChange,
      handleIconSelect,
      selectedIcon,
      setSelectedIcon,
      state.customIcons,
    ],
  );

  const [selectedPathCount, setSelectedPathCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (!selectedIcon?.url) {
      setSelectedPathCount(selectedIcon?.pathCount ?? 0);
      return;
    }

    fetchSvgInnerContentRaw(selectedIcon.url)
      .then(({ content }) => {
        if (cancelled) return;
        const count =
          content.match(
            /<(path|circle|rect|ellipse|line|polyline|polygon)\b/gi,
          )?.length ?? 0;
        setSelectedPathCount(count);
      })
      .catch(() => {
        if (!cancelled) setSelectedPathCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedIcon?.pathCount, selectedIcon?.url]);

  const selectedIconForPanel = useMemo(
    () =>
      selectedIcon
        ? { ...selectedIcon, pathCount: selectedPathCount }
        : null,
    [selectedIcon, selectedPathCount],
  );

  const [showGrid, setShowGrid] = useState(true);

  const handleExport = useCallback(() => {
    const configJson = JSON.stringify(state, null, 2);
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `customization-${Date.now()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Configuration exported");
  }, [state]);

  const handleCopySvg = useCallback(async () => {
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
  }, [selectedIcon, state]);

  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onCopySvg: handleCopySvg,
    onExport: handleExport,
    onReset: handleReset,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onToggleGrid: () => setShowGrid((previous) => !previous),
    onNextCategory: () => {
      const currentIndex = CATEGORIES.indexOf(activeCategory);
      setActiveCategory(CATEGORIES[(currentIndex + 1) % CATEGORIES.length]);
    },
    onPrevCategory: () => {
      const currentIndex = CATEGORIES.indexOf(activeCategory);
      setActiveCategory(
        CATEGORIES[(currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length],
      );
    },
    onNextType: () => {
      const currentIndex = ICON_TYPES.indexOf(state.iconType);
      handleTypeChange(ICON_TYPES[(currentIndex + 1) % ICON_TYPES.length]);
    },
    onPrevType: () => {
      const currentIndex = ICON_TYPES.indexOf(state.iconType);
      handleTypeChange(
        ICON_TYPES[(currentIndex - 1 + ICON_TYPES.length) % ICON_TYPES.length],
      );
    },
    onSelectTraySlot: (index) => {
      const icon = trayIcons[index];
      if (!icon) return;
      handleIconSelectWithTypeSync(icon);
      toast.success(`Selected ${icon.name}`);
    },
    trayIcons,
    canCopy: !!selectedIcon,
  });

  return (
    <>
      <div className="hidden flex-1 overflow-x-auto overflow-y-hidden lg:flex">
      <aside className="relative z-[100] w-12 shrink-0" aria-label="Tool rail">
        <ToolRail
          activeType={state.iconType}
          onTypeChange={handleTypeChange}
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
          customizationState={state}
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
        onGridToggle={() => setShowGrid((previous) => !previous)}
      />

      <aside
        className="relative w-[341px] shrink-0 overflow-y-auto border-l border-border bg-workspace-pattern"
        aria-label="Customization controls"
      >
        <div className="pointer-events-none absolute inset-0 bg-background/80" />
        <div className="relative z-10">
          <PropertiesPanel
            state={state}
            selectedIcon={selectedIconForPanel}
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
    </>
  );
}
