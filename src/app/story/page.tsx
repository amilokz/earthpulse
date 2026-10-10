import type { Metadata } from "next";
import StoryModule from "@/modules/story/StoryModule";

export const metadata: Metadata = {
  title: "The World's Story · EarthPulse",
  description: "The whole world writes one story together, one line a day. Vote for tomorrow's line or write your own.",
};

export default function StoryPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-6">
      <StoryModule />
    </main>
  );
}
