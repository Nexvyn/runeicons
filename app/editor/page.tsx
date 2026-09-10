import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/EditorShell";
import { getEditorAssets } from "@/lib/editor/assets";
import { TuningProvider } from "@/components/icon-page/tuning";

export const metadata: Metadata = {
  title: "Editor",
  alternates: { canonical: "/editor" },
  description: "Create and edit custom SVG icons with the RuneIcons editor.",
};

export default async function EditorPage() {
  const assets = await getEditorAssets();

  return (
    <TuningProvider>
      <EditorShell assets={assets} />
    </TuningProvider>
  );
}
