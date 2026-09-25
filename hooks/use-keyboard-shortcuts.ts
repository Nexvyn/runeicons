"use client";

import { useEffect, useRef, useState } from "react";
import { IconData } from "@/lib/types";

type ShortcutHandler = (e: KeyboardEvent) => boolean | void;

interface Options {
  onCopySvg?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  onSelectTraySlot?: (index: number) => void;
  onToggleGrid?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onNextCategory?: () => void;
  onPrevCategory?: () => void;
  onNextType?: () => void;
  onPrevType?: () => void;
  onToggleTab?: () => void;
  trayIcons: IconData[];
  canCopy?: boolean;
}

interface Return {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const isTyping = (e: KeyboardEvent) =>
  e.target instanceof HTMLInputElement ||
  e.target instanceof HTMLTextAreaElement ||
  e.target instanceof HTMLSelectElement ||
  (e.target as HTMLElement)?.isContentEditable;

const isMac = () => typeof window !== 'undefined' && navigator.platform.toUpperCase().includes("MAC");
const mod = (e: KeyboardEvent) => (isMac() ? e.metaKey : e.ctrlKey);

export function useKeyboardShortcuts({
  onCopySvg,
  onExport,
  onReset,
  onSelectTraySlot,
  onToggleGrid,
  onUndo,
  onRedo,
  onNextCategory,
  onPrevCategory,
  onNextType,
  onPrevType,
  onToggleTab,
  trayIcons,
  canCopy,
}: Options): Return {
  const [showHelp, setShowHelp] = useState(false);
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const arm = () => {
    setArmed(true);
    timeoutRef.current = setTimeout(() => setArmed(false), 2000);
  };

  const disarm = () => {
    setArmed(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const shortcuts: Record<string, ShortcutHandler> = {
    c: (e) => {
      if (!mod(e) || e.shiftKey) return false;
      if (window.getSelection()?.toString()) return false;
      e.preventDefault();
      if (canCopy) onCopySvg?.();
      return true;
    },
    e: (e) => {
      if (!mod(e)) return false;
      e.preventDefault();
      onExport?.();
      return true;
    },
    z: (e) => {
      if (!mod(e)) return false;
      e.preventDefault();
      if (e.shiftKey) {
        onRedo?.();
      } else {
        onUndo?.();
      }
      return true;
    },
    y: (e) => {
      if (!mod(e)) return false;
      e.preventDefault();
      onRedo?.();
      return true;
    },
    g: (e) => {
      if (isTyping(e)) return false;
      e.preventDefault();
      onToggleGrid?.();
      return true;
    },
    t: (e) => {
      if (isTyping(e)) return false;
      e.preventDefault();
      onToggleTab?.();
      return true;
    },
    r: (e) => {
      if (mod(e) || e.altKey) return false;
      e.preventDefault();
      armed ? (disarm(), onReset?.()) : arm();
      return true;
    },
    "[": (e) => {
      if (isTyping(e)) return false;
      e.preventDefault();
      onPrevCategory?.();
      return true;
    },
    "]": (e) => {
      if (isTyping(e)) return false;
      e.preventDefault();
      onNextCategory?.();
      return true;
    },
    ArrowUp: (e) => {
      if (isTyping(e) || !mod(e)) return false;
      e.preventDefault();
      onPrevType?.();
      return true;
    },
    ArrowDown: (e) => {
      if (isTyping(e) || !mod(e)) return false;
      e.preventDefault();
      onNextType?.();
      return true;
    },
    Escape: () => {
      if (armed) {
        disarm();
        return true;
      }
      if (showHelp) {
        setShowHelp(false);
        return true;
      }
      return false;
    },
    "?": (e) => {
      if (isTyping(e) && e.shiftKey) return false;
      e.preventDefault();
      setShowHelp(true);
      return true;
    },
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isTyping(e) && e.key !== "Escape" && e.key !== "Enter") {
      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault();
        setShowHelp(true);
      }
      return;
    }

    if (/^[1-8]$/.test(e.key) && !mod(e) && !e.altKey) {
      const idx = parseInt(e.key) - 1;
      if (idx < trayIcons.length) {
        e.preventDefault();
        onSelectTraySlot?.(idx);
      }
      return;
    }

    shortcuts[e.key]?.(e);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

export const KEYBOARD_SHORTCUTS = [
  {
    category: "Actions",
    items: [
      { key: "⌘C / Ctrl+C", desc: "Copy SVG" },
      { key: "⌘E / Ctrl+E", desc: "Export" },
      { key: "⌘Z / Ctrl+Z", desc: "Undo" },
      { key: "⌘⇧Z / Ctrl+Shift+Z", desc: "Redo" },
      { key: "G", desc: "Toggle Grid" },
      { key: "T", desc: "Toggle Props/Motion" },
      { key: "R", desc: "Reset (press twice)" },
    ],
  },
  {
    category: "Navigation",
    items: [
      { key: "[ / ]", desc: "Prev / Next Category" },
      { key: "⌘↑ / ⌘↓", desc: "Prev / Next Style" },
    ],
  },
  {
    category: "Tray",
    items: [{ key: "1–8", desc: "Select slot" }],
  },
  {
    category: "Help",
    items: [
      { key: "?", desc: "Shortcuts" },
      { key: "Esc", desc: "Close / Cancel" },
    ],
  },
] as const;
