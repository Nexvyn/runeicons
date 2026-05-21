"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence } from "motion/react";

import AudioControl from "./AudioControl";
import BackButton from "./BackButton";
import Card from "./Card";
import DetailView from "./DetailView";
import UserDetails from "../constants";

const RAW_BASE_X = [-246, -82, 95, 276];
const RAW_BASE_Y = [-15, -10, 7, 0];

// Re-center the idle layout around its own centroid for however many cards
// UserDetails currently has, so removing/adding an entry doesn't drift the row.
const ACTIVE_COUNT = UserDetails.length;
const CENTROID_X =
  RAW_BASE_X.slice(0, ACTIVE_COUNT).reduce((sum, x) => sum + x, 0) /
  ACTIVE_COUNT;
const CENTROID_Y =
  RAW_BASE_Y.slice(0, ACTIVE_COUNT).reduce((sum, y) => sum + y, 0) /
  ACTIVE_COUNT;

const BASE_X = RAW_BASE_X.map((x) => x - CENTROID_X);
const BASE_Y = RAW_BASE_Y.map((y) => y - CENTROID_Y);
const NAT_W = [270, 230, 255, 285];
const Z_IDX = [4, 3, 2, 1];
const GRID_X_PCT = [-25, 25, -25, 25];
const GRID_Y_PCT = [-20, -20, 20, 20];

const PANEL_W = 360;
const MOBILE_BREAKPOINT = 700;
const DRAWER_HEIGHT_RATIO = 0.6;

const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)";

const POSITIONER_TRANSITION = `transform 0.32s ${EASE_OUT_QUART}`;
const INNER_TRANSITION = `transform 0.32s ${EASE_OUT_QUART}, opacity 0.22s ease-out`;

function getScale(mobile = false) {
  if (typeof window === "undefined") return 1;
  if (mobile) {
    return Math.min(0.7, Math.max(0.42, (window.innerWidth - 20) / 800));
  }
  return Math.min(1, (window.innerWidth - 20) / 1000);
}

function getRepulsion(heroIdx: number, charIdx: number) {
  const dir = Math.sign(charIdx - heroIdx);
  const dist = Math.abs(charIdx - heroIdx);
  const pushX = dir * (320 + dist * 200);
  const pushY = (dist === 1 ? 20 : dist === 2 ? 10 : 0) * (heroIdx % 2 === 0 ? 1 : -1);
  return { x: pushX, y: pushY };
}

