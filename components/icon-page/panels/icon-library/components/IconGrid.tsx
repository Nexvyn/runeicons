"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

import type { IconType } from "@/lib/icons";
import { STROKE_STYLE_MAP } from "@/lib/stroke-style";
import { CustomizationState, IconData } from "@/lib/types";
import { cn } from "@/lib/utils";

import { IconNameTag } from "./IconNameTag";

interface IconGridProps {
  icons: IconData[];
  selectedIconId: string | null;
  onIconClick: (icon: IconData) => void;
  isSearching?: boolean;
  iconType: IconType;
  customizationState?: CustomizationState;
}

interface GridTileProps {
  icon: IconData;
  index: number;
  total: number;
  cols: number;
  isSelected: boolean;
  isSearching?: boolean;
  invertInDark: boolean;
  customizationState?: CustomizationState;
  tagActive: boolean;
  tagFromX: number;
  reduceMotion: boolean;
  onShowTag: (id: string, index: number) => void;
  onHideTag: () => void;
  onSelect: (icon: IconData) => void;
}

const GridTile = memo(function GridTile({
  icon,
  index,
  total,
  cols,
  isSelected,
  isSearching,
  invertInDark,
  customizationState,
  tagActive,
  tagFromX,
  reduceMotion,
  onShowTag,
  onHideTag,
  onSelect,
}: GridTileProps) {
  const Icon = icon.icon;
  const col = index % cols;
  const showAbove = index >= total - cols;
  const align = col === 0 ? "left" : col === cols - 1 ? "right" : "center";

  return (
    <div className="relative w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      >
        <span className="absolute h-2.5 w-px bg-border" />
        <span className="absolute h-px w-2.5 bg-border" />
      </span>
      <motion.button
        onClick={() => onSelect(icon)}
        onMouseEnter={() => onShowTag(icon.id, index)}
        onMouseLeave={onHideTag}
        onFocus={() => onShowTag(icon.id, index)}
        onBlur={onHideTag}
        initial="initial"
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
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
        tabIndex={0}
      >
        <div className="relative z-10 flex items-center justify-center p-3">
          {(() => {
            if (isSelected && customizationState && Icon) {
              const s = customizationState;
              const stroke = STROKE_STYLE_MAP[s.strokeStyle ?? "round"];
              const color = s.colors[0] || "currentColor";
              const fillSelected = s.iconType === "fill";
              const duotoneSelected = s.iconType === "duotone";
              return (
                <Icon
                  className="h-5 w-5"
                  strokeWidth={stroke.strokeWidth}
                  strokeLinecap={stroke.strokeLinecap}
                  strokeLinejoin={stroke.strokeLinejoin}
                  stroke={color}
                  fill={fillSelected ? color : duotoneSelected ? `${color}33` : "none"}
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
              <img
                src={icon.url}
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="lazy"
                decoding="async"
                className={cn("h-5 w-5 select-none", invertInDark && "dark:invert")}
              />
            );
          })()}
        </div>
      </motion.button>
      <AnimatePresence>
        {tagActive && (
          <IconNameTag
            label={icon.name}
            above={showAbove}
            fromX={tagFromX}
            align={align}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

function IconGridInner({
  icons,
  selectedIconId,
  onIconClick,
  isSearching,
  iconType,
  customizationState,
}: IconGridProps) {
  const invertInDark = iconType === "normal" || iconType === "pixelated";
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeTag, setActiveTag] = useState<{ id: string; fromX: number } | null>(null);
  const activeTagRef = useRef<{ id: string; fromX: number } | null>(null);
  const lastIndexRef = useRef<number | null>(null);
  const tagTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const COLS = 5;

  const clearTagTimer = useCallback(() => {
    if (tagTimer.current) clearTimeout(tagTimer.current);
    tagTimer.current = null;
  }, []);

  const showTag = useCallback((id: string, index: number) => {
    if (tagTimer.current) clearTimeout(tagTimer.current);
    tagTimer.current = null;
    const prev = lastIndexRef.current;
    lastIndexRef.current = index;
    const dir = prev === null || prev === index ? 0 : Math.sign(index - prev);
    const next = { id, fromX: dir * 10 };
    if (activeTagRef.current !== null) {
      activeTagRef.current = next;
      setActiveTag(next);
      return;
    }
    tagTimer.current = setTimeout(() => {
      activeTagRef.current = next;
      setActiveTag(next);
    }, 100);
  }, []);

  const hideTag = useCallback(() => {
    if (tagTimer.current) clearTimeout(tagTimer.current);
    tagTimer.current = null;
    tagTimer.current = setTimeout(() => {
      activeTagRef.current = null;
      setActiveTag(null);
    }, 120);
  }, []);

  useEffect(() => {
    const timer = tagTimer.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const hideNow = () => {
      if (tagTimer.current) clearTimeout(tagTimer.current);
      tagTimer.current = null;
      activeTagRef.current = null;
      lastIndexRef.current = null;
      setActiveTag(null);
    };
    window.addEventListener("blur", hideNow);
    return () => window.removeEventListener("blur", hideNow);
  }, []);

  useEffect(() => {
    activeTagRef.current = null;
    lastIndexRef.current = null;
    setActiveTag(null);
  }, [icons]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (!active || !container.contains(active)) return;
      const buttons = Array.from(container.querySelectorAll("button"));
      const currentIndex = buttons.indexOf(active as HTMLButtonElement);
      if (currentIndex === -1) return;
      let nextIndex = -1;
      switch (e.key) {
        case "Escape":
          hideTag();
          (active as HTMLElement).blur();
          return;
        case "ArrowRight":
          nextIndex = currentIndex + 1;
          break;
        case "ArrowLeft":
          nextIndex = currentIndex - 1;
          break;
        case "ArrowDown":
          nextIndex = currentIndex + COLS;
          break;
        case "ArrowUp":
          nextIndex = currentIndex - COLS;
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
  }, [hideTag]);

  return (
    <LayoutGroup>
      <div
        className="grid grid-cols-5 border-b border-border outline-none"
        ref={containerRef}
        tabIndex={-1}
      >
        {icons.map((icon, index) => (
          <GridTile
            key={icon.id}
            icon={icon}
            index={index}
            total={icons.length}
            cols={COLS}
            isSelected={selectedIconId === icon.id}
            isSearching={isSearching}
            invertInDark={invertInDark}
            customizationState={customizationState}
            tagActive={activeTag?.id === icon.id}
            tagFromX={activeTag?.id === icon.id ? activeTag.fromX : 0}
            reduceMotion={reduceMotion === true}
            onShowTag={showTag}
            onHideTag={hideTag}
            onSelect={onIconClick}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
export const IconGrid = memo(IconGridInner);
