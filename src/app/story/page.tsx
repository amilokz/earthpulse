import type { Metadata } from "next";
import StoryModule from "@/modules/story/StoryModule";

export const metadata: Metadata = {
  title: "World Story — Collaborative Story, One Line a Day | EarthPulse",
  description: "The whole world writes one story together, one line a day. Vote for tomorrow’s line or add your own — free collaborative storytelling.",
};

export default function StoryPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-6">
      <StoryModule />
    </main>
  );
}
