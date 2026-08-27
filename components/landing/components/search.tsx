"use client";
import { useState } from "react";
import type { ComponentType, SVGProps } from "react";

import { Search as SearchIcon } from "lucide-react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import type { IconType } from "@/lib/icons";
import type { IconData } from "@/lib/types";

import { DuotoneIcon } from "../../icons/DuotoneIcon";
import { FillIcon } from "../../icons/FillIcon";
import { GlassIcon } from "../../icons/GlassIcon";
import { NormalIcon } from "../../icons/NormalIcon";
import { PixelatedIcon } from "../../icons/PixelatedIcon";
import { Input } from "../../ui/input";
import { useLandingSearch } from "../hooks/use-landing-search";
import SpecimenPlate from "./specimen-plate";

type TypeIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_TYPES: { value: IconType; label: string; Icon: TypeIcon }[] = [
  { value: "normal", label: "Normal", Icon: NormalIcon },
  { value: "duotone", label: "Duotone", Icon: DuotoneIcon },
  { value: "fill", label: "Fill", Icon: FillIcon },
  { value: "pixelated", label: "Pixelated", Icon: PixelatedIcon },
  { value: "glass", label: "Glass", Icon: GlassIcon },
];

const HIGHLIGHT_CLASS =
  "absolute inset-0 rounded-xl bg-zinc-100 shadow-[0.222px_0.222px_0.314px_-0.5px_rgba(0,0,0,0.2),0.605px_0.605px_0.856px_-1px_rgba(0,0,0,0.18),1.329px_1.329px_1.88px_-1.5px_rgba(0,0,0,0.25),2.95px_2.95px_4.172px_-2px_rgba(0,0,0,0.1),2.5px_2.5px_3px_-2.5px_rgba(0,0,0,0.15),-0.5px_-0.5px_0px_rgba(0,0,0,0.1),inset_0.5px_0.5px_1px_#FFFFFF,inset_-0.5px_-0.5px_1px_rgba(0,0,0,0.15)] dark:bg-zinc-800 dark:shadow-[0.222px_0.222px_0.314px_-0.5px_rgba(0,0,0,0.35),0.605px_0.605px_0.856px_-1px_rgba(0,0,0,0.3),1.329px_1.329px_1.88px_-1.5px_rgba(0,0,0,0.35),2.95px_2.95px_4.172px_-2px_rgba(0,0,0,0.28),2.5px_2.5px_3px_-2.5px_rgba(0,0,0,0.35),inset_0.5px_0.5px_1px_rgba(255,255,255,0.08),inset_-0.5px_-0.5px_1px_rgba(0,0,0,0.4)]";

const Search = () => {
  const [iconType, setIconType] = useState<IconType>("normal");
  const [interacting, setInteracting] = useState(false);
  const [previewed, setPreviewed] = useState<IconData | undefined>(undefined);
  const shouldReduceMotion = useReducedMotion();
  const { query, setQuery, results } = useLandingSearch(iconType, 25);

  const specimen = previewed ?? (query.trim() ? results[0] : undefined);

  return (
    <div
      className="flex h-full flex-col gap-5 py-6 lg:flex-row"
      onPointerEnter={() => setInteracting(true)}
      onPointerLeave={() => setInteracting(false)}
    >
      <div className="min-h-[400px] lg:min-h-0 lg:w-1/2">
        <SpecimenPlate
          iconType={iconType}
          onChange={setIconType}
          paused={interacting}
          icon={specimen}
        />
      </div>

      <div className="lg:w-1/2">
        <div
          className="flex h-full w-full items-center justify-center rounded-2xl bg-center bg-no-repeat p-6 max-sm:p-2 md:p-10"
          style={{
            backgroundImage: "url('/landing/gradient/search-gradient2.png')",
            backgroundSize: "cover",
          }}
        >
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-border/50 bg-background/20 p-4 shadow-lg backdrop-blur-[2px]">
              <div className="flex h-11 items-center overflow-hidden rounded-xl border border-input bg-background/80 focus-within:ring-2 focus-within:ring-ring/50">
                <div className="flex h-full items-center px-3 text-muted-foreground dark:text-white/80">
                  <SearchIcon className="h-4 w-4" />
                </div>
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPreviewed(undefined);
                  }}
                  placeholder="Search for icons..."
                  className="h-full flex-1 rounded-r-xl border-0 bg-transparent pr-4 pl-2 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 dark:text-white dark:placeholder:text-white/70"
                />
              </div>

              <div className="mt-4 mb-3 flex min-h-[200px] flex-col sm:mt-6 sm:mb-4 sm:min-h-[460px] md:min-h-[330px]">
                {results.length > 0 ? (
                  <div className="grid flex-1 grid-cols-3 content-start justify-items-center gap-2 px-1 sm:grid-cols-4 sm:gap-3 sm:px-0 md:grid-cols-5">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {results.map((icon, index) => (
                        <m.div
                          key={icon.id}
                          layout={!shouldReduceMotion}
                          className={`flex w-14 flex-col items-center gap-1 ${
                            index >= 9 ? "hidden sm:flex" : ""
                          }`}
                          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.18,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          <button
                            type="button"
                            aria-label={`Preview ${icon.name}`}
                            onPointerEnter={() => setPreviewed(icon)}
                            onFocus={() => setPreviewed(icon)}
                            onClick={() => setPreviewed(icon)}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-muted/50 transition-colors hover:bg-muted"
                          >
                            {icon.url && (
                              <m.img
                                key={icon.url}
                                src={icon.url}
                                alt={icon.name}
                                className={`h-5 w-5 ${
                                  iconType === "duotone" ? "brightness-0 dark:brightness-100" : ""
                                }`}
                                loading="lazy"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                              />
                            )}
                          </button>
                          <span className="w-full truncate text-center text-[10px] text-white/85">
                            {icon.name}
                          </span>
                        </m.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-[12px] text-white/80">
                    No icons match &ldquo;{query}&rdquo;.
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-border/40 pt-4">
                <div className="rounded-xl bg-white dark:bg-zinc-900">
                  <div className="flex w-full gap-1 rounded-xl bg-black/10 p-1 shadow-[0px_1px_0px_rgba(255,255,255,0.25),inset_0px_1px_2px_rgba(0,0,0,0.15)] dark:bg-white/10 dark:shadow-[0px_1px_0px_rgba(0,0,0,0.25),inset_0px_1px_2px_rgba(255,255,255,0.08)]">
                    {ICON_TYPES.map(({ value, label, Icon }) => {
                      const isActive = iconType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={label}
                          title={label}
                          onClick={() => setIconType(value)}
                          className="relative flex flex-1 cursor-pointer items-center justify-center py-2.5 transition-transform duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97]"
                        >
                          {isActive && (
                            <m.div
                              layoutId="landing-search-type"
                              className={HIGHLIGHT_CLASS}
                              transition={
                                shouldReduceMotion
                                  ? { duration: 0 }
                                  : { type: "spring", stiffness: 500, damping: 40 }
                              }
                            />
                          )}
                          <span
                            className={`relative z-10 ${
                              isActive ? "text-black dark:text-white" : "text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
