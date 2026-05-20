"use client";

import { useState } from "react";
import { Check, ChevronDown, Download } from "lucide-react";
import { toast } from "sonner";
import { PropertiesPanelProps } from "./types";
import { useConfigPersistence } from "./hooks/use-config-persistence";
import { useCustomIconUpload } from "./hooks/use-custom-icon-upload";
import { PanelHeader } from "./components/PanelHeader";
import { ColorSection } from "./sections/color-section";
import { SizeTransformSection } from "./sections/size-transform-section";
import { FlipRotateSection } from "./sections/flip-rotate-section";
import { ShadowSection } from "./sections/shadow-section";
import { NoiseSection } from "./sections/noise-section";
import { TextureSection } from "./sections/texture-section";
import { UploadSection } from "./sections/upload-section";
import { MotionSection } from "./sections/motion-section";
import { StrokeStyleSection } from "./sections/stroke-style-section";
import { generateStandaloneSvg, generateJsxComponent, buildComponentName } from "@/lib/svg-export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SIZES = [16, 20, 24, 28, 32, 48, 64, 96, 128];

export function PropertiesPanel({
  state,
  selectedIcon,
  onIconSelect,
  onDeleteIcon,
  onChange,
  onReset,
}: PropertiesPanelProps) {
  const { handleExport, handleImport } = useConfigPersistence(state, onChange);
  const [isPending, setIsPending] = useState(false);
  const isAnimated = state.motion?.enabled === true;

  const handleMobileExport = async () => {
    if (!selectedIcon) { toast.error("Select an icon first"); return; }
    if (isPending) return;
    setIsPending(true);
    try {
      if (isAnimated) {
        const code = await generateJsxComponent(selectedIcon, state);
        const blob = new Blob([code], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${buildComponentName(selectedIcon.name)}.jsx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("JSX downloaded");
      } else {
        const svg = await generateStandaloneSvg(selectedIcon, state);
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedIcon.name.toLowerCase().replace(/\s+/g, "-")}.svg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("SVG downloaded");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsPending(false);
    }
  };

  const {
    isDragging,
    uploadError,
    setUploadError,
    isUploading,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    deleteIcon,
    MAX_CUSTOM_ICONS,
  } = useCustomIconUpload(state, onChange, onDeleteIcon);

  return (
    <div
      className="h-full overflow-y-auto custom-scrollbar bg-background"
      role="region"
      aria-label="Customization controls panel"
    >
      <div className="lg:hidden sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 focus:outline-none"
            >
              <span className="font-mono">{state.width}px</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-24 p-1">
            {SIZES.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onChange({ width: size, height: size })}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs"
              >
                <span>{size}px</span>
                {state.width === size && <Check className="h-3 w-3 opacity-50" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          disabled={isPending || !selectedIcon}
          onClick={handleMobileExport}
          className="flex h-8 flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-xs font-semibold text-background transition-opacity disabled:opacity-40 active:opacity-80"
        >
          <Download className="h-3.5 w-3.5" />
          {isPending ? "Exporting…" : isAnimated ? "Export JSX" : "Export SVG"}
        </button>
      </div>

      <div className="p-4 pt-4 space-y-2">
        <PanelHeader
          onExport={handleExport}
          onImport={handleImport}
          onReset={onReset}
        />

        <div className="space-y-2 pb-10">
          <ColorSection
            state={state}
            onChange={onChange}
          />

          <SizeTransformSection state={state} onChange={onChange} />

          <MotionSection 
            state={state} 
            onChange={onChange} 
            pathCount={selectedIcon?.pathCount ?? 0}
          />
          
          <StrokeStyleSection state={state} onChange={onChange} />

          <FlipRotateSection state={state} onChange={onChange} />

          <ShadowSection state={state} onChange={onChange} />

          <NoiseSection state={state} onChange={onChange} />

          <TextureSection state={state} onChange={onChange} />

          <UploadSection
            state={state}
            onIconSelect={onIconSelect}
            isDragging={isDragging}
            uploadError={uploadError}
            setUploadError={setUploadError}
            isUploading={isUploading}
            handleFileUpload={handleFileUpload}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            deleteIcon={deleteIcon}
            maxIcons={MAX_CUSTOM_ICONS}
          />
        </div>
      </div>
    </div>
  );
}
