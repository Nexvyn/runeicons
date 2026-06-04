"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Check, FileDown, FileUp, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useTuning } from "@/components/icon-page/tuning";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PanelHeaderProps {
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export function PanelHeader({ onExport, onImport, onReset }: PanelHeaderProps) {
  useTuning();
  const [isResetArmed, setIsResetArmed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [resetTooltipOpen, setResetTooltipOpen] = useState(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const disarmReset = useCallback(() => {
    setIsResetArmed(false);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    resetTimeoutRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  const armReset = useCallback(() => {
    setIsResetArmed(true);
    setCountdown(5);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
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
    if (isResetArmed) {
      disarmReset();
      onReset();
      toast.success("Settings restored to default");
    } else {
      armReset();
    }
  }, [isResetArmed, disarmReset, armReset, onReset]);

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between w-full py-1.5 mb-4 px-1">
        <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors whitespace-nowrap">
          Properties
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onImport}
                className="h-7 w-7 rounded-md text-foreground/60 transition-all duration-150 hover:bg-muted/10 hover:text-foreground active:scale-[0.96]"
              >
                <FileUp className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={2}>Import Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-7 w-7 rounded-md text-foreground/60 transition-all duration-150 hover:bg-muted/10 hover:text-foreground active:scale-[0.96]"
              >
                <FileDown className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={2}>Export Settings</TooltipContent>
          </Tooltip>

          <div className="mx-1 h-3.5 w-[1px] bg-border/40" />

          <div className="relative">
            <Tooltip
              open={!isResetArmed && resetTooltipOpen}
              onOpenChange={setResetTooltipOpen}
            >
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetClick}
                  className={cn(
                    "h-7 w-7 rounded-md transition-all active:scale-[0.96]",
                    isResetArmed
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={2}>Reset to Default</TooltipContent>
            </Tooltip>

            <AnimatePresence>
              {isResetArmed && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  className="absolute right-0 top-[calc(100%+6px)] flex items-center gap-1 rounded-lg bg-popover p-1 border border-border shadow-xl z-[100] whitespace-nowrap"
                >
                  <button
                    onClick={handleResetClick}
                    className="flex h-7 px-3 items-center gap-2 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-all font-bold text-[10px] shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Reset</span>
                    <span className="font-mono text-[9px] tabular-nums opacity-60">{countdown}s</span>
                  </button>
                  <button
                    onClick={disarmReset}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/40 hover:bg-muted/10 hover:text-foreground transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute -top-[5px] right-3 w-2 h-2 bg-popover border-l border-t border-border rotate-45 z-[-1]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
