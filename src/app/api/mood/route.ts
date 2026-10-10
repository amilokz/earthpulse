import { castVote, countsForDay, myMood, randomKindness } from "@/server/mood";
import { detectCountry, getDevice, ipHash, json, readBody, today, tooMany } from "@/server/request";

export async function POST(req: Request) {
  if (await tooMany("mood", 15)) return json({ error: "Slow down a little 🙂" }, 429);
  const body = await readBody(req);
  const mood = Number(body.mood);
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) return json({ error: "Invalid mood" }, 400);

  const day = today();
  const device = (await getDevice())!;
  const country = await detectCountry(body.tz);
  const r = castVote(day, device, country, mood, await ipHash());
  if (!r.ok) return json({ error: r.error }, 429);

  const mine = myMood(day, device)!;
  return json({
    day,
    me: { mood: mine.mood, country: mine.country },
    countries: countsForDay(day),
    // Udaas mood par kisi anjaan insaan ka kindness note
    note: mine.mood <= 2 ? randomKindness(device) : null,
  });
}
