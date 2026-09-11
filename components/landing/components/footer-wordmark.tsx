"use client";

import { useEffect, useRef } from "react";

import { useInView, useReducedMotion } from "motion/react";

import { WORDMARK_D } from "../svg/wordmark-data";

const VB_W = 1202;
const VB_H = 147;
const ICON = 26;
const BUCKET = 24;
const N_BUCKETS = Math.ceil(VB_W / BUCKET);
const MAX_ICONS = 900;
const RAISE_PER_ICON = 6.5;
const MAX_PILE = 132;
const SPAWN_THROTTLE_MS = 70;
const TOUCH_RADIUS = 55;

const PIXELATED_ICONS = [
  "documents/file-text",
  "documents/folder",
  "documents/save",
  "documents/inbox",
  "documents/archive",
  "documents/box",
  "documents/clipboard",
  "code/copy",
  "code/git-branch",
  "code/server",
  "arrows/skip-forward",
  "gadgets/laptop",
  "gadgets/watch",
  "gadgets/printer",
  "identity/lock",
];

const GLASS_ICONS = [
  "FileText.svg",
  "Bookmark.svg",
  "Bubble.svg",
  "Code.svg",
  "Folder.svg",
  "Email.svg",
  "Send.svg",
  "Gift.svg",
  "Pencil.svg",
  "Console.svg",
  "CloudDownload.svg",
  "ShoppingBag.svg",
  "Pointer.svg",
  "CirclePerson.svg",
];

const pick = () => {
  if (Math.random() < 0.5) {
    return `/glass-icons/${GLASS_ICONS[Math.floor(Math.random() * GLASS_ICONS.length)]}`;
  }
  const icon = PIXELATED_ICONS[Math.floor(Math.random() * PIXELATED_ICONS.length)];
  return `/pixelated/${icon}.svg`;
};

interface Placed {
  x: number;
  y: number;
  href: string;
  node: SVGImageElement;
}

