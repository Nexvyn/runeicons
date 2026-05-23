"use client";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconData } from "@/lib/types";
import { cn } from "@/lib/utils";
interface TrayIconItemProps {
  icon: IconData;
  index: number;
  isSelected: boolean;
  onSelect: (icon: IconData) => void;
  onRemove: (name: string) => void;
}
export function TrayIconItem({ 
  icon, 
  index, 
  isSelected, 
  onSelect, 
  onRemove 
}: TrayIconItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      transition={{
        type: "spring",
        duration: 0.3,
        bounce: 0,
        delay: Math.min(index * 0.05, 0.3),
      }}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md border px-2 py-2 shadow-sm outline outline-1 -outline-offset-1 outline-black/5 transition-[background-color,border-color,scale,box-shadow] duration-150 ease-out active:scale-[0.96] dark:outline-white/5",
        isSelected
          ? "border-border/60 bg-accent"
          : "border-transparent bg-background hover:border-border/30 hover:bg-muted/40",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(icon)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label={`Select ${icon.name}`}
      >
        {icon.icon ? (
          <icon.icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-200",
              isSelected
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        ) : icon.url ? (
          <div
            className={cn(
              "h-4 w-4 shrink-0 rounded-sm bg-muted-foreground transition-colors duration-200",
              isSelected ? "bg-primary" : "group-hover:bg-foreground",
              icon.iconType !== "glass" && "dark:invert",
            )}
            style={{
              maskImage: `url(${icon.url})`,
              WebkitMaskImage: `url(${icon.url})`,
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
        ) : (
          <div
            className={cn(
              "h-4 w-4 shrink-0 rounded-sm bg-muted-foreground transition-colors duration-200",
              isSelected ? "bg-primary" : "group-hover:bg-foreground",
            )}
          />
        )}
        <span
          className={cn(
            "truncate text-xs transition-colors duration-200",
            isSelected
              ? "font-medium text-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {icon.name}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(icon.name)}
        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 active:scale-[0.96]"
        aria-label={`Remove ${icon.name}`}
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
}
