import type { Metadata } from "next";

import Link from "next/link";

import NotFoundContent from "@/components/not-found/content";
import Navbar from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "404: Page not found",
  description:
    "This page never made it onto the sheet. Browse 900+ icons in five styles instead.",
  robots: { index: false },
};

const footerLinks = [
  { href: "/icons", label: "Icons" },
  { href: "/editor", label: "Editor" },
  { href: "/about", label: "About dev" },
  {
    href: "https://github.com/Nexvyn/runeicons",
    label: "GitHub",
    external: true,
  },
];

const NotFoundPage = () => {
  return (
    <div className="relative flex min-h-svh w-full flex-col overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mask-[radial-gradient(ellipse_at_center,white,transparent_75%)] dark:opacity-[0.06]"
      >
        <svg
          preserveAspectRatio="none"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="nf-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nf-grid)" />
        </svg>
      </div>

      <Navbar
        showBanner
        showDashedBorder
        links={[{ href: "/about", label: "About dev" }]}
      />

      <main className="relative z-10 flex flex-1 w-full flex-col items-center justify-center px-3 pt-36 pb-16 sm:px-6">
        <NotFoundContent />
      </main>

      <footer className="relative z-10 border-t-2 border-dashed">
        <div className="mx-auto flex w-[95vw] max-w-[1440px] flex-col items-center justify-between gap-3 px-3 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]">
          <p>Rune Icons — open source under Apache 2.0</p>
          <nav aria-label="Footer" className="flex items-center gap-4">
            {footerLinks.map((link) =>
              "external" in link && link.external ? (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </footer>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-[95vw] max-w-[1440px] -translate-x-1/2 border-x-2 border-dashed md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]"
      />
    </div>
  );
};

export default NotFoundPage;
