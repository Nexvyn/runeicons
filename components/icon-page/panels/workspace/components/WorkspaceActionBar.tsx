"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  Braces,
  Check,
  ChevronDown,
  Code,
  Download,
  FileCode,
  FileJson,
  Grid3X3,
  Image,
  Layers,
  Redo,
  RotateCcw,
  Sparkles,
  Undo,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useTuning } from "@/components/icon-page/tuning";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  buildComponentName,
  generateJsxComponent,
  generatePng,
  generateStandaloneSvg,
  generateTsxComponent,
} from "@/lib/svg-export-utils";
import { CustomizationState, IconData } from "@/lib/types";
import { cn } from "@/lib/utils";
export interface WorkspaceActionBarProps {
  onDownload?: () => void;
  onReset?: () => void;
  onCode?: (code: string) => void;
  onGridToggle?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  selectedIcon?: IconData | null;
  state?: CustomizationState;
  onChange?: (updates: Partial<CustomizationState>) => void;
  className?: string;
  onGetSvgContent?: () => Promise<string>;
  hideAdvancedExports?: boolean;
  additionalDropdownItems?: ReactNode;
}
export function WorkspaceActionBar({
  onDownload,
  onReset,
  onCode,
  onGridToggle,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  showGrid = false,
  selectedIcon,
  state,
  onChange,
  className,
  onGetSvgContent,
  hideAdvancedExports = false,
  additionalDropdownItems,
}: WorkspaceActionBarProps) {
  const [isPending, setIsPending] = useState(false);
  const isAnimated = state?.motion?.enabled === true;
  const withPending = async (fn: () => Promise<void>) => {
    if (isPending) return;
    setIsPending(true);
    try {
      await fn();
    } finally {
      setIsPending(false);
    }
  };
  useTuning();
  const [isResetArmed, setIsResetArmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [resetTooltipOpen, setResetTooltipOpen] = useState(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const disarmReset = useCallback(() => {
    setIsResetArmed(false);
    setTimeLeft(5);
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);
  const armReset = useCallback(() => {
    setIsResetArmed(true);
    setTimeLeft(5);
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          disarmReset();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    resetTimeoutRef.current = setTimeout(() => {
      disarmReset();
    }, 5000);
  }, [disarmReset]);
  const handleResetClick = useCallback(() => {
    if (!isResetArmed) {
      armReset();
    }
  }, [isResetArmed, armReset]);
  const handleConfirmReset = useCallback(() => {
    disarmReset();
    onReset?.();
    toast.success("Customizations reset");
  }, [disarmReset, onReset]);
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };
  const getSvgContent = async (): Promise<string> => {
    if (onGetSvgContent) {
      try {
        return await onGetSvgContent();
      } catch (error) {
        console.error("Custom SVG generator failed:", error);
        toast.error("Export failed.");
        return "";
      }
    }
    if (!selectedIcon || !state) return "";
    try {
      return await generateStandaloneSvg(selectedIcon, state);
    } catch (error) {
      console.error("Failed to generate SVG:", error);
      toast.error("Enhanced export failed. Falling back to basic copy.");
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}" viewBox="0 0 24 24" fill="none" stroke="${state.colors[0]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <use href="#${selectedIcon.id}" />
</svg>`;
    }
  };
  const downloadSvg = async () => {
    const svg = await getSvgContent();
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedIcon?.name.toLowerCase().replace(/\s+/g, "-") || "icon"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("SVG downloaded successfully");
    if (isAnimated) {
      toast.info("Animations play when SVG is opened directly in browser or inlined in HTML", { duration: 5000 });
    }
    onDownload?.();
  };
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const downloadPng = async () => {
    if (!selectedIcon || !state) return;
    await withPending(async () => {
      try {
        const blob = await generatePng(selectedIcon, state);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedIcon.name.toLowerCase().replace(/\s+/g, "-")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("PNG downloaded");
      } catch {
        toast.error("Failed to generate PNG");
      }
    });
  };
  const getComponentFilename = (ext: string) =>
    selectedIcon ? `${buildComponentName(selectedIcon.name)}.${ext}` : `icon.${ext}`;
  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          "flex h-[46px] items-stretch gap-1.5 rounded-[14px] p-1 border border-black/5 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]",
          "bg-[#f5f5f5] dark:bg-[#1a1a1a]",
          className,
        )}
      >
        <div className="flex items-center gap-1 rounded-[10px] bg-[#1d1d1f] p-[3px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.5)]">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="flex h-9 w-9 items-center justify-center rounded-[7px] text-[#c9c9cb] transition-all hover:bg-white/5 hover:text-white active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:text-[#4f4f51]"
              >
                <Undo className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Undo <span className="ml-1 opacity-50 text-[10px]">⌘Z</span></p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="flex h-9 w-9 items-center justify-center rounded-[7px] text-[#c9c9cb] transition-all hover:bg-white/5 hover:text-white active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:text-[#4f4f51]"
              >
                <Redo className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Redo <span className="ml-1 opacity-50 text-[10px]">⌘Y</span></p>
            </TooltipContent>
          </Tooltip>
          <div className="relative">
            <Tooltip
              open={!isResetArmed && resetTooltipOpen}
              onOpenChange={setResetTooltipOpen}
            >
              <TooltipTrigger asChild>
                <button
                  onClick={handleResetClick}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-[7px] transition-all active:translate-y-[0.5px]",
                    isResetArmed
                      ? "bg-white text-black"
                      : "text-[#c9c9cb] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Reset</p></TooltipContent>
            </Tooltip>
            <AnimatePresence>
              {isResetArmed && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.95 }}
                  animate={{ opacity: 1, y: -80, scale: 1 }}
                  exit={{ opacity: 0, y: 0, scale: 0.95 }}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-[9px] bg-[#2c2c2e] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] z-[100] whitespace-nowrap"
                >
                  <button
                    onClick={handleConfirmReset}
                    className="flex h-7 px-3 items-center gap-2 rounded-[6px] bg-white text-black hover:bg-white/90 transition-all font-bold text-[10px] shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Reset</span>
                    <span className="font-mono text-[9px] tabular-nums text-[#10b981] font-bold">{timeLeft}s</span>
                  </button>
                  <button
                    onClick={disarmReset}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] text-white/50 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2c2c2e] border-r border-b border-white/10 rotate-45 z-[-1]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center rounded-[10px] bg-[#1d1d1f] p-[3px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.5)]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex h-full min-w-[64px] items-center justify-center gap-1.5 rounded-[7px] px-2 text-[#c9c9cb] transition-all hover:bg-white/5 hover:text-white focus:outline-none">
                <span className="font-mono text-[11px] font-bold tracking-tighter">{state?.width}px</span>
                <ChevronDown className="h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-[85px] border-white/10 bg-[#2c2c2e] p-1 text-white shadow-xl"
            >
              {[16, 20, 24, 28, 32, 48, 64, 96, 128].map((size) => (
                <DropdownMenuItem
                  key={size}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                  onClick={() => onChange?.({ width: size, height: size })}
                >
                  <span>{size}px</span>
                  {state?.width === size && <Check className="h-2.5 w-2.5 text-white/50" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onGridToggle}
                className={cn(
                  "flex h-full w-9 items-center justify-center rounded-[7px] transition-all active:translate-y-[0.5px]",
                  showGrid
                    ? "bg-[#1d1d1f] text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.4)]"
                    : "text-[#c9c9cb] hover:bg-white/5 hover:text-white",
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{showGrid ? "Hide Grid" : "Show Grid"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-1 rounded-[10px] bg-[#1d1d1f] p-[3px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.5)]">
          <button
            disabled={isPending}
            onClick={isAnimated && !hideAdvancedExports ? async () => {
              if (!selectedIcon || !state) return;
              await withPending(async () => {
                try {
                  const code = await generateJsxComponent(selectedIcon, state);
                  downloadFile(code, getComponentFilename("jsx"), "text/javascript");
                  toast.success("JSX component downloaded");
                } catch {
                  toast.error("Failed to generate JSX component");
                }
              });
            } : downloadSvg}
            className="group relative flex h-full flex-1 items-center justify-center gap-2 overflow-hidden rounded-[7px] bg-white px-4 text-center transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full" />
            <Download className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold tracking-tight">
              {isPending ? "Exporting..." : isAnimated && !hideAdvancedExports ? "Export JSX" : "Export SVG"}
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex h-full w-8 items-center justify-center rounded-[7px] bg-white text-black transition-all hover:bg-white/90 active:scale-[0.98] dark:bg-white dark:text-black">
                <ChevronDown className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[146px] border-white/10 bg-[#2c2c2e] p-1 text-white shadow-2xl"
            >
              {isAnimated ? (
                <>
                  {!hideAdvancedExports && (
                    <>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={async () => {
                          if (!selectedIcon || !state) return;
                          await withPending(async () => {
                            try {
                              const code = await generateJsxComponent(selectedIcon, state);
                              await copyToClipboard(code, "JSX Component");
                            } catch {
                              toast.error("Failed to generate JSX component");
                            }
                          });
                        }}
                      >
                        <FileCode className="h-4 w-4 text-white/40" />
                        <div className="flex flex-1 items-center justify-between">
                          <span>Copy JSX Component</span>
                          <span className="font-mono text-[9px] opacity-40">JSX</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={async () => {
                          if (!selectedIcon || !state) return;
                          await withPending(async () => {
                            try {
                              const code = await generateTsxComponent(selectedIcon, state);
                              await copyToClipboard(code, "TSX Component");
                            } catch {
                              toast.error("Failed to generate TSX component");
                            }
                          });
                        }}
                      >
                        <FileCode className="h-4 w-4 text-white/40" />
                        <div className="flex flex-1 items-center justify-between">
                          <span>Copy TSX Component</span>
                          <span className="font-mono text-[9px] opacity-40">TSX</span>
                        </div>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    disabled={isPending}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                    onClick={async () => {
                      const svg = await getSvgContent();
                      if (svg) copyToClipboard(svg, "SVG (animated)");
                    }}
                  >
                    <FileCode className="h-4 w-4 text-white/40" />
                    <div className="flex flex-1 items-center justify-between">
                      <span>Copy as SVG</span>
                      <span className="font-mono text-[9px] opacity-40">SVG</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {!hideAdvancedExports && (
                    <>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={async () => {
                          if (!selectedIcon || !state) return;
                          await withPending(async () => {
                            try {
                              const code = await generateJsxComponent(selectedIcon, state);
                              downloadFile(code, getComponentFilename("jsx"), "text/javascript");
                              toast.success("JSX component downloaded");
                            } catch {
                              toast.error("Failed to generate JSX component");
                            }
                          });
                        }}
                      >
                        <FileCode className="h-4 w-4 text-white/40" />
                        <span>Download as JSX</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={async () => {
                          if (!selectedIcon || !state) return;
                          await withPending(async () => {
                            try {
                              const code = await generateTsxComponent(selectedIcon, state);
                              downloadFile(code, getComponentFilename("tsx"), "text/typescript");
                              toast.success("TSX component downloaded");
                            } catch {
                              toast.error("Failed to generate TSX component");
                            }
                          });
                        }}
                      >
                        <FileCode className="h-4 w-4 text-white/40" />
                        <span>Download as TSX</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    disabled={isPending}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                    onClick={downloadSvg}
                  >
                    <FileCode className="h-4 w-4 text-white/40" />
                    <span>Download as SVG (animated)</span>
                  </DropdownMenuItem>
                  {additionalDropdownItems && (
                    <>
                      <DropdownMenuSeparator className="my-0.5 bg-white/5" />
                      {additionalDropdownItems}
                    </>
                  )}
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    disabled={isPending}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                    onClick={async () => {
                      const svg = await getSvgContent();
                      if (svg) {
                        copyToClipboard(svg, "SVG");
                      } else {
                        toast.error("Select an icon first");
                      }
                    }}
                  >
                    <FileCode className="h-4 w-4 text-white/40" />
                    <div className="flex flex-1 items-center justify-between">
                      <span>Copy as SVG</span>
                      <span className="font-mono text-[9px] opacity-40">SVG</span>
                    </div>
                  </DropdownMenuItem>
                  {!hideAdvancedExports && (
                    <DropdownMenuItem
                      disabled={isPending}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                      onClick={() => {
                        if (selectedIcon && state) {
                          generateJsxComponent(selectedIcon, state).then(code =>
                            copyToClipboard(code, "React Component")
                          );
                        }
                      }}
                    >
                      <Braces className="h-4 w-4 text-white/40" />
                      <span>Copy as React</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-0.5 bg-white/5" />
                  <DropdownMenuItem
                    disabled={isPending}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                    onClick={downloadSvg}
                  >
                    <Download className="h-4 w-4 text-white/40" />
                    <span>Download as SVG</span>
                  </DropdownMenuItem>
                  {!hideAdvancedExports && (
                    <>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={async () => {
                          if (!selectedIcon || !state) return;
                          await withPending(async () => {
                            try {
                              const code = await generateJsxComponent(selectedIcon, state);
                              downloadFile(code, getComponentFilename("jsx"), "text/javascript");
                              toast.success("JSX component downloaded");
                            } catch {
                              toast.error("Failed to generate JSX component");
                            }
                          });
                        }}
                      >
                        <FileCode className="h-4 w-4 text-white/40" />
                        <span>Download as JSX</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={async () => {
                          if (!selectedIcon || !state) return;
                          await withPending(async () => {
                            try {
                              const code = await generateTsxComponent(selectedIcon, state);
                              downloadFile(code, getComponentFilename("tsx"), "text/typescript");
                              toast.success("TSX component downloaded");
                            } catch {
                              toast.error("Failed to generate TSX component");
                            }
                          });
                        }}
                      >
                        <FileCode className="h-4 w-4 text-white/40" />
                        <span>Download as TSX</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus:bg-white/10 focus:text-white"
                        onClick={downloadPng}
                      >
                        <Image className="h-4 w-4 text-white/40" />
                        <span>Download as PNG</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {additionalDropdownItems && (
                    <>
                      <DropdownMenuSeparator className="my-0.5 bg-white/5" />
                      {additionalDropdownItems}
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
