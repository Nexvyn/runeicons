"use client";

import { memo, useEffect, useRef } from "react";

import { motion } from "motion/react";

import { IconData, CustomizationState } from "@/lib/types";
import type { IconType } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { STROKE_STYLE_MAP } from "@/lib/stroke-style";

const iconVariants = {
  initial: { y: 0, scale: 1 },
  hover: { y: -12, scale: 0.92 },
};

const labelVariants = {
  initial: { opacity: 0, y: 4, scale: 0.94 },
  hover: { opacity: 1, y: 0, scale: 1 },
};

interface IconGridProps {
  icons: IconData[];
  selectedIconId: string | null;
  onIconClick: (icon: IconData) => void;
  isSearching?: boolean;
  iconType: IconType;
  customizationState?: CustomizationState;
}

function IconGridInner({ icons, selectedIconId, onIconClick, isSearching, iconType, customizationState }: IconGridProps) {
  const invertInDark = iconType === "normal" || iconType === "pixelated";
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (!active || !container.contains(active)) return;

      const buttons = Array.from(container.querySelectorAll("button"));
      const currentIndex = buttons.indexOf(active as HTMLButtonElement);
      if (currentIndex === -1) return;

      const cols = 5;
      let nextIndex = -1;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = currentIndex + 1;
          break;
        case "ArrowLeft":
          nextIndex = currentIndex - 1;
          break;
        case "ArrowDown":
          nextIndex = currentIndex + cols;
          break;
        case "ArrowUp":
          nextIndex = currentIndex - cols;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = buttons.length - 1;
          break;
      }

      if (nextIndex >= 0 && nextIndex < buttons.length) {
        e.preventDefault();
        buttons[nextIndex].focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="grid grid-cols-5 border-b border-border outline-none"
      ref={containerRef}
      tabIndex={-1}
    >
      {icons.map((icon) => {
        const Icon = icon.icon;
        const isSelected = selectedIconId === icon.id;

        return (
          <div key={icon.id} className="relative w-full">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            >
              <span className="absolute h-2.5 w-px bg-border" />
              <span className="absolute h-px w-2.5 bg-border" />
            </span>

            <motion.button
              onClick={() => onIconClick(icon)}
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.96 }}
              className={cn(
                "group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden border-r border-b border-border transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                isSelected ? "bg-accent" : "bg-transparent hover:bg-muted focus-visible:bg-muted",
              )}
              style={
                isSelected && customizationState?.backgroundColor
                  ? { backgroundColor: customizationState.backgroundColor }
                  : undefined
              }
              type="button"
              aria-label={`${icon.name} icon`}
              title={icon.name}
              tabIndex={0}
            >
              <motion.div
                className="relative z-10 flex items-center justify-center p-3 will-change-transform"
                variants={iconVariants}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {(() => {
                  if (isSelected && customizationState && Icon) {
                    const s = customizationState;
                    const stroke = STROKE_STYLE_MAP[s.strokeStyle ?? "round"];
                    const color = s.colors[0] || "currentColor";
                    const isFill = s.iconType === "fill";
                    const isDuotone = s.iconType === "duotone";
                    return (
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={stroke.strokeWidth}
                        strokeLinecap={stroke.strokeLinecap}
                        strokeLinejoin={stroke.strokeLinejoin}
                        stroke={color}
                        fill={isFill ? color : isDuotone ? `${color}33` : "none"}
                        aria-hidden="true"
                      />
                    );
                  }
                  if (Icon) {
                    return (
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          isSearching
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    );
                  }
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={icon.url}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className={cn("h-5 w-5 select-none", invertInDark && "dark:invert")}
                    />
                  );
                })()}
              </motion.div>

              <motion.div
                className="pointer-events-none absolute right-0 bottom-1 left-0 z-10 px-1.5 text-center"
                variants={labelVariants}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="block truncate text-[8.5px] leading-[1.1] font-bold tracking-[0.04em] text-muted-foreground/80 uppercase">
                  {icon.name}
                </span>
              </motion.div>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

export const IconGrid = memo(IconGridInner);
