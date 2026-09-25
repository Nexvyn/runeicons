import type { Metadata } from "next";

import Footer from "@/components/landing/components/footer";
import NotFoundContent from "@/components/not-found/content";
import Navbar from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "404: Page not found",
  description: "This page doesn't exist. Browse 900+ icons in five styles instead.",
  robots: { index: false },
};

const NotFoundPage = () => (
  <div className="relative grid min-h-screen w-full grid-cols-[1fr_auto_1fr] grid-rows-[auto_1px_auto_1px_auto] overflow-hidden bg-[#F5F5F5] font-(family-name:--font-inter-tight) dark:bg-background">
    <div className="relative col-start-2 row-start-1 flex w-[95vw] max-w-[1440px] flex-col overflow-hidden md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]">
      <Navbar showBanner showDashedBorder links={[{ href: "/about", label: "About dev" }]} />
    </div>

    <main className="col-start-2 row-start-3 flex w-[95vw] max-w-[1440px] flex-col gap-2 px-3 pt-20 pb-4 sm:px-6 sm:pb-6 md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]">
      <NotFoundContent />
    </main>

    <div className="pointer-events-none col-span-full col-start-1 row-start-4 border-b-2 border-dashed" />

    <div className="col-start-2 row-start-5 flex w-[95vw] max-w-[1440px] flex-col px-3 py-10 sm:px-6 sm:py-14 md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]">
      <Footer />
    </div>

    <div className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-[95vw] max-w-[1440px] -translate-x-1/2 border-x-2 border-dashed md:w-[90vw] 2xl:w-[85vw] 2xl:max-w-[1800px]" />
  </div>
);

export default NotFoundPage;