const FooterWordmark = () => {
  const shouldReduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pileRef = useRef<SVGGElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });

  const pileH = useRef<number[]>(new Array(N_BUCKETS).fill(0));
  const icons = useRef<Placed[]>([]);
  const lastSpawn = useRef(0);
  const seeded = useRef(false);

  const makeNode = (href: string) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "image");
    node.setAttribute("href", href);
    node.setAttribute("width", String(ICON));
    node.setAttribute("height", String(ICON));
    node.style.transformBox = "fill-box";
    node.style.transformOrigin = "center";
    return node;
  };

  const claimSlot = (nearBucket: number): { b: number; y: number } | null => {
    for (let off = 0; off <= 6; off++) {
      for (const b of off === 0 ? [nearBucket] : [nearBucket - off, nearBucket + off]) {
        if (b < 0 || b >= N_BUCKETS) continue;
        if (pileH.current[b] < MAX_PILE) {
          const y = VB_H - ICON + 4 - pileH.current[b] - Math.random() * 4;
          pileH.current[b] += RAISE_PER_ICON;
          return { b, y };
        }
      }
    }
    let minB = -1;
    let minH = Infinity;
    for (let b = 0; b < N_BUCKETS; b++) {
      if (pileH.current[b] < MAX_PILE && pileH.current[b] < minH) {
        minH = pileH.current[b];
        minB = b;
      }
    }
    if (minB < 0) return null;
    const y = VB_H - ICON + 4 - pileH.current[minB] - Math.random() * 4;
    pileH.current[minB] += RAISE_PER_ICON;
    return { b: minB, y };
  };

  const seedIcon = (b: number, delayMs: number, animateIn: boolean) => {
    const pile = pileRef.current;
    if (!pile || icons.current.length >= MAX_ICONS) return;
    const slot = claimSlot(b);
    if (!slot) return;
    const href = pick();
    const node = makeNode(href);
    const x = slot.b * BUCKET + Math.random() * (BUCKET - 6) - 4;
    const base = `translate(${x}px, ${slot.y}px)`;
    pile.appendChild(node);
    icons.current.push({ x, y: slot.y, href, node });

    if (!animateIn) {
      node.style.transform = base;
      return;
    }
    node.style.transform = `${base} scale(0)`;
    node.animate(
      [
        { transform: `${base} scale(0)`, opacity: 0 },
        { transform: `${base} scale(1.12)`, opacity: 1, offset: 0.7 },
        { transform: `${base} scale(1)`, opacity: 1 },
      ],
      {
        duration: 380,
        delay: delayMs,
        easing: "cubic-bezier(0.34, 1.3, 0.64, 1)",
        fill: "forwards",
      },
    );
  };

  const cloneFrom = (parent: Placed, delayMs = 0, chain = 2) => {
    const pile = pileRef.current;
    if (!pile || icons.current.length >= MAX_ICONS) return;
    const parentBucket = Math.round(parent.x / BUCKET);
    const slot = claimSlot(parentBucket);
    if (!slot) return;

    const tx = slot.b * BUCKET + Math.random() * (BUCKET - 6) - 4;
    const ty = slot.y;
    const px = parent.x;
    const py = parent.y;
    const mx = (px + tx) / 2 + (Math.random() - 0.5) * 8;
    const my = Math.min(py, ty) - (18 + Math.random() * 14);

    const node = makeNode(parent.href);
    pile.insertBefore(node, parent.node);
    const placed: Placed = { x: tx, y: ty, href: parent.href, node };
    icons.current.push(placed);

    if (shouldReduceMotion) {
      node.style.transform = `translate(${tx}px, ${ty}px)`;
      return;
    }

    node.style.transform = `translate(${px}px, ${py}px) scale(0.3)`;
    const dur = 460 + Math.random() * 120;
    node.animate(
      [
        {
          transform: `translate(${px}px, ${py}px) scale(0.3)`,
          opacity: 0.7,
        },
        {
          transform: `translate(${mx}px, ${my}px) scale(1.08)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${tx}px, ${ty}px) scale(1)`,
          opacity: 1,
        },
      ],
      {
        duration: dur,
        delay: delayMs,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    if (chain > 0) {
      setTimeout(() => {
        if (icons.current.length >= MAX_ICONS) return;
        let neighbor: Placed | null = null;
        let nd = 42 * 42;
        for (const p of icons.current) {
          if (p === placed || p === parent) continue;
          const dx = p.x - placed.x;
          const dy = p.y - placed.y;
          const d = dx * dx + dy * dy;
          if (d < nd) {
            nd = d;
            neighbor = p;
          }
        }
        if (neighbor && Math.random() < 0.65) {
          cloneFrom(neighbor, 0, chain - 1);
        }
      }, delayMs + dur);
    }

    parent.node.animate(
      [
        { transform: `translate(${px}px, ${py}px) scale(1)` },
        { transform: `translate(${px}px, ${py}px) scale(1.2)`, offset: 0.35 },
        { transform: `translate(${px}px, ${py}px) scale(1)` },
      ],
      {
        duration: 280,
        delay: delayMs,
        easing: "ease-out",
      },
    );
  };

  useEffect(() => {
    if (!inView || seeded.current) return;
    seeded.current = true;
    let i = 0;
    for (let b = 0; b < N_BUCKETS; b++) {
      const stack = 1 + Math.floor(Math.random() * 3);
      for (let s = 0; s < stack; s++) {
        seedIcon(b, i * 9, !shouldReduceMotion);
        i++;
      }
    }
  }, [inView, shouldReduceMotion]);

  const multiplyAt = (clientX: number, clientY: number, copies: number) => {
    if (!seeded.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * VB_W;
    const y = ((clientY - r.top) / r.height) * VB_H;

    let best: Placed | null = null;
    let bestD = TOUCH_RADIUS * TOUCH_RADIUS;
    for (const p of icons.current) {
      const dx = p.x + ICON / 2 - x;
      const dy = p.y + ICON / 2 - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (!best) return;
    for (let i = 0; i < copies; i++) {
      cloneFrom(best, i * 90);
    }
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastSpawn.current < SPAWN_THROTTLE_MS) return;
    lastSpawn.current = now;
    multiplyAt(e.clientX, e.clientY, 2);
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    multiplyAt(e.clientX, e.clientY, 5);
  };

  return (
    <div
      ref={wrapRef}
      className="relative touch-none select-none"
      onPointerMove={handleMove}
      onPointerDown={handleDown}
    >
      <span
        style={{ fontFamily: "var(--font-caveat)" }}
        className="pointer-events-none absolute -top-6 right-[3%] -rotate-2 text-base text-muted-foreground/70 sm:text-lg"
      >
        touch one, it multiplies
      </span>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-auto w-full text-foreground"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="fwm-letters">
            <path d={WORDMARK_D} />
          </clipPath>
        </defs>
        <path d={WORDMARK_D} fill="currentColor" fillOpacity="0.05" />
        <g clipPath="url(#fwm-letters)">
          <g ref={pileRef} className="opacity-45 grayscale dark:opacity-40 dark:invert" />
        </g>
      </svg>
    </div>
  );
};

export default FooterWordmark;
