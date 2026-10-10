import type { Metadata } from "next";
import Prose from "@/components/Prose";

export const metadata: Metadata = { title: "Terms of Use · EarthPulse", description: "The simple rules of EarthPulse." };

export default function Terms() {
  return (
    <Prose title="Terms of Use" updated="October 2026">
      <p>By using EarthPulse you agree to these simple rules.</p>
      <h2>Be kind</h2>
      <ul>
        <li>No hate, harassment, threats, sexual content or anything harmful.</li>
        <li>No personal information about yourself or anyone else (names, phone numbers, addresses, links).</li>
        <li>No spam, advertising or attempts to manipulate votes.</li>
      </ul>
      <h2>Your content</h2>
      <p>
        You keep ownership of what you write. By posting, you allow EarthPulse to display it on the site and in things made from
        it, such as the World&apos;s Story e-book and share images. We may hide or remove any content at any time.
      </p>
      <h2>No guarantees</h2>
      <p>
        EarthPulse is provided as-is for fun and connection. Mood numbers reflect people who chose to vote, not a scientific
        survey. EarthPulse is not a medical, mental health or emergency service.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. Continuing to use EarthPulse means you accept the latest version.</p>
    </Prose>
  );
}
