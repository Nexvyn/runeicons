"use client";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { AnimatePresence, useAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const TOOLTIP_TIMING = { duration: 0.16, ease: EASE_OUT };
const SNAPBACK = {
  type: "spring" as const,
  stiffness: 600,
  damping: 20,
  mass: 0.9,
};
const CLICK_GUARD_MS = 150;

const FLOAT = [
  {
    y: [0, -10, -4, -13, 0],
    rotate: [-0.7, 0.85, -0.3, 1.25, -0.7],
    times: [0, 0.3, 0.6, 0.8, 1],
    duration: 7.5,
    delay: 0,
  },
  {
    y: [-3, -13, -1, -15, -3],
    rotate: [0.4, -0.8, 0.85, -0.3, 0.4],
    times: [0, 0.25, 0.55, 0.8, 1],
    duration: 8,
    delay: -2.5,
  },
  {
    y: [-5, -14, -2, -11, -5],
    rotate: [0.75, -0.4, 0.35, -0.8, 0.75],
    times: [0, 0.2, 0.55, 0.75, 1],
    duration: 7,
    delay: -4.2,
  },
  {
    y: [-1, -12, -3, -14, -1],
    rotate: [-0.3, 0.75, -0.7, 0.4, -0.3],
    times: [0, 0.35, 0.65, 0.85, 1],
    duration: 8.5,
    delay: -1.3,
  },
  {
    y: [-3, -15, -2, -13, -3],
    rotate: [0.55, -0.9, 0.5, -0.65, 0.55],
    times: [0, 0.28, 0.58, 0.82, 1],
    duration: 7.5,
    delay: -3.4,
  },
];

interface CardProps {
  user: {
    id: number;
    name: string;
    description?: string;
    industry?: string;
    status?: string;
    socials?: { type: string; url: string }[];
    img: string;
    accentColor?: string;
    needsOutline?: boolean;
  };
  index?: number;
  size?: number;
  onClick: () => void;
  onPlayAudio?: (sound: string) => void;
  isDetailOpen?: boolean;
  isFocused?: boolean;
}

const Card = ({
  user,
  index = 0,
  size = 192,
  onClick,
  onPlayAudio,
  isDetailOpen = false,
}: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const dragControls = useAnimation();
  const isDragging = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const float = FLOAT[index % FLOAT.length];
  const showTooltip = isHovered && !isDetailOpen;
  const entranceDelay = 0.04 + index * 0.06;

  return (
    <m.div
      role="button"
      tabIndex={0}
      drag={isDetailOpen ? false : true}
      dragMomentum={false}
      dragElastic={0.35}
      animate={dragControls}
      onTap={() => {
        if (!isDragging.current) onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => {
        if (!isDetailOpen && !isDragging.current) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={() => {
        setIsHovered(false);
        isDragging.current = true;
        onPlayAudio?.("tap");
      }}
      onDragEnd={async () => {
        onPlayAudio?.("release");
        await dragControls.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          transition: SNAPBACK,
        });
        setTimeout(() => {
          if (isMounted.current) isDragging.current = false;
        }, CLICK_GUARD_MS);
      }}
      style={{
        position: "relative",
        display: "block",
        cursor: isDetailOpen ? "pointer" : "grab",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <AnimatePresence>
        {showTooltip && (
          <m.span
            key="tip"
            className="pointer-events-none absolute left-1/2 z-10 rounded-full border border-white/10 bg-[#0d0d0d] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white/90"
            style={{
              bottom: "calc(100% + 8px)",
              translateX: "-50%",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={TOOLTIP_TIMING}
          >
            {user.name}
          </m.span>
        )}
      </AnimatePresence>

      <m.div
        className="block"
        style={{ willChange: "transform" }}
        initial={
          reduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.92, y: 12 }
        }
        animate={
          reduceMotion || isDetailOpen
            ? { opacity: 1, scale: 1, y: 0, rotate: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: float.y,
                rotate: float.rotate,
              }
        }
        transition={
          reduceMotion || isDetailOpen
            ? { duration: 0.4, ease: EASE_OUT }
            : {
                opacity: { duration: 0.4, delay: entranceDelay, ease: EASE_OUT },
                scale: { duration: 0.4, delay: entranceDelay, ease: EASE_OUT },
                y: {
                  duration: float.duration,
                  delay: float.delay,
                  times: float.times,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
                rotate: {
                  duration: float.duration,
                  delay: float.delay,
                  times: float.times,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
              }
        }
      >
        <m.div
          style={{ width: size, height: size }}
          animate={{ scale: isHovered && !isDetailOpen ? 1.04 : 1 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          <Image
            src={user.img}
            alt={user.name}
            width={size}
            height={size}
            className="pointer-events-none block size-full object-cover"
            style={
              user.needsOutline && user.accentColor
                ? {
                    filter: `drop-shadow(0 0 3px ${user.accentColor}) drop-shadow(0 0 8px ${user.accentColor})`,
                  }
                : undefined
            }
            draggable={false}
            priority
          />
        </m.div>
      </m.div>
    </m.div>
  );
};

export default Card;
