"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { GithubIcon } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";

import LightLogo from "@/components/landing/svg/light";
import { Button } from "@/components/ui/button";
import { LightDarkMode } from "@/components/ui/light-dark-mode";
import { useGitHubStars } from "@/components/icon-page/panels/header/hooks/use-github-stars";

const Navbar = () => {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const githubStars = useGitHubStars();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className="fixed inset-x-0 z-50 bg-background">
      <m.div
        className="overflow-hidden"
        initial={false}
        animate={hidden ? "hidden" : "visible"}
        variants={{
          visible: { height: "auto" },
          hidden: { height: 0 },
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <m.div
          initial={false}
          animate={hidden ? "hidden" : "visible"}
          variants={{
            visible: { y: 0 },
            hidden: { y: "-100%" },
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Link
            href="https://github.com/rune-icon/runeicons"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block overflow-hidden border-b border-black/15 px-4 py-2 text-center text-xs font-medium text-white sm:px-8 md:px-24"
          >
            <Image
              src="/landing/gradient/cta-gradient.png"
              className="absolute inset-0 h-full w-full object-cover"
              alt=""
              fill
              sizes="100vw"
              priority
            />
            <span className="relative z-10 text-[10px] leading-tight sm:text-xs sm:leading-snug">
              Rune Icons now includes 1000+ modern icons for your products.
            </span>
          </Link>
        </m.div>
      </m.div>

      <div className="flex w-full justify-center border-b-2 border-dashed bg-[#F5F5F5] dark:bg-background">
        <div className="flex w-[90vw] max-w-[1440px] items-center justify-between bg-[#F5F5F5] px-4 py-3 max-sm:px-1.5 2xl:w-[85vw] 2xl:max-w-[1800px] dark:bg-background">
          <div className="flex items-end justify-center gap-5">
            <span>
              <LightLogo />
            </span>
            <div className="mb-0.5 flex gap-4 text-sm max-sm:hidden">
              <Link
                href="/about"
                className="cursor-pointer text-muted-foreground transition-all duration-150 hover:text-accent-foreground"
              >
                About dev
              </Link>
              <Link
                href="/sponsor"
                className="cursor-pointer text-muted-foreground transition-all duration-150 hover:text-accent-foreground"
              >
                Sponsor
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <ul className="hidden gap-2 md:flex">
            {Links.map((link) => (
              <Button
                variant={"ghost"}
                key={link}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium transition-colors"
              >
                {link}
              </Button>
            ))}
          </ul> */}
            <div className="flex items-center gap-2">
              <Link
                href="https://github.com/rune-icon/runeicons"
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
              <Link href="https://x.com/RuneIcon" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size={"icon"} className="text-xs" aria-label="Rune on X">
                  <svg
                    className="invert dark:invert-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    color="currentColor"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" />
                  </svg>{" "}
                </Button>
              </Link>
              <LightDarkMode />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
