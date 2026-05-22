"use client";

import { useEffect, useState } from "react";

import { Atom, AudioLines, Bug, Cat, Flower2, Hop, Minus, Plus } from "lucide-react";
import * as m from "motion/react-m";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICONS = [
  { icon: Cat, name: "Cat" },
  { icon: Flower2, name: "Flower" },
  { icon: Bug, name: "Bug" },
  { icon: Atom, name: "Atom" },
  { icon: AudioLines, name: "Audio" },
  { icon: Hop, name: "Hop" },
];

const COLORS = [
  { value: "currentColor", label: "Default", bg: "bg-foreground" },
  { value: "#1346E7", label: "Blue", bg: "bg-blue-600" },
  { value: "#dc2626", label: "Red", bg: "bg-red-600" },
  { value: "#16a34a", label: "Green", bg: "bg-green-600" },
  { value: "#9333ea", label: "Purple", bg: "bg-purple-600" },
  { value: "#ea580c", label: "Orange", bg: "bg-orange-600" },
];

const ICON_GAP = 120;

const IconCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [iconSize, setIconSize] = useState(16);
  const [strokeColor, setStrokeColor] = useState("currentColor");
  const [animation, setAnimation] = useState("none");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ICONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (i: number) => {
    setActiveIndex(i);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 self-stretch">
      <div className="no-scrollbar flex h-12 items-center gap-2 overflow-x-auto mask-r-from-90% mask-l-from-90% px-4">
        <div className="flex h-8 shrink-0 items-center rounded-md border shadow-sm">
          <Select value={animation} onValueChange={setAnimation}>
            <SelectTrigger className="h-full w-24 shrink-0 justify-between gap-1 rounded-none border-none px-3 text-[10px] shadow-none transition-colors hover:bg-accent focus:ring-0 sm:text-xs">
              <SelectValue placeholder="Anim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Normal</SelectItem>
              <SelectItem value="spin">Spin</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex h-8 shrink-0 items-center rounded-md border bg-background shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-7 rounded-none border-none transition-colors hover:bg-accent"
            onClick={() => setStrokeWidth(Math.max(0.5, strokeWidth - 0.5))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="flex h-full w-8 items-center justify-center border-x bg-muted/10">
            <span className="font-mono text-[10px] font-medium text-muted-foreground">
              {strokeWidth}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-7 rounded-none border-none transition-colors hover:bg-accent"
            onClick={() => setStrokeWidth(Math.min(4, strokeWidth + 0.5))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex h-8 shrink-0 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setStrokeColor(c.value)}
              className={`h-3.5 w-3.5 rounded-full ${c.bg} border border-black/5 transition-all duration-200 ${
                strokeColor === c.value
                  ? "scale-110 shadow-sm ring-2 ring-foreground/20 ring-offset-1"
                  : "opacity-70 hover:scale-105 hover:opacity-100"
              }`}
              title={c.label}
            />
          ))}
        </div>

        <div className="ml-auto flex h-8 min-w-[110px] shrink-0 items-center gap-3 rounded-md border bg-background px-3 shadow-sm">
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap text-muted-foreground uppercase">
            Size
          </span>
          <SliderPrimitive.Root
            value={[iconSize]}
            onValueChange={([v]) => setIconSize(v)}
            min={10}
            max={24}
            step={1}
            className="relative flex h-4 w-14 cursor-pointer touch-none items-center select-none"
          >
            <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
              <SliderPrimitive.Range className="absolute h-full bg-foreground" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border border-border bg-background shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" />
          </SliderPrimitive.Root>
          <span className="w-4 text-right font-mono text-[10px] font-medium text-muted-foreground">
            {iconSize}
          </span>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center mask-r-from-70% mask-l-from-70%">
        <m.div
          className="absolute flex items-center justify-center"
          animate={{ x: -activeIndex * ICON_GAP, y: "-50%" }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          style={{ left: "50%", top: "50%", marginLeft: -ICON_GAP / 2 }}
        >
          {ICONS.map((item, i) => {
            const isActive = i === activeIndex;
            const dist = Math.abs(i - activeIndex);

            return (
              <m.div
                key={item.name}
                className="flex shrink-0 cursor-pointer items-center justify-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
                style={{ width: ICON_GAP }}
                animate={
                  isActive
                    ? {
                        opacity: 1,
                        rotate: animation === "spin" ? 360 : 0,
                        scale: animation === "pulse" ? 1.2 : 1,
                        y: animation === "bounce" ? -15 : 0,
                      }
                    : {
                        opacity: dist === 1 ? 0.3 : 0.12,
                        rotate: 0,
                        scale: 1,
                        y: 0,
                      }
                }
                transition={
                  isActive && animation !== "none"
                    ? {
                        opacity: { duration: 0.4 },
                        rotate:
                          animation === "spin"
                            ? { duration: 3, repeat: Infinity, ease: "linear" }
                            : { duration: 0.4 },
                        scale:
                          animation === "pulse"
                            ? {
                                duration: 0.8,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                              }
                            : { duration: 0.4 },
                        y:
                          animation === "bounce"
                            ? {
                                duration: 0.8,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                              }
                            : { duration: 0.4 },
                      }
                    : {
                        duration: 0.4,
                        ease: "easeOut",
                      }
                }
                onClick={() => goTo(i)}
              >
                <item.icon
                  size={isActive ? iconSize * 5 : 48}
                  strokeWidth={isActive ? strokeWidth : 1.5}
                  style={{ color: isActive ? strokeColor : undefined }}
                  className={`${isActive ? "" : "text-foreground"} transition-all duration-500`}
                />
              </m.div>
            );
          })}
        </m.div>
      </div>

    </div>
  );
};

export default IconCarousel;
