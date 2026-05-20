export const LAUNCH = {
  ignition: 0,
  plumeIn: 0.12,
  stretchStart: 0.3,
  flickerStart: 0.4,
  hold: 0.35,
  trailOut: 1.7,
  rocketDuration: 2.4,
} as const;

export const EASING = {
  enter: "cubic-bezier(0.23, 1, 0.32, 1)",
  stretch: "cubic-bezier(0.645, 0.045, 0.355, 1)",
  flicker: "sine.inOut",
  exit: "cubic-bezier(0.215, 0.61, 0.355, 1)",
} as const;

export const STATE_TRANSITION = {
  cubeColor: { duration: 0.5, ease: "power2.inOut" },
  textOut: { duration: 0.18, ease: "power2.out" },
  textIn: { duration: 0.22, ease: "power2.out" },
  arrow: { duration: 0.36, ease: "power2.out", delay: 0.24 },
} as const;

export const COUNTDOWN_TICKS = [5, 4, 3, 2, 1] as const;

export const EMBERS_CFG = {
  count: 22,
  coreCount: 14,
  spawnStagger: 0.045,
  cycleMin: 0.55,
  cycleMax: 1.05,
  driftYMin: 28,
  driftYMax: 64,
  driftXJitter: 6,
  cxJitter: 12,
  outerCycleMin: 0.75,
  outerCycleMax: 1.45,
  outerDriftYMin: 38,
  outerDriftYMax: 88,
  outerDriftXJitter: 22,
  outerCxJitter: 32,
  sizeMin: 0.6,
  sizeMax: 1.6,
} as const;

const round3 = (v: number) => Math.round(v * 1000) / 1000;
const emberRand = (i: number, n: number) => {
  const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return round3(((v % 1) + 1) % 1);
};

export const NOZZLE_COLUMNS = [657, 684, 710] as const;

export const EMBERS = Array.from({ length: EMBERS_CFG.count }, (_, i) => {
  const isOuter = i >= EMBERS_CFG.coreCount;
  const nozzleX = NOZZLE_COLUMNS[i % NOZZLE_COLUMNS.length];
  const cxJ = isOuter ? EMBERS_CFG.outerCxJitter : EMBERS_CFG.cxJitter;
  const cMin = isOuter ? EMBERS_CFG.outerCycleMin : EMBERS_CFG.cycleMin;
  const cMax = isOuter ? EMBERS_CFG.outerCycleMax : EMBERS_CFG.cycleMax;
  const dyMin = isOuter ? EMBERS_CFG.outerDriftYMin : EMBERS_CFG.driftYMin;
  const dyMax = isOuter ? EMBERS_CFG.outerDriftYMax : EMBERS_CFG.driftYMax;
  const dxJ = isOuter
    ? EMBERS_CFG.outerDriftXJitter
    : EMBERS_CFG.driftXJitter;
  return {
    id: `ember-${i}`,
    cx: round3(nozzleX + (emberRand(i, 1) - 0.5) * cxJ),
    cy: round3(478 + emberRand(i, 2) * 8),
    radius: round3(
      EMBERS_CFG.sizeMin +
        emberRand(i, 3) * (EMBERS_CFG.sizeMax - EMBERS_CFG.sizeMin),
    ),
    fill: emberRand(i, 4) < 0.5 ? "#FDBA74" : "#F97316",
    delay: round3(i * EMBERS_CFG.spawnStagger),
    cycle: round3(cMin + emberRand(i, 5) * (cMax - cMin)),
    driftY: round3(dyMin + emberRand(i, 6) * (dyMax - dyMin)),
    driftX: round3((emberRand(i, 7) - 0.5) * 2 * dxJ),
    repeatDelay: round3(0.05 + (i % 3) * 0.07),
  };
});
