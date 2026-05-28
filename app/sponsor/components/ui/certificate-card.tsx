"use client";

import { CreemCheckout } from "@creem_io/nextjs";
import NumberFlow from "@number-flow/react";
import * as m from "motion/react-m";

import Mascot from "@/components/landing/svg/mascot";
import { Button } from "@/components/ui/button";

interface CertificateCardProps {
  amount: number;
  stage?: 1 | 2 | 3 | 4;
  flush?: boolean;
  checkout?: { productId: string; units: number } | null;
}

export function CertificateCard({
  amount,
  stage = 1,
  flush = false,
  checkout = null,
}: CertificateCardProps) {
  const sponsorButton = (
    <Button
      disabled={amount <= 0}
      className="w-full cursor-pointer gap-1 bg-blue-700 px-6 text-[14px] font-medium text-white hover:bg-blue-700/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <span>Sponsor</span>
      {amount > 0 ? (
        <NumberFlow
          value={amount}
          prefix="$"
          transformTiming={{ duration: 500, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        />
      ) : null}
    </Button>
  );

  return (
    <div
      className={
        flush
          ? "relative w-full overflow-hidden bg-card text-card-foreground"
          : "relative mt-2 w-full overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg"
      }
    >
      <div className="relative flex flex-col gap-5 overflow-hidden px-6 py-6 sm:flex-row sm:items-center sm:gap-10 sm:px-10 sm:py-10">
        <div className="relative flex h-[160px] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white sm:h-[200px] sm:w-[200px]">
          <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32 [&>svg]:h-full [&>svg]:w-full">
            <Mascot stage={stage} />
          </div>
        </div>

        <div className="z-10 flex flex-col justify-center">
          <m.h3
            layout
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="flex w-fit items-baseline gap-1.5 text-[22px] leading-none font-medium tracking-tight sm:text-[28px]"
          >
            {amount > 0 ? (
              <>
                <NumberFlow
                  value={amount}
                  prefix="$"
                  className="text-blue-700"
                  transformTiming={{ duration: 500, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}
                />
                <m.span layout>contribution</m.span>
              </>
            ) : (
              <m.span layout>
                <span className="text-blue-700">Custom</span> contribution
              </m.span>
            )}
          </m.h3>
          <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground sm:mt-4">
            {amount > 0
              ? "RuneIcons stays free and open-source, always. Your sponsorship helps me ship new icons, refine every stroke, and keep the library evolving."
              : "Enter any amount above — RuneIcons stays free and open-source, always. Sponsor whatever feels right."}
          </p>
          <m.div
            layout
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="mt-5 w-full sm:mt-6 sm:w-fit"
          >
            {checkout && amount > 0 ? (
              <CreemCheckout
                productId={checkout.productId}
                units={checkout.units}
                successUrl="/sponsor"
                metadata={{ tier: `$${amount}` }}
              >
                {sponsorButton}
              </CreemCheckout>
            ) : (
              sponsorButton
            )}
          </m.div>
        </div>
      </div>
    </div>
  );
}
