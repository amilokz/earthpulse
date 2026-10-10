import { countsForDay, myMood } from "@/server/mood";
import { detectCountry, getDevice, json, today } from "@/server/request";

// Aaj ki poori duniya ka mood + is device ka vote
export async function GET(req: Request) {
  const tz = new URL(req.url).searchParams.get("tz") ?? undefined;
  const day = today();
  const device = (await getDevice())!;
  const mine = myMood(day, device);
  return json({
    day,
    countries: countsForDay(day),
    me: { mood: mine?.mood ?? null, country: mine?.country ?? (await detectCountry(tz)) },
  });
}
