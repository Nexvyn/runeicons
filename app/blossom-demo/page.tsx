'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BlossomColorPicker,
} from '@/components/icon-page/blossom-vendor/BlossomColorPicker';
import { blossomPickerStyles } from '@/components/icon-page/blossom-vendor/styles';
import type { BlossomColorPickerColor } from '@/components/icon-page/blossom-vendor/types';

let stylesInjected = false;
function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = blossomPickerStyles;
  document.head.appendChild(style);
  stylesInjected = true;
}

function hexToRgbString(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function PickerDemo({
  id,
  label,
  colors,
  sliderPosition,
  onColorChange,
  showAlphaSlider = true,
  coreSize,
  petalSize,
}: {
  id: string;
  label: string;
  colors?: string[] | { h: number; s: number; l: number }[];
  sliderPosition?: 'top' | 'bottom' | 'left' | 'right';
  onColorChange: (color: BlossomColorPickerColor) => void;
  showAlphaSlider?: boolean;
  coreSize?: number;
  petalSize?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<BlossomColorPicker | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    injectStyles();

    const instance = new BlossomColorPicker(container, {
      colors,
      onChange: onColorChange,
      showAlphaSlider,
      sliderPosition,
      coreSize,
      petalSize,
      collapsible: true,
    });

    instanceRef.current = instance;

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, [id]);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div ref={containerRef} className="inline-block" />
    </div>
  );
}

export default function BlossomDemoPage() {
  const [defaultColor, setDefaultColor] = useState<BlossomColorPickerColor | null>(null);

  const colorCard = (color: BlossomColorPickerColor | null) => {
    if (!color) return <span className="text-muted-foreground text-sm">Pick a color...</span>;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: color.hex }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-foreground font-semibold">
              {color.hex.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {hexToRgbString(color.hex)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-muted rounded px-2 py-1">{color.hsl}</div>
          <div className="bg-muted rounded px-2 py-1">{color.hsla}</div>
          <div className="bg-muted rounded px-2 py-1">{color.rgb}</div>
          <div className="bg-muted rounded px-2 py-1">{color.rgba}</div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Blossom Color Picker
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A radial, petal-based color picker. Click the center to bloom, select a petal, then drag the arc slider to adjust lightness. Hover to expand when configured.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <PickerDemo
            id="default"
            label="Default Palette"
            onColorChange={setDefaultColor}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Selected Color</h3>
          {colorCard(defaultColor)}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">How to use:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click the center circle to open the color bloom.</li>
            <li>Hover over petals to preview; click to select.</li>
            <li>Drag the arc slider to adjust lightness / saturation.</li>
            <li>Click outside or the center again to collapse.</li>
            <li>Works with both mouse and touch input.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
