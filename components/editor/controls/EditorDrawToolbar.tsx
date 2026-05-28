"use client";

import { memo } from "react";
import {
  Pencil,
  Square,
  Circle,
  Slash,
  Eraser,
  PaintBucket,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawTool =
  | "pen"
  | "rect"
  | "ellipse"
  | "line"
  | "eraser"
  | "bucket";

interface EditorDrawToolbarProps {
  activeTool: DrawTool;
  onToolChange: (tool: DrawTool) => void;
  showReference: boolean;
  onToggleReference: () => void;
}

export const DRAW_TOOLS: { id: DrawTool; label: string; Icon: typeof Pencil }[] = [
  { id: "pen", label: "Pen", Icon: Pencil },
  { id: "rect", label: "Rectangle", Icon: Square },
  { id: "ellipse", label: "Ellipse", Icon: Circle },
  { id: "line", label: "Line", Icon: Slash },
  { id: "bucket", label: "Bucket fill", Icon: PaintBucket },
  { id: "eraser", label: "Eraser", Icon: Eraser },
];

const TOOLS = DRAW_TOOLS;

export const EditorDrawToolbar = memo(function EditorDrawToolbar({
  activeTool,
  onToolChange,
  showReference,
  onToggleReference,
}: EditorDrawToolbarProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 p-0.5 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-sm">
      {TOOLS.map(({ id, label, Icon }) => {
        const isActive = activeTool === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            aria-label={label}
            title={label}
            aria-pressed={isActive}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}

      <div className="h-px w-5 bg-border/60 my-0.5" aria-hidden="true" />

      <button
        type="button"
        onClick={onToggleReference}
        aria-label={showReference ? "Hide reference" : "Show reference"}
        title={
          showReference
            ? "Hide underlying icon"
            : "Show underlying icon as faded reference"
        }
        aria-pressed={showReference}
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
          showReference
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        )}
      >
        {showReference ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
});
