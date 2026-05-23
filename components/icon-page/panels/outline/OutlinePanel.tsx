"use client";
import { AnimatePresence, motion } from "motion/react";
import { CustomizationState, IconData } from "@/lib/types";
import { IconTypeList } from "./components/IconTypeList";
import { TrayIconItem } from "./components/TrayIconItem";
export { ToolRail } from "./components/ToolRail";
export type { ToolRailProps } from "./components/ToolRail";
type IconType = CustomizationState["iconType"];
export interface OutlinePanelProps {
  activeType?: IconType;
  onTypeChange?: (type: IconType) => void;
  trayIcons: IconData[];
  selectedIcon: IconData | null;
  onSelectIcon: (icon: IconData) => void;
  onRemoveFromTray: (iconName: string) => void;
}
export function OutlinePanel({
  activeType = "normal",
  onTypeChange,
  trayIcons,
  selectedIcon,
  onSelectIcon,
  onRemoveFromTray,
}: OutlinePanelProps) {
  return (
    <div className="relative flex h-full flex-col border-r border-border bg-background">
      <div className="bg-pattern-vertical-dashes pointer-events-none absolute inset-0 opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-border px-3 pt-3 pb-2">
          <h2 className="text-sm font-semibold text-foreground">Outline</h2>
          <p className="mt-1 text-xs whitespace-normal text-muted-foreground">
            Layers and styles
          </p>
          <div className="mt-3">
            <IconTypeList activeType={activeType} onTypeChange={onTypeChange} />
          </div>
        </div>
        <div className="scrollbar-hide flex-1 space-y-1 overflow-y-auto p-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {trayIcons.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                className="px-2 py-4"
              >
                <p className="text-xs text-muted-foreground">No layers in tray.</p>
              </motion.div>
            ) : (
              trayIcons.map((icon, index) => (
                <TrayIconItem
                  key={`${icon.id}-${index}`}
                  icon={icon}
                  index={index}
                  isSelected={selectedIcon?.id === icon.id}
                  onSelect={onSelectIcon}
                  onRemove={onRemoveFromTray}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
