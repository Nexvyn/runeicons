"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { animate, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";

import { useTuning } from "@/components/icon-page/tuning";
import { cn } from "@/lib/utils";

const DEAD_ZONE = 32;
const MAX_CURSOR_RANGE = 200;
const MAX_STRETCH = 8;

interface ScrubberProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  initialValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  showInput?: boolean;
  showCenterDivider?: boolean;
  rightSlot?: React.ReactNode;
  showTicks?: boolean;
  showFill?: boolean;
}

export const Scrubber: React.FC<ScrubberProps> = ({
  label,
  min = -20,
  max = 50,
  step = 1,
  value: controlledValue,
  initialValue = 50,
  onChange,
  disabled = false,
  className,
  trackClassName,
  fillClassName,
  showInput = true,
  showCenterDivider = false,
  rightSlot,
  showTicks = true,
  showFill = true,
}) => {
  const { values } = useTuning();
  const [internalValue, setInternalValue] = useState(controlledValue ?? initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState((controlledValue ?? initialValue).toString());
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const initialPercentage = ((value - min) / (max - min)) * 100;
  const xPercent = useMotionValue(initialPercentage);

  useEffect(() => {
    if (controlledValue !== undefined) {
      const percentage = ((controlledValue - min) / (max - min)) * 100;
      xPercent.set(percentage);
    }
  }, [controlledValue, min, max, xPercent]);

  const springX = useSpring(xPercent, {
    stiffness: values.scrubberSpringStiffness,
    damping: values.scrubberSpringDamping,
  });
  const thumbPos = useTransform(springX, [0, 100], ["calc(0% + 8px)", "calc(100% - 8px)"]);

  const progressScaleX = useTransform(springX, (v) => Math.max(0, v / 100));
  const progressTransform = useMotionTemplate`scaleX(${progressScaleX})`;

  const valueMaskImage = useTransform(
    springX,
    (v) =>
      `linear-gradient(to right, transparent 0%, transparent calc(${v}% - 10px), black calc(${v}% + 10px), black 100%)`,
  );

  const rubberStretchPx = useMotionValue(0);
  const rubberBandWidth = useTransform(
    rubberStretchPx,
    (stretch) => `calc(100% + ${Math.abs(stretch)}px)`
  );
  const rubberBandX = useTransform(
    rubberStretchPx,
    (stretch) => (stretch < 0 ? stretch : 0)
  );

  useEffect(() => {
    const checkOverlap = () => {
      if (containerRef.current && labelRef.current && valueRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const labelRect = labelRef.current.getBoundingClientRect();
        const valueRect = valueRef.current.getBoundingClientRect();

        const currentX = springX.get();
        const thumbX = containerRect.left + (currentX / 100) * containerRect.width;
        const notchLeft = thumbX - 8;
        const notchRight = thumbX + 8;

        const overlapsLabel = notchLeft < labelRect.right && notchRight > labelRect.left;
        const overlapsValue = notchLeft < valueRect.right && notchRight > valueRect.left;

        setIsOverlapping(overlapsLabel || overlapsValue);
      }
    };

    const unsubscribe = springX.on("change", checkOverlap);
    window.addEventListener("resize", checkOverlap);
    checkOverlap();

    return () => {
      unsubscribe();
      window.removeEventListener("resize", checkOverlap);
    };
  }, [label, springX]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const snapToStep = useCallback(
    (val: number): number => {
      const stepped = Math.round((val - min) / step) * step + min;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step],
  );

  const handleEditCommit = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) parsed = value;
    const clamped = snapToStep(Math.max(min, Math.min(max, parsed)));

    if (controlledValue === undefined) {
      setInternalValue(clamped);
      xPercent.set(((clamped - min) / (max - min)) * 100);
    }
    onChange?.(clamped);
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditCommit();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(value.toString());
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isEditing || (showInput && document.activeElement === inputRef.current)) return;

    let delta = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    else if (e.key === "PageDown") delta = -step * 10;
    else if (e.key === "PageUp") delta = step * 10;
    else if (e.key === "Home") {
      onChange?.(min);
      return;
    } else if (e.key === "End") {
      onChange?.(max);
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      const newValue = snapToStep(value + delta);
      onChange?.(newValue);
    }
  };

  const computeRubberStretch = (clientX: number, sign: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const distancePast = sign < 0 ? rect.left - clientX : clientX - rect.right;
    const overflow = Math.max(0, distancePast - DEAD_ZONE);
    return (
      sign *
      MAX_STRETCH *
      Math.sqrt(Math.min(overflow / MAX_CURSOR_RANGE, 1.0))
    );
  };

  const updateValue = (clientX: number, isDragging: boolean = false) => {
    if (!containerRef.current || disabled) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging) {
      if (clientX < rect.left) {
        rubberStretchPx.set(computeRubberStretch(clientX, -1));
      } else if (clientX > rect.right) {
        rubberStretchPx.set(computeRubberStretch(clientX, 1));
      } else {
        rubberStretchPx.set(0);
      }
    }

    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = pos * (max - min) + min;
    const newValue = snapToStep(rawValue);

    xPercent.set(pos * 100);
    if (value !== newValue) {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      if (isDragging && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(5);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current || isEditing || disabled) return;
    if (showInput && e.target === inputRef.current) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateValue(e.clientX, true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !isDragging) return;

    if (e.buttons === 1) {
      updateValue(e.clientX, true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (rubberStretchPx.get() !== 0) {
      animate(rubberStretchPx, 0, {
        type: "spring",
        stiffness: 400,
        damping: 30,
      });
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  return (
    <motion.div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleSliderKeyDown}
      style={{ width: rubberBandWidth, x: rubberBandX }}
      className={cn(
        "group relative h-[34px] w-full touch-none overflow-hidden rounded-sm border border-border/40 bg-muted/10 transition-all",
        className,
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing",
        (isEditing ||
          (showInput &&
            typeof document !== "undefined" &&
            document.activeElement === inputRef.current)) &&
          "border-brand/40 ring-1 ring-brand/20",
        isHovered && !disabled && "border-border/60 bg-muted/20",
      )}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          trackClassName,
        )}
      >
        {showTicks && (
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <div className="flex w-full justify-between px-[10px] opacity-[0.06]">
              {(() => {
                const discreteSteps = Math.min(20, Math.floor((max - min) / step));
                const count = discreteSteps > 1 ? discreteSteps + 1 : 11;
                return Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[1px] bg-foreground/50"
                    style={{
                      height: i % 5 === 0 || count <= 11 ? "5px" : "3px",
                    }}
                  />
                ));
              })()}
            </div>
          </div>
        )}
        {showFill && (
          <motion.div
            style={{ transform: progressTransform, transformOrigin: "left" }}
            animate={{
              backgroundColor: fillClassName ? undefined : "var(--brand)",
              opacity: isDragging ? 0.2 : 0.12,
            }}
            transition={{ duration: 0.1 }}
            className={cn("absolute top-0 right-0 bottom-0 left-0 z-0", fillClassName)}
          />
        )}
        {showCenterDivider && (
          <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-[5] w-px -translate-x-1/2 bg-border/50" />
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center px-2 text-[10px] uppercase tracking-widest text-foreground/70 select-none">
        <div className="flex w-full items-center justify-between">
          <span ref={labelRef} className="ml-1">
            {label}
          </span>
          {rightSlot ? (
            <div ref={valueRef} className="flex items-center" onPointerDown={(e) => e.stopPropagation()}>
              {rightSlot}
            </div>
          ) : (
            <div
              ref={valueRef}
              className="pointer-events-auto flex items-center gap-1"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValue(val);

                  const parsed = parseFloat(val);
                  if (!isNaN(parsed)) {
                    const clamped = Math.max(min, Math.min(max, parsed));
                    const percentage = ((clamped - min) / (max - min)) * 100;
                    xPercent.set(percentage);

                    if (parsed >= min && parsed <= max) {
                      onChange?.(parsed);
                    }
                  }
                }}
                onBlur={(e) => {
                  handleEditCommit();
                  setIsEditing(false);
                }}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setIsEditing(true)}
                className={cn(
                  "w-10 bg-transparent text-right text-[11px] font-mono tabular-nums transition-all outline-none",
                  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                  "cursor-ew-resize border border-transparent px-1 py-0.5",
                  "hover:bg-muted/20",
                  "focus:cursor-text focus:bg-background/20",
                )}
              />
            </div>
          )}
        </div>
      </div>

      {!showInput && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <motion.div
            style={{ maskImage: valueMaskImage, WebkitMaskImage: valueMaskImage }}
            className="absolute inset-0 flex items-center justify-end px-2"
          >
            {!isEditing && (
              <div ref={valueRef} className="flex items-center text-[10px] uppercase tracking-widest text-foreground/70">
                {rightSlot ?? <span className="font-mono">{value}</span>}
              </div>
            )}
          </motion.div>
        </div>
      )}

      <motion.div
        className="pointer-events-none absolute top-0 z-20 h-full w-4"
        style={{ left: thumbPos, x: "-50%" }}
      >
        <div className="absolute inset-0 flex h-full items-center justify-center">
          <motion.div
            animate={{
              backgroundColor: "var(--brand)",
              width: isDragging ? 3 : 2,
              height: isDragging ? 16 : 14,
              opacity: isOverlapping ? 0.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 35,
            }}
            className="rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
