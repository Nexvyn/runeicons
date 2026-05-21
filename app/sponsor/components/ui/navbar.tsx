"use client";

import Link from "next/link";

import { GithubIcon } from "lucide-react";

import { useGitHubStars } from "@/components/icon-page/panels/header/hooks/use-github-stars";
import LightLogo from "@/components/landing/svg/light";
import { Button } from "@/components/ui/button";
import { LightDarkMode } from "@/components/ui/light-dark-mode";

export function Navbar() {
  const githubStars = useGitHubStars();

  return (
    <header className="w-full bg-[#F5F5F5] dark:bg-background">
      <div className="flex w-full items-center justify-between px-4 py-3 max-sm:px-1.5">
        <div className="flex items-end gap-5">
          <Link href="/" aria-label="Home">
            <LightLogo />
          </Link>
          <div className="mb-0.5 flex gap-4 text-sm max-sm:hidden">
            <Link
              href="/"
              className="cursor-pointer text-muted-foreground transition-all duration-150 hover:text-accent-foreground"
            >
              Home
            </Link>
            <Link
              href="/icons"
              className="cursor-pointer text-muted-foreground transition-all duration-150 hover:text-accent-foreground"
            >
              Icons
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/AitijhyaModak/rune-icons"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="group relative gap-1 overflow-hidden text-xs"
              aria-label="GitHub"
            >
              <GithubIcon className="size-4" /> {githubStars}
            </Button>
          </Link>
          <LightDarkMode />
        </div>
      </div>
    </header>
  );
}
