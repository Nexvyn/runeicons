"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseHistoryOptions {
  maxHistory?: number;
  enableKeyboardShortcuts?: boolean;
}

interface UseHistoryReturn<T> {
  history: T[];
  historyIndex: number;
  handleUndo: () => void;
  handleRedo: () => void;
  pushState: (newState: T) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {},
): UseHistoryReturn<T> {
  const { maxHistory = 50, enableKeyboardShortcuts = true } = options;
  const [history, setHistory] = useState<T[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyIndexRef = useRef(0);
  const historyRef = useRef<T[]>([initialState]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const pushState = useCallback(
    (newState: T) => {
      const nextIndex = Math.min(historyIndexRef.current + 1, maxHistory - 1);
      setHistory((previous) => {
        const branchedHistory = previous.slice(0, historyIndexRef.current + 1);
        branchedHistory.push(newState);
        const cappedHistory = branchedHistory.slice(-maxHistory);
        historyRef.current = cappedHistory;
        return cappedHistory;
      });
      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);
    },
    [maxHistory],
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const nextIndex = historyIndexRef.current - 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const nextIndex = historyIndexRef.current + 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
  }, []);

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) return;

      const key = (event.key || "").toLowerCase();
      const hasModifier = event.metaKey || event.ctrlKey;
      if (!hasModifier) return;

      if (key === "z") {
        event.preventDefault();
        event.shiftKey ? handleRedo() : handleUndo();
      } else if (key === "y") {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcuts, handleUndo, handleRedo]);

  return {
    history,
    historyIndex,
    handleUndo,
    handleRedo,
    pushState,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}

export function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
    return true;
  }

  return new Set(["INPUT", "TEXTAREA", "SELECT"]).has(target.tagName);
}
