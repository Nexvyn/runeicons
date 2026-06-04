import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Scrubber } from "@/components/ui/scrubber";
import { CustomizationState } from "@/lib/types";
import { Section } from "../components/Section";

interface FlipRotateSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function FlipRotateSection({
  state,
  onChange,
}: FlipRotateSectionProps) {
  return (
    <Section>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between h-[34px] px-1">
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/60 shrink-0">Flip / Axis</span>
          <div className="flex bg-muted/20 p-0.5 rounded-md border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ flipH: !state.flipH })}
              className={cn(
                "h-6 px-3 text-[9px] font-medium uppercase tracking-tighter rounded-sm transition-all duration-150 active:scale-[0.98]",
                state.flipH
                  ? "bg-white/15 text-foreground border border-white/20 shadow-sm"
                  : "text-foreground/60 hover:text-foreground hover:bg-background/40"
              )}
            >
              Horizontal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ flipV: !state.flipV })}
              className={cn(
                "h-6 px-3 text-[9px] font-medium uppercase tracking-tighter rounded-sm transition-all duration-150 active:scale-[0.98]",
                state.flipV
                  ? "bg-white/15 text-foreground border border-white/20 shadow-sm"
                  : "text-foreground/60 hover:text-foreground hover:bg-background/40"
              )}
            >
              Vertical
            </Button>
          </div>
        </div>

        <Scrubber
          label="Rotation"
          value={state.rotation}
          onChange={(val: number) => onChange({ rotation: val })}
          min={0}
          max={360}
        />
      </div>
    </Section>
  );
}
