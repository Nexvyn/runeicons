"use client";
import type { JSX } from "react";
import { useRef } from "react";
import { DuotoneIcon } from "@/components/icons/DuotoneIcon";
import { FillIcon } from "@/components/icons/FillIcon";
import { GlassIcon } from "@/components/icons/GlassIcon";
import { NormalIcon } from "@/components/icons/NormalIcon";
import { PixelatedIcon } from "@/components/icons/PixelatedIcon";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomizationState } from "@/lib/types";
import { getIconsForType } from "@/lib/icons";
import { cn } from "@/lib/utils";
type IconType = CustomizationState["iconType"];
export const iconTypes: Array<{
  id: IconType;
  label: string;
  icon: () => JSX.Element;
}> = [
  {
    id: "normal",
    label: "Normal",
    icon: () => <NormalIcon className="h-4 w-4" />,
  },
  {
    id: "duotone",
    label: "Duotone",
    icon: () => <DuotoneIcon className="h-4 w-4" />,
  },
  {
    id: "fill",
    label: "Fill",
    icon: () => <FillIcon className="h-4 w-4" />,
  },
  {
    id: "pixelated",
    label: "Pixelated",
    icon: () => <PixelatedIcon className="h-4 w-4" />,
  },
  {
    id: "glass",
    label: "Glass",
    icon: () => <GlassIcon className="h-4 w-4" />,
  },
];
interface IconTypeListProps {
  activeType: IconType;
  onTypeChange?: (type: IconType) => void;
  compact?: boolean;
  supportedTypes?: readonly IconType[];
}
export function IconTypeList({
  activeType,
  onTypeChange,
  compact = false,
  supportedTypes,
}: IconTypeListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef<Set<IconType>>(new Set());
  const prefetchType = (type: IconType) => {
    if (prefetchedRef.current.has(type)) return;
    prefetchedRef.current.add(type);
    try {
      for (const icon of getIconsForType(type)) {
        if (!icon.url) continue;
        const img = new Image();
        img.decoding = "async";
        img.src = icon.url;
      }
    } catch {
      /* prefetch is best-effort */
    }
  };
  const visibleTypes = supportedTypes
    ? iconTypes.filter((type) => supportedTypes.includes(type.id))
    : iconTypes;
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(containerRef.current?.querySelectorAll("button") || []);
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex === -1) return;
    let nextIndex = -1;
    if (compact) {
      if (e.key === "ArrowDown") nextIndex = currentIndex + 1;
      if (e.key === "ArrowUp") nextIndex = currentIndex - 1;
    } else {
      if (e.key === "ArrowRight") nextIndex = currentIndex + 1;
      if (e.key === "ArrowLeft") nextIndex = currentIndex - 1;
      if (e.key === "ArrowDown") nextIndex = currentIndex + 3;
      if (e.key === "ArrowUp") nextIndex = currentIndex - 3;
    }
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = buttons.length - 1;
    if (nextIndex >= 0 && nextIndex < buttons.length) {
      e.preventDefault();
      buttons[nextIndex].focus();
    }
  };
  return (
    <TooltipProvider delayDuration={0}>
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-3")}
        role="radiogroup"
        aria-label="Icon style type"
      >
        {visibleTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          return (
            <Tooltip key={type.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onTypeChange?.(type.id)}
                  onMouseEnter={() => prefetchType(type.id)}
                  onFocus={() => prefetchType(type.id)}
                  className={cn(
                    "group/icon-type h-8 w-8 rounded-md border-border transition-[background-color,color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.96]",
                    isActive
                      ? "bg-brand dark:bg-brand text-white border-brand/20 hover:bg-brand/90 dark:hover:bg-brand/90"
                      : "bg-white dark:bg-[#1a1a1a] text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-label={type.label}
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                >
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={compact ? "right" : "bottom"} className="text-xs font-medium">
                {type.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
