import gsap from "gsap";

import { BLAST_ICONS, BURST } from "./constants";

const SVG_NS = "http://www.w3.org/2000/svg";

type Piece = {
  node: SVGGElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  rotation: number;
  life: number;
};

const make = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
};

const between = (min: number, max: number) => min + Math.random() * (max - min);

const shardPath = (size: number) => {
  const corners = 3 + Math.floor(Math.random() * 3);
  const points: string[] = [];
  for (let i = 0; i < corners; i++) {
    const angle = (i / corners) * Math.PI * 2 + between(-0.4, 0.4);
    const radius = size * between(0.45, 1);
    points.push(
      `${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}`,
    );
  }
  return `M${points.join("L")}Z`;
};

export function burstRocket(
  svg: SVGSVGElement,
  rocketEl: SVGGElement,
  fullMotion: boolean,
): () => void {
  const body = rocketEl.querySelector<SVGGElement>(".rocketDetails") ?? rocketEl;
  const box = body.getBBox();
  const offsetX = Number(gsap.getProperty(rocketEl, "x")) || 0;
  const offsetY = Number(gsap.getProperty(rocketEl, "y")) || 0;
  const originX = box.x + box.width / 2 + offsetX;
  const originY = box.y + box.height * BURST.hitPoint + offsetY;

  const layer = make("g", {
    class: "rocketBurst",
    "aria-hidden": "true",
    "pointer-events": "none",
  });
  svg.appendChild(layer);

  const tweens: gsap.core.Animation[] = [];

  if (!fullMotion) {
    tweens.push(gsap.to(rocketEl, { opacity: 0, duration: 0.3, ease: "power1.out" }));
    const puff = make("circle", {
      cx: originX,
      cy: originY,
      r: 28,
      fill: "white",
      stroke: "black",
      "stroke-width": 1,
      opacity: 0,
    });
    layer.appendChild(puff);
    tweens.push(
      gsap.to(puff, {
        keyframes: [
          { opacity: 0.9, duration: 0.2, ease: "power1.out" },
          { opacity: 0, duration: 0.8, ease: "power1.in", delay: 0.3 },
        ],
      }),
    );
    return () => {
      tweens.forEach((tw) => tw.kill());
      layer.remove();
    };
  }

  const smoke = make("g", {});
  const rings = make("g", {});
  const debris = make("g", {});
  const flashLayer = make("g", {});
  layer.append(smoke, rings, debris, flashLayer);

  const flash = make("circle", {
    cx: originX,
    cy: originY,
    r: 6,
    fill: "white",
    stroke: "black",
    "stroke-width": 1.5,
  });
  flashLayer.appendChild(flash);
  tweens.push(
    gsap.to(flash, {
      attr: { r: BURST.flashRadius, "stroke-width": 0.4 },
      opacity: 0,
      duration: 0.32,
      ease: "cubic-bezier(0.23, 1, 0.32, 1)",
    }),
  );

  tweens.push(gsap.to(rocketEl, { opacity: 0, duration: 0.06, ease: "none" }));

  BURST.rings.forEach((ring) => {
    const circle = make("circle", {
      cx: originX,
      cy: originY,
      r: 8,
      fill: "none",
      stroke: "black",
      "stroke-width": ring.width,
      "stroke-dasharray": ring.dash,
      opacity: 0,
    });
    rings.appendChild(circle);
    tweens.push(
      gsap
        .timeline({ delay: ring.delay })
        .set(circle, { opacity: ring.opacity })
        .to(circle, {
          attr: { r: ring.radius, "stroke-width": 0.2 },
          opacity: 0,
          duration: ring.duration,
          ease: "cubic-bezier(0.23, 1, 0.32, 1)",
        }),
    );
  });

  BURST.smoke.forEach((puff, i) => {
    const circle = make("circle", {
      cx: originX + puff.dx,
      cy: originY + puff.dy,
      r: puff.r,
      fill: "white",
      stroke: "black",
      "stroke-width": 1,
      opacity: 0,
    });
    smoke.appendChild(circle);
    tweens.push(
      gsap
        .timeline({ delay: 0.05 + i * 0.035 })
        .set(circle, { opacity: 1 })
        .to(circle, {
          attr: { r: puff.r * 2.1, cy: originY + puff.dy - puff.rise },
          duration: puff.life,
          ease: "cubic-bezier(0.23, 1, 0.32, 1)",
        })
        .to(
          circle,
          { opacity: 0, duration: puff.life * 0.55, ease: "power1.in" },
          puff.life * 0.45,
        ),
    );
  });

  const pieces: Piece[] = [];
  const launch = (node: SVGGElement, x: number, y: number, speed: number) => {
    const dx = x - originX;
    const dy = y - originY;
    const dist = Math.hypot(dx, dy) || 1;
    const push = speed * (1 - Math.min(dist / box.height, 0.6));
    pieces.push({
      node,
      x,
      y,
      vx: (dx / dist) * push + between(-40, 40),
      vy: (dy / dist) * push + BURST.inheritedLift + between(-40, 20),
      spin: between(-540, 540),
      rotation: between(0, 360),
      life: between(BURST.lifeMin, BURST.lifeMax),
    });
    debris.appendChild(node);
  };

  for (let i = 0; i < BURST.shards; i++) {
    const node = make("g", {});
    node.appendChild(
      make("path", {
        d: shardPath(between(4, 11)),
        fill: "white",
        stroke: "black",
        "stroke-width": 1.2,
        "stroke-linejoin": "round",
      }),
    );
    launch(
      node,
      box.x + offsetX + between(0.1, 0.9) * box.width,
      box.y + offsetY + between(0.05, 0.95) * box.height,
      between(BURST.speedMin, BURST.speedMax),
    );
  }

  const glyphs = [...BLAST_ICONS].sort(() => Math.random() - 0.5).slice(0, BURST.glyphs);
  glyphs.forEach((icon) => {
    const node = make("g", {});
    const inner = make("g", { transform: "scale(0.62) translate(-12 -12)" });
    inner.appendChild(
      make("path", {
        d: icon.d,
        fill: "none",
        stroke: "black",
        "stroke-width": 2,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
    node.appendChild(inner);
    launch(
      node,
      originX + between(-18, 18),
      originY + between(-30, 30),
      between(BURST.speedMin * 0.8, BURST.speedMax * 0.8),
    );
  });

  const clock = { t: 0 };
  const total = BURST.lifeMax;
  const k = BURST.drag;
  tweens.push(
    gsap.to(clock, {
      t: total,
      duration: total,
      ease: "none",
      onUpdate: () => {
        const t = clock.t;
        const damp = (1 - Math.exp(-k * t)) / k;
        for (const p of pieces) {
          const local = Math.min(t, p.life);
          const d = (1 - Math.exp(-k * local)) / k;
          const x = p.x + p.vx * d;
          const y = p.y + p.vy * d + 0.5 * BURST.gravity * local * local;
          const rotation = p.rotation + p.spin * damp;
          const fade = local / p.life;
          const opacity = fade < 0.7 ? 1 : Math.max(0, 1 - (fade - 0.7) / 0.3);
          p.node.setAttribute(
            "transform",
            `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(1)})`,
          );
          p.node.setAttribute("opacity", opacity.toFixed(3));
        }
      },
      onComplete: () => layer.remove(),
    }),
  );

  return () => {
    tweens.forEach((tw) => tw.kill());
    layer.remove();
  };
}
