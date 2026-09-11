import type { Metadata } from "next";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HeaderPanel } from "@/components/icon-page/panels/header";
import { WorkspaceShell } from "@/components/icon-page/panels/workspace";
import { TuningProvider } from "@/components/icon-page/tuning";

export const metadata: Metadata = {
  title: "Browse icons",
  alternates: { canonical: "/icons" },
  description: "Browse and customize 1000+ beautiful icons.",
};

export default function Home() {
  return (
    <TuningProvider>
      <div className="flex h-screen flex-col bg-background">
        <div className="hidden lg:contents">
          <HeaderPanel />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <ErrorBoundary>
            <WorkspaceShell />
          </ErrorBoundary>
        </div>
      </div>
    </TuningProvider>
  );
}
