import { Scrubber } from "@/components/ui/scrubber";
import { CustomizationState } from "@/lib/types";
import { TEXTURES } from "@/lib/visual-effects";
import { Section } from "../components/Section";

interface TextureSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

function TexturePreview({ texId }: { texId: string }) {
  const tex = TEXTURES.find(t => t.id === texId);
  return (
    <div
      className="w-5 h-5 rounded-sm border border-border/40 overflow-hidden bg-muted/10 flex items-center justify-center"
      style={tex && tex.id !== 'none' ? {
        backgroundImage: `url(${tex.path || `/placeholder.svg?height=100&width=100&query=${tex.id}-texture`})`,
        backgroundSize: 'cover'
      } : {}}
    >
      {texId === 'none' && <span className="text-[8px] font-black opacity-40">∅</span>}
    </div>
  );
}

export function TextureSection({
  state,
  onChange,
}: TextureSectionProps) {
  const currentIndex = TEXTURES.findIndex(t => t.id === state.texture.selected);
  const currentTex = TEXTURES[currentIndex];

  return (
    <Section>
      <div className="space-y-4 pt-1">
        <Scrubber
          label={currentTex?.name || "None"}
          min={0}
          max={TEXTURES.length - 1}
          step={1}
          value={currentIndex}
          onChange={(val) => {
            const index = Math.round(val);
            const tex = TEXTURES[index];
            onChange({
              texture: { ...state.texture, selected: tex.id },
            });
          }}
          showInput={false}
          rightSlot={<TexturePreview texId={state.texture.selected} />}
        />

        {state.texture.selected !== "none" && (
          <Scrubber
            label="Opacity"
            value={state.texture.opacity}
            onChange={(val: number) =>
              onChange({
                texture: { ...state.texture, opacity: val },
              })
            }
            min={0}
            max={100}
          />
        )}
      </div>
    </Section>
  );
}
