"use client";
import { useState } from "react";
import Link from "next/link";
import { History, Info, Keyboard, MessageCircle, User } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CustomizationState } from "@/lib/types";
import { IconTypeList } from "./IconTypeList";
import { FeedbackForm } from "./FeedbackForm";
type IconType = CustomizationState["iconType"];
export interface ToolRailProps {
  activeType?: IconType;
  onTypeChange?: (type: IconType) => void;
  onHelpClick?: () => void;
  supportedTypes?: readonly IconType[];
}
export function ToolRail({ activeType = "normal", onTypeChange, onHelpClick, supportedTypes }: ToolRailProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  return (
    <aside className="relative z-10 flex h-full flex-col justify-between border-r border-border bg-background p-2">
      <div className="bg-pattern-vertical-dashes pointer-events-none absolute inset-0 opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
        <IconTypeList activeType={activeType} onTypeChange={onTypeChange} compact supportedTypes={supportedTypes} />
        <div className="mt-auto flex justify-center pt-4 relative">
          <AnimatePresence>
            {showFeedback && (
              <FeedbackForm onClose={() => setShowFeedback(false)} />
            )}
          </AnimatePresence>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-8 w-8 bg-white dark:bg-[#1a1a1a] border-border text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-accent/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.96]",
                  showFeedback && "bg-primary/10 border-primary/30 text-primary scale-110"
                )}
                aria-label="Info and shortcuts"
              >
                <Info className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-48">
              <DropdownMenuItem onClick={onHelpClick} className="gap-2 cursor-pointer">
                <Keyboard className="h-4 w-4" />
                <span>Shortcuts</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowFeedback(true)} className="gap-2 cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                <span>Feature Requests</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about" prefetch={false} className="flex items-center gap-2 cursor-pointer w-full">
                  <User className="h-4 w-4" />
                  <span>About</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog" prefetch={false} className="flex items-center gap-2 cursor-pointer w-full">
                  <History className="h-4 w-4" />
                  <span>Change Log</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