export default function AboutContent() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stageScale, setStageScale] = useState(1);

  const positionerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setStageScale(getScale(isMobile));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isMobile]);

  const focusedIndex =
    selectedId === null
      ? -1
      : UserDetails.findIndex((u) => u.id === selectedId);

  const selectedUser = UserDetails.find((u) => u.id === selectedId);
  const isOpen = selectedId !== null;

  const playAudio = useCallback(
    (soundName: string) => {
      if (!isMuted) {
        const audio = new Audio(`/about/${soundName}.wav`);
        audio.volume = 1;
        audio.play().catch((e) => console.error("Audio playback failed:", e));
      }
    },
    [isMuted]
  );

  const applyIdlePositions = useCallback(() => {
    if (isMobile) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      positionerRefs.current.forEach((el, i) => {
        if (!el) return;
        const x = (GRID_X_PCT[i] / 100) * vw;
        const y = (GRID_Y_PCT[i] / 100) * vh;
        el.style.transition = POSITIONER_TRANSITION;
        el.style.transform = `translateX(${x}px) translateY(${y}px)`;
        el.style.zIndex = String(Z_IDX[i]);
      });
    } else {
      const s = getScale(false);
      positionerRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = POSITIONER_TRANSITION;
        el.style.transform = `translateX(${BASE_X[i] * s}px) translateY(${BASE_Y[i] * s}px)`;
        el.style.zIndex = String(Z_IDX[i]);
      });
    }
    innerRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "";
      el.style.opacity = "";
    });
  }, [isMobile]);

  const applyOpenPositions = useCallback(
    (heroIdx: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = getScale(isMobile);

      const panelW = isMobile ? 0 : Math.min(PANEL_W, vw * 0.42);
      const stageW = vw - panelW;
      const heroX = isMobile ? 0 : -(panelW / 2);
      const heroY = isMobile ? -vh * (DRAWER_HEIGHT_RATIO / 2) : 0;
      const heroNatW = NAT_W[heroIdx] * s;
      const stageH = isMobile ? vh * (1 - DRAWER_HEIGHT_RATIO) : vh;
      const fitWidth = (stageW * 0.32) / heroNatW;
      const fitHeight = (stageH * 0.55) / heroNatW;
      const heroScale = Math.min(2.2, Math.max(1.4, Math.min(fitWidth, fitHeight)));

      positionerRefs.current.forEach((el, i) => {
        if (!el) return;
        const inner = innerRefs.current[i];
        el.style.transition = POSITIONER_TRANSITION;

        if (i === heroIdx) {
          el.style.transform = `translateX(${heroX}px) translateY(${heroY}px)`;
          el.style.zIndex = "10";
          if (inner) {
            inner.style.transform = `scale(${heroScale})`;
            inner.style.opacity = "1";
          }
        } else if (isMobile) {
          const gx = (GRID_X_PCT[i] / 100) * vw;
          const gy = (GRID_Y_PCT[i] / 100) * vh;
          el.style.transform = `translateX(${gx}px) translateY(${gy}px)`;
          el.style.zIndex = String(Z_IDX[i]);
          if (inner) {
            inner.style.transform = "scale(0.6)";
            inner.style.opacity = "0";
          }
        } else {
          const rep = getRepulsion(heroIdx, i);
          el.style.transform = `translateX(${heroX + rep.x * s}px) translateY(${heroY + rep.y * s}px)`;
          el.style.zIndex = String(Z_IDX[i]);
          if (inner) {
            inner.style.transform = "scale(0.72)";
            inner.style.opacity = "0.28";
          }
        }
      });
    },
    [isMobile]
  );

  useEffect(() => {
    if (isOpen) applyOpenPositions(focusedIndex);
    else applyIdlePositions();
  }, [isOpen, focusedIndex, applyIdlePositions, applyOpenPositions]);

  useEffect(() => {
    const onResize = () => {
      if (isOpen) applyOpenPositions(focusedIndex);
      else applyIdlePositions();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, focusedIndex, applyIdlePositions, applyOpenPositions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "m" && e.key !== "M") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      setIsMuted((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
        playAudio("close");
      } else if (e.key === "ArrowRight") {
        const next = (focusedIndex + 1) % UserDetails.length;
        setDirection(1);
        setSelectedId(UserDetails[next].id);
        playAudio("forward");
      } else if (e.key === "ArrowLeft") {
        const prev =
          (focusedIndex - 1 + UserDetails.length) % UserDetails.length;
        setDirection(-1);
        setSelectedId(UserDetails[prev].id);
        playAudio("back");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, focusedIndex, playAudio]);

  const onCardClick = (idx: number) => {
    const id = UserDetails[idx].id;
    if (selectedId === null) {
      setSelectedId(id);
      playAudio("open");
    } else if (selectedId === id) {
      setSelectedId(null);
      playAudio("close");
    } else {
      setDirection(idx > focusedIndex ? 1 : -1);
      setSelectedId(id);
      playAudio(idx > focusedIndex ? "forward" : "back");
    }
  };

  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpen && e.target === e.currentTarget) {
      setSelectedId(null);
      playAudio("close");
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#050505] text-[#EEEEEE]">
      <BackButton />
      <AudioControl isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />

      <div
        className="fixed inset-0"
        onClick={onStageClick}
        style={{

          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {UserDetails.map((user, index) => (
          <div
            key={user.id}
            ref={(el) => {
              positionerRefs.current[index] = el;
            }}
            data-detail-keep
            className="absolute inset-0 flex items-center justify-center"
            style={{
              willChange: "transform",
              transition: POSITIONER_TRANSITION,
              pointerEvents: "none",
            }}
          >
            <div
              ref={(el) => {
                innerRefs.current[index] = el;
              }}
              style={{
                display: "block",
                transition: INNER_TRANSITION,
                transformOrigin: "center center",
                pointerEvents: "auto",
              }}
            >
              <Card
                user={user}
                index={index}
                size={Math.round(NAT_W[index] * stageScale)}
                isDetailOpen={isOpen}
                isFocused={focusedIndex === index}
                onClick={() => onCardClick(index)}
                onPlayAudio={playAudio}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className={`absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2 transition-opacity duration-400 ease-out ${
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <h1 className="font-sans text-2xl font-bold tracking-wider text-white md:text-4xl">
          RUNE ICON
        </h1>
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <a
            href="https://x.com/RuneIcon"
            target="_blank"
            className="text-sm font-semibold text-[#595959]"
          >
            X
          </a>
        </div>
      </div>

      <AnimatePresence>
        {selectedId && selectedUser && (
          <DetailView
            user={selectedUser}
            direction={direction}
            isMobile={isMobile}
            onClose={() => {
              setSelectedId(null);
              playAudio("close");
            }}
            onNext={() => {
              const currentIndex = UserDetails.findIndex(
                (u) => u.id === selectedId
              );
              const nextIndex = (currentIndex + 1) % UserDetails.length;
              setDirection(1);
              setSelectedId(UserDetails[nextIndex].id);
              playAudio("forward");
            }}
            onPrev={() => {
              const currentIndex = UserDetails.findIndex(
                (u) => u.id === selectedId
              );
              const prevIndex =
                (currentIndex - 1 + UserDetails.length) % UserDetails.length;
              setDirection(-1);
              setSelectedId(UserDetails[prevIndex].id);
              playAudio("back");
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
