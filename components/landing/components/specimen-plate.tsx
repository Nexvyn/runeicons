"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, useInView, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { getIconUrlById, type IconType } from "@/lib/icons";
import type { IconData } from "@/lib/types";

import { SPEC_DETAILS_D, SPEC_MAIN_D } from "../svg/specimen-data";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const CYCLE_MS = 4000;
const HAND = { fontFamily: "var(--font-caveat)" };
const DEFAULT_ID = "documents-file-text";
const DEFAULT_NAME = "file-text";
const DEFAULT_GLASS = "/glass-icons/FileText.svg";

const STYLE_ORDER: IconType[] = ["normal", "duotone", "fill", "pixelated", "glass"];

const STYLE_LABELS: Record<IconType, string> = {
  normal: "outline",
  duotone: "duotone",
  fill: "fill",
  pixelated: "pixelated",
  glass: "glass",
};

const NOTE_POS: Record<IconType, { pos: string; rotate: number; arrow: "left" | "right" }> = {
  normal: { pos: "top-[20%] right-[4%] w-[130px] text-right", rotate: -2, arrow: "left" },
  duotone: { pos: "top-[24%] left-[5%] w-[120px]", rotate: 1.5, arrow: "right" },
  fill: { pos: "bottom-[26%] right-[5%] w-[110px] text-right", rotate: -1.5, arrow: "left" },
  pixelated: { pos: "bottom-[24%] left-[5%] w-[130px]", rotate: 2, arrow: "right" },
  glass: { pos: "top-[22%] right-[5%] w-[110px] text-right", rotate: -2.5, arrow: "left" },
};

interface ParsedPath {
  d: string;
  stroke: string | null;
  fill: string | null;
  strokeWidth: string | null;
}

interface Vector {
  kind: "vector";
  vb: string;
  paths: ParsedPath[];
  anchors: [number, number][];
  key: string;
}

interface Glass {
  kind: "glass";
  url: string;
  key: string;
}

type View = Vector | Glass;

const FILE_TEXT_HANDLES: [number, number, number, number][] = [
  [4, 4, 4.59, 2.59],
  [4, 20, 4.59, 21.41],
  [18, 22, 19.41, 21.41],
  [20, 8, 19.82, 7.08],
];

const extractAnchors = (paths: ParsedPath[]): [number, number][] => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const p of paths) {
    if (!p.stroke) continue;
    const tokens = p.d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
    let x = 0;
    let y = 0;
    for (const t of tokens) {
      const cmd = t[0];
      const nums = (t.slice(1).match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number);
      if (cmd === "M" || cmd === "L") {
        for (let i = 0; i + 1 < nums.length; i += 2) {
          x = nums[i];
          y = nums[i + 1];
          const k = `${Math.round(x * 2)},${Math.round(y * 2)}`;
          if (!seen.has(k)) {
            seen.add(k);
            out.push([x, y]);
          }
        }
      } else if (cmd === "H") {
        x = nums[nums.length - 1];
      } else if (cmd === "V") {
        y = nums[nums.length - 1];
      } else if (cmd === "C") {
        for (let i = 0; i + 5 < nums.length; i += 6) {
          x = nums[i + 4];
          y = nums[i + 5];
          const k = `${Math.round(x * 2)},${Math.round(y * 2)}`;
          if (!seen.has(k)) {
            seen.add(k);
            out.push([x, y]);
          }
        }
      }
    }
  }
  return out.slice(0, 30);
};

const svgCache = new Map<string, { vb: string; paths: ParsedPath[] }>();

const loadSvg = async (url: string) => {
  const cached = svgCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.querySelector("svg");
  const vb = svg?.getAttribute("viewBox") ?? "0 0 24 24";
  const paths = [...doc.querySelectorAll("path")].map((p) => ({
    d: p.getAttribute("d") ?? "",
    stroke: p.getAttribute("stroke"),
    fill: p.getAttribute("fill"),
    strokeWidth: p.getAttribute("stroke-width"),
  }));
  const parsed = { vb, paths };
  svgCache.set(url, parsed);
  return parsed;
};

