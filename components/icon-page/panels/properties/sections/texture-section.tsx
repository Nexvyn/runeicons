import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Scrubber } from "@/components/ui/scrubber";
import { CustomizationState } from "@/lib/types";
import { TEXTURES } from "@/lib/visual-effects";
import { Section } from "../components/Section";
import { cn } from "@/lib/utils";

interface TextureSectionProps {
  state: CustomizationState;
  onChange: (updates: Partial<CustomizationState>) => void;
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
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentTex = TEXTURES.find(t => t.id === state.texture.selected);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTexture = (id: string) => {
    onChange({
      texture: { ...state.texture, selected: id, enabled: id !== "none" },
    });
    setIsOpen(false);
  };

  return (
    <Section>
      <div className="space-y-4 pt-1">
        <div
          ref={wrapperRef}
          className={cn(
            "overflow-hidden rounded-sm border border-border/40 bg-muted/10",
            "transition-colors",
            isOpen && "border-border/60 bg-muted/15"
          )}
        >
          <div className="flex h-[34px] w-full items-center justify-between px-2 text-[10px] uppercase tracking-widest text-foreground/70">
            <span className="ml-1">Texture</span>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-0.5 transition-colors",
                "hover:bg-muted/30 focus:outline-none",
                isOpen && "bg-muted/30"
              )}
            >
              <span>{currentTex?.name || "None"}</span>
              <TexturePreview texId={state.texture.selected} />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/20">
                  {TEXTURES.map((tex) => (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() => selectTexture(tex.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-[10px] uppercase tracking-widest",
                        "text-foreground/70 transition-colors hover:bg-muted/20",
                        state.texture.selected === tex.id && "bg-muted/30 text-foreground"
                      )}
                    >
                      <span>{tex.name}</span>
                      <TexturePreview texId={tex.id} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
