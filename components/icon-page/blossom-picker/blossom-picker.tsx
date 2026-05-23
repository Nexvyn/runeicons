'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { 
    HexColor, 
    colorsMatch, 
    rgbToHex 
} from '@/lib/color-utils';
import { cn } from '@/lib/utils';
import { 
    Point, 
    getExpandedMetrics, 
    clampPortalPosition 
} from '@/lib/blossom-utils';
import { 
    BLOSSOM_DEFAULT_COLOR, 
    BLOSSOM_LAYOUT_DEFAULTS, 
    BLOSSOM_STYLE_DEFAULTS, 
    BLOSSOM_NUMBERS, 
    DEFAULT_BLOSSOM_PALETTE 
} from './constants';
import { BlossomScene } from './blossom-scene';
import { useBlossomColorPickerModel } from '@/hooks/use-blossom-picker';
import { BlossomColorPickerProps } from './types';
type Ring = 'inner' | 'outer';
const POP_EASE = [0.22, 1, 0.36, 1] as const;
export const BlossomColorPicker = ({
    value,
    defaultValue,
    onChange,
    onDismiss,
    layout = BLOSSOM_LAYOUT_DEFAULTS,
    palette = DEFAULT_BLOSSOM_PALETTE,
    styleConfig = BLOSSOM_STYLE_DEFAULTS,
    portalContainer,
    disabled = false,
    className,
}: BlossomColorPickerProps) => {
    const {
        selectedColor,
        hue,
        saturation,
        lightness,
        isOpen,
        setIsOpen,
        hoveredPetalIndex,
        setHoveredPetalIndex,
        hoveredRing,
        setHoveredRing,
        isDraggingArc,
        setIsDraggingArc,
        dragPointerIdRef,
        commitColor,
        updateLightness,
        clearHover,
    } = useBlossomColorPickerModel({
        value,
        defaultValue,
        onChange,
        defaultColor: BLOSSOM_DEFAULT_COLOR,
    });
    const resolvedLayout = { ...BLOSSOM_LAYOUT_DEFAULTS, ...layout };
    const resolvedStyle = { ...BLOSSOM_STYLE_DEFAULTS, ...styleConfig };
    const metrics = getExpandedMetrics(
        resolvedLayout, 
        resolvedStyle, 
        BLOSSOM_NUMBERS.viewPadding, 
        BLOSSOM_NUMBERS.outerRingInset
    );
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [anchor, setAnchor] = useState<Point | null>(null);
    const portalTarget = portalContainer ?? (typeof document !== 'undefined' ? document.body : null);
    const syncAnchor = useCallback(() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const left = clampPortalPosition(
            rect.left + rect.width / 2 - metrics.totalSize / 2,
            window.innerWidth,
            metrics.totalSize,
            BLOSSOM_NUMBERS.viewportPadding
        );
        const top = clampPortalPosition(
            rect.top + rect.height / 2 - metrics.totalSize / 2,
            window.innerHeight,
            metrics.totalSize,
            BLOSSOM_NUMBERS.viewportPadding
        );
        setAnchor({ x: left, y: top });
    }, [metrics.totalSize]);
    const [focusedPetalIndex, setFocusedPetalIndex] = useState<number | null>(null);
    const [focusedRing, setFocusedRing] = useState<Ring | null>(null);
    const closePicker = useCallback(() => {
        if (!isOpen) return;
        setIsOpen(false);
        clearHover();
        setFocusedPetalIndex(null);
        setFocusedRing(null);
        onDismiss?.(selectedColor);
    }, [isOpen, setIsOpen, clearHover, onDismiss, selectedColor]);
    const openPicker = useCallback(() => {
        if (disabled) return;
        syncAnchor();
        setIsOpen(true);
        setFocusedRing('outer');
        setFocusedPetalIndex(0);
    }, [disabled, syncAnchor, setIsOpen]);
    const handleSelectColor = (color: HexColor) => {
        if (colorsMatch(color, selectedColor)) {
            closePicker();
            return;
        }
        commitColor(color);
    };
    const handlePetalSelection = (index: number, ring: 'inner' | 'outer') => {
        const ringPalette = ring === 'inner' ? palette.ring_1 : palette.ring_2;
        handleSelectColor(rgbToHex(ringPalette[index % ringPalette.length]));
    };
    const handleCenterSelection = () => {
        handleSelectColor(rgbToHex(palette.center[0]));
    };
    const handleArcPointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        setIsDraggingArc(true);
        dragPointerIdRef.current = e.pointerId;
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;
            let angle = (Math.atan2(localY - metrics.center.y, localX - metrics.center.x) * 180) / Math.PI;
            angle = Math.max(BLOSSOM_NUMBERS.arcStartAngle, Math.min(BLOSSOM_NUMBERS.arcEndAngle, angle));
            const normalized =
                (angle - BLOSSOM_NUMBERS.arcStartAngle) /
                (BLOSSOM_NUMBERS.arcEndAngle - BLOSSOM_NUMBERS.arcStartAngle);
            updateLightness((1 - normalized) * 100);
        }
    };
    useEffect(() => {
        if (!isOpen) return;
        const handleOutsidePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (portalRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
            closePicker();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePicker();
                buttonRef.current?.focus();
            }
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                const count = focusedRing === 'inner' ? resolvedLayout.innerPetalCount : resolvedLayout.outerPetalCount;
                const delta = event.key === 'ArrowRight' ? 1 : -1;
                setFocusedPetalIndex((prev) => {
                    const current = prev ?? 0;
                    return (current + delta + count) % count;
                });
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                setFocusedRing((prev) => (prev === 'outer' ? 'inner' : 'outer'));
                const nextCount = focusedRing === 'outer' ? resolvedLayout.innerPetalCount : resolvedLayout.outerPetalCount;
                setFocusedPetalIndex((prev) => (prev ?? 0) % nextCount);
            }
            if (event.key === 'Enter' && focusedPetalIndex !== null && focusedRing !== null) {
                handlePetalSelection(focusedPetalIndex, focusedRing);
            }
        };
        const handleViewportChange = () => syncAnchor();
        document.addEventListener('pointerdown', handleOutsidePointerDown, true);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);
        return () => {
            document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [isOpen, syncAnchor, closePicker]);
        useEffect(() => {
        if (!isDraggingArc) return;
        const handlePointerMove = (event: PointerEvent) => {
            if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return;
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;
            let angle = (Math.atan2(localY - metrics.center.y, localX - metrics.center.x) * 180) / Math.PI;
            angle = Math.max(BLOSSOM_NUMBERS.arcStartAngle, Math.min(BLOSSOM_NUMBERS.arcEndAngle, angle));
            const normalized =
                (angle - BLOSSOM_NUMBERS.arcStartAngle) /
                (BLOSSOM_NUMBERS.arcEndAngle - BLOSSOM_NUMBERS.arcStartAngle);
            updateLightness((1 - normalized) * 100);
        };
        const handlePointerUp = (event: PointerEvent) => {
            if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return;
            dragPointerIdRef.current = null;
            setIsDraggingArc(false);
        };
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDraggingArc, metrics.center, setIsDraggingArc, updateLightness, dragPointerIdRef]);
    return (
        <div className={cn("flex items-center", className)}>
            <motion.button
                ref={buttonRef}
                type="button"
                className="blossom-picker-swatch group relative focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full outline-none"
                onClick={openPicker}
                style={{
                    width: BLOSSOM_NUMBERS.collapsedSwatchSize,
                    height: BLOSSOM_NUMBERS.collapsedSwatchSize,
                    borderRadius: '50%',
                    backgroundColor: selectedColor,
                    border: 'none',
                    boxShadow: `0 0 0 1px hsl(var(--foreground) / 0.15), 0 2px 4px hsl(var(--foreground) / 0.08)`,
                    cursor: disabled ? 'default' : 'pointer',
                }}
                whileHover={disabled ? {} : { scale: 1.03 }}
                whileTap={disabled ? {} : { scale: 0.97 }}
                disabled={disabled}
                aria-label="Pick color"
            />
            {anchor && portalTarget && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={portalRef}
                            style={{
                                position: 'fixed',
                                left: anchor.x,
                                top: anchor.y,
                                width: metrics.totalSize,
                                height: metrics.totalSize,
                                zIndex: 9999,
                                pointerEvents: 'none',
                            }}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <BlossomScene
                                svgRef={svgRef}
                                center={metrics.center}
                                ringRadius={metrics.ringRadius}
                                sliderRadius={metrics.sliderRadius}
                                totalSize={metrics.totalSize}
                                selectedColor={selectedColor}
                                hue={hue}
                                saturation={saturation}
                                lightness={lightness}
                                hoveredPetalIndex={hoveredPetalIndex}
                                hoveredRing={hoveredRing}
                        focusedPetalIndex={focusedPetalIndex}
                        focusedRing={focusedRing}
                        isDraggingArc={isDraggingArc}
                                layout={resolvedLayout}
                                styleConfig={resolvedStyle}
                                palette={palette}
                                onPetalClick={handlePetalSelection}
                                onCenterClick={handleCenterSelection}
                                onArcPointerDown={handleArcPointerDown}
                                onPetalHover={(idx, ring) => {
                                    setHoveredPetalIndex(idx);
                                    setHoveredRing(ring);
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>,
                portalTarget
            )}
        </div>
    );
};
