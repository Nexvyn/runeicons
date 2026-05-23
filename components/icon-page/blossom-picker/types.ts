import { RGBColor } from "@/lib/color-utils";
import { BlossomLayoutConfig, BlossomStyleConfig } from "@/lib/blossom-utils";
export interface BlossomPalette {
    center: RGBColor[];
    ring_1: RGBColor[];
    ring_2: RGBColor[];
}
export interface BlossomColorPickerProps {
    value?: `#${string}`;
    defaultValue?: `#${string}`;
    onChange?: (color: `#${string}`) => void;
    onDismiss?: (finalColor: `#${string}`) => void;
    layout?: Partial<BlossomLayoutConfig>;
    palette?: BlossomPalette;
    styleConfig?: Partial<BlossomStyleConfig>;
    portalContainer?: HTMLElement;
    disabled?: boolean;
    className?: string;
}
