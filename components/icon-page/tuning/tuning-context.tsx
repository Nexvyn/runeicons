"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_TUNING = {
  buttonPressScale: 0.97,
  buttonHoverScale: 1.02,
  springStiffness: 400,
  springDamping: 30,
  springBounce: 0.15,
  fastDuration: 0.15,
  mediumDuration: 0.2,
  slowDuration: 0.28,
  easeOutX1: 0.23,
  easeOutY1: 1,
  easeOutX2: 0.32,
  easeOutY2: 1,
  entryScale: 0.95,
  entryYOffset: 8,
  staggerDelay: 0.01,
  staggerMaxDelay: 0.04,
  cardSpringStiffness: 400,
  cardSpringDamping: 30,
  modeSwitchDuration: 0.15,
  modeSwitchDistance: 8,
  chevronDuration: 0.2,
  iconTrayEntryScale: 0.95,
  iconTrayEntryY: 8,
  iconTrayHoverScale: 1.1,
  iconTraySpringStiffness: 500,
  iconTraySpringDamping: 30,
  morphPaddingDuration: 0.2,
  morphSpringVisualDuration: 0.3,
  morphSpringBounce: 0.1,
  iconGridHoverScale: 1.1,
  iconGridStaggerDelay: 0.005,
  scrubberSpringStiffness: 400,
  scrubberSpringDamping: 25,
};

type TuningValues = typeof DEFAULT_TUNING;

interface TuningContextType {
  values: TuningValues;
  updateValue: <K extends keyof TuningValues>(
    key: K,
    value: TuningValues[K],
  ) => void;
  resetAll: () => void;
  getEaseOut: () => [number, number, number, number];
  getSpring: (override?: {
    stiffness?: number;
    damping?: number;
    bounce?: number;
  }) => {
    type: "spring";
    stiffness: number;
    damping: number;
    bounce?: number;
  };
  getFastTransition: () => {
    duration: number;
    ease: [number, number, number, number];
  };
  getMediumTransition: () => {
    duration: number;
    ease: [number, number, number, number];
  };
  getSlowTransition: () => {
    duration: number;
    ease: [number, number, number, number];
  };
}

const TuningContext = createContext<TuningContextType | null>(null);
const STORAGE_KEY = "rune-animation-tuning";

export function TuningProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<TuningValues>(DEFAULT_TUNING);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<TuningValues>;
      setValues({ ...DEFAULT_TUNING, ...parsed });
    } catch (error) {
      console.warn("Failed to restore animation tuning:", error);
    }
  }, []);

  const updateValue = useCallback(
    <K extends keyof TuningValues>(key: K, value: TuningValues[K]) => {
      setValues((previous) => {
        const next = { ...previous, [key]: value };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
          console.warn("Failed to save animation tuning:", error);
        }
        return next;
      });
    },
    [],
  );

  const resetAll = useCallback(() => {
    setValues(DEFAULT_TUNING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear animation tuning:", error);
    }
  }, []);

  const getEaseOut = useCallback(
    () =>
      [
        values.easeOutX1,
        values.easeOutY1,
        values.easeOutX2,
        values.easeOutY2,
      ] as [number, number, number, number],
    [values],
  );

  const getSpring = useCallback(
    (override?: {
      stiffness?: number;
      damping?: number;
      bounce?: number;
    }) => ({
      type: "spring" as const,
      stiffness: override?.stiffness ?? values.springStiffness,
      damping: override?.damping ?? values.springDamping,
      bounce: override?.bounce ?? values.springBounce,
    }),
    [values],
  );

  const getFastTransition = useCallback(
    () => ({ duration: values.fastDuration, ease: getEaseOut() }),
    [values.fastDuration, getEaseOut],
  );
  const getMediumTransition = useCallback(
    () => ({ duration: values.mediumDuration, ease: getEaseOut() }),
    [values.mediumDuration, getEaseOut],
  );
  const getSlowTransition = useCallback(
    () => ({ duration: values.slowDuration, ease: getEaseOut() }),
    [values.slowDuration, getEaseOut],
  );

  return (
    <TuningContext.Provider
      value={{
        values,
        updateValue,
        resetAll,
        getEaseOut,
        getSpring,
        getFastTransition,
        getMediumTransition,
        getSlowTransition,
      }}
    >
      {children}
    </TuningContext.Provider>
  );
}

export function useTuning() {
  const context = useContext(TuningContext);
  if (!context) {
    throw new Error("useTuning must be used within TuningProvider");
  }
  return context;
}

export { DEFAULT_TUNING };
export type { TuningValues };
