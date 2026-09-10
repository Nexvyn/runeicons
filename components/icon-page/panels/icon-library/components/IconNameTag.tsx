"use client";
import { CSSProperties } from "react";

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
  align?: "center" | "left" | "right";
  left?: number;
  right?: number;
  top?: number;
  reduceMotion?: boolean;
}

export function IconNameTag({
  label,
  above,
  align = "center",
  left,
  right,
  top,
  reduceMotion,
}: IconNameTagProps) {
  const style: CSSProperties = {};
  if (left !== undefined) style.left = left;
  if (right !== undefined) style.right = right;
  if (top !== undefined) style.top = top;

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              scale: 1,
              left: left ?? "auto",
              right: right ?? "auto",
              top: top ?? "auto",
            }
      }
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
      transition={reduceMotion ? { duration: 0 } : NAME_TAG_SPRING}
      style={style}
      className={cn(
        "pointer-events-none absolute z-30 rounded-md bg-white px-3 py-1.5 text-xs leading-none font-medium whitespace-nowrap text-zinc-900 shadow-xl dark:bg-[#111111] dark:text-white",
        align === "center" && "-translate-x-1/2",
        above ? "-translate-y-[calc(100%+8px)]" : "translate-y-2",
      )}
      aria-hidden="true"
    >
      {label}
    </motion.span>
  );
}
