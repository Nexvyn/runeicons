import { useRef } from "react";
import { CanvasFrame } from "./CanvasFrame";
import { PreviewContent } from "./PreviewContent";
import { IconTray } from "./IconTray";
import { CustomizationState, IconData } from "@/lib/types";
import { useCanvasStyles } from "@/hooks/use-canvas-styles";

interface PreviewAreaProps {
  state: CustomizationState;
  trayIcons: IconData[];
  selectedIcon: IconData | null;
  onSelectIcon: (icon: IconData) => void;
  onRemoveFromTray: (iconName: string) => void;
  showGrid: boolean;
}

export function PreviewArea({
  state,
  trayIcons,
  selectedIcon,
  onSelectIcon,
  onRemoveFromTray,
  showGrid,
}: PreviewAreaProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { dropShadow, supportsFilter, noiseFilter, blurFilter } =
    useCanvasStyles(state);

  return (
    <CanvasFrame
      showGrid={showGrid}
      trayNode={
        <IconTray
          trayIcons={trayIcons}
          selectedIconId={selectedIcon?.id ?? null}
          onSelectIcon={onSelectIcon}
          onRemoveFromTray={onRemoveFromTray}
          state={state}
        />
      }
    >
      <PreviewContent
        ref={canvasRef}
        state={state}
        selectedIcon={selectedIcon}
        dropShadow={dropShadow}
        supportsFilter={supportsFilter}
        noiseFilter={noiseFilter}
        blurFilter={blurFilter}
      />
    </CanvasFrame>
  );
}
