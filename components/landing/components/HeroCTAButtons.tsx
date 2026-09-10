"use client";


import { useState } from "react";
import Link from "next/link";

import { Github } from "lucide-react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { DuotoneIcon } from "../../icons/DuotoneIcon";
import { FillIcon } from "../../icons/FillIcon";
import { GlassIcon } from "../../icons/GlassIcon";
import { NormalIcon } from "../../icons/NormalIcon";
import { PixelatedIcon } from "../../icons/PixelatedIcon";
import { Button } from "../../ui/button";
import Mascot from "../svg/mascot";

const MOTION = {
  iconsSpring: { type: "spring", visualDuration: 0.38, bounce: 0.18 },
  iconsStagger: 0.035,
  mascotSpring: { type: "spring", visualDuration: 0.42, bounce: 0.2 },
} as const;

const BROWSE_ICON_TYPES = [
  { Icon: NormalIcon, label: "Normal" },
  { Icon: DuotoneIcon, label: "Duotone" },
  { Icon: FillIcon, label: "Fill" },
  { Icon: PixelatedIcon, label: "Pixelated" },
  { Icon: GlassIcon, label: "Glass" },
] as const;

const FAN_RADIUS = 80;

export function BrowseIconsButton() {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link
      href="/icons"
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Button className="py-5 active:scale-[0.97]">Browse Icons</Button>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 block h-0 w-0 translate-y-10"
      >
        {BROWSE_ICON_TYPES.map(({ Icon, label }, i, arr) => {
          const angle = ((-50 + (100 / (arr.length - 1)) * i) * Math.PI) / 180;
          const endX = (FAN_RADIUS * Math.sin(angle)).toFixed(1);
          const endY = (-FAN_RADIUS * Math.cos(angle)).toFixed(1);
          const offsetPath = `path('M 0 0 Q 0 -${FAN_RADIUS}, ${endX} ${endY}')`;

          const enterDelay = i * MOTION.iconsStagger;
          const exitDelay = (arr.length - 1 - i) * MOTION.iconsStagger;

          return (
            <m.span
              key={label}
              className="absolute top-0 left-0 block h-6 w-6"
              style={{ offsetPath, offsetRotate: "0deg" }}
              initial={false}
              animate={{
                offsetDistance: hovered ? "100%" : "0%",
                opacity: hovered ? 1 : 0,
                scale: hovered ? 1 : 0.6,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { ...MOTION.iconsSpring, delay: hovered ? enterDelay : exitDelay }
              }
            >
              <Icon className="block h-full w-full text-foreground" />
            </m.span>
          );
        })}
      </span>
    </Link>
  );
}

export function GithubStarButton() {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link
      href="https://github.com/rune-icon/runeicons"
      target="_blank"
      rel="noopener noreferrer"
      className="relative isolate inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <m.span
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 -z-10 block w-11 origin-bottom-left [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
        initial={false}
        animate={{
          x: hovered ? "50%" : 0,
          y: hovered ? -16 : 4,
          rotate: hovered ? 45 : 0,
        }}
        transition={shouldReduceMotion ? { duration: 0 } : MOTION.mascotSpring}
      >
        <Mascot />
      </m.span>
      <Button
        variant="outline"
        className="relative z-10 py-5 active:scale-[0.97] dark:hover:bg-muted"
      >
        Star On Github <Github />
      </Button>
    </Link>
  );
}
