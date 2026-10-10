import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import MoodRibbon from "@/components/MoodRibbon";
import { COUNTRIES, getCountry, isCountry } from "@/lib/countries";
import { MOODS, dominantMood, happyPercent } from "@/lib/moods";
import { getFacts, slug } from "@/lib/spotlight";
import { countryHistory } from "@/server/overview";
import { today } from "@/server/request";

type Params = Promise<{ code: string }>;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ code: slug(c.code) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const code = (await params).code.toUpperCase();
  if (!isCountry(code)) return {};
  const c = getCountry(code);
  return {
    title: `How is ${c.name} feeling today? · EarthPulse`,
    description: `Live mood of ${c.name} today: see how people in ${c.name} feel, the last 14 days, and facts about ${c.name}. Add your own mood in one tap.`,
    alternates: { canonical: `/mood/${slug(code)}` },
  };
}

const toCounts = (c: number[]) => ({ 1: c[0], 2: c[1], 3: c[2], 4: c[3], 5: c[4] });
const fmtArea = (n: number) => `${Math.round(n).toLocaleString("en-US")} km²`;

export default async function CountryPage({ params }: { params: Params }) {
  const code = (await params).code.toUpperCase();
  if (!isCountry(code)) notFound();
  const c = getCountry(code);
  const f = getFacts(code)!;

  const facts: [string, string][] = [
    ["Official name", f.official],
    ["Capital", f.capital.join(", ") || "—"],
    ["Region", f.subregion ? `${f.subregion}, ${f.region}` : f.region],
    ["Languages", f.languages.join(", ") || "—"],
    ["Currency", f.currencies.join(", ") || "—"],
    ["Area", fmtArea(f.area)],
    ["People are called", f.demonym ?? "—"],
    ["Coastline", f.landlocked ? "Landlocked (no sea)" : "Has a coastline"],
  ];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 pt-6 lg:px-8">
      <Link href="/mood" className="text-muted text-sm font-bold">
        ‹ All countries
      </Link>
      <header className="flex items-center gap-4">
        <span className="text-7xl leading-none lg:text-8xl">{c.flag}</span>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">How is {c.name} feeling today?</h1>
          <p className="text-muted mt-1">Live mood from people in {c.name}, updated with every tap.</p>
        </div>
      </header>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-[1.75rem] bg-white/5" />}>
        <CountryMood code={code} name={c.name} />
      </Suspense>

      <section className="card">
        <h2 className="mb-4 text-2xl font-extrabold">About {c.name}</h2>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted text-sm">{k}</dt>
              <dd className="font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        {f.borders.length > 0 && (
          <div className="mt-6">
            <h3 className="text-muted mb-2 text-sm">Neighbours</h3>
            <div className="flex flex-wrap gap-2">
              {f.borders.map((b) => (
                <Link key={b} href={`/mood/${slug(b)}`} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/20">
                  {getCountry(b).flag} {getCountry(b).name}
                </Link>
              ))}
            </div>
          </div>
        )}
        <p className="text-muted mt-6 text-xs">Country facts from the open-source world-countries dataset.</p>
      </section>
    </main>
  );
}

async function CountryMood({ code, name }: { code: string; name: string }) {
  await connection();
  const day = today();
  const hist = countryHistory(code, day, 14);
  const todayRow = hist[hist.length - 1];
  const total = todayRow.c.reduce((a, b) => a + b, 0);
  const counts = toCounts(todayRow.c);
  const maxDay = Math.max(1, ...hist.map((h) => h.c.reduce((a, b) => a + b, 0)));

  return (
    <>
      <section className="card flex flex-col gap-4">
        {total > 0 ? (
          <>
            <p className="display text-3xl font-extrabold lg:text-4xl">
              {dominantMood(counts).emoji} Mostly {dominantMood(counts).label.toLowerCase()} · {happyPercent(counts)}% happy
            </p>
            <MoodRibbon counts={todayRow.c} className="h-5" />
            <ul className="grid grid-cols-5 gap-2 text-center text-sm">
              {MOODS.map((m) => (
                <li key={m.value}>
                  <span className="block text-2xl">{m.emoji}</span>
                  <b>{counts[m.value]}</b>
                  <span className="text-muted block text-xs">{m.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted text-sm">
              {total.toLocaleString()} {total === 1 ? "person" : "people"} in {name} shared a mood today (UTC).
            </p>
          </>
        ) : (
          <p className="text-lg">
            Nobody in {name} has shared a mood yet today. If you&apos;re in {name},{" "}
            <Link href="/" className="font-extrabold text-gold underline">
              add the first one
            </Link>
            .
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="mb-1 text-xl font-extrabold">Last 14 days</h2>
        <p className="text-muted mb-4 text-sm">Each bar is one day. Height shows how many people voted, colors show how they felt.</p>
        <div className="flex h-40 items-end gap-1.5">
          {hist.map((h) => {
            const t = h.c.reduce((a, b) => a + b, 0);
            return (
              <div key={h.day} className="flex h-full flex-1 flex-col justify-end" title={`${h.day}: ${t} moods`}>
                <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-md bg-white/5" style={{ height: `${t ? Math.max(6, (t / maxDay) * 100) : 3}%` }}>
                  {t > 0 && MOODS.slice().reverse().map((m) => <div key={m.value} style={{ height: `${(h.c[m.value - 1] / t) * 100}%`, background: m.color }} />)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-muted mt-2 flex justify-between text-xs">
          <span>{hist[0].day.slice(5)}</span>
          <span>Today</span>
        </div>
      </section>
    </>
  );
}
