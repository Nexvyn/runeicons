import React from "react";

import BentoCenterSvg from "../svg/bento-center-svg";
import BentoSvg from "../svg/bento-svg";
import RocketInteractive from "../svg/rocket-interactive";
import IconCarousel from "./icon-carousel";
import { IconVarietyShowcase } from "./icon-variety-showcase";

interface BentoCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  graphicClassName?: string;
  fullBackgroundGraphic?: boolean;
  inlineLabel?: boolean;
  transparentBg?: boolean;
}

const BentoCard = ({
  title,
  description,
  children,
  className,
  graphicClassName,
  fullBackgroundGraphic,
  inlineLabel,
  transparentBg,
}: BentoCardProps) => {
  const label = (title || description) && (
    <div
      className={
        inlineLabel
          ? "relative z-10 p-4 md:px-8 md:pb-6"
          : "pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 md:px-8 md:pb-6"
      }
    >
      <h3 className="mb-1 text-sm font-semibold md:text-base">{title}</h3>
      <p className="text-sm text-muted-foreground md:text-base">{description}</p>
    </div>
  );

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border ${transparentBg ? "bg-transparent" : "bg-card"} ease text-card-foreground transition-shadow duration-150 hover:shadow-lg md:rounded-3xl ${className}`}
    >
      <div
        className={
          fullBackgroundGraphic
            ? `absolute inset-0 z-0 overflow-hidden ${graphicClassName ?? ""}`
            : `relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 md:p-6 ${graphicClassName ?? ""}`
        }
      >
        {children}
      </div>
      {label}
    </div>
  );
};

const Bento = () => {
  return (
    <section className="w-full">
      <div className="mx-auto grid min-h-[60vh] w-full grid-cols-1 gap-2 max-sm:h-full md:gap-4 lg:h-[calc(100vh-104px)] lg:grid-cols-12">
        <div className="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-4 lg:grid-rows-[6fr_4fr]">
          <BentoCard
            title="Five styles, one library"
            description="Outline, duotone, fill, pixel, glass. The same glyph, drawn five ways."
            className="flex h-full items-center justify-center"
            inlineLabel
            transparentBg
          >
            <RocketInteractive />
          </BentoCard>
          <BentoCard
            title="Edit in the browser"
            description="Grab a point, drag it, watch the path bend. No Figma round-trip."
            className="h-full"
            inlineLabel
            transparentBg
          >
            <IconVarietyShowcase />
          </BentoCard>
        </div>

        <BentoCard
          title="Snaps to your grid"
          description="Built on a 24px grid so nothing lands half a pixel off."
          className="h-full min-h-0 max-sm:p-5 lg:col-span-3"
          inlineLabel
          transparentBg
        >
          <BentoCenterSvg />
        </BentoCard>

        <div className="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-5 lg:grid-rows-[5fr_5fr]">
          <BentoCard
            title="Tune every detail"
            description="Stroke, size, color, motion. Dial each icon in until it fits."
            className="h-full"
            graphicClassName="p-0!"
            inlineLabel
            transparentBg
          >
            <IconCarousel />
          </BentoCard>
          <BentoCard
            title="Drawn by hand"
            description="Every curve was placed on purpose. They stay sharp at any size."
            className="h-full max-lg:aspect-square"
            fullBackgroundGraphic
            transparentBg
          >
            <BentoSvg />
          </BentoCard>
        </div>
      </div>
    </section>
  );
};

export default Bento;
