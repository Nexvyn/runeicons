"use client";

import React, { useState, useEffect } from "react";
import { BlossomColorPicker } from "@/components/icon-page/blossom-picker/blossom-picker";
import { HexColor } from "@/lib/color-utils";

interface ColorRowProps {
  label: string;
  value: HexColor;
  onChange: (color: HexColor) => void;
  disabled?: boolean;
  position?: number;
  onPositionChange?: (position: number) => void;
}

export function ColorRow({ 
  label, 
  value, 
  onChange, 
  disabled, 
  position, 
  onPositionChange 
}: ColorRowProps) {
  const [inputValue, setInputValue] = useState(value.replace("#", ""));
  const [posValue, setPosValue] = useState(position?.toString() ?? "0");

  useEffect(() => {
    setInputValue(value.replace("#", ""));
  }, [value]);

  useEffect(() => {
    if (position !== undefined) {
      setPosValue(position.toString());
    }
  }, [position]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (/^[0-9A-Fa-f]{6}$/.test(val) || /^[0-9A-Fa-f]{3}$/.test(val)) {
      onChange(`#${val}` as HexColor);
      return;
    }

    const rgbMatch = val.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      onChange(`#${r}${g}${b}` as HexColor);
      return;
    }

    const simpleRgbMatch = val.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
    if (simpleRgbMatch) {
      const r = parseInt(simpleRgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(simpleRgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(simpleRgbMatch[3]).toString(16).padStart(2, '0');
      onChange(`#${r}${g}${b}` as HexColor);
    }
  };

  const handlePosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPosValue(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && onPositionChange) {
      onPositionChange(Math.max(0, Math.min(100, parsed)));
    }
  };

  const handleBlur = () => {
    setInputValue(value.replace("#", ""));
    if (position !== undefined) {
      setPosValue(position.toString());
    }
  };

  return (
    <div className="relative grid grid-cols-3 items-center group h-[34px] px-2 rounded-md border border-border/60 bg-muted/10 transition-colors hover:border-foreground/20">
      <span className="text-[10px] uppercase tracking-widest text-foreground/70 transition-colors ml-1">
        {label}
      </span>
      <div className="flex items-center justify-center gap-2">
        {position !== undefined && (
          <div className="h-7 px-1.5 flex items-center bg-muted/20 border border-border/80 rounded-sm focus-within:border-foreground/30 transition-colors">
            <input
              type="text"
              value={posValue}
              onChange={handlePosChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-8 bg-transparent text-[11px] font-mono tabular-nums text-right focus:outline-none transition-colors pr-0.5 mt-[0.5px]"
            />
            <span className="text-[9px] text-foreground/30 select-none mt-[1px]">%</span>
          </div>
        )}
        <div className="relative flex items-center justify-center h-7 w-7 rounded-full bg-muted/10 border border-border/80 transition-transform active:scale-[0.96] cursor-pointer">
          <div className="absolute inset-0 rounded-full" />
          <BlossomColorPicker
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex items-center justify-end">
        <div className="h-7 px-1.5 flex items-center bg-muted/20 border border-border/80 rounded-sm focus-within:border-foreground/30 transition-colors">
          <input
            id={`color-input-${label}`}
            type="text"
            value={inputValue.toUpperCase()}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-[52px] bg-transparent text-[11px] font-mono tabular-nums uppercase focus:outline-none transition-colors mt-[0.5px]"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
