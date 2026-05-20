import type { Metadata } from "next";

import Bento from "@/components/landing/components/bento";
import CTA from "@/components/landing/components/cta";
import Faq from "@/components/landing/components/faq";
import Footer from "@/components/landing/components/footer";
import HeroSection from "@/components/landing/components/herosection";
import Navbar from "@/components/landing/components/navbar";
import Search from "@/components/landing/components/search";
import Testimonials from "@/components/landing/components/testimonials";

export const metadata: Metadata = {
  title: "RuneIcons - Beautiful Icons for Your Next Project",
  description: "1000+ modern, customizable icons for designers and developers.",
};

async function getGitHubStars(): Promise<string> {
  try {
    const response = await fetch("https://api.github.com/repos/AitijhyaModak/rune-icons", {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    const count = data.stargazers_count;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`;
  } catch {
    return "—";
  }
}

const Page = async () => {
  return (
    <div className="relative grid min-h-screen w-full grid-cols-[1fr_auto_1fr] grid-rows-[auto_1px_auto_1px_auto_1px_auto_1px_auto_1px_auto_1px_auto_1px_auto] overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
      {/* Row 1: Navbar */}
      <div className="relative col-start-2 row-start-1 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] flex-col overflow-hidden md:w-[90vw] 2xl:w-[85vw]">
        <Navbar />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-2 border-b-2 border-dashed" />

      {/* Row 2: Hero Section */}
      <div
        id="home"
        className="col-start-2 row-start-3 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col gap-2 px-3 pt-20 pb-10 sm:px-6 sm:pb-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <HeroSection />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-4 border-b-2 border-dashed" />

      {/* Row 3: Search Section */}
      <div
        id="search"
        className="col-start-2 row-start-5 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col gap-2 px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Search />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-6 border-b-2 border-dashed" />

      {/* Row 4: Bento Section */}
      <div
        id="features"
        className="col-start-2 row-start-7 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col p-3 py-10 sm:p-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Bento />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-8 border-b-2 border-dashed" />

      {/* Row 5: Testimonials Section */}
      <div
        id="testimonials"
        className="col-start-2 row-start-9 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col p-3 py-10 sm:p-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Testimonials />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-10 border-b-2 border-dashed" />

      {/* Row 6: FAQ Section */}
      <div
        id="faq"
        className="col-start-2 row-start-11 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] scroll-mt-24 flex-col px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]"
      >
        <Faq />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-12 border-b-2 border-dashed" />

      {/* Row 7: CTA Section */}
      <div className="col-start-2 row-start-13 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] flex-col overflow-hidden p-3 py-10 sm:p-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]">
        <CTA />
      </div>

      <div className="pointer-events-none col-span-full col-start-1 row-start-14 border-b-2 border-dashed" />

      {/* Row 8: Footer */}
      <div className="col-start-2 row-start-15 flex w-[95vw] max-w-[1440px] 2xl:max-w-[1800px] flex-col px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw]">
        <Footer />
      </div>

      {/* Decorative side borders - border-x-2 */}
      <div className="pointer-events-none z-50 col-start-2 row-span-full row-start-1 border-x-2 border-dashed" />
    </div>
  );
};

export default Page;
