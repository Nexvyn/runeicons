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
      <h3 className="md:text-md mb-1 text-sm font-semibold">{title}</h3>
      <p className="md:text-md text-sm text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border ${transparentBg ? "bg-transparent" : "bg-card"} text-card-foreground transition-all duration-300 hover:shadow-lg md:rounded-3xl ${className}`}
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
      <div className="mx-auto grid min-h-[50vh] w-full grid-cols-1 gap-2 max-sm:h-full md:gap-4 lg:h-[90vh] lg:grid-cols-12">
        <div className="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-4 lg:grid-rows-[6fr_4fr]">
          <BentoCard
            title="Five styles, one library"
            description="From clean outlines to glossy 3D, every icon comes in five distinct flavors."
            className="flex h-full items-center justify-center"
            inlineLabel
            transparentBg
          >
            <RocketInteractive />
          </BentoCard>
          <BentoCard
            title="Interactive SVG Editing"
            description="Drag points, reshape paths, and customize vectors directly in the browser."
            className="h-full"
            inlineLabel
            transparentBg
          >
            <IconVarietyShowcase />
          </BentoCard>
        </div>

        <BentoCard
          title="Modular by design"
          description="Composable shapes that snap into any layout without breaking your grid."
          className="h-full min-h-0 max-sm:p-5 lg:col-span-3"
          inlineLabel
          transparentBg
        >
          <BentoCenterSvg />
        </BentoCard>

        <div className="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-5 lg:grid-rows-[5fr_5fr]">
          <BentoCard
            title="Tweak every detail"
            description="Stroke, size, color, animation, dial each icon in until it fits your brand."
            className="h-full"
            graphicClassName="!p-0"
            inlineLabel
            transparentBg
          >
            <IconCarousel />
          </BentoCard>
          <BentoCard
            title="Crafted line by line"
            description="Hand-tuned strokes and perfect curves that scale to any size without losing detail."
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
