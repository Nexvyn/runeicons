import { cn } from "@/lib/utils";

export const GLYPH_STYLES = [
  { key: "normal", label: "Normal" },
  { key: "duotone", label: "Duotone" },
  { key: "fill", label: "Fill" },
  { key: "pixelated", label: "Pixelated" },
  { key: "glass", label: "Glass" },
] as const;

export type GlyphStyle = (typeof GLYPH_STYLES)[number]["key"];

const HOOK =
  "M16.8 17.4c0-5 3.6-8.4 8.2-8.4s7.6 3 7.6 7.2c0 3.2-1.7 5-3.8 6.5-2 1.5-3.7 2.8-3.7 5.9v1.6";
const DOT = "M25.1 37.5h.01";

const PIXEL_DOTS: [number, number][] = [
  [15, 6],
  [21, 6],
  [27, 6],
  [33, 6],
  [9, 12],
  [39, 12],
  [39, 18],
  [33, 24],
  [27, 30],
  [27, 42],
];

const NormalGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    overflow="visible"
    aria-hidden="true"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={HOOK}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d={DOT} stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const DuotoneGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    overflow="visible"
    aria-hidden="true"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="7.5"
      y="7.5"
      width="33"
      height="33"
      rx="9"
      fill="currentColor"
      opacity="0.18"
      transform="rotate(-4 24 24)"
    />
    <path
      d={HOOK}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d={DOT} stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const FillGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    overflow="visible"
    aria-hidden="true"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={HOOK}
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d={DOT} stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
  </svg>
);

const PixelatedGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    overflow="visible"
    aria-hidden="true"
    className={className}
    stroke="currentColor"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g strokeWidth="6" strokeLinecap="square">
      {PIXEL_DOTS.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y}H${x}.01`} />
      ))}
    </g>
  </svg>
);

const GlassGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    overflow="visible"
    aria-hidden="true"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="nf404-glass"
        x1="8"
        y1="8"
        x2="40"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#82AAFC" />
        <stop offset="0.5" stopColor="#3366F0" />
        <stop offset="1" stopColor="#0A2E9E" />
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="38" height="38" rx="11" fill="url(#nf404-glass)" />
    <path
      d="M12.5 33.5L31.5 12.5"
      stroke="white"
      strokeOpacity="0.45"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M17 36.5L35.5 17.5"
      stroke="white"
      strokeOpacity="0.2"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d={HOOK}
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d={DOT} stroke="white" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const MissingGlyph = ({
  style,
  className,
}: {
  style: GlyphStyle;
  className?: string;
}) => {
  const props = { className: cn("block", className) };

  switch (style) {
    case "duotone":
      return <DuotoneGlyph {...props} />;
    case "fill":
      return <FillGlyph {...props} />;
    case "pixelated":
      return <PixelatedGlyph {...props} />;
    case "glass":
      return <GlassGlyph {...props} />;
    default:
      return <NormalGlyph {...props} />;
  }
};

export default MissingGlyph;
