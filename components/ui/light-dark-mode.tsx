"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

import { Button } from "./button";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const DURATION_IN = 0.25;
const DURATION_OUT = 0.2;

const ICON_VARIANTS = {
  initial: { rotate: 45, scale: 0.6, opacity: 0 },
  animate: { rotate: 0, scale: 1, opacity: 1 },
  exit: { rotate: -45, scale: 0.6, opacity: 0 },
} as const;

export function LightDarkMode({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={className} disabled>
        <Sun className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        <AnimatePresence initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            className="absolute inset-0 inline-flex items-center justify-center"
            variants={ICON_VARIANTS}
            initial={shouldReduceMotion ? false : "initial"}
            animate="animate"
            exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: DURATION_IN,
                    ease: EASE_OUT_QUART,
                    opacity: { duration: DURATION_OUT, ease: EASE_OUT_QUART },
                  }
            }
          >
            {isDark ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
    </Button>
  );
}
