import type { Metadata } from "next";
import PlayHub from "@/modules/game/PlayHub";

export const metadata: Metadata = {
  title: "Pulse Journey: free puzzle game · EarthPulse",
  description: "A free match-3 puzzle game: travel from Lahore to Istanbul to Tokyo and cheer people up. Live local time and real weather in every city. No download.",
};

export default function PlayPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-6 lg:px-8">
      <PlayHub />
    </main>
  );
}
