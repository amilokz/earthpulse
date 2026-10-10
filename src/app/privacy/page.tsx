import type { Metadata } from "next";
import Prose from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy Policy · EarthPulse", description: "What EarthPulse stores and why." };

export default function Privacy() {
  return (
    <Prose title="Privacy Policy" updated="October 2026">
      <p>EarthPulse is designed to work without accounts. We collect as little as possible.</p>
      <h2>What we store</h2>
      <ul>
        <li><b>A random device ID</b> in a cookie, so you can vote once a day and see your own capsules. It is not linked to your name or email.</li>
        <li><b>Your mood, story lines, kindness notes and capsules</b>, with the date and your country.</li>
        <li><b>Your country</b>, detected from your connection or your device&apos;s time zone. We do not store your city or exact location.</li>
        <li><b>A one-way hash of your IP address</b>, only to stop spam and vote abuse. We never store your raw IP address.</li>
        <li><b>On your own device</b> (browser storage): your mood history and streak. This never leaves your device.</li>
      </ul>
      <h2>What becomes public</h2>
      <p>
        Moods are only ever shown as country totals. Story lines, kindness notes and public capsules are shown to others
        with your country and an optional nickname. Private capsules are only shown to the device that wrote them. Please
        don&apos;t write personal details such as names, phone numbers or addresses.
      </p>
      <h2>Advertising and cookies</h2>
      <p>
        We may show ads through Google AdSense. Google and its partners use cookies to serve ads based on your visits to this
        and other websites. You can learn more and opt out of personalised ads at{" "}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google&apos;s ads policy</a> and{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Ad Settings</a>.
      </p>
      <h2>Moderation</h2>
      <p>Written content is filtered automatically and can be reported by anyone. Reported content may be hidden and reviewed.</p>
      <h2>Children</h2>
      <p>EarthPulse is meant for a general audience and does not knowingly collect personal information from children.</p>
      <h2>Deleting your data</h2>
      <p>
        Clearing this site&apos;s cookies and storage removes the link between you and anything you posted. To ask us to remove
        specific content, contact us through <a href="https://akclnt.com" target="_blank" rel="noopener noreferrer">akclnt.com</a>.
      </p>
    </Prose>
  );
}
