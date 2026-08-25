import type { Metadata } from "next";

import Footer from "@/components/landing/components/footer";
import Navbar from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  description: "Privacy Policy for RuneIcons.",
};

const PrivacyPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-[95vw] max-w-[1440px] -translate-x-1/2 border-x-2 border-dashed md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]" />

      <div className="mx-auto flex w-[95vw] max-w-[1440px] flex-col md:w-[90vw] 2xl:w-[85vw]">
        <Navbar showDashedBorder />

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3 pt-32 pb-20 sm:px-6">
          <h1 className="text-3xl font-medium sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: July 29, 2026</p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              This Privacy Policy explains what information RuneIcons collects and how it is used.
              We aim to collect{" "}
              <strong className="font-medium text-foreground">
                as little personal information as possible
              </strong>
              .
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                We{" "}
                <strong className="font-medium text-foreground">do not require an account</strong>{" "}
                to browse or download icons. If you sponsor the project or contact us, we may
                receive the information you{" "}
                <strong className="font-medium text-foreground">voluntarily provide</strong>, such
                as your{" "}
                <strong className="font-medium text-foreground">name and email address</strong>,
                through{" "}
                <strong className="font-medium text-foreground">third-party services</strong> (e.g.
                GitHub, payment processors).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">2. Cookies & Analytics</h2>
              <p>
                We may use{" "}
                <strong className="font-medium text-foreground">
                  basic, privacy-respecting analytics
                </strong>{" "}
                to understand{" "}
                <strong className="font-medium text-foreground">aggregate site usage</strong>. We{" "}
                <strong className="font-medium text-foreground">
                  do not sell personal data to third parties
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">3. Third-Party Services</h2>
              <p>
                Sponsorships and payments are processed by{" "}
                <strong className="font-medium text-foreground">third-party providers</strong>, and
                interactions with our GitHub repository are governed by{" "}
                <strong className="font-medium text-foreground">
                  GitHub&apos;s own privacy policy
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">4. Changes to This Policy</h2>
              <p>
                We{" "}
                <strong className="font-medium text-foreground">
                  may update this Privacy Policy
                </strong>{" "}
                from time to time. Continued use of the site after changes are posted{" "}
                <strong className="font-medium text-foreground">
                  constitutes acceptance of the revised policy
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
              <p>
                Questions about this policy can be raised via our{" "}
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

export default PrivacyPage;
