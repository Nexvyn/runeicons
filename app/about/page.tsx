import type { Metadata } from "next";

import AboutContent from "./components/AboutContent";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description: "Meet the team behind RuneIcons.",
};

export default function AboutPage() {
  return <AboutContent />;
}
