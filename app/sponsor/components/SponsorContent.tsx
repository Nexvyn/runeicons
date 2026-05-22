"use client";
import { useState } from "react";

import * as m from "motion/react-m";

import { getCheckoutForAmount } from "@/lib/creem";

import { AmountSelector } from "./ui/amount-selector";
import { CertificateCard } from "./ui/certificate-card";
import Navbar from "@/components/ui/navbar";

export default function SponsorContent() {
  const [selectedAmount, setSelectedAmount] = useState(5);

  const checkout = getCheckoutForAmount(selectedAmount);

  return (
    <div className="relative grid min-h-screen w-full grid-cols-[1fr_auto_1fr] grid-rows-[auto_1px_1fr] overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
      <div className="relative col-start-2 row-start-1 flex w-[95vw] max-w-[1440px] flex-col overflow-hidden md:w-[90vw] 2xl:w-[85vw]">
        <Navbar
          showDashedBorder
          links={[
            { href: "/", label: "Home" },
            { href: "/icons", label: "Icons" },
          ]}
        />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-2 border-b-2 border-dashed" />

      <div className="col-start-2 row-start-3 flex w-[95vw] max-w-[1440px] flex-col items-center px-3 pt-16 pb-14 sm:px-6 sm:pt-20 sm:pb-16 md:w-[90vw] 2xl:w-[85vw]">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex w-full max-w-3xl flex-col items-center"
        >
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-foreground uppercase shadow-sm dark:bg-card">
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <m.path
                d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: {
                    duration: 2.4,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 0.4,
                  },
                  opacity: { duration: 0.3 },
                }}
              />
            </svg>
            Open source forever
          </span>

          <h1 className="mb-5 text-center text-[36px] leading-[1.1] font-medium tracking-tight sm:text-[52px]">
            Support <span className="text-blue-700">RuneIcons</span>
          </h1>

          <p className="max-w-[480px] text-center text-[13px] leading-relaxed text-muted-foreground">
            RuneIcons will always be free and open-source. If the library has saved you time,
            or if you just want to see it keep growing, your support helps me design new icons,
            ship new styles, and keep everything sharp.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full max-w-3xl flex-col items-center"
        >
          <div className="w-full overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-lg">
            <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
              <AmountSelector
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
              />
            </div>

            <div className="relative h-px w-full">
              <div className="absolute inset-0 mx-6 border-t border-dashed border-border sm:mx-8" />
            </div>

            <div className="w-full">
              <CertificateCard
                amount={selectedAmount}
                checkout={checkout}
                flush
              />
            </div>
          </div>
        </m.div>
      </div>

      <div className="pointer-events-none z-50 col-start-2 row-span-full row-start-1 border-x-2 border-dashed" />
    </div>
  );
}
