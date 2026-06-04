import { Scrubber } from "@/components/ui/scrubber";
import { CustomizationState } from "@/lib/types";

interface NoiseSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

import { Section } from "../components/Section";

export function NoiseSection({
  state,
  onChange,
}: NoiseSectionProps) {
  return (
    <Section>
      <div className="pt-1 relative">
        <Scrubber
          label="Noise Grain"
          value={state.noise.intensity}
          onChange={(val: number) =>
            onChange({
              noise: { enabled: val > 0, intensity: val },
            })
          }
          min={0}
          max={100}
          className="noise-track-custom border-transparent"
          showFill={false}
          showTicks={false}
        />
      </div>
    </Section>
  );
}
