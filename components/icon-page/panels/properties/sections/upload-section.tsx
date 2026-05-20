"use client";

import { useState, useCallback, useRef } from "react";
import {
  AlertCircle,
  Loader2,
  Upload,
  X,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CustomizationState } from "@/lib/types";
import { motion } from "motion/react";
import { useTuning } from "@/components/icon-page/tuning";

interface UploadSectionProps {
  state: CustomizationState;
  onIconSelect?: (icon: any) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isDragging: boolean;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => Promise<void>;
  deleteIcon: (id: string) => void;
  maxIcons: number;
}

import { Section } from "../components/Section";

export function UploadSection({
  state,
  onIconSelect,
  isDragging,
  uploadError,
  setUploadError,
  isUploading,
  handleFileUpload,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  deleteIcon,
  maxIcons,
}: UploadSectionProps) {
  useTuning();
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disarmDelete = useCallback(() => {
    setArmedDeleteId(null);
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
  }, []);

  const armDelete = useCallback((id: string) => {
    setArmedDeleteId(id);
    deleteTimeoutRef.current = setTimeout(() => {
      setArmedDeleteId(null);
    }, 2000);
  }, []);

  const handleDeleteClick = useCallback((id: string, name: string) => {
    if (armedDeleteId === id) {
      disarmDelete();
      deleteIcon(id);
    } else {
      armDelete(id);
    }
  }, [armedDeleteId, disarmDelete, armDelete, deleteIcon]);

  return (
    <Section 
      title="Uploads" 
      headerAction={
        <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {state.customIcons.length}/{maxIcons}
        </span>
      }
    >

      <div id="section-upload-content" className="space-y-4">
        {uploadError && (
          <div
            className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive leading-relaxed">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-destructive hover:text-destructive/80 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 rounded-sm outline-none"
              aria-label="Dismiss error"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
            isDragging ? "border-primary bg-primary/5 scale-[0.99] shadow-inner" : "border-border hover:border-border/80",
            isUploading && "opacity-50 pointer-events-none",
            state.customIcons.length >= maxIcons && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
          )}
          role="region"
          aria-label="File upload area"
        >
          {isUploading ? (
            <div className="py-2">
              <Loader2
                className="h-8 w-8 mx-auto mb-3 text-primary animate-spin"
                aria-hidden="true"
              />
              <p className="text-xs font-bold text-primary tracking-tight">UPLOADING...</p>
            </div>
          ) : (
            <>
              <Upload
                className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop files here
              </p>
              <p className="text-[10px] font-bold text-muted-foreground/60 mb-4 px-6">
                SVG or PNG (MAX 5MB)
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/svg+xml,image/png"
                  multiple
                  onChange={handleFileUpload}
                  className="sr-only"
                  aria-label="Upload SVG icon"
                  disabled={state.customIcons.length >= maxIcons}
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 px-4 font-bold border-border hover:bg-muted/50 transition-colors"
                  disabled={state.customIcons.length >= maxIcons}
                >
                  <span>Upload Icon</span>
                </Button>
              </label>
            </>
          )}
        </div>

        {state.customIcons.length > 0 && (
          <div className="pt-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 block opacity-70 text-balance">
              Custom Icons
            </label>
            <motion.div
              className="space-y-2"
              role="list"
              aria-label="Uploaded custom icons"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {state.customIcons.map((icon) => (
                <motion.div
                  key={icon.id}
                  variants={{
                    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 transition-[background-color,border-color,scale] duration-200 group cursor-pointer active:scale-[0.98] focus-within:ring-2 focus-within:ring-primary"
                  role="listitem"
                  onClick={() => onIconSelect?.({
                    id: icon.id,
                    name: icon.name,
                    icon: null,
                    url: icon.url,
                    category: "custom",
                    tags: ["custom", "upload"]
                  })}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-[4px] bg-background border border-border shadow-sm p-1.5 overflow-hidden outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
                    <img
                      src={icon.url || "/placeholder.svg"}
                      alt={icon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span
                    className="text-xs font-medium text-foreground flex-1 truncate pr-2"
                    title={icon.name}
                  >
                    {icon.name}
                  </span>
                  <motion.div
                    animate={armedDeleteId === icon.id ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={armedDeleteId === icon.id ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" } : { duration: 0.15 }}
                    className="flex-shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(icon.id, icon.name)}
                      className={cn(
                        "h-8 w-8 transition-[scale,background-color,color,opacity] duration-200 rounded-lg active:scale-[0.96] outline-none focus-visible:ring-2",
                        armedDeleteId === icon.id
                          ? "bg-destructive text-white ring-destructive/30"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive opacity-0 group-hover:opacity-100"
                      )}
                      aria-label={armedDeleteId === icon.id ? `Confirm delete ${icon.name}` : `Delete ${icon.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </Section>
  );
}
