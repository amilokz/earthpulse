import type { Metadata } from "next";
import CapsuleModule from "@/modules/capsule/CapsuleModule";

export const metadata: Metadata = {
  title: "Time Capsule · EarthPulse",
  description: "Write a message to the future. It stays locked for 1 month to 10 years, then opens for you or the whole world.",
};

export default function CapsulePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-6">
      <CapsuleModule />
    </main>
  );
}
