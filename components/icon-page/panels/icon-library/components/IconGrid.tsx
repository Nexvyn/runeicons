"use client";

import { useEffect, useRef } from "react";

import { motion } from "motion/react";

import { IconData } from "@/lib/types";
import type { IconType } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IconGridProps {
  icons: IconData[];
  selectedIconId: string | null;
  onIconClick: (icon: IconData) => void;
  isSearching?: boolean;
  iconType: IconType;
}

export function IconGrid({ icons, selectedIconId, onIconClick, isSearching, iconType }: IconGridProps) {
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

      const cols = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 640 ? 4 : 3;
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
  }, [icons.length]);

  return (
    <div
      className="grid grid-cols-3 border-b border-border outline-none sm:grid-cols-4 lg:grid-cols-5"
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
              type="button"
              aria-label={`${icon.name} icon`}
              title={icon.name}
              tabIndex={0}
            >
              <motion.div
                className="relative z-10 flex items-center justify-center p-3"
                variants={{
                  initial: { y: 0, scale: 1 },
                  hover: { y: -12, scale: 0.92 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {Icon ? (
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isSelected
                        ? "text-primary"
                        : isSearching
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={icon.url}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className={cn(
                      "h-5 w-5 select-none",
                      invertInDark && "dark:invert",
                    )}
                  />
                )}
              </motion.div>

              <motion.div
                className="pointer-events-none absolute right-0 bottom-1 left-0 z-10 flex justify-center px-1.5 text-center"
                variants={{
                  initial: { opacity: 0, y: 4, filter: "blur(4px)" },
                  hover: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span
                  className="text-[8.5px] leading-[1.1] font-bold tracking-[0.04em] whitespace-normal text-muted-foreground/80 uppercase"
                  style={{ textWrap: "balance" } as React.CSSProperties}
                >
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
