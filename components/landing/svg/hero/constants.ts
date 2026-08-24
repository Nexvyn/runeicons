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
  textOut: { duration: 0.18, ease: "power2.out" },
  textIn: { duration: 0.22, ease: "power2.out" },
  arrow: { duration: 0.36, ease: "power2.out", delay: 0.24 },
} as const;

export const COUNTDOWN_TICKS = [5, 4, 3, 2, 1] as const;

export const IDLE_LEAK = {
  opacityMin: 0.12,
  opacityMax: 0.28,
  scaleYMin: 0.4,
  scaleYMid: 0.45,
  scaleYMax: 0.65,
  inDuration: 0.7,
  outDuration: 0.9,
  stagger: 0.15,
  stopDuration: 0.3,
} as const;

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
const seededRand = (i: number, n: number) => {
  const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return round3(((v % 1) + 1) % 1);
};
const emberRand = seededRand;

export const NOZZLE_COLUMNS = [657, 684, 710] as const;

export const ROCKET_DETAILS = {
  readyStagger: 0.11,
  ignition: { amplitude: 0.6, duration: 0.32, cycles: 9, ease: "sine.inOut" },
  descent: { dimOpacity: 0.35, duration: 0.4, ease: "power2.out" },
  settle: { startAt: 1.8, duration: 0.4, targetOpacity: 0.88, ease: "power2.out" },
} as const;

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

export const CLOUDS_CFG = {
  count: 22,
  spawnStagger: 0.035,
  spawnY: 488,
  spawnXMin: 520,
  spawnXMax: 764,
  radiusMin: 20,
  radiusMax: 46,
  cycleMin: 1.2,
  cycleMax: 2.2,
  driftXJitter: 130,
  driftYMin: -80,
  driftYMax: -20,
  peakOpacity: 0.7,
  peakScale: 2.4,
} as const;

export const CLOUDS = Array.from({ length: CLOUDS_CFG.count }, (_, i) => ({
  id: `cloud-${i}`,
  cx: round3(
    CLOUDS_CFG.spawnXMin +
      seededRand(i + 100, 1) * (CLOUDS_CFG.spawnXMax - CLOUDS_CFG.spawnXMin),
  ),
  cy: round3(CLOUDS_CFG.spawnY + (seededRand(i + 100, 2) - 0.5) * 12),
  radius: round3(
    CLOUDS_CFG.radiusMin +
      seededRand(i + 100, 3) * (CLOUDS_CFG.radiusMax - CLOUDS_CFG.radiusMin),
  ),
  delay: round3(i * CLOUDS_CFG.spawnStagger),
  cycle: round3(
    CLOUDS_CFG.cycleMin +
      seededRand(i + 100, 4) * (CLOUDS_CFG.cycleMax - CLOUDS_CFG.cycleMin),
  ),
  driftX: round3((seededRand(i + 100, 5) - 0.5) * 2 * CLOUDS_CFG.driftXJitter),
  driftY: round3(
    CLOUDS_CFG.driftYMin +
      seededRand(i + 100, 6) * (CLOUDS_CFG.driftYMax - CLOUDS_CFG.driftYMin),
  ),
}));

export const LANDING_DUST = Array.from({ length: 10 }, (_, i) => ({
  id: `dust-${i}`,
  cx: round3(600 + seededRand(i + 200, 1) * 170),
  cy: round3(494 + (seededRand(i + 200, 2) - 0.5) * 10),
  radius: round3(10 + seededRand(i + 200, 3) * 9),
  delay: round3(i * 0.03),
  driftX: round3((seededRand(i + 200, 4) - 0.5) * 50),
  driftY: round3(-10 - seededRand(i + 200, 5) * 14),
}));

