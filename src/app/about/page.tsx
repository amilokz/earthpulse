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
      <h2>Questions people ask</h2>
      <h3 className="font-extrabold text-white">Do I need an account?</h3>
      <p>No. Open the site, tap an emoji, done. A random ID in a cookie lets you vote once a day.</p>
      <h3 className="font-extrabold text-white">When does a new day start?</h3>
      <p>At midnight UTC, the same moment for everyone. That keeps the whole world on one shared day.</p>
      <h3 className="font-extrabold text-white">How is my country detected?</h3>
      <p>From your internet connection or your device&apos;s time zone. We never store your city or exact location.</p>
      <h3 className="font-extrabold text-white">Are the numbers scientific?</h3>
      <p>No. They show how the people who chose to vote feel today. Think of it as a live snapshot, not a survey.</p>
      <h3 className="font-extrabold text-white">How does the story pick a line?</h3>
      <p>Anyone can write one line a day and vote for one line a day. At midnight UTC the line with the most votes joins the story.</p>
      <h3 className="font-extrabold text-white">Can I use EarthPulse like an app?</h3>
      <p>Yes. On your phone, open the browser menu and choose &quot;Add to Home Screen&quot;.</p>
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
