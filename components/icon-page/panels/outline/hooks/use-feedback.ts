"use client";
import { useState } from "react";
import { toast } from "sonner";
const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_FEEDBACK_WEBHOOK;
interface UseFeedbackOptions {
  onSuccess?: () => void;
}
export function useFeedback({ onSuccess }: UseFeedbackOptions = {}) {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!feedbackText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (DISCORD_WEBHOOK_URL) {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `**Feedback:** ${feedbackText}`,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to send feedback');
        }
      }
      toast.success("Thank you for your feedback!");
      setFeedbackText("");
      onSuccess?.();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return {
    feedbackText,
    setFeedbackText,
    handleSubmit,
    isSubmitting,
  };
}
