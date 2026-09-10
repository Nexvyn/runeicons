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
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center lg:hidden">
          <p className="text-lg font-medium text-foreground">Please switch to a laptop</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            This needs a bigger screen to work properly.
          </p>
        </div>
        <div className="hidden lg:contents">
          <HeaderPanel />
        </div>
        <div className="hidden flex-1 flex-col min-h-0 lg:flex">
          <ErrorBoundary>
            <WorkspaceShell />
          </ErrorBoundary>
        </div>
      </div>
    </TuningProvider>
  );
}
