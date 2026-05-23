import { motion } from 'motion/react';
import { HexColor, adjustBorderColor } from '@/lib/color-utils';
import { Ring, BlossomLayoutConfig } from '@/lib/blossom-utils';
import { BLOSSOM_NUMBERS } from './constants';
interface PetalProps {
    index: number;
    ring: Ring;
    color: HexColor;
    x: number;
    y: number;
    center: { x: number; y: number };
    size: number;
    layout: BlossomLayoutConfig;
    isHovered: boolean;
    isFocused: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}
const BLOSSOM_SPRING = {
    type: 'spring',
    stiffness: 170,
    damping: 15,
} as const;
export function Petal({
    index,
    ring,
    color,
    x,
    y,
    center,
    size,
    layout,
    isHovered,
    isFocused,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: PetalProps) {
    const delay = (ring === 'inner' ? index : layout.innerPetalCount + index) * BLOSSOM_NUMBERS.bloomDelayMs / 1000;
    return (
        <motion.circle
            cx={center.x}
            cy={center.y}
            r={size / 2}
            fill={color}
            stroke={isFocused ? "#ffffff" : adjustBorderColor(
                color, 
                BLOSSOM_NUMBERS.borderSaturationMultiplier, 
                BLOSSOM_NUMBERS.borderBrightnessMultiplier
            )}
            strokeWidth={isFocused ? BLOSSOM_NUMBERS.borderWidth + 1.5 : BLOSSOM_NUMBERS.borderWidth}
            initial={{ x: 0, y: 0, scale: 0.9, opacity: 0 }}
            animate={{
                x: x - center.x,
                y: y - center.y,
                scale: (isHovered || isFocused) ? BLOSSOM_NUMBERS.petalHoverScale : 1,
                opacity: 1,
            }}
            exit={{ x: 0, y: 0, scale: 0.9, opacity: 0 }}
            transition={{
                ...BLOSSOM_SPRING,
                delay,
                scale: { duration: 0.15 },
            }}
            style={{ cursor: 'pointer' }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
}
