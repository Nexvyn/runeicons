"use client";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Diamond, Github, Hammer, Paintbrush, Rocket, Sparkles, Zap } from "lucide-react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { Button } from "@/components/ui/button";

import Mascot from "../svg/mascot";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const ENTRANCE_DURATION = 0.35;
const HOVER_DURATION = 0.15;

const CTA = () => {
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const mascotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mascotRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStage(2);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const icons = [
    { icon: Rocket, x: "10%", y: "20%", size: 32, delay: 0 },
    { icon: Sparkles, x: "85%", y: "15%", size: 24, delay: 1 },
    { icon: Paintbrush, x: "15%", y: "75%", size: 28, delay: 2 },
    { icon: Diamond, x: "80%", y: "70%", size: 26, delay: 0.5 },
    { icon: Hammer, x: "50%", y: "10%", size: 22, delay: 1.5 },
    { icon: Zap, x: "25%", y: "40%", size: 20, delay: 3 },
  ];

  return (
    <section className="relative h-full w-full overflow-hidden rounded-3xl py-24">
      <Image
        src="/landing/gradient/cta-gradient.png"
        className="absolute inset-0 h-full w-full object-cover"
        alt=""
        fill
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-[0.03] dark:opacity-[0.05]">
          <svg
            preserveAspectRatio="none"
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>

        {icons.map((item, i) => (
          <m.div
            key={`${item.x}-${item.y}`}
            className="text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.25, x: 0, y: 0, rotate: 0 }
                : {
                    opacity: [0.1, 0.4, 0.1],
                    y: [0, -15, 0],
                    x: [0, 10, 0],
                    rotate: [0, 10, -10, 0],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: 6 + i,
                    repeat: Infinity,
                    delay: item.delay,
                    ease: "linear",
                  }
            }
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
            }}
          >
            <item.icon size={item.size} strokeWidth={1.5} />
          </m.div>
        ))}
      </div>
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div ref={mascotRef} data-stage={stage} className="mb-3 h-20 w-20 rotate-2">
          <m.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 46, scaleX: 1, scaleY: 1 }}
            whileInView={{
              opacity: [0, 1, 1, 1],
              y: [46, 0, -9, 0],
              scaleY: [1, 0.88, 1.05, 1],
              scaleX: [1, 1.1, 0.97, 1],
            }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, times: [0, 0.55, 0.8, 1], ease: EASE_OUT_QUART }}
            className="h-full w-full origin-bottom"
          >
            <Mascot stage={stage} />
          </m.div>
        </div>
        <m.h2
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: ENTRANCE_DURATION, ease: EASE_OUT_QUART, delay: 0.08 }}
          className="mb-8 text-3xl leading-[1.1] font-medium tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
        >
          <span className="bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent">
            900+ icons. Five styles. Free forever.
          </span>
        </m.h2>

        <m.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: ENTRANCE_DURATION, ease: EASE_OUT_QUART, delay: 0.18 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <m.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: HOVER_DURATION, ease: EASE_OUT_QUART }}
            onMouseEnter={() => setStage(3)}
            onMouseLeave={() => setStage(2)}
          >
            <Link href="/icons">
              <Button size="lg" variant="default">
                Browse Icons
              </Button>
            </Link>
          </m.div>
          <m.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: HOVER_DURATION, ease: EASE_OUT_QUART }}
            onMouseEnter={() => setStage(4)}
            onMouseLeave={() => setStage(2)}
          >
            <Link
              href="https://github.com/Nexvyn/runeicons"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="secondary">
                Star On GitHub <Github />
              </Button>
            </Link>
          </m.div>
        </m.div>

        <m.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: ENTRANCE_DURATION, ease: EASE_OUT_QUART, delay: 0.3 }}
          className="mt-8 max-w-md text-sm text-white/70"
        >
          Every set I liked had one style. Mine has five, all editable.
          <span className="mt-2 block font-medium text-white/85">Nexvyn</span>
        </m.p>
      </div>
    </section>
  );
};

export default CTA;
