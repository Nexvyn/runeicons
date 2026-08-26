import type { Metadata } from "next";

import SponsorContent from "./components/SponsorContent";

export const metadata: Metadata = {
  title: "Sponsor",
  alternates: { canonical: "/sponsor" },
  description: "Support the RuneIcons project with a donation.",
};

export default function SponsorPage() {
  return <SponsorContent />;
}