const BLAST_GLYPHS = {
  zap: "M3.99999 14C3.81076 14.0007 3.62522 13.9476 3.46495 13.847C3.30467 13.7464 3.17623 13.6024 3.09454 13.4317C3.01286 13.261 2.98129 13.0706 3.00349 12.8827C3.0257 12.6948 3.10077 12.517 3.21999 12.37L13.12 2.17004C13.1943 2.08432 13.2955 2.0264 13.407 2.00577C13.5185 1.98515 13.6337 2.00305 13.7337 2.05654C13.8337 2.11004 13.9126 2.19594 13.9573 2.30015C14.0021 2.40436 14.0101 2.52069 13.98 2.63004L12.06 8.65004C12.0034 8.80156 11.9844 8.96456 12.0046 9.12505C12.0248 9.28553 12.0837 9.43872 12.1761 9.57147C12.2685 9.70421 12.3918 9.81256 12.5353 9.8872C12.6788 9.96185 12.8382 10.0006 13 10H20C20.1892 9.9994 20.3748 10.0525 20.535 10.1531C20.6953 10.2537 20.8238 10.3977 20.9054 10.5684C20.9871 10.7391 21.0187 10.9295 20.9965 11.1174C20.9743 11.3053 20.8992 11.4831 20.78 11.63L10.88 21.83C10.8057 21.9158 10.7045 21.9737 10.593 21.9943C10.4815 22.0149 10.3663 21.997 10.2663 21.9435C10.1663 21.89 10.0874 21.8041 10.0427 21.6999C9.99791 21.5957 9.98991 21.4794 10.02 21.37L11.94 15.35C11.9966 15.1985 12.0156 15.0355 11.9954 14.875C11.9752 14.7145 11.9163 14.5614 11.8239 14.4286C11.7315 14.2959 11.6082 14.1875 11.4647 14.1129C11.3212 14.0382 11.1617 13.9995 11 14H3.99999Z",
  star: "M11.525 2.29502C11.5688 2.20648 11.6365 2.13195 11.7205 2.07984C11.8044 2.02773 11.9012 2.00012 12 2.00012C12.0988 2.00012 12.1956 2.02773 12.2795 2.07984C12.3635 2.13195 12.4312 2.20648 12.475 2.29502L14.785 6.97402C14.9372 7.28198 15.1618 7.54842 15.4396 7.75047C15.7174 7.95251 16.0401 8.08413 16.38 8.13402L21.546 8.89002C21.6439 8.9042 21.7358 8.94549 21.8115 9.00921C21.8871 9.07294 21.9434 9.15656 21.974 9.25062C22.0046 9.34468 22.0083 9.44542 21.9846 9.54145C21.9609 9.63748 21.9108 9.72497 21.84 9.79402L18.104 13.432C17.8576 13.6721 17.6733 13.9685 17.5668 14.2956C17.4604 14.6228 17.4351 14.9709 17.493 15.31L18.375 20.45C18.3923 20.5479 18.3817 20.6486 18.3445 20.7407C18.3073 20.8328 18.2449 20.9126 18.1645 20.971C18.0842 21.0294 17.989 21.064 17.8899 21.0709C17.7908 21.0778 17.6917 21.0567 17.604 21.01L12.986 18.582C12.6817 18.4222 12.3432 18.3388 11.9995 18.3388C11.6558 18.3388 11.3173 18.4222 11.013 18.582L6.396 21.01C6.30833 21.0564 6.2094 21.0773 6.11045 21.0703C6.0115 21.0632 5.91652 21.0286 5.83629 20.9702C5.75607 20.9119 5.69383 20.8322 5.65666 20.7402C5.61948 20.6483 5.60886 20.5477 5.626 20.45L6.507 15.311C6.5652 14.9717 6.53998 14.6234 6.43354 14.2961C6.32709 13.9687 6.14261 13.6722 5.896 13.432L2.16 9.79502C2.08859 9.72605 2.03799 9.63841 2.01396 9.54209C1.98993 9.44577 1.99344 9.34463 2.02408 9.25021C2.05472 9.15578 2.11127 9.07186 2.18728 9.008C2.26329 8.94414 2.3557 8.90291 2.454 8.88902L7.619 8.13402C7.95926 8.08451 8.28239 7.95307 8.56058 7.751C8.83878 7.54893 9.0637 7.28229 9.216 6.97402L11.525 2.29502Z",
  heart: "M2 9.49998C2.00002 8.38718 2.33759 7.30056 2.96813 6.38364C3.59867 5.46672 4.49252 4.76264 5.53161 4.36438C6.5707 3.96612 7.70616 3.89242 8.78801 4.15302C9.86987 4.41362 10.8472 4.99626 11.591 5.82398C11.6434 5.87999 11.7067 5.92465 11.7771 5.95518C11.8474 5.98571 11.9233 6.00146 12 6.00146C12.0767 6.00146 12.1526 5.98571 12.2229 5.95518C12.2933 5.92465 12.3566 5.87999 12.409 5.82398C13.1504 4.99088 14.128 4.40335 15.2116 4.13958C16.2952 3.87581 17.4335 3.94833 18.4749 4.34746C19.5163 4.7466 20.4114 5.45343 21.0411 6.37388C21.6708 7.29433 22.0053 8.38474 22 9.49998C22 11.79 20.5 13.5 19 15L13.508 20.313C13.3217 20.527 13.0919 20.6989 12.834 20.8173C12.5762 20.9357 12.296 20.9978 12.0123 20.9996C11.7285 21.0014 11.4476 20.9428 11.1883 20.8277C10.9289 20.7126 10.697 20.5436 10.508 20.332L5 15C3.5 13.5 2 11.8 2 9.49998Z",
  box: "M3.30005 7L12 12M12 12L20.7001 7M12 12L12 22M21 7.9999C20.9996 7.64918 20.9071 7.30471 20.7315 7.00106C20.556 6.69742 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09437 12.3511 2.00195 12 2.00195C11.6489 2.00195 11.304 2.09437 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69742 3.26846 7.00106C3.09294 7.30471 3.00036 7.64918 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999V7.9999Z",
  check:
    "M9 12L11 14L15 10M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",
  moon: "M20.985 12.486C20.8912 14.2221 20.2966 15.894 19.273 17.2994C18.2494 18.7048 16.8406 19.7837 15.217 20.4055C13.5933 21.0274 11.8243 21.1656 10.1237 20.8035C8.42318 20.4414 6.86392 19.5945 5.63442 18.3651C4.40493 17.1358 3.55785 15.5766 3.19558 13.8761C2.83331 12.1756 2.97136 10.4065 3.59304 8.78279C4.21472 7.15906 5.29342 5.75016 6.69874 4.72641C8.10406 3.70265 9.77583 3.10788 11.512 3.01397C11.917 2.99197 12.129 3.47397 11.914 3.81697C11.1949 4.96753 10.8869 6.32784 11.0405 7.67592C11.194 9.024 11.7999 10.2803 12.7593 11.2396C13.7187 12.199 14.9749 12.805 16.323 12.9585C17.6711 13.112 19.0314 12.8041 20.182 12.085C20.526 11.87 21.007 12.081 20.985 12.486Z",
} as const;

