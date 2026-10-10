"use client";

import { useState } from "react";

interface Props {
  country: string;
  countryName: string;
  happy: number | null;
  mood: number;
  moodEmoji: string;
  streak: number;
}

// Mobile: image + text native share sheet (WhatsApp, Insta story...). Desktop: copy link + download card.
export default function ShareButton({ country, countryName, happy, mood, moodEmoji, streak }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  const params = new URLSearchParams({ c: country, m: String(mood), s: String(streak) });
  if (happy !== null) params.set("h", String(happy));
  const cardUrl = `/api/card?${params}`;
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const text =
    happy !== null
      ? `${countryName} is ${happy}% happy today on EarthPulse 🌍 I felt ${moodEmoji}. How do you feel? One tap:`
      : `I added my ${moodEmoji} to the world's mood on EarthPulse 🌍 How do you feel today? One tap:`;

  const share = async () => {
    setMsg(null);
    try {
      const blob = await fetch(cardUrl).then((r) => r.blob());
      const file = new File([blob], "earthpulse.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text} ${siteUrl}` });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text, url: siteUrl });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${siteUrl}`);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "earthpulse.png";
      a.click();
      setMsg("Link copied and card downloaded ✅");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setMsg("Couldn't share. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button onClick={share} className="flex-1 rounded-full bg-gold py-3.5 text-lg font-extrabold text-ink shadow-[0_12px_30px_-12px_var(--gold)] active:scale-95">
          Share my pulse
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${siteUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-5 font-extrabold text-ink active:scale-95"
        >
          WhatsApp
        </a>
      </div>
      {msg && <p className="text-muted text-center text-xs">{msg}</p>}
    </div>
  );
}
