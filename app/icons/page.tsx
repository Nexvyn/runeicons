import type { Metadata } from "next";

import { HeaderPanel } from "@/components/icon-page/panels/header";
import { WorkspaceShell } from "@/components/icon-page/panels/workspace";
import { TuningProvider } from "@/components/icon-page/tuning";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Browse icons",
  alternates: { canonical: "/icons" },
  description: "Browse and customize 1000+ beautiful icons.",
};

export default function Home() {
  return (
    <TuningProvider>
      <div className="flex flex-col h-screen bg-background">
        <HeaderPanel />
        <ErrorBoundary>
          <WorkspaceShell />
        </ErrorBoundary>
      </div>
    </TuningProvider>
  );
}
