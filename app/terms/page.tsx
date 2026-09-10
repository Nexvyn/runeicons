import type { Metadata } from "next";

import Footer from "@/components/landing/components/footer";
import Navbar from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "Terms of Use",
  alternates: { canonical: "/terms" },
  description: "Terms of Use for RuneIcons.",
};

const TermsPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-[95vw] max-w-[1440px] -translate-x-1/2 border-x-2 border-dashed md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]" />

      <div className="mx-auto flex w-[95vw] max-w-[1440px] flex-col md:w-[90vw] 2xl:w-[85vw]">
        <Navbar showDashedBorder />

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3 pt-32 pb-20 sm:px-6">
          <h1 className="text-3xl font-medium sm:text-4xl">Terms of Use</h1>
          <p className="text-sm text-muted-foreground">Last updated: July 29, 2026</p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              By accessing or using RuneIcons, you{" "}
              <strong className="font-medium text-foreground">
                agree to be bound by these Terms of Use
              </strong>
              . If you do not agree with any part of these terms, please{" "}
              <strong className="font-medium text-foreground">
                do not use the site or its contents
              </strong>
              .
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">1. Use of Icons</h2>
              <p>
                RuneIcons are <strong className="font-medium text-foreground">open-source</strong>{" "}
                and distributed under the{" "}
                <a
                  href="https://github.com/Nexvyn/runeicons/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline"
                >
                  Apache License 2.0
                </a>
                . You may use them in personal, commercial, and client projects, subject to the
                license terms in our GitHub repository.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">2. Acceptable Use</h2>
              <p>
                You agree{" "}
                <strong className="font-medium text-foreground">not to misuse the site</strong>,
                attempt to disrupt its operation, or use it in any way that violates applicable laws
                or the rights of others.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">3. No Warranty</h2>
              <p>
                RuneIcons is provided{" "}
                <strong className="font-medium text-foreground">
                  &quot;as is&quot; without warranties of any kind
                </strong>
                , express or implied. We do not guarantee the site or icons will be error-free or
                uninterrupted.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">4. Changes to These Terms</h2>
              <p>
                We may update these Terms of Use from time to time. Continued use of the site after
                changes are posted{" "}
                <strong className="font-medium text-foreground">
                  constitutes acceptance of the revised terms
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
              <p>
                Questions about these terms can be raised via our{" "}
                <a
                  href="https://github.com/Nexvyn/runeicons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 pb-10 sm:px-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
