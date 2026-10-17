import type { Metadata } from "next";
import CapsuleModule from "@/modules/capsule/CapsuleModule";

export const metadata: Metadata = {
  title: "Time Capsule — Send a Message to the Future | EarthPulse",
  description: "Write a digital time capsule message to the future — locked for 1 month to 10 years, then opened for you or the world. Free.",
};

export default function CapsulePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-6">
      <CapsuleModule />
    </main>
  );
}
