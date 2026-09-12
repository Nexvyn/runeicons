"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import NumberFlow from "@number-flow/react";
import { GithubIcon } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";

import { useGitHubStars } from "@/components/icon-page/panels/header/hooks/use-github-stars";
import LightLogo from "@/components/landing/svg/light";
import { Button } from "@/components/ui/button";
import { LightDarkMode } from "@/components/ui/light-dark-mode";

const HERO_REVEAL_PX = 12;
const SCROLL_JITTER_PX = 2;

const BANNER_FALLBACK = "#1a43c7";

const BANNER_REVEAL = { duration: 0.22, ease: [0.23, 1, 0.32, 1] } as const;
const BANNER_HIDE = { duration: 0.15, ease: [0.23, 1, 0.32, 1] } as const;

const BANNER_COLLAPSE = {
  visible: { height: "auto" },
  hidden: { height: 0 },
} as const;

const BANNER_SLIDE = {
  visible: { y: 0 },
  hidden: { y: "-100%" },
} as const;

interface NavLink {
  href: string;
  label: string;
}

interface NavbarProps {
  showBanner?: boolean;
  showDashedBorder?: boolean;
  links?: NavLink[];
  logoHref?: string;
}

const Navbar = ({
  showBanner = false,
  showDashedBorder = false,
  links = [],
  logoHref = "/",
}: NavbarProps) => {
  const [bannerHidden, setBannerHidden] = useState(false);
  const [iconCount, setIconCount] = useState(0);
  const { scrollY } = useScroll();
  const githubStars = useGitHubStars();

  useEffect(() => {
    setIconCount(900);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const delta = latest - previous;

    if (latest <= HERO_REVEAL_PX) {
      setBannerHidden(false);
      return;
    }

    if (Math.abs(delta) < SCROLL_JITTER_PX) return;

    setBannerHidden(delta > 0);
  });

  return (
    <div className="fixed inset-x-0 z-50 bg-background">
      {showBanner && (
        <m.div
          className="overflow-hidden"
          initial={false}
          animate={bannerHidden ? "hidden" : "visible"}
          variants={BANNER_COLLAPSE}
          transition={bannerHidden ? BANNER_HIDE : BANNER_REVEAL}
        >
          <m.div
            initial={false}
            animate={bannerHidden ? "hidden" : "visible"}
            variants={BANNER_SLIDE}
            transition={bannerHidden ? BANNER_HIDE : BANNER_REVEAL}
          >
            <Link
              href="https://github.com/Nexvyn/runeicons"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: BANNER_FALLBACK }}
              className="relative block overflow-hidden border-b border-black/15 px-4 py-2 text-center text-xs font-medium text-white sm:px-8 md:px-24"
            >
              <Image
                src="/landing/gradient/cta-gradient.png"
                className="absolute inset-0 h-full w-full object-cover"
                alt=""
                fill
                sizes="100vw"
              />
              <span className="relative z-10 flex flex-wrap items-center justify-center text-[10px] leading-tight sm:text-xs sm:leading-snug">
                Rune Icons now includes&nbsp;
                <NumberFlow value={iconCount} suffix="+" />
                &nbsp;modern icons for your products.
              </span>
            </Link>
          </m.div>
        </m.div>
      )}

      <div
        className={`flex w-full justify-center bg-[#F5F5F5] dark:bg-background ${
          showDashedBorder ? "border-b-2 border-dashed" : ""
        }`}
      >
        <div className="relative flex w-[90vw] max-w-[1440px] items-center justify-between bg-[#F5F5F5] px-4 py-3 max-sm:px-1.5 2xl:w-[85vw] 2xl:max-w-[1800px] dark:bg-background">
          <div className="flex items-center justify-center">
            <Link
              href={logoHref}
              prefetch={false}
              aria-label="Home"
              className="-m-1.5 rounded-md p-1.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <LightLogo />
            </Link>
          </div>
          {links.length > 0 && (
            <div className="absolute left-1/2 hidden -translate-x-1/2 gap-3 text-sm sm:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="cursor-pointer rounded-md border border-border px-3 py-2 text-muted-foreground transition-[color,transform] duration-150 outline-none hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/Nexvyn/runeicons"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-1 text-xs" aria-label="GitHub">
                <GithubIcon /> {githubStars}
              </Button>
            </Link>
            <Link href="https://x.com/nexvyn" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="text-xs" aria-label="Rune on X">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" />
                </svg>
              </Button>
            </Link>
            <LightDarkMode />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
