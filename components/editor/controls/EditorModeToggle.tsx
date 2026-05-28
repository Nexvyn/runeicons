"use client";

import { memo } from "react";
import { MousePointer, Pencil } from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { EDITOR_TRANSITION } from "@/components/editor/controls/EditorActionBar";

type EditorMode = "edit" | "draw";

interface EditorModeToggleProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const MODES: { id: EditorMode; label: string; Icon: typeof MousePointer }[] = [
  { id: "edit", label: "Edit", Icon: MousePointer },
  { id: "draw", label: "Draw", Icon: Pencil },
];

export const EditorModeToggle = memo(function EditorModeToggle({
  mode,
  onModeChange,
}: EditorModeToggleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LayoutGroup>
      <div className="flex items-center gap-0.5 p-0.5 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-sm">
        {MODES.map(({ id, label, Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onModeChange(id)}
              aria-pressed={active}
              className="relative flex items-center rounded-md focus:outline-none"
            >
              {active && (
                <motion.div
                  layoutId="editor-mode-indicator"
                  className="absolute inset-0 rounded-md bg-foreground"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          duration: EDITOR_TRANSITION.toggle,
                          bounce: 0.15,
                        }
                  }
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
});
