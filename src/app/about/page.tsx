import type { Metadata } from "next";
import Prose from "@/components/Prose";

export const metadata: Metadata = { title: "About · EarthPulse", description: "What EarthPulse is and why we built it." };

export default function About() {
  return (
    <Prose title="About EarthPulse 🌍">
      <p>
        EarthPulse is a small daily ritual for the whole planet. Every day, people everywhere tap one emoji to share how
        they feel, and the globe lights up with the world&apos;s mood, live.
      </p>
      <h2>What you can do here</h2>
      <ul>
        <li><b>World Mood:</b> share your mood in one tap and see how your country and the world feel today.</li>
        <li><b>Kindness Notes:</b> leave a short, kind note. People who feel sad today receive one from a stranger.</li>
        <li><b>The World&apos;s Story:</b> the world writes one story together. Every day the most-voted line is added.</li>
        <li><b>Time Capsule:</b> write a message that stays locked for 1 month to 10 years, for yourself or for everyone.</li>
      </ul>
      <h2>Why</h2>
      <p>
        So many of us feel alone with how we feel. EarthPulse is a reminder that millions of people are feeling the same
        things today, and that a few kind words from anywhere in the world can help.
      </p>
      <h2>Anonymous by design</h2>
      <p>No account, no login, no profile. Read our <a href="/privacy">Privacy Policy</a> for exactly what we store.</p>
      <h2>Contact</h2>
      <p>
        EarthPulse is built by <a href="https://akclnt.com" target="_blank" rel="noopener noreferrer">AKCLNT</a>. Reach us
        through the contact page there.
      </p>
      <p className="text-muted text-sm">
        EarthPulse is not a medical or crisis service. If you are in danger or thinking about harming yourself, please
        contact your local emergency number or a crisis helpline in your country right away.
      </p>
    </Prose>
  );
}
