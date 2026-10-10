import Link from "next/link";
import MoodRibbon from "@/components/MoodRibbon";
import { getCountry } from "@/lib/countries";
import { happyPercent, moodByValue, type MoodValue } from "@/lib/moods";
import { slug, spotlightFor } from "@/lib/spotlight";
import { fmtDate, timeAgo } from "@/lib/time";
import { capsuleStats, kindnessCount, latestKindness, recentActivity, storyPreview, worldToday } from "@/server/overview";
import { serverNow, today } from "@/server/request";

const toCounts = (c: number[]) => ({ 1: c[0], 2: c[1], 3: c[2], 4: c[3], 5: c[4] });

// Home page ka "Today on Earth" hissa: server par render (SEO + AdSense ke liye asli content)
export default function TodaySections() {
  const day = today();
  const world = worldToday(day);
  const activity = recentActivity(day, 8);
  const spot = spotlightFor(day);
  const spotCounts = world.byCountry.find((r) => r.code === spot.code)?.c;
  const story = storyPreview(day);
  const notes = latestKindness(3);
  const notesTotal = kindnessCount();
  const caps = capsuleStats();
  const now = serverNow();

  return (
    <div className="flex w-full flex-col gap-10">
      <section aria-labelledby="today-h" className="grid gap-4 lg:grid-cols-3">
        <h2 id="today-h" className="text-2xl font-extrabold lg:col-span-3 lg:text-3xl">
          Today on Earth
        </h2>

        <div className="card flex flex-col gap-4">
          <div>
            <p className="display text-5xl font-extrabold">{world.total.toLocaleString()}</p>
            <p className="text-muted text-sm font-bold">
              moods shared today from {world.countries} {world.countries === 1 ? "country" : "countries"}
            </p>
          </div>
          <MoodRibbon counts={world.counts} className="h-4" />
          {world.total > 0 ? (
            <p className="text-sm">
              The world is <b>{happyPercent(toCounts(world.counts))}% happy</b> right now.
            </p>
          ) : (
            <p className="text-muted text-sm">The day just started (midnight UTC). Add the first mood.</p>
          )}
          <Link href="/mood" className="mt-auto text-sm font-extrabold text-gold">
            See every country
          </Link>
        </div>

        <div className="card">
          <h3 className="mb-3 font-extrabold">Right now</h3>
          {activity.length === 0 ? (
            <p className="text-muted text-sm">No moods yet today. Yours could be the first.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activity.map((a, i) => {
                const c = getCountry(a.country);
                const m = moodByValue(a.mood as MoodValue);
                return (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-xl">{m.emoji}</span>
                    <span className="flex-1">
                      Someone in {c.flag} <b>{c.name}</b> feels {m.label.toLowerCase()}
                    </span>
                    <span className="text-muted shrink-0 text-xs">{timeAgo(a.created_at, now)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Link href={`/mood/${slug(spot.code)}`} className="card group flex flex-col gap-3 transition hover:bg-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Country of the day</h3>
            <span className="text-muted text-xs font-bold">changes daily</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-6xl leading-none">{spot.flag}</span>
            <div>
              <p className="display text-2xl font-extrabold leading-tight">{spot.name}</p>
              <p className="text-muted text-sm">{spot.facts.subregion ?? spot.facts.region}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {spot.facts.capital[0] && (
              <div>
                <dt className="text-muted text-xs">Capital</dt>
                <dd className="font-bold">{spot.facts.capital[0]}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted text-xs">Language</dt>
              <dd className="font-bold">{spot.facts.languages.slice(0, 2).join(", ") || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Currency</dt>
              <dd className="font-bold">{spot.facts.currencies[0] ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Mood today</dt>
              <dd className="font-bold">{spotCounts ? `${happyPercent(toCounts(spotCounts))}% happy` : "No votes yet"}</dd>
            </div>
          </dl>
          <span className="mt-auto text-sm font-extrabold text-gold group-hover:underline">Discover {spot.name}</span>
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-5 lg:items-start">
        <Link href="/story" className="card group flex flex-col gap-3 transition hover:bg-white/10 lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-extrabold">The world&apos;s story</h2>
            <span className="text-muted text-sm font-bold">Chapter {story.chapter}</span>
          </div>
          <div className="flex flex-col gap-2 font-serif text-lg leading-relaxed">
            {story.lines.map((l, i) => (
              <p key={i} className={i === story.lines.length - 1 ? "" : "text-cream/60"}>
                {l.text}
              </p>
            ))}
            <p className="text-gold">…</p>
          </div>
          <p className="mt-auto text-sm">
            <b className="text-gold group-hover:underline">What happens next?</b>{" "}
            <span className="text-muted">
              {story.candidatesToday > 0 ? `${story.candidatesToday} lines are in today's vote.` : "Nobody has written today's line yet."}
            </span>
          </p>
        </Link>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-extrabold">Kindness wall</h2>
              <Link href="/kindness" className="text-sm font-extrabold text-gold">
                Read all {notesTotal > 0 ? notesTotal.toLocaleString() : ""}
              </Link>
            </div>
            {notes.length === 0 ? (
              <p className="text-muted text-sm">No notes yet. Write the first kind words for a stranger.</p>
            ) : (
              notes.map((n, i) => (
                <figure key={n.id} className="rounded-md bg-[var(--paper)] px-4 py-3 text-ink" style={{ rotate: `${[-1, 0.8, -0.5][i]}deg` }}>
                  <blockquote className="font-[family-name:var(--font-hand)] text-2xl leading-tight">{n.text}</blockquote>
                  <figcaption className="mt-1 text-xs text-ink/60">
                    {getCountry(n.country).flag} {getCountry(n.country).name}
                  </figcaption>
                </figure>
              ))
            )}
          </div>

          <Link href="/capsule" className="card group flex items-center gap-4 transition hover:bg-white/10">
            <span className="text-5xl">⏳</span>
            <span>
              <span className="block font-extrabold">Time capsules</span>
              <span className="text-muted block text-sm">
                {caps.locked
                  ? `${caps.locked.toLocaleString()} locked${caps.next ? `, next opens ${fmtDate(caps.next)}` : ""}.`
                  : "Write a message the world will read in the future."}
                {caps.opened ? ` ${caps.opened} already opened.` : ""}
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
