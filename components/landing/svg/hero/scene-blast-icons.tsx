import { BLAST_ICONS } from "./constants";

const SceneBlastIcons = () => (
  <g className="blastIcons" aria-hidden="true" pointerEvents="none">
    {BLAST_ICONS.map((icon) => (
      <g key={icon.id} transform={`translate(${icon.x} ${icon.y})`}>
        <g
          className="blastIcon"
          opacity={icon.restOpacity}
          style={{ willChange: "transform, opacity" }}
        >
          <g transform={`rotate(${icon.tilt}) scale(${icon.scale}) translate(-12 -12)`}>
            <path
              d={icon.d}
              fill="none"
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
    ))}
  </g>
);

export default SceneBlastIcons;
