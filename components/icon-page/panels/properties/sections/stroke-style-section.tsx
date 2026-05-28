import { CustomizationState } from "@/lib/types";
import { StrokeStyle } from "@/lib/stroke-style";
import { Scrubber } from "@/components/ui/scrubber";
import { Section } from "../components/Section";

interface StrokeStyleSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
}

const STROKE_SEQUENCE: StrokeStyle[] = ["soft", "round", "medium", "sharp"];

const STYLE_ROUNDNESS: Record<StrokeStyle, number> = {
  soft: 8,
  round: 6,
  medium: 4,
  sharp: 0,
};

function RoundnessPreview({ styleId }: { styleId: StrokeStyle }) {
  const r = STYLE_ROUNDNESS[styleId];
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-foreground/50">
      <path
        d={`M 2 18 L 2 ${2 + r} Q 2 2 ${2 + r} 2 L 18 2`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StrokeStyleSection({
  state,
  onChange,
}: StrokeStyleSectionProps) {
  const currentIndex = STROKE_SEQUENCE.indexOf(state.strokeStyle);

  return (
    <Section>
      <div className="space-y-4 pt-1">
        <Scrubber
          label="Roundness"
          min={0}
          max={3}
          step={1}
          value={currentIndex}
          onChange={(val) => {
            const index = Math.round(val);
            onChange({ strokeStyle: STROKE_SEQUENCE[index] });
          }}
          showInput={false}
          rightSlot={<RoundnessPreview styleId={state.strokeStyle} />}
        />
      </div>
    </Section>
  );
}