const fillClass = (fill: string | null) =>
  fill === "#DDDDDD" ? "fill-[#DDDDDD] dark:fill-zinc-700" : "";

const strokeProps = (p: ParsedPath) => {
  if (!p.stroke) return { stroke: undefined, className: "" };
  if (p.stroke === "black" || p.stroke === "#1C1F21") {
    return { stroke: "currentColor", className: "" };
  }
  if (p.stroke === "#DDDDDD") {
    return { stroke: undefined, className: "stroke-[#c9c9c9] dark:stroke-[#DDDDDD]" };
  }
  return { stroke: p.stroke, className: "" };
};

const HandArrow = ({ flip, reduced }: { flip?: boolean; reduced: boolean }) => (
  <svg
    viewBox="0 0 80 34"
    className={`mt-1 h-8 w-16 text-brand/70 ${flip ? "-scale-x-100 self-start" : "self-end"}`}
    fill="none"
  >
    <m.path
      d="M76 4 Q48 2 30 12 Q12 22 5 29"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      initial={reduced ? false : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT_QUART }}
    />
    <m.path
      d="M14 24 Q9 27 5 29 Q10 29.5 15 32"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.6 }}
    />
  </svg>
);

interface SpecimenPlateProps {
  iconType: IconType;
  onChange: (t: IconType) => void;
  paused?: boolean;
  icon?: IconData;
}

