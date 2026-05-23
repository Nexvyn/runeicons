import { Scrubber } from "@/components/ui/scrubber";
import { CustomizationState } from "@/lib/types";
import { NOISE_STYLES } from "@/lib/visual-effects";

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
        <style dangerouslySetInnerHTML={{
          __html: NOISE_STYLES
        }} />
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
          className="bg-transparent border-transparent"
          trackClassName="noise-track-custom"
          fillClassName="hidden"
          showTicks={false}
        />
      </div>
    </Section>
  );
}
