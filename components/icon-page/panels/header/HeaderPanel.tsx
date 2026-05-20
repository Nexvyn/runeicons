"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Github, Heart } from "lucide-react";
import { motion } from "motion/react";
import { HeaderLogo } from "@/components/icons/HeaderLogo";
import { Button } from "@/components/ui/button";
import { LightDarkMode } from "@/components/ui/light-dark-mode";
import { cn } from "@/lib/utils";
import { useGitHubStars } from "./hooks/use-github-stars";

interface HeaderPanelProps {
  className?: string;
}

export function HeaderPanel({ className }: HeaderPanelProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const displayCount = useGitHubStars();
  const isEditorPage = pathname === "/editor";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={cn(
        "relative flex h-12 shrink-0 items-center overflow-hidden border-b border-border bg-background transition-colors duration-200 ease-out",
        className,
      )}
    >
      <div className="bg-pattern-vertical-dashes pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex h-full w-full min-w-0">
        <Link
          href="/"
          className="group flex h-full w-12 shrink-0 cursor-pointer items-center justify-center border-r border-border transition-colors duration-150 ease-out hover:bg-muted/50"
        >
          <HeaderLogo className="h-8 w-8 transition-transform duration-150 ease-out group-hover:scale-[1.02]" />
        </Link>

        <div className="hidden lg:flex h-full w-[320px] shrink-0 items-center border-r border-border px-5" />

        <div className="hidden sm:flex h-full flex-1 min-w-0 items-center justify-center lg:justify-end border-r border-border px-4 lg:px-6">
          <div className="relative flex h-8 items-center gap-1 rounded-md border border-border bg-[#f5f5f5] p-1 dark:bg-[#1a1a1a]">
            <Link
              href="/icons"
              className={cn(
                "relative flex h-full items-center justify-center rounded-[4px] px-4 text-[11px] font-medium transition-colors duration-200",
                !isEditorPage ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {!isEditorPage && (
                <motion.div
                  layoutId="header-nav-indicator"
                  className="absolute inset-0 rounded-[4px] border border-border/50 bg-white shadow-sm dark:bg-[#2a2a2a]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Icons</span>
            </Link>
            <Link
              href="/editor"
              className={cn(
                "relative flex h-full items-center justify-center rounded-[4px] px-4 text-[11px] font-medium transition-colors duration-200",
                isEditorPage ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isEditorPage && (
                <motion.div
                  layoutId="header-nav-indicator"
                  className="absolute inset-0 rounded-[4px] border border-border/50 bg-white shadow-sm dark:bg-[#2a2a2a]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Edit</span>
            </Link>
          </div>
        </div>

        <div className="flex h-full shrink-0 items-center justify-end gap-2 px-3 lg:w-85 lg:gap-2.5 lg:px-6">
          <Link
            href="https://github.com/rune-icon/runeicons"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button
              variant="outline"
              className="h-8 gap-2 border-border bg-white px-3 text-[11px] font-medium opacity-100 shadow-none dark:bg-[#1a1a1a]"
              aria-label="GitHub"
            >
              <Github className="size-3.5" /> {displayCount}
            </Button>
          </Link>
          <Link href="/sponsor" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="h-8 gap-2 border-pink-500/40 bg-[#fff5f7] px-3 text-[11px] font-medium text-pink-500 opacity-100 shadow-none dark:border-pink-900 dark:bg-[#1f1114]"
              aria-label="Sponsor"
            >
              <Heart className="size-3.5" /> Sponsor
            </Button>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white dark:bg-[#1a1a1a]">
            <LightDarkMode className="size-4 border-none bg-transparent text-muted-foreground shadow-none transition-colors duration-150 ease-out hover:text-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
