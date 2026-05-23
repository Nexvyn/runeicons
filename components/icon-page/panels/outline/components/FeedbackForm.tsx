"use client";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFeedback } from "../hooks/use-feedback";
interface FeedbackFormProps {
  onClose: () => void;
}
export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const { feedbackText, setFeedbackText, handleSubmit, isSubmitting } = useFeedback({
    onSuccess: onClose,
  });
  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute left-full ml-3 bottom-0 w-60 bg-background border border-border p-3 rounded-md shadow-xl z-50"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-labelledby="feedback-title"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3
            id="feedback-title"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Feature Requests
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-5 w-5 rounded-md hover:bg-muted"
            aria-label="Close feedback form"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <Textarea
          placeholder="Share your thoughts..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="min-h-[100px] resize-none text-[11px] bg-muted/30 border-transparent focus:border-primary/20 focus-visible:ring-0 rounded-md p-2 placeholder:text-muted-foreground/50 leading-tight"
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="flex-1 text-[10px] font-bold uppercase rounded-md h-7 px-3"
            onClick={handleSubmit}
            disabled={!feedbackText.trim() || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="px-3 text-[10px] font-bold uppercase rounded-md h-7 border-border hover:bg-muted"
          >
            Close
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
