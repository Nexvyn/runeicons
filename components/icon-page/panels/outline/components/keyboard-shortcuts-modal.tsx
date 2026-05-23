"use client";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { KEYBOARD_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
function ShortcutKey({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 font-mono text-[9px] font-medium",
        "rounded border border-border bg-muted/50 text-foreground",
        "h-4.5 min-w-[18px]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
function ShortcutRow({ shortcut }: { shortcut: { key: string; desc: string } }) {
  const keyGroups = shortcut.key.split(" / ");
  return (
    <div className="flex items-center justify-between px-1 py-1.5">
      <span className="text-[11px] text-muted-foreground">{shortcut.desc}</span>
      <div className="flex items-center gap-2">
        {keyGroups.map((group, i) => (
          <div key={group} className="flex items-center gap-1">
            {group.split("+").map((k, j, arr) => (
              <div key={j} className="flex items-center gap-1">
                <ShortcutKey>{k.trim()}</ShortcutKey>
                {j < arr.length - 1 && <span className="text-[9px] opacity-30">+</span>}
              </div>
            ))}
            {i < keyGroups.length - 1 && <span className="text-[9px] opacity-30">/</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "relative flex w-full max-w-sm flex-col",
              "rounded-lg border border-border bg-background shadow-xl",
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-2.5">
              <h2 className="text-xs font-bold text-foreground">Shortcuts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 rounded-md hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {KEYBOARD_SHORTCUTS.map((category, idx) => (
                  <motion.section
                    key={category.category}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: idx * 0.04,
                      duration: 0.2,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    <h3 className="mb-2 px-1 text-[10px] font-bold tracking-wider text-primary uppercase">
                      {category.category}
                    </h3>
                    <div className="divide-y divide-border/20">
                      {category.items.map((item) => (
                        <ShortcutRow key={`${category.category}-${item.key}`} shortcut={item} />
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>
            </div>
            <div className="flex justify-center border-t border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Press</span>
                <ShortcutKey>Esc</ShortcutKey>
                <span>to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
