import { useState, useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useHistory } from "@/hooks/use-history";
import { CustomizationState } from "@/lib/types";
import { DEFAULT_STATE } from "@/constants/workspace";

interface UseWorkspaceStateOptions {
  enableKeyboardShortcuts?: boolean;
}

function createAdaptiveState(theme?: string): CustomizationState {
  const isDark = theme === "dark";
  const adaptiveColor = isDark ? "#ffffff" : "#000000";
  const adaptiveStop = isDark ? "#cccccc" : "#333333";

  return {
    ...DEFAULT_STATE,
    colors: [adaptiveColor],
    gradient: {
      ...DEFAULT_STATE.gradient,
      stops: [
        { color: adaptiveColor, position: 0 },
        { color: adaptiveStop, position: 100 },
      ],
    },
  };
}

function areStringArraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function areGradientStopsEqual(
  a: CustomizationState["gradient"]["stops"],
  b: CustomizationState["gradient"]["stops"],
) {
  return (
    a.length === b.length &&
    a.every(
      (stop, index) =>
        stop.color === b[index]?.color && stop.position === b[index]?.position,
    )
  );
}

function areGradientsEqual(
  a: CustomizationState["gradient"],
  b: CustomizationState["gradient"],
) {
  return (
    a.type === b.type &&
    a.angle === b.angle &&
    areGradientStopsEqual(a.stops, b.stops)
  );
}

export function useWorkspaceState(
  options: UseWorkspaceStateOptions = {},
) {
  const { enableKeyboardShortcuts = true } = options;
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<CustomizationState>(DEFAULT_STATE);
  const [hasInitializedTheme, setHasInitializedTheme] = useState(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const colorsManuallySetRef = useRef(false);
  const customIconsRef = useRef<
    Array<{ id: string; name: string; url: string }>
  >([]);
  const lastResolvedThemeRef = useRef<string | undefined>(undefined);

  const { history, historyIndex, handleUndo, handleRedo, pushState, canUndo, canRedo } =
    useHistory<CustomizationState>(DEFAULT_STATE, {
      maxHistory: 50,
      enableKeyboardShortcuts,
    });

  useEffect(() => {
    if (typeof window === "undefined" || hasLoadedFromStorage) return;

    try {
      const savedState = localStorage.getItem("rune_workspace_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          motion: { ...DEFAULT_STATE.motion, ...(parsed.motion ?? {}) },
          shadow: { ...DEFAULT_STATE.shadow, ...(parsed.shadow ?? {}) },
          noise: { ...DEFAULT_STATE.noise, ...(parsed.noise ?? {}) },
          texture: { ...DEFAULT_STATE.texture, ...(parsed.texture ?? {}) },
          gradient: { ...DEFAULT_STATE.gradient, ...(parsed.gradient ?? {}) },
        });
      }
    } catch (error) {
      console.error("Failed to load state from storage:", error);
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, [hasLoadedFromStorage]);

  useEffect(() => {
    if (!hasLoadedFromStorage) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem("rune_workspace_state", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save state to storage:", error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state, hasLoadedFromStorage]);

  const lastHistoryIndexRef = useRef(historyIndex);
  const lastStateRef = useRef<CustomizationState>(state);
  useEffect(() => {
    if (historyIndex !== lastHistoryIndexRef.current) {
      lastHistoryIndexRef.current = historyIndex;
      const historicalState = history[historyIndex];
      lastStateRef.current = historicalState;
      setState(historicalState);
      return;
    }

    if (state !== lastStateRef.current) {
      const timeoutId = setTimeout(() => {
        pushState(state);
        lastStateRef.current = state;
      }, 600);
      return () => clearTimeout(timeoutId);
    }
  }, [historyIndex, history, state, pushState]);

  useEffect(() => {
    customIconsRef.current = state.customIcons;
  }, [state.customIcons]);

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (resolvedTheme && !hasInitializedTheme && !localStorage.getItem("rune_workspace_state")) {
      const isDark = resolvedTheme === "dark";
      const adaptiveColor = isDark ? "#ffffff" : "#000000";
      const adaptiveStop = isDark ? "#cccccc" : "#333333";

      setState((prev: CustomizationState) => ({
        ...prev,
        colors: [adaptiveColor],
        gradient: {
          ...prev.gradient,
          stops: [
            { color: adaptiveColor, position: 0 },
            { color: adaptiveStop, position: 100 },
          ],
        },
      }));
      setHasInitializedTheme(true);
    }

    const adaptiveState = createAdaptiveState(resolvedTheme);
    const previousTheme = lastResolvedThemeRef.current;
    const previousAdaptiveState = previousTheme
      ? createAdaptiveState(previousTheme)
      : null;
    const currentState = lastStateRef.current;
    const shouldSyncAdaptivePalette =
      !colorsManuallySetRef.current &&
      (!previousAdaptiveState ||
        (areStringArraysEqual(currentState.colors, previousAdaptiveState.colors) &&
          areGradientsEqual(currentState.gradient, previousAdaptiveState.gradient)));

    lastResolvedThemeRef.current = resolvedTheme;

    if (!shouldSyncAdaptivePalette) {
      return;
    }

    setState((prev: CustomizationState) => ({
      ...prev,
      colors: adaptiveState.colors,
      gradient: adaptiveState.gradient,
    }));
  }, [resolvedTheme, hasInitializedTheme]);

  const handleChange = useCallback((updates: Partial<CustomizationState>) => {
    if ("colors" in updates || "gradient" in updates) {
      colorsManuallySetRef.current = true;
    }
    setState((prev: CustomizationState) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    colorsManuallySetRef.current = false;
    setState(createAdaptiveState(resolvedTheme));
  }, [resolvedTheme]);

  useEffect(() => {
    return () => {
      customIconsRef.current.forEach((icon) => {
        if (icon.url.startsWith("blob:")) {
          URL.revokeObjectURL(icon.url);
        }
      });
    };
  }, []);

  return {
    state,
    handleChange,
    handleReset,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  };
}
