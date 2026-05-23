import { motion as m, AnimatePresence } from "motion/react";
interface EmptyStateProps {
  isVisible: boolean;
  onClearSearch?: () => void;
}
export function EmptyState({ isVisible, onClearSearch }: EmptyStateProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className="col-span-full flex flex-col items-center justify-start mt-24 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-foreground font-medium text-sm">No icons found</p>
          <p className="text-muted-foreground text-xs mt-1">
            Try adjusting your search
          </p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="mt-3 text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              Clear search
            </button>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
