"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Compass, FileQuestion, Ghost, MapPinOff, Search } from "lucide-react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { Button } from "@/components/ui/button";

import MissingGlyph, { GLYPH_STYLES } from "./missing-glyph";

const AUTO_ADVANCE_MS = 2400;

const FLOATERS = [
  { Icon: Search, x: "6%", y: "12%", size: 30, delay: 0, hideOnMobile: true },
  { Icon: Ghost, x: "90%", y: "8%", size: 26, delay: 1.2, hideOnMobile: false },
  { Icon: Compass, x: "4%", y: "66%", size: 24, delay: 0.6, hideOnMobile: true },
  { Icon: MapPinOff, x: "88%", y: "62%", size: 26, delay: 2, hideOnMobile: false },
] as const;

const HAND = { fontFamily: "var(--font-caveat)" } as const;

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;

const NotFoundContent = () => {
  const shouldReduceMotion = useReducedMotion();
  const [styleIndex, setStyleIndex] = useState(0);
  const [cyclingPaused, setCyclingPaused] = useState(false);

  const { key, label } = GLYPH_STYLES[styleIndex];

  useEffect(() => {
    if (shouldReduceMotion || cyclingPaused) return;
    const timer = setInterval(
      () => setStyleIndex((i) => (i + 1) % GLYPH_STYLES.length),
      AUTO_ADVANCE_MS,
    );
    return () => clearInterval(timer);
  }, [shouldReduceMotion, cyclingPaused]);

  const advance = () => setStyleIndex((i) => (i + 1) % GLYPH_STYLES.length);

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="-rotate-2 flex w-fit items-center gap-2 rounded-md border p-0.5 pl-2.5 text-xs">
        <span className="flex items-center font-semibold">
          <span className="text-blue-700">404</span>
          <span>&nbsp;· lost glyph</span>
        </span>
        <div className="rounded-sm border bg-background p-1">
          <FileQuestion size={15} />
        </div>
      </div>

      <h1 className="sr-only">404 — Page not found</h1>

      <div className="relative mt-8 w-full">
        <div
          aria-hidden="true"
          className="flex items-center justify-center gap-[0.06em] text-[clamp(6rem,19vw,11.5rem)] leading-none font-semibold tracking-tighter"
        >
          <m.span
            key={`left-${key}`}
            initial={shouldReduceMotion ? false : { y: 3, opacity: 0.55 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
          >
            4
          </m.span>

          <m.button
            type="button"
            onClick={advance}
            onMouseEnter={() => setCyclingPaused(true)}
            onMouseLeave={() => setCyclingPaused(false)}
            onFocus={() => setCyclingPaused(true)}
            onBlur={() => setCyclingPaused(false)}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            aria-label={`Missing glyph shown in ${label} style. Activate to see the next style.`}
            className="relative size-[0.72em] cursor-pointer rounded-[0.14em] border-2 border-dashed border-foreground/30 bg-background transition-colors outline-none hover:border-foreground/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:border-foreground/40"
          >
            <span className="absolute -top-6 -left-7 text-base font-medium text-muted-foreground/60 select-none">
              +
            </span>
            <span className="absolute -right-7 -bottom-6 text-base font-medium text-muted-foreground/60 select-none">
              +
            </span>
            <m.span
              key={key}
              className="absolute inset-[11%] block"
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, scale: 0.6, rotate: -10 }
              }
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
            >
              <MissingGlyph style={key} className="h-full w-full" />
            </m.span>
          </m.button>

          <m.span
            key={`right-${key}`}
            initial={shouldReduceMotion ? false : { y: 3, opacity: 0.55 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
          >
            4
          </m.span>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {FLOATERS.map(({ Icon, x, y, size, delay, hideOnMobile }) => (
            <m.div
              key={`${x}-${y}`}
              className={`absolute text-muted-foreground/35 ${hideOnMobile ? "max-sm:hidden" : ""}`}
              initial={shouldReduceMotion ? { opacity: 0.25 } : false}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.25 }
                  : {
                      opacity: [0.2, 0.45, 0.2],
                      y: [0, -14, 0],
                      rotate: [0, 8, -6, 0],
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 6 + delay,
                      repeat: Infinity,
                      delay,
                      ease: "linear",
                    }
              }
              style={{ left: x, top: y }}
            >
              <Icon size={size} strokeWidth={1.5} />
            </m.div>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Missing glyph style: {label}
      </p>

      <div className="mt-6 flex items-center gap-2">
        <span
          key={label}
          className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs font-medium"
        >
          <span className="size-1.5 rounded-full bg-brand" />
          {label}
        </span>
        <span
          aria-hidden="true"
          className="-rotate-2 text-lg leading-none text-muted-foreground max-sm:hidden"
          style={HAND}
        >
          psst — click the glyph, it comes in five styles
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 60 24"
          className="h-5 w-14 -scale-y-100 text-muted-foreground max-sm:hidden"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 18 C 18 6, 36 4, 52 10" />
          <path d="M52 10 l-7 -0.5 M52 10 l-3.5 6" />
        </svg>
      </div>

      <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        This page never made it onto the sheet. We checked normal, duotone,
        fill, pixelated and glass — still nothing.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <m.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15, ease: EASE_OUT_QUART }}
        >
          <Link href="/icons">
            <Button className="bg-brand py-5 text-white hover:bg-brand/90">
              Browse Icons
            </Button>
          </Link>
        </m.div>
        <m.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15, ease: EASE_OUT_QUART }}
        >
          <Link href="/">
            <Button variant="outline" className="py-5">
              Back to home
            </Button>
          </Link>
        </m.div>
      </div>

      <Link
        href="/editor"
        prefetch={false}
        className="mt-5 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        or reshape a glyph in the editor
      </Link>
    </div>
  );
};

export default NotFoundContent;
