"use client";

import { Plus, X } from "lucide-react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";

import { CustomizationState, IconData } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRAY_ITEM = {
  initialScale: 0.9,
  initialY: 8,
  exitY: -8,
  spring: { type: "spring" as const, stiffness: 400, damping: 28 },
};

const MAX_SLOTS = 8;

interface IconTrayProps {
  trayIcons: IconData[];
  selectedIconId: string | null;
  onSelectIcon: (icon: IconData) => void;
  onRemoveFromTray: (iconId: string) => void;
  state: CustomizationState;
}

export function IconTray({
  trayIcons,
  selectedIconId,
  onSelectIcon,
  onRemoveFromTray,
  state,
}: IconTrayProps) {
  const padSlots = Math.max(0, MAX_SLOTS - trayIcons.length - 1);

  return (
    <div className="grid grid-cols-8 w-full h-full">
        <AnimatePresence mode="popLayout" initial={false}>
          {trayIcons.map((trayIcon) => {
            const slotType = trayIcon.iconType ?? "normal";
            const isDesigned =
              slotType === "duotone" ||
              slotType === "fill" ||
              slotType === "pixelated" ||
              slotType === "glass";
            const invertInDark = slotType === "pixelated";
            const isSelected = trayIcon.id === selectedIconId;

            return (
              <m.div
                key={trayIcon.id}
                layout
                initial={{
                  opacity: 0,
                  scale: TRAY_ITEM.initialScale,
                  y: TRAY_ITEM.initialY,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: TRAY_ITEM.initialScale,
                  y: TRAY_ITEM.exitY,
                }}
                transition={TRAY_ITEM.spring}
                className="group flex items-center justify-center will-change-transform"
              >
                <div className="relative">
                <button
                  type="button"
                  className={cn(
                    "w-11 h-11 rounded-lg border flex items-center justify-center p-2",
                    "transition-[colors,transform,box-shadow] duration-150 ease-out hover:scale-105 active:scale-[0.97]",
                    "bg-card shadow-sm cursor-pointer outline-none",
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-border",
                  )}
                  onClick={() => onSelectIcon(trayIcon)}
                  aria-label={`Select ${trayIcon.name}`}
                >
                  {trayIcon.icon ? (
                    <trayIcon.icon
                      className={cn(
                        "h-full w-full",
                        invertInDark && "dark:invert",
                      )}
                      strokeWidth={2}
                      style={{
                        stroke: state.iconGradient
                          ? `url(#icon-gradient)`
                          : state.colors[0] || "currentColor",
                        ...(state.shadow.inner
                          ? { filter: "url(#inner-shadow)" }
                          : null),
                        transform: `rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
                      }}
                    />
                  ) : isDesigned ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={trayIcon.url}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className={cn(
                        "h-full w-full object-contain select-none",
                        invertInDark && "dark:invert",
                      )}
                      style={{
                        ...(state.shadow.inner
                          ? { filter: "url(#inner-shadow)" }
                          : null),
                        transform: `rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        "h-full w-full",
                        invertInDark && "dark:invert",
                      )}
                      style={{
                        maskImage: trayIcon.url ? `url(${trayIcon.url})` : "none",
                        WebkitMaskImage: trayIcon.url ? `url(${trayIcon.url})` : "none",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        background: state.iconGradient
                          ? `url(#icon-gradient)`
                          : state.colors[0] || "currentColor",
                        ...(state.shadow.inner
                          ? { filter: "url(#inner-shadow)" }
                          : null),
                        transform: `rotate(${state.rotation}deg) ${state.flipH ? "scaleX(-1)" : ""} ${state.flipV ? "scaleY(-1)" : ""}`.trim(),
                      }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromTray(trayIcon.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-150 ease-out flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 z-10"
                  aria-label={`Remove ${trayIcon.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>

        {trayIcons.length < MAX_SLOTS ? (
          <div className="flex items-center justify-center">
            <div className="w-11 h-11 rounded-lg border border-dashed border-border/30 flex items-center justify-center text-muted-foreground/20">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        ) : null}

        {Array.from({ length: padSlots }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
    </div>
  );
}
