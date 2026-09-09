'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BlossomColorPicker as VendorBlossomColorPicker,
  blossomPickerStyles,
} from '@/components/icon-page/blossom-vendor';
import type { BlossomColorPickerColor } from '@/components/icon-page/blossom-vendor/types';
import { normalizeHexColor } from '@/lib/color-utils';
import { cn } from '@/lib/utils';
import { BlossomColorPickerProps } from './types';
import { hexToPickerValue, VENDOR_PICKER_DEFAULTS } from './vendor-bridge';
import { usePickerPortal } from '@/components/icon-page/panels/properties/picker-portal-context';

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = blossomPickerStyles;
  document.head.appendChild(style);
  stylesInjected = true;
}

export const BlossomColorPicker = ({
  value,
  defaultValue,
  onChange,
  onDismiss,
  disabled = false,
  portalContainer,
  className,
}: BlossomColorPickerProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const portalHostRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<VendorBlossomColorPicker | null>(null);
  const onChangeRef = useRef(onChange);
  const onDismissRef = useRef(onDismiss);
  const rafRef = useRef<number | null>(null);

  // Prefer the panel-level portal container from context; fall back to prop or body.
  const panelPortal = usePickerPortal();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  onChangeRef.current = onChange;
  onDismissRef.current = onDismiss;

  // Resolve portal target: panel portal (absolute) > prop > document.body (fixed)
  useEffect(() => {
    setPortalTarget(panelPortal ?? portalContainer ?? document.body);
  }, [panelPortal, portalContainer]);

  const syncPortalPosition = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const anchor = anchorRef.current;
      const portal = portalHostRef.current;
      if (!anchor || !portal) return;

      const anchorRect = anchor.getBoundingClientRect();

      if (panelPortal) {
        // Absolute positioning relative to the panel portal overlay
        const containerRect = panelPortal.getBoundingClientRect();
        portal.style.position = 'absolute';
        portal.style.left = `${anchorRect.left - containerRect.left}px`;
        portal.style.top = `${anchorRect.top - containerRect.top}px`;
      } else {
        // Fixed positioning relative to viewport (fallback / no panel context)
        portal.style.position = 'fixed';
        portal.style.left = `${anchorRect.left}px`;
        portal.style.top = `${anchorRect.top}px`;
      }

      portal.style.width = `${anchorRect.width}px`;
      portal.style.height = `${anchorRect.height}px`;
      portal.style.zIndex = '9999';
      portal.style.pointerEvents = 'auto';
    });
  }, [panelPortal]);

  const handleVendorChange = useCallback((color: BlossomColorPickerColor) => {
    onChangeRef.current?.(normalizeHexColor(color.hex, '#007aff'));
  }, []);

  const handleVendorCollapse = useCallback((color: BlossomColorPickerColor) => {
    onDismissRef.current?.(normalizeHexColor(color.hex, '#007aff'));
  }, []);

  useLayoutEffect(() => {
    if (!portalTarget) return;

    const portal = portalHostRef.current;
    if (!portal) return;

    injectStyles();

    const initialHex = normalizeHexColor(
      value ?? defaultValue ?? '#007aff',
      '#007aff',
    );

    const instance = new VendorBlossomColorPicker(portal, {
      ...VENDOR_PICKER_DEFAULTS,
      value: hexToPickerValue(initialHex),
      onChange: handleVendorChange,
      onCollapse: handleVendorCollapse,
      disabled,
    });

    const originalSetExpanded = (instance as any).setExpanded.bind(instance);
    (instance as any).setExpanded = function (expanded: boolean) {
      originalSetExpanded(expanded);
      if (expanded && portal.parentNode && portal.parentNode.lastChild !== portal) {
        portal.parentNode.appendChild(portal);
      }
    };

    instanceRef.current = instance;
    syncPortalPosition();

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, [
    portalTarget,
    defaultValue,
    handleVendorChange,
    handleVendorCollapse,
    syncPortalPosition,
  ]);

  useEffect(() => {
    instanceRef.current?.setOptions({ disabled });
  }, [disabled]);

  useEffect(() => {
    if (!instanceRef.current || value === undefined) return;
    const currentHue = instanceRef.current.getValue().hue;
    instanceRef.current.setValue(
      hexToPickerValue(normalizeHexColor(value, '#007aff'), 100, currentHue),
    );
  }, [value]);

  useEffect(() => {
    syncPortalPosition();
    window.addEventListener('resize', syncPortalPosition);
    window.addEventListener('scroll', syncPortalPosition);
    return () => {
      window.removeEventListener('resize', syncPortalPosition);
      window.removeEventListener('scroll', syncPortalPosition);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [syncPortalPosition]);

  useEffect(() => {
    const portal = portalHostRef.current;
    if (!portal) return;

    const bringToFront = () => {
      if (portal.parentNode && portal.parentNode.lastChild !== portal) {
        portal.parentNode.appendChild(portal);
      }
    };

    portal.addEventListener('mousedown', bringToFront);
    return () => portal.removeEventListener('mousedown', bringToFront);
  }, []);

  const portalNode =
    portalTarget &&
    createPortal(
      <div ref={portalHostRef} aria-hidden={false} />,
      portalTarget,
    );

  return (
    <>
      <div
        ref={anchorRef}
        className={cn(
          'relative inline-flex h-7 w-7 shrink-0 items-center justify-center',
          className,
        )}
      />
      {portalNode}
    </>
  );
};
