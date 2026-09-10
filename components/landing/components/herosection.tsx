"use client";

import { type CSSProperties, useEffect, useState } from "react";

import Link from "next/link";

import NumberFlow from "@number-flow/react";
import { Check, Github } from "lucide-react";

import { DuotoneIcon } from "../../icons/DuotoneIcon";
import { FillIcon } from "../../icons/FillIcon";
import { GlassIcon } from "../../icons/GlassIcon";
import { NormalIcon } from "../../icons/NormalIcon";
import { PixelatedIcon } from "../../icons/PixelatedIcon";
import { Button } from "../../ui/button";
import HeroSvg from "../svg/hero";
import Mascot from "../svg/mascot";
import { TOTAL_ICON_COUNT } from "@/lib/icons";

const browseIconTypes = [
  { Icon: NormalIcon, label: "Normal" },
  { Icon: DuotoneIcon, label: "Duotone" },
  { Icon: FillIcon, label: "Fill" },
  { Icon: PixelatedIcon, label: "Pixelated" },
  { Icon: GlassIcon, label: "Glass" },
] as const;

const FAN_RADIUS = 80;
const FAN_SPREAD_DEG = 100;
const FAN_STAGGER_MS = 45;

const HeroSection = () => {
  const [iconCount, setIconCount] = useState(0);

  useEffect(() => {
    setIconCount(Math.floor(TOTAL_ICON_COUNT / 100) * 100);
  }, []);

  return (
    <div className="grid min-h-[60vh] grid-cols-1 gap-10 lg:h-[calc(100vh-104px)] lg:max-h-[780px] lg:grid-cols-2 lg:gap-6">
      <div className="flex h-full flex-col justify-center py-8 lg:py-0">
        <div className="flex w-fit -rotate-2 items-center gap-2 rounded-md border p-0.5 pl-2.5 text-xs">
          <span className="flex items-center font-semibold">
            <span className="text-blue-700">Added&nbsp;</span>
            <NumberFlow value={iconCount} suffix="+" />
            <span>&nbsp;icons</span>
          </span>
          <div className="rounded-sm border bg-background p-1">
            <Check size={15} />
          </div>
        </div>
        <div className="mt-4 text-2xl leading-tight font-medium sm:text-4xl sm:leading-none md:text-5xl lg:text-6xl">
          Modern <span className="text-blue-700">icon</span> <br />
          <span className="text-blue-700">system</span> for products
        </div>
        <div className="mt-4 max-w-lg text-xs leading-tight text-muted-foreground sm:text-sm sm:leading-5 md:text-base">
          One glyph, five moods: outline, duotone, fill, pixel, and glass. Tune it
          in your browser, paste it as SVG or JSX.
        </div>

        <div className="mt-8 flex flex-wrap gap-2 sm:gap-4">
          <Link href="/icons" className="group relative inline-block">
            <Button className="bg-brand py-5 text-white hover:bg-brand/90">Browse Icons</Button>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-1/2 block h-0 w-0 translate-y-10"
            >
              {browseIconTypes.map(({ Icon, label }, i, arr) => {
                const spreadDeg = -FAN_SPREAD_DEG / 2 + (FAN_SPREAD_DEG / (arr.length - 1)) * i;
                const angle = (spreadDeg * Math.PI) / 180;
                const endX = (FAN_RADIUS * Math.sin(angle)).toFixed(1);
                const endY = (-FAN_RADIUS * Math.cos(angle)).toFixed(1);
                return (
                  <span
                    key={label}
                    className="fan-dot absolute top-0 left-0 block h-6 w-6"
                    style={
                      {
                        offsetPath: `path('M 0 0 Q 0 -${FAN_RADIUS}, ${endX} ${endY}')`,
                        "--fan-delay": `${i * FAN_STAGGER_MS}ms`,
                      } as CSSProperties
                    }
                  >
                    <Icon className="block h-full w-full text-foreground" />
                  </span>
                );
              })}
            </span>
          </Link>
          <Link
            href="https://github.com/Nexvyn/runeicons"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative isolate inline-block"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 -z-10 block w-11 origin-bottom-left translate-y-1 transition-transform duration-300 ease-out group-hover:translate-x-1/2 group-hover:-translate-y-4 group-hover:rotate-45 group-hover:duration-420 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-1 motion-reduce:group-hover:rotate-0 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
            >
              <Mascot />
            </span>
            <Button className="relative py-5">
              Star On Github <Github />
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <HeroSvg />
      </div>
    </div>
  );
};

export default HeroSection;
