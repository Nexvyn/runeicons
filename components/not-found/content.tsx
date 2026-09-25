import Link from "next/link";

import HeroSvg from "@/components/landing/svg/hero";
import { Button } from "@/components/ui/button";

const NotFoundContent = () => (
  <div className="grid min-h-[60vh] grid-cols-1 gap-10 lg:h-[calc(100vh-104px)] lg:max-h-[780px] lg:grid-cols-2 lg:gap-6">
    <div className="flex h-full flex-col justify-center py-8 lg:py-0">
      <div className="flex w-fit -rotate-2 items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold">
        <span className="text-blue-700">404</span>
        <span className="text-muted-foreground">page not found</span>
      </div>

      <h1 className="mt-4 text-2xl leading-tight font-medium sm:text-4xl sm:leading-none md:text-5xl lg:text-6xl">
        This page never <br />
        made it <span className="text-blue-700">off the pad</span>
      </h1>

      <p className="mt-4 max-w-lg text-xs leading-tight text-muted-foreground sm:text-sm sm:leading-5 md:text-base">
        The link is broken, or the page moved somewhere we forgot to tell you about. Press launch on
        the rocket if you want to see how that went for it.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 sm:gap-4">
        <Link href="/icons" prefetch={false}>
          <Button className="bg-brand py-5 text-white hover:bg-brand/90">Browse Icons</Button>
        </Link>
        <Link href="/" prefetch={false}>
          <Button variant="outline" className="py-5">
            Back to home
          </Button>
        </Link>
      </div>
    </div>

    <div className="flex items-center justify-center">
      <HeroSvg variant="burst" />
    </div>
  </div>
);

export default NotFoundContent;
