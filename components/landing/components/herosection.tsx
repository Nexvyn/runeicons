import { Check } from "lucide-react";

import HeroSvg from "../svg/hero";
import { BrowseIconsButton, GithubStarButton } from "./HeroCTAButtons";

const HeroSection = () => {
  return (
    <div className="grid min-h-[60vh] grid-cols-1 lg:h-[calc(100vh-64px)] lg:grid-cols-2">
      <div className="flex h-full flex-col justify-center py-8 lg:py-0">
        <div className="flex w-fit items-center gap-2 rounded-md border p-0.5 pl-2.5 text-xs">
          <span className="font-semibold">
            <span className="text-blue-700">Added </span>1000 icons
          </span>
          <div className="rounded-sm border bg-background p-1">
            <Check size={15} />
          </div>
        </div>
        <div className="xs:text-3xl mt-4 text-2xl leading-tight font-medium sm:text-4xl sm:leading-none md:text-5xl lg:text-6xl">
          Modern <span className="text-blue-700">icon</span> <br />{" "}
          <span className="text-blue-700">system</span> for products{" "}
        </div>
        <div className="mt-4 max-w-lg text-xs leading-tight text-muted-foreground sm:text-sm sm:leading-5 md:text-base">
          Consistent, lightweight, and production-ready icons designed to fit seamlessly into SaaS
          and AI interfaces.
        </div>

        <div className="mt-8 flex flex-wrap gap-2 sm:gap-4 lg:mt-14">
          <BrowseIconsButton />
          <GithubStarButton />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <HeroSvg />
      </div>
    </div>
  );
};

export default HeroSection;
