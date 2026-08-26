"use client";

import { useState } from "react";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

const PRESETS = [5, 20, 100];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10000;

const HIGHLIGHT_CLASS =
  "absolute inset-0 rounded-xl bg-zinc-100 shadow-[0.222px_0.222px_0.314px_-0.5px_rgba(0,0,0,0.2),0.605px_0.605px_0.856px_-1px_rgba(0,0,0,0.18),1.329px_1.329px_1.88px_-1.5px_rgba(0,0,0,0.25),2.95px_2.95px_4.172px_-2px_rgba(0,0,0,0.1),2.5px_2.5px_3px_-2.5px_rgba(0,0,0,0.15),-0.5px_-0.5px_0px_rgba(0,0,0,0.1),inset_0.5px_0.5px_1px_#FFFFFF,inset_-0.5px_-0.5px_1px_rgba(0,0,0,0.15)] dark:bg-zinc-800 dark:shadow-[0.222px_0.222px_0.314px_-0.5px_rgba(0,0,0,0.35),0.605px_0.605px_0.856px_-1px_rgba(0,0,0,0.3),1.329px_1.329px_1.88px_-1.5px_rgba(0,0,0,0.35),2.95px_2.95px_4.172px_-2px_rgba(0,0,0,0.28),2.5px_2.5px_3px_-2.5px_rgba(0,0,0,0.35),inset_0.5px_0.5px_1px_rgba(255,255,255,0.08),inset_-0.5px_-0.5px_1px_rgba(0,0,0,0.4)]";

interface AmountSelectorProps {
  selectedAmount: number;
  customMode: boolean;
  onAmountChange: (amount: number) => void;
  onCustomModeChange: (customMode: boolean) => void;
}

export function AmountSelector({
  selectedAmount,
  customMode,
  onAmountChange,
  onCustomModeChange,
}: AmountSelectorProps) {
  const [customValue, setCustomValue] = useState("");

  const handlePreset = (amount: number) => {
    onCustomModeChange(false);
    onAmountChange(amount);
  };

  const handleCustom = () => {
    onCustomModeChange(true);
    const num = parseInt(customValue, 10);
    onAmountChange(num > 0 ? num : 0);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stripped = e.target.value.replace(/[^0-9]/g, "");

    if (stripped === "") {
      setCustomValue("");
      onAmountChange(0);
      return;
    }

    let num = parseInt(stripped, 10);
    if (num > MAX_AMOUNT) num = MAX_AMOUNT;

    setCustomValue(String(num));
    onAmountChange(num);
  };

  const handleCustomBlur = () => {
    const num = parseInt(customValue, 10);
    if (!num || num < MIN_AMOUNT) {
      setCustomValue(String(MIN_AMOUNT));
      onAmountChange(MIN_AMOUNT);
    }
  };

  return (
    <div>
      <div className="rounded-xl bg-white dark:bg-zinc-900">
        <div className="flex w-full gap-1 rounded-xl bg-black/10 p-1 shadow-[0px_1px_0px_rgba(255,255,255,0.25),inset_0px_1px_2px_rgba(0,0,0,0.15)] dark:bg-white/10 dark:shadow-[0px_1px_0px_rgba(0,0,0,0.25),inset_0px_1px_2px_rgba(255,255,255,0.08)]">
          {PRESETS.map((amount) => {
            const isActive = !customMode && amount === selectedAmount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => handlePreset(amount)}
                className="relative flex flex-1 cursor-pointer items-center justify-center py-3 text-[13px] font-medium"
              >
                {isActive && (
                  <m.div
                    layoutId="amount-highlight"
                    className={HIGHLIGHT_CLASS}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-black dark:text-white" : "text-muted-foreground"
                  }`}
                >
                  ${amount}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleCustom}
            className="relative flex flex-1 cursor-pointer items-center justify-center py-3 text-[13px] font-medium"
          >
            {customMode && (
              <m.div
                layoutId="amount-highlight"
                className={HIGHLIGHT_CLASS}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span
              className={`relative z-10 ${
                customMode ? "text-black dark:text-white" : "text-muted-foreground"
              }`}
            >
              Custom
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {customMode && (
          <m.div
            key="custom-input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pt-3">
              <div className="flex items-center rounded-xl border border-border bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-700/30 dark:bg-zinc-900">
                <span className="pl-4 text-lg font-medium text-muted-foreground">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customValue}
                  onChange={handleCustomInput}
                  onBlur={handleCustomBlur}
                  autoFocus
                  className="flex-1 bg-transparent px-2 py-3 text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
                  aria-label="Custom contribution amount"
                  aria-valuemin={MIN_AMOUNT}
                  aria-valuemax={MAX_AMOUNT}
                />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
