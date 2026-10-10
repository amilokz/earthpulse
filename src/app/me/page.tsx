import type { Metadata } from "next";
import MyPulse from "@/modules/me/MyPulse";

export const metadata: Metadata = {
  title: "My Pulse · EarthPulse",
  description: "Your mood calendar, streak and patterns. Saved only on your device.",
  robots: { index: false },
};

export default function MePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-6 lg:px-8">
      <MyPulse />
    </main>
  );
}
