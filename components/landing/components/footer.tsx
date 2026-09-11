import Link from "next/link";

import { Github } from "lucide-react";

import LightLogo from "@/components/landing/svg/light";

import FooterWordmark from "./footer-wordmark";

const legalLinks = [
  { title: "Terms of Use", href: "/terms" },
  { title: "Privacy Policy", href: "/privacy" },
];

const collaboratorsLinks = [
  { title: "Nexvyn", href: "https://x.com/nexvyn" },
  { title: "Vansh", href: "https://x.com/vansh1029" },
  { title: "Abhinav", href: "https://x.com/Abhinavstwt" },
  { title: "Mohit", href: "https://x.com/mohitmehtre" },
];

const Footer = () => {
  return (
    <footer className="w-full">
      <div className="w-full rounded-3xl border border-border/60 bg-background px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Link href="/" aria-label="Go home" className="flex size-fit items-center gap-2">
              <LightLogo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Open-source icons in five styles. Reshape any glyph in the browser, then ship it as
              SVG or JSX. Apache 2.0 licensed.
            </p>
          </div>

          <div className="space-y-3 text-sm md:col-start-5">
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">Team</p>
            <div className="space-y-2">
              {collaboratorsLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm md:col-start-6">
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">Social</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://x.com/RuneIcon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X/Twitter"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="text-black dark:text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" />
                </svg>
              </Link>
              <Link
                href="https://github.com/Nexvyn/runeicons"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="transition-colors hover:text-foreground"
              >
                <Github className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-border/40 pt-5">
          <div className="flex items-center justify-center gap-5 text-xs">
            {legalLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FooterWordmark />
      </div>
    </footer>
  );
};

export default Footer;
