import Link from "next/link";

import { Check, Github } from "lucide-react";

import { DuotoneIcon } from "../../icons/DuotoneIcon";
import { FillIcon } from "../../icons/FillIcon";
import { GlassIcon } from "../../icons/GlassIcon";
import { NormalIcon } from "../../icons/NormalIcon";
import { PixelatedIcon } from "../../icons/PixelatedIcon";
import { Button } from "../../ui/button";
import HeroSvg from "../svg/hero";
import Mascot from "../svg/mascot";

const browseIconTypes = [
  { Icon: NormalIcon, label: "Normal" },
  { Icon: DuotoneIcon, label: "Duotone" },
  { Icon: FillIcon, label: "Fill" },
  { Icon: PixelatedIcon, label: "Pixelated" },
  { Icon: GlassIcon, label: "Glass" },
] as const;

const HeroSection = () => {
  return (
    <div className="grid min-h-[60vh] grid-cols-1 lg:h-[calc(100vh-64px)] lg:grid-cols-2">
      <div className="flex h-full flex-col justify-center py-8 lg:py-0">
        <div className="flex w-fit items-center gap-2 rounded-md border p-0.5 pl-2.5 text-xs">
          <span className="font-semibold">
            <span className="text-blue-700">Added </span>1000 icons
          </span>
          <div className="rounded-sm border bg-background p-1">
            <Check size={15} />
          </div>
        </div>
        <div className="xs:text-3xl mt-4 text-2xl leading-tight font-medium sm:text-4xl sm:leading-none md:text-5xl lg:text-6xl">
          Modern <span className="text-blue-700">icon</span> <br />{" "}
          <span className="text-blue-700">system</span> for products{" "}
        </div>
        <div className="mt-4 max-w-lg text-xs leading-tight text-muted-foreground sm:text-sm sm:leading-5 md:text-base">
          Consistent, lightweight, and production-ready icons designed to fit seamlessly into SaaS
          and AI interfaces.
        </div>

        <div className="mt-8 flex flex-wrap gap-2 sm:gap-4 lg:mt-14">
          <Link href="/icons" className="group relative inline-block">
            <Button className="py-5">Browse Icons</Button>
            <span className="pointer-events-none absolute bottom-full left-1/2 block h-0 w-0 translate-y-10">
              {browseIconTypes.map(({ Icon, label }, i, arr) => {
                const angle = ((-50 + (100 / (arr.length - 1)) * i) * Math.PI) / 180;
                const radius = 80;
                const endX = (radius * Math.sin(angle)).toFixed(1);
                const endY = (-radius * Math.cos(angle)).toFixed(1);
                return (
                  <span
                    key={label}
                    className="absolute top-0 left-0 block h-6 w-6 opacity-0 transition-[offset-distance,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [offset-distance:0%] [offset-rotate:0deg] group-hover:opacity-100 group-hover:[offset-distance:100%]"
                    style={{
                      offsetPath: `path('M 0 0 Q 0 -${radius}, ${endX} ${endY}')`,
                      transitionDelay: `${i * 70}ms`,
                    }}
                  >
                    <Icon className="block h-full w-full text-foreground" />
                  </span>
                );
              })}
            </span>
          </Link>
          <Link
            href="https://github.com/rune-icon/runeicons"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative isolate inline-block"
          >
            <span className="pointer-events-none absolute top-0 right-0 -z-10 block w-11 origin-bottom-left translate-y-1 transition-transform duration-300 ease-out group-hover:-translate-y-4 group-hover:translate-x-1/2 group-hover:rotate-45 group-hover:duration-420 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)] [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
              <Mascot />
            </span>
            <Button variant="outline" className="relative py-5">
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
