export type IconStyle = "normal" | "duotone" | "fill" | "pixelated" | "glass";
export interface GeneratedIcon {
    /** Unique id, e.g. "arrows-arrow-down-left" or "glass-archive". */
    id: string;
    /** Human-readable name, e.g. "Arrow Down Left". */
    name: string;
    /** Visual style of this variant. */
    style: IconStyle;
    /** Category bucket, e.g. "navigation". */
    category: string;
    /** Searchable keywords. */
    tags: string[];
    /** Path of the bundled SVG under assets/, e.g. "normal/arrows/arrow-down-left.svg". */
    file: string;
}
export declare const ICON_COUNTS: {
    readonly total: 904;
    readonly normal: 217;
    readonly duotone: 213;
    readonly fill: 124;
    readonly pixelated: 215;
    readonly glass: 135;
};
export declare const GENERATED_ICONS: GeneratedIcon[];
