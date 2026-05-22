import type { Metadata } from "next";

import Bento from "@/components/landing/components/bento";
import CTA from "@/components/landing/components/cta";
import Faq from "@/components/landing/components/faq";
import Footer from "@/components/landing/components/footer";
import HeroSection from "@/components/landing/components/herosection";
import Navbar from "@/components/ui/navbar";
import Search from "@/components/landing/components/search";
import Testimonials from "@/components/landing/components/testimonials";

export const metadata: Metadata = {
  title: "RuneIcons - Beautiful Icons for Your Next Project",
  description: "1000+ modern, customizable icons for designers and developers.",
};

const Page = async () => {
  return (
    <div className="relative grid min-h-screen w-full grid-cols-[1fr_auto_1fr] grid-rows-[auto_1px_auto_1px_auto_1px_auto_1px_auto_1px_auto_1px_auto_1px_auto] overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
      <div className="relative col-start-2 row-start-1 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] flex-col overflow-hidden md:w-[90vw] 2xl:w-[85vw]">
        <Navbar
          showBanner
          showDashedBorder
          links={[
            { href: "/about", label: "About dev" },
            { href: "/sponsor", label: "Sponsor" },
          ]}
        />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-2 border-b-2 border-dashed" />

      <div
        id="home"
        className="col-start-2 row-start-3 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col gap-2 px-3 pt-20 pb-10 sm:px-6 sm:pb-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <HeroSection />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-4 border-b-2 border-dashed" />

      <div
        id="search"
        className="col-start-2 row-start-5 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col gap-2 px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Search />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-6 border-b-2 border-dashed" />

      <div
        id="features"
        className="col-start-2 row-start-7 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col p-3 py-10 sm:p-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Bento />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-8 border-b-2 border-dashed" />

      <div
        id="testimonials"
        className="col-start-2 row-start-9 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col p-3 py-10 sm:p-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Testimonials />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-10 border-b-2 border-dashed" />

      <div
        id="faq"
        className="col-start-2 row-start-11 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Faq />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-12 border-b-2 border-dashed" />

      <div className="col-start-2 row-start-13 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] flex-col overflow-hidden p-3 py-10 sm:p-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]">
        <CTA />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-14 border-b-2 border-dashed" />

      <div className="col-start-2 row-start-15 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] flex-col px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]">
        <Footer />
      </div>

      <div className="pointer-events-none z-50 col-start-2 row-span-full row-start-1 border-x-2 border-dashed" />
    </div>
  );
};

export default Page;
