"use client";

import { useEffect, useRef, useState } from "react";

import type { Transition } from "motion/react";
import * as m from "motion/react-m";

import { DuotoneIcon } from "@/components/icons/DuotoneIcon";
import { FillIcon } from "@/components/icons/FillIcon";
import { GlassIcon } from "@/components/icons/GlassIcon";
import { NormalIcon } from "@/components/icons/NormalIcon";
import { PixelatedIcon } from "@/components/icons/PixelatedIcon";

interface Variant {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const VARIANTS: Variant[] = [
  {
    id: "normal",
    title: "Normal",
    description: "Clean strokes for everyday UI.",
    Icon: NormalIcon,
  },
  {
    id: "duotone",
    title: "Duotone",
    description: "Layered tones for visual depth.",
    Icon: DuotoneIcon,
  },
  {
    id: "fill",
    title: "Fill",
    description: "Solid weight for emphasis.",
    Icon: FillIcon,
  },
  {
    id: "pixelated",
    title: "Pixelated",
    description: "Retro 8-bit nostalgia.",
    Icon: PixelatedIcon,
  },
  {
    id: "glass",
    title: "Glass",
    description: "Glossy 3D translucency.",
    Icon: GlassIcon,
  },
];

const VISIBLE = 3;
const CARD_HEIGHT = 96;
const STACK_OFFSET = 14;
const WIDTH_SHRINK = 24;
const BASE_WIDTH = 340;

const GHOST_LIFETIME_MS = 450;
const SETTLE_MS = 520;
const FILL_MS = 1800;
const HOLD_MS = 400;

const IconVarietyShowcase = () => {
  const [order, setOrder] = useState(() =>
    Array.from({ length: VARIANTS.length }, (_, i) => i),
  );
  const [phase, setPhase] = useState<"settling" | "filling" | "exiting">(
    "settling",
  );
  const [displayProgress, setDisplayProgress] = useState(0);
  const [ghost, setGhost] = useState<{ idx: number; progress: number } | null>(
    null,
  );
  const [appearCard, setAppearCard] = useState<{
    idx: number;
    phase: "start" | "end";
  } | null>(null);

  const orderRef = useRef(order);
  const displayProgressRef = useRef(displayProgress);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);
  useEffect(() => {
    displayProgressRef.current = displayProgress;
  }, [displayProgress]);

  useEffect(() => {
    let phaseTimer: ReturnType<typeof setTimeout> | null = null;

    if (phase === "settling") {
      phaseTimer = setTimeout(() => setPhase("filling"), SETTLE_MS);
    } else if (phase === "filling") {
      phaseTimer = setTimeout(() => setPhase("exiting"), FILL_MS + HOLD_MS);
    } else if (phase === "exiting") {
      const top = orderRef.current[0];
      const newBackIdx =
        orderRef.current[VISIBLE % orderRef.current.length] ?? top;

      setGhost({ idx: top, progress: displayProgressRef.current });
      setOrder(([first, ...rest]) => [...rest, first]);
      setDisplayProgress(0);
      setAppearCard({ idx: newBackIdx, phase: "start" });

      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setAppearCard({ idx: newBackIdx, phase: "end" }),
        ),
      );

      setPhase("settling");
    }

    return () => {
      if (phaseTimer) clearTimeout(phaseTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (!ghost) return;
    const timer = setTimeout(() => setGhost(null), GHOST_LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [ghost]);

  useEffect(() => {
    if (appearCard?.phase !== "end") return;
    const t = setTimeout(() => setAppearCard(null), 350);
    return () => clearTimeout(t);
  }, [appearCard]);

  useEffect(() => {
    if (phase !== "filling") return;
    const startTime = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const elapsed = Math.min(now - startTime, FILL_MS);
      setDisplayProgress(Math.round((100 * elapsed) / FILL_MS));
      if (elapsed < FILL_MS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const visibleOrder = order.slice(0, VISIBLE);
  const stackHeight = CARD_HEIGHT + (VISIBLE - 1) * STACK_OFFSET;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="relative"
        style={{ width: BASE_WIDTH, height: stackHeight + 32 }}
      >
        <div
          className="absolute left-0"
          style={{ top: 16, width: BASE_WIDTH, height: stackHeight }}
        >
          {ghost && (
            <m.div
              key={`ghost-${ghost.idx}`}
              className="absolute overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              initial={{
                top: 0,
                left: 0,
                width: BASE_WIDTH,
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              animate={{
                top: -28,
                opacity: 0,
                scale: 1.04,
                filter: "blur(8px)",
              }}
              transition={{ duration: 0.4, ease: "easeIn" }}
              style={{ height: CARD_HEIGHT, zIndex: VISIBLE + 1 }}
            >
              <CardContent variant={VARIANTS[ghost.idx]} />
            </m.div>
          )}

          {visibleOrder.map((cardIdx, stackPos) => {
            const isTop = stackPos === 0;
            const isAppearStart =
              appearCard?.idx === cardIdx && appearCard.phase === "start";
            const isAppearEnd =
              appearCard?.idx === cardIdx && appearCard.phase === "end";
            const topOffset = stackPos * STACK_OFFSET;
            const widthShrink = stackPos * WIDTH_SHRINK;
            const cardWidth = BASE_WIDTH - widthShrink;

            const animateValues = isAppearStart
              ? {
                  top: topOffset,
                  left: widthShrink / 2,
                  width: cardWidth,
                  opacity: 0,
                  scale: 0.85,
                  filter: "blur(3px)",
                }
              : {
                  top: topOffset,
                  left: widthShrink / 2,
                  width: cardWidth,
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                };

            const transitionValues: Transition = isAppearStart
              ? { duration: 0 }
              : isAppearEnd
                ? { duration: 0.3, ease: "easeOut" as const }
                : { duration: 0.45, ease: "easeInOut" as const };

            return (
              <m.div
                key={cardIdx}
                className="absolute overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                initial={false}
                animate={animateValues}
                transition={transitionValues}
                style={{ height: CARD_HEIGHT, zIndex: VISIBLE - stackPos }}
              >
                {isTop && (
                  <m.div
                    className="h-full"
                    initial={false}
                    animate={{ opacity: ghost ? 0 : 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <CardContent variant={VARIANTS[cardIdx]} />
                  </m.div>
                )}
              </m.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function CardContent({ variant }: { variant: Variant }) {
  const Icon = variant.Icon;
  return (
    <div className="flex h-full items-center gap-4 px-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-9 w-9 text-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[18px] leading-tight font-semibold text-foreground">
          {variant.title}
        </span>
        <span className="truncate text-[13px] leading-snug text-muted-foreground">
          {variant.description}
        </span>
      </div>
    </div>
  );
}

export { IconVarietyShowcase };
