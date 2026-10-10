import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import ReportButton from "@/components/ReportButton";
import { getCountry } from "@/lib/countries";
import { timeAgo } from "@/lib/time";
import KindnessModule from "@/modules/kindness/KindnessModule";
import { kindnessCount, latestKindness } from "@/server/overview";
import { serverNow } from "@/server/request";

export const metadata: Metadata = {
  title: "Kindness wall · EarthPulse",
  description: "Short, kind notes from strangers all over the world. Read them, or write one for someone who feels sad today.",
};

export default function KindnessPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pt-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-extrabold lg:text-5xl">Kindness wall</h1>
        <p className="text-muted mt-2">
          Kind words from strangers around the world. When someone taps 😔 or 😢, they get one of these notes.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <KindnessModule />
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-[1.75rem] bg-white/5" />}>
          <Wall />
        </Suspense>
      </div>
    </main>
  );
}

async function Wall() {
  await connection();
  const notes = latestKindness(60);
  const total = kindnessCount();
  const now = serverNow();
  if (notes.length === 0) {
    return <p className="card text-lg">The wall is empty. Write the very first note 💌</p>;
  }
  return (
    <section>
      <p className="text-muted mb-4 text-sm font-bold">{total.toLocaleString()} notes and counting</p>
      <ul className="columns-1 gap-4 sm:columns-2">
        {notes.map((n, i) => (
          <li key={n.id} className="mb-4 break-inside-avoid">
            <figure className="rounded-md bg-[var(--paper)] px-5 py-4 text-ink shadow-[0_18px_30px_-20px_rgba(0,0,0,0.7)]" style={{ rotate: `${((i * 37) % 5) - 2}deg` }}>
              <blockquote className="font-[family-name:var(--font-hand)] text-[1.7rem] leading-tight">{n.text}</blockquote>
              <figcaption className="mt-2 flex items-center justify-between gap-2 text-xs text-ink/60">
                <span>
                  {getCountry(n.country).flag} {getCountry(n.country).name} · {timeAgo(n.created_at, now)}
                </span>
                <span className="[&_button]:!text-ink/50 [&_span]:!text-ink/60">
                  <ReportButton type="kindness" id={n.id} />
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
