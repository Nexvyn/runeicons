import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Scrubber } from "@/components/ui/scrubber";
import { Switch } from "@/components/ui/switch";
import { CustomizationState } from "@/lib/types";

interface ShadowSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

import { Section } from "../components/Section";

export function ShadowSection({
  state,
  onChange,
}: ShadowSectionProps) {
  return (
    <Section
      title="Shadow"
      headerAction={
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-md border border-border/50 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  shadow: { ...state.shadow, inner: false, enabled: true },
                })
              }
              className={cn(
                "h-6 px-3 text-[9px] uppercase tracking-tighter rounded-sm transition-all duration-150 active:scale-[0.98]",
                !state.shadow.inner
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
            >
              Outer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  shadow: { ...state.shadow, inner: true, enabled: true },
                })
              }
              className={cn(
                "h-6 px-3 text-[9px] uppercase tracking-tighter rounded-sm transition-all duration-150 active:scale-[0.98]",
                state.shadow.inner
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
            >
              Inner
            </Button>
          </div>
          <Switch
            checked={state.shadow.enabled}
            onCheckedChange={(v) => onChange({ shadow: { ...state.shadow, enabled: v } })}
          />
        </div>
      }
    >
      <div id="section-shadow-content" className="space-y-1.5">
        <Scrubber
          label="Opacity"
          value={state.shadow.opacity}
          onChange={(val: number) =>
            onChange({
              shadow: { ...state.shadow, opacity: val },
            })
          }
          min={0}
          max={100}
        />

        <Scrubber
          label="Blur"
          value={state.shadow.blur}
          onChange={(val: number) =>
            onChange({
              shadow: { ...state.shadow, blur: val },
            })
          }
          min={0}
          max={50}
        />

        <div className="grid grid-cols-2 gap-2">
          <Scrubber
            label="X"
            value={state.shadow.offsetX}
            onChange={(val: number) =>
              onChange({
                shadow: { ...state.shadow, offsetX: val },
              })
            }
            min={-50}
            max={50}
          />

          <Scrubber
            label="Y"
            value={state.shadow.offsetY}
            onChange={(val: number) =>
              onChange({
                shadow: { ...state.shadow, offsetY: val },
              })
            }
            min={-50}
            max={50}
          />
        </div>
      </div>
    </Section>
  );
}
