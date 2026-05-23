import { useId } from 'react';
import { motion } from 'motion/react';
import { HexColor, hsbToHex, rgbToHex } from '@/lib/color-utils';
import { 
    Point, 
    BlossomLayoutConfig, 
    BlossomStyleConfig, 
    Ring, 
    getPetalPosition, 
    describeArc, 
    polarToCartesian 
} from '@/lib/blossom-utils';
import { BLOSSOM_NUMBERS } from './constants';
import { Petal } from './petal';
import { BlossomPalette } from './types';
interface BlossomSceneProps {
    center: Point;
    ringRadius: number;
    sliderRadius: number;
    totalSize: number;
    selectedColor: HexColor;
    hue: number;
    saturation: number;
    lightness: number;
    hoveredPetalIndex: number | null;
    hoveredRing: Ring | null;
    focusedPetalIndex: number | null;
    focusedRing: Ring | null;
    isDraggingArc: boolean;
    layout: BlossomLayoutConfig;
    styleConfig: BlossomStyleConfig;
    palette: BlossomPalette;
    onPetalClick: (index: number, ring: Ring) => void;
    onCenterClick: () => void;
    onArcPointerDown: (e: React.PointerEvent) => void;
    onPetalHover: (index: number | null, ring: Ring | null) => void;
    svgRef: React.RefObject<SVGSVGElement | null>;
}
const BLOSSOM_SPRING = {
    type: 'spring',
    stiffness: 170,
    damping: 15,
} as const;
const THUMB_SPRING = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
};
export function BlossomScene({
    center,
    ringRadius,
    sliderRadius,
    totalSize,
    selectedColor,
    hue,
    saturation,
    lightness,
    hoveredPetalIndex,
    hoveredRing,
    focusedPetalIndex,
    focusedRing,
    isDraggingArc,
    layout,
    styleConfig,
    palette,
    onPetalClick,
    onCenterClick,
    onArcPointerDown,
    onPetalHover,
    svgRef,
}: BlossomSceneProps) {
    const instanceId = useId();
    const thumbAngle =
        BLOSSOM_NUMBERS.arcStartAngle +
        (1 - lightness / 100) * (BLOSSOM_NUMBERS.arcEndAngle - BLOSSOM_NUMBERS.arcStartAngle);
    const thumbPosition = polarToCartesian(center, sliderRadius, thumbAngle);
    const currentThumbColor = hsbToHex({
        hue,
        saturation: saturation * (1 - (lightness / 100) * 0.8),
        brightness: 20 + (lightness / 100) * 80,
    });
    const arcSteps = Array.from({ length: BLOSSOM_NUMBERS.arcGradientSteps - 1 }, (_, index) => {
        const totalSteps = BLOSSOM_NUMBERS.arcGradientSteps - 1;
        const startT = index / totalSteps;
        const endT = (index + 1) / totalSteps;
        const startAngle =
            BLOSSOM_NUMBERS.arcStartAngle +
            startT * (BLOSSOM_NUMBERS.arcEndAngle - BLOSSOM_NUMBERS.arcStartAngle);
        const endAngle =
            BLOSSOM_NUMBERS.arcStartAngle +
            startT === (totalSteps - 1) / totalSteps ? BLOSSOM_NUMBERS.arcEndAngle : endT * (BLOSSOM_NUMBERS.arcEndAngle - BLOSSOM_NUMBERS.arcStartAngle);
        return {
            id: `${instanceId}-arc-${index}`,
            d: describeArc(center, sliderRadius, startAngle, endAngle),
            color: hsbToHex({
                hue,
                saturation: saturation * endT,
                brightness: Math.max(10, (1 - endT) * 80 + 20),
            }),
            delay: 0.1 + index * 0.012,
        };
    });
    return (
        <svg
            ref={svgRef}
            width={totalSize}
            height={totalSize}
            viewBox={`0 0 ${totalSize} ${totalSize}`}
            style={{
                overflow: 'visible',
                pointerEvents: 'auto',
                filter: 'drop-shadow(0 24px 40px hsl(var(--foreground) / 0.2))',
            }}
        >
            <motion.circle
                cx={center.x}
                cy={center.y}
                r={ringRadius}
                fill={selectedColor}
                fillOpacity={BLOSSOM_NUMBERS.outerRingFillOpacity}
                stroke={selectedColor}
                strokeWidth={styleConfig.outerRingBorderWidth}
                initial={{ scale: 0.72, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.72, opacity: 0 }}
                transition={{
                    ...BLOSSOM_SPRING,
                    delay: 0.04,
                }}
                style={{ transformOrigin: 'center' }}
            />
            {(['outer', 'inner'] as const).map((ring) => {
                const count = ring === 'inner' ? layout.innerPetalCount : layout.outerPetalCount;
                const ringPalette = ring === 'inner' ? palette.ring_1 : palette.ring_2;
                return Array.from({ length: count }).map((_, index) => {
                    const color = rgbToHex(ringPalette[index % ringPalette.length]);
                    const pos = getPetalPosition(index, ring, center, layout);
                    const isHovered = hoveredRing === ring && hoveredPetalIndex === index;
                    return (
                        <Petal
                            key={`${ring}-${index}`}
                            index={index}
                            ring={ring}
                            color={color}
                            x={pos.x}
                            y={pos.y}
                            center={center}
                            size={ring === 'inner' ? styleConfig.innerPetalSize : styleConfig.petalSize}
                            layout={layout}
                            isHovered={isHovered}
                            isFocused={focusedRing === ring && focusedPetalIndex === index}
                            onClick={() => onPetalClick(index, ring)}
                            onMouseEnter={() => onPetalHover(index, ring)}
                            onMouseLeave={() => onPetalHover(null, null)}
                        />
                    );
                });
            })}
            <motion.circle
                cx={center.x}
                cy={center.y}
                r={styleConfig.centerCircleSize / 2}
                fill={rgbToHex(palette.center[0])}
                stroke="hsl(var(--foreground) / 0.1)"
                strokeOpacity={BLOSSOM_NUMBERS.centerBorderOpacity}
                strokeWidth={BLOSSOM_NUMBERS.borderWidth}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                    ...BLOSSOM_SPRING,
                    delay: 0.1,
                }}
                style={{ cursor: 'pointer' }}
                onClick={onCenterClick}
            />
            <g>
                {arcSteps.map((step) => (
                    <motion.path
                        key={step.id}
                        d={step.d}
                        fill="none"
                        stroke={step.color}
                        strokeWidth={styleConfig.sliderWidth}
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            delay: step.delay,
                        }}
                    />
                ))}
                <path
                    d={describeArc(center, sliderRadius, BLOSSOM_NUMBERS.arcStartAngle, BLOSSOM_NUMBERS.arcEndAngle)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={styleConfig.sliderWidth + BLOSSOM_NUMBERS.arcThumbSizeOffset}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer' }}
                    onPointerDown={onArcPointerDown}
                />
                <motion.circle
                    cx={thumbPosition.x}
                    cy={thumbPosition.y}
                    r={styleConfig.sliderWidth / 1.5}
                    fill={currentThumbColor}
                    stroke="hsl(var(--background))"
                    strokeWidth={BLOSSOM_NUMBERS.borderWidth * 3}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                        scale: isDraggingArc ? BLOSSOM_NUMBERS.arcThumbDragScale : 1,
                        opacity: 1,
                    }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={THUMB_SPRING}
                    style={{
                        cursor: 'grab',
                        filter: 'drop-shadow(0 2px 4px hsl(var(--foreground) / 0.2))',
                    }}
                />
            </g>
        </svg>
    );
}
