"use client";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export const NAME_TAG_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 35,
} as const;

interface IconNameTagProps {
  label: string;
  above?: boolean;
  fromX?: number;
  align?: "center" | "left" | "right";
  reduceMotion?: boolean;
}

export function IconNameTag({
  label,
  above,
  fromX = 0,
  align = "center",
  reduceMotion,
}: IconNameTagProps) {
  return (
    <motion.span
      layoutId="icon-grid-name-tag"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6, x: fromX, y: above ? 6 : -6 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, x: fromX, y: above ? 6 : -6 }}
      transition={reduceMotion ? { duration: 0 } : NAME_TAG_SPRING}
      className={cn(
        "pointer-events-none absolute z-30 rounded-md bg-white px-3 py-1.5 text-xs leading-none font-medium whitespace-nowrap text-zinc-900 shadow-xl dark:bg-[#111111] dark:text-white",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "left" && "left-0 ml-1",
        align === "right" && "right-0 mr-1",
        above ? "bottom-full mb-2" : "top-full mt-2",
      )}
      aria-hidden="true"
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute h-1.5 w-1.5 rotate-45 bg-white dark:bg-[#111111]",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "left" && "left-3",
          align === "right" && "right-3",
          above ? "-bottom-[3px]" : "-top-[3px]",
        )}
      />
    </motion.span>
  );
}