const SpecimenPlate = ({ iconType, onChange, paused, icon }: SpecimenPlateProps) => {
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });

  const activeId = icon?.id ?? DEFAULT_ID;
  const activeName = (icon?.name ?? DEFAULT_NAME).toLowerCase();
  const isDefault = activeId === DEFAULT_ID;

  const [view, setView] = useState<View>({
    kind: "vector",
    vb: "0 0 24 24",
    paths: [
      { d: SPEC_MAIN_D, stroke: "black", fill: null, strokeWidth: "2" },
      { d: SPEC_DETAILS_D, stroke: "black", fill: null, strokeWidth: "2" },
    ],
    anchors: extractAnchors([
      { d: SPEC_MAIN_D, stroke: "black", fill: null, strokeWidth: "2" },
      { d: SPEC_DETAILS_D, stroke: "black", fill: null, strokeWidth: "2" },
    ]),
    key: `${DEFAULT_ID}:normal`,
  });

  const holdRef = useRef({ iconType, onChange });
  holdRef.current = { iconType, onChange };

  useEffect(() => {
    if (paused || shouldReduceMotion || !inView) return;
    const id = setInterval(() => {
      const { iconType: current, onChange: change } = holdRef.current;
      const idx = STYLE_ORDER.indexOf(current);
      change(STYLE_ORDER[(idx + 1) % STYLE_ORDER.length]);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [paused, shouldReduceMotion, inView]);

  useEffect(() => {
    const key = `${activeId}:${iconType}`;
    let url = getIconUrlById(activeId, iconType);
    if (!url) {
      if (isDefault && iconType === "glass") {
        url = DEFAULT_GLASS;
      } else {
        url =
          getIconUrlById(activeId, "normal") ??
          getIconUrlById(activeId, "pixelated") ??
          icon?.url ??
          null;
      }
    }
    if (!url) return;
    if (url.includes("glass-icons")) {
      setView({ kind: "glass", url, key });
      return;
    }
    let alive = true;
    loadSvg(url).then(({ vb, paths }) => {
      if (!alive) return;
      setView({
        kind: "vector",
        vb,
        paths,
        anchors: iconType === "normal" ? extractAnchors(paths) : [],
        key,
      });
    });
    return () => {
      alive = false;
    };
  }, [activeId, iconType, icon?.url]);

  const notePos = NOTE_POS[iconType];
  const noteText =
    iconType === "normal"
      ? `${view.kind === "vector" ? view.anchors.length : 16} anchors — grab & drag any of them`
      : iconType === "duotone"
        ? "two layers: base + a 40% tint"
        : iconType === "fill"
          ? "one solid path, that's it"
          : iconType === "pixelated"
            ? `${view.kind === "vector" ? view.paths.length : 49} little squares, placed by hand`
            : "blur + shine... still 24px";

  const strokePaths = view.kind === "vector" ? view.paths.filter((p) => p.stroke) : [];
  const isDetailStroke = (s: string | null) => s === "#DDDDDD" || s === "#F3F3F3";
  const duoBase = view.kind === "vector" ? view.paths.filter((p) => !isDetailStroke(p.stroke)) : [];
  const duoDetail =
    view.kind === "vector" ? view.paths.filter((p) => isDetailStroke(p.stroke)) : [];

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[400px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-background"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-brand"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="spec-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.06"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spec-grid)" />
      </svg>

      <div className="pointer-events-none absolute inset-3 text-brand/40">
        <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-current" />
        <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-current" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-current" />
        <span className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-current" />
      </div>

      <div className="relative z-10 flex items-start justify-between px-6 pt-5">
        <div style={HAND} className="-rotate-1">
          <p className="text-xl leading-none text-foreground/85">
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={activeName}
                className="inline-block"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.18, ease: EASE_OUT_QUART }}
              >
                {activeName}
              </m.span>
            </AnimatePresence>{" "}
            <span className="text-muted-foreground">— same glyph, five moods</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground/80">
            {isDefault
              ? "flips on its own every 4s (or search something →)"
              : "that's your search, dissected"}
          </p>
        </div>
        <div style={HAND} className="rotate-2 text-right">
          <p className="text-base leading-none text-brand/80">24 × 24 px</p>
          <svg viewBox="0 0 26 26" className="mt-1 ml-auto h-5 w-5 text-brand/50" fill="none">
            <path
              d="M4 5 Q13 3 22 4.5 Q23.5 13 22.5 21.5 Q13 23.5 4.5 22 Q3 13 4 5Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center py-2">
        <svg
          viewBox="-5 -5 34 34"
          className="h-auto w-[58%] max-w-[320px] min-w-[200px] text-foreground"
          xmlns="http://www.w3.org/2000/svg"
        >
          <AnimatePresence mode="wait" initial={false}>
            {view.kind === "glass" ? (
              <m.g
                key={view.key}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              >
                <image href={view.url} x="0" y="0" width="24" height="24" className="dark:invert" />
              </m.g>
            ) : iconType === "pixelated" ? (
              <m.g
                key={view.key}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <svg x="-1" y="-1" width="26" height="26" viewBox={view.vb} overflow="visible">
                  {view.paths.map((cell, i) => (
                    <m.path
                      key={`${view.key}-${i}`}
                      d={cell.d}
                      fill="currentColor"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: -7 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.32,
                        delay: shouldReduceMotion ? 0 : Math.min(i * 0.018, 1.1),
                        ease: EASE_OUT_QUART,
                      }}
                    />
                  ))}
                </svg>
              </m.g>
            ) : iconType === "duotone" ? (
              <m.g
                key={view.key}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg x="0" y="0" width="24" height="24" viewBox={view.vb} overflow="visible">
                  <g>
                    {duoBase.map((p, i) => (
                      <path
                        key={`b-${i}`}
                        d={p.d}
                        stroke={p.stroke === "white" ? undefined : (p.stroke ?? undefined)}
                        className={p.stroke === "white" ? "stroke-background" : undefined}
                        strokeWidth={p.strokeWidth ?? undefined}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={p.fill && p.fill !== "none" ? p.fill : "none"}
                      />
                    ))}
                  </g>
                  <g>
                    {duoDetail.map((p, i) => {
                      const sp = strokeProps(p);
                      return (
                        <path
                          key={`d-${i}`}
                          d={p.d}
                          stroke={sp.stroke}
                          className={sp.className}
                          strokeWidth={p.strokeWidth ?? undefined}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill={p.fill && p.fill !== "none" ? p.fill : "none"}
                        />
                      );
                    })}
                  </g>
                </svg>
              </m.g>
            ) : iconType === "fill" ? (
              <m.g
                key={view.key}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg x="0" y="0" width="24" height="24" viewBox={view.vb} overflow="visible">
                  {view.paths.map((p, i) => {
                    const sp = strokeProps(p);
                    return (
                      <m.path
                        key={`f-${i}`}
                        d={p.d}
                        stroke={sp.stroke}
                        className={`${sp.className} ${fillClass(p.fill)}`}
                        strokeWidth={p.strokeWidth ?? undefined}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={
                          p.fill && p.fill !== "#DDDDDD" && p.fill !== "none"
                            ? p.fill
                            : p.fill === "#DDDDDD"
                              ? undefined
                              : "none"
                        }
                        initial={shouldReduceMotion || !p.fill ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45, delay: p.fill ? 0.2 : 0 }}
                      />
                    );
                  })}
                </svg>
              </m.g>
            ) : (
              <m.g
                key={view.key}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <svg x="0" y="0" width="24" height="24" viewBox={view.vb} overflow="visible">
                  {strokePaths.map((p, i) => (
                    <m.path
                      key={`o-${i}`}
                      d={p.d}
                      stroke="currentColor"
                      strokeWidth={p.strokeWidth ?? "2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      initial={shouldReduceMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.75,
                        delay: shouldReduceMotion ? 0 : i * 0.28,
                        ease: EASE_OUT_QUART,
                      }}
                    />
                  ))}
                  <m.g
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: shouldReduceMotion ? 0 : 0.8,
                    }}
                    className="text-brand"
                  >
                    {isDefault &&
                      FILE_TEXT_HANDLES.map(([ax, ay, hx, hy]) => (
                        <g key={`h-${ax}-${ay}`}>
                          <line
                            x1={ax}
                            y1={ay}
                            x2={hx}
                            y2={hy}
                            stroke="currentColor"
                            strokeWidth="0.25"
                            opacity="0.8"
                          />
                          <circle cx={hx} cy={hy} r="0.45" fill="currentColor" opacity="0.8" />
                        </g>
                      ))}
                    {view.anchors.map(([x, y]) => (
                      <rect
                        key={`a-${x}-${y}`}
                        x={x - 0.55}
                        y={y - 0.55}
                        width="1.1"
                        height="1.1"
                        className="fill-background"
                        stroke="currentColor"
                        strokeWidth="0.3"
                      />
                    ))}
                  </m.g>
                </svg>
              </m.g>
            )}
          </AnimatePresence>
        </svg>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={iconType}
            style={{ ...HAND, rotate: `${notePos.rotate}deg` }}
            className={`absolute flex flex-col ${notePos.pos}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
          >
            <p className="text-base leading-snug text-foreground/75">{noteText}</p>
            <HandArrow flip={notePos.arrow === "right"} reduced={!!shouldReduceMotion} />
          </m.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex items-end justify-center gap-1 px-4 pb-4 sm:gap-2">
        {STYLE_ORDER.map((style, i) => {
          const isActive = style === iconType;
          return (
            <button
              key={style}
              type="button"
              onClick={() => onChange(style)}
              style={{
                ...HAND,
                rotate: `${(i % 2 === 0 ? -1 : 1) * (1 + (i % 3) * 0.5)}deg`,
              }}
              className={`relative cursor-pointer px-2.5 py-1 text-lg leading-none transition-colors duration-150 ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              {isActive && (
                <m.span
                  layoutId="specimen-ticker"
                  className="absolute inset-0 text-brand/70"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 500, damping: 40 }
                  }
                >
                  <svg
                    viewBox="0 0 100 34"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M8 17 C6 7 30 3 52 4 C78 5 95 9 94 17 C93 27 68 31 46 30 C22 29 9 26 8 17Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </m.span>
              )}
              <span className="relative z-10">{STYLE_LABELS[style]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SpecimenPlate;