const LAUNCH_PAD = {
  cx: (641.687 + 723.093) / 2,
  cy: 490.254,
  rx: (723.093 - 641.687) / 2,
  ry: (503.233 - 490.254) * 0.75,
} as const;

export const BLAST_ICONS_CFG = {
  reachRight: 35,
  reachLeft: 200,
  liftBase: 95,
  liftBoost: 90,
  jitter: 0.08,
  spinMin: 200,
  spinMax: 560,
  flightMin: 1,
  flightMax: 1.5,
  restOpacity: 0.85,
  growMin: 1.3,
  growMax: 1.65,
  holdRatio: 0.6,
  shoveDuration: 0.1,
  settleDuration: 0.44,
  settleDrop: 11,
  settleStagger: 0.045,
} as const;

const BLAST_ICON_SEATS = [
  { glyph: "check", t: 0.17, scale: 0.64, tilt: 7 },
  { glyph: "star", t: 0.335, scale: 0.72, tilt: -6 },
  { glyph: "box", t: 0.5, scale: 0.78, tilt: 4 },
  { glyph: "heart", t: 0.665, scale: 0.72, tilt: -9 },
  { glyph: "zap", t: 0.83, scale: 0.64, tilt: 11 },
] as const;

export const BLAST_ICONS = BLAST_ICON_SEATS.map((rawSeat, i) => {
  const angle = rawSeat.t * Math.PI;
  const seat = {
    ...rawSeat,
    x: round3(LAUNCH_PAD.cx + LAUNCH_PAD.rx * Math.cos(angle)),
    y: round3(
      LAUNCH_PAD.cy + LAUNCH_PAD.ry * Math.sin(angle) - rawSeat.scale * 12 * 0.8,
    ),
  };
  const cfg = BLAST_ICONS_CFG;
  const rand = (n: number) => seededRand(i + 300, n);
  const lerp = (min: number, max: number, t: number) => min + t * (max - min);
  const jitter = (n: number) => 1 + (rand(n) - 0.5) * 2 * cfg.jitter;

  const bearing = Math.cos(angle);
  const dir = bearing >= 0 ? 1 : -1;
  const centrality = 1 - Math.abs(bearing);
  const reach = bearing >= 0 ? cfg.reachRight : cfg.reachLeft;

  return {
    id: `blast-icon-${i}`,
    d: BLAST_GLYPHS[seat.glyph],
    x: seat.x,
    y: seat.y,
    scale: seat.scale,
    tilt: seat.tilt,
    restOpacity: cfg.restOpacity,
    driftX: round3(bearing * reach * jitter(1)),
    lift: round3((cfg.liftBase + centrality * cfg.liftBoost) * jitter(2)),
    spin: round3(dir * lerp(cfg.spinMin, cfg.spinMax, rand(3))),
    flight: round3(lerp(cfg.flightMax, cfg.flightMin, centrality)),
    growScale: round3(lerp(cfg.growMin, cfg.growMax, rand(4))),
    delay: round3((1 - centrality) * 0.18 + rand(5) * 0.06),
  };
});
