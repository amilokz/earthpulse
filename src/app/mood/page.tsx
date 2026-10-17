import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import MoodRibbon from "@/components/MoodRibbon";
import { COUNTRIES, getCountry } from "@/lib/countries";
import { happyPercent } from "@/lib/moods";
import { slug } from "@/lib/spotlight";
import { worldToday } from "@/server/overview";
import { today } from "@/server/request";

export const metadata: Metadata = {
  title: "World Mood by Country Today — Live Rankings | EarthPulse",
  description: "See how every country in the world is feeling today, live — global mood rankings, happiness scores and all 195 countries.",
};

const toCounts = (c: number[]) => ({ 1: c[0], 2: c[1], 3: c[2], 4: c[3], 5: c[4] });

export default function CountriesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pt-6 lg:px-8">
      <header>
        <h1 className="text-4xl font-extrabold lg:text-5xl">The world&apos;s mood, country by country</h1>
        <p className="text-muted mt-2 max-w-[60ch]">Live results from today (UTC). Tap a country to see its last 14 days and learn about it.</p>
      </header>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-[1.75rem] bg-white/5" />}>
        <Ranking />
      </Suspense>
      <section>
        <h2 className="mb-3 text-2xl font-extrabold">All countries</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <Link href={`/mood/${slug(c.code)}`} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold hover:bg-white/10">
                <span className="text-xl">{c.flag}</span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

async function Ranking() {
  await connection();
  const w = worldToday(today());
  const rows = w.byCountry
    .filter((r) => r.code !== "XX")
    .map((r) => ({ ...r, total: r.c.reduce((a, b) => a + b, 0), happy: happyPercent(toCounts(r.c)) }))
    .sort((a, b) => b.total - a.total);

  if (rows.length === 0) {
    return (
      <p className="card text-lg">
        No country has voted yet today.{" "}
        <Link href="/" className="font-extrabold text-gold underline">
          Be the first
        </Link>
        .
      </p>
    );
  }
  return (
    <section className="card !p-0">
      <h2 className="px-5 pt-4 text-xl font-extrabold">Voting today</h2>
      <ul className="divide-y divide-white/10">
        {rows.map((r) => {
          const c = getCountry(r.code);
          return (
            <li key={r.code}>
              <Link href={`/mood/${slug(r.code)}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-white/5 sm:grid-cols-[auto_12rem_1fr_auto]">
                <span className="text-2xl">{c.flag}</span>
                <span className="font-bold">{c.name}</span>
                <span className="col-span-3 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                  <MoodRibbon counts={r.c} />
                </span>
                <span className="col-start-3 row-start-1 text-right text-sm sm:col-start-4">
                  <b className="text-gold">{r.happy}%</b> <span className="text-muted">· {r.total}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
