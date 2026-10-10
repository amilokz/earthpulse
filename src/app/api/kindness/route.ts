import { countToday } from "@/server/content";
import { db } from "@/server/db";
import { checkText } from "@/server/moderation";
import { detectCountry, getDevice, json, readBody, today, tooMany } from "@/server/request";

const MAX_PER_DAY = 3;
const qInsert = db.prepare(`INSERT INTO kindness (text, country, device, day, created_at) VALUES (?, ?, ?, ?, ?)`);

// Kisi udaas anjaan insaan ke liye note likho
export async function POST(req: Request) {
  if (await tooMany("kindness", 6)) return json({ error: "Slow down a little 🙂" }, 429);
  const body = await readBody(req);
  const check = checkText(body.text, 8, 160);
  if (!check.ok) return json({ error: check.reason }, 400);

  const day = today();
  const device = (await getDevice())!;
  if (countToday("kindness", day, device) >= MAX_PER_DAY) {
    return json({ error: "You've shared 3 notes today. Thank you! Come back tomorrow 💛" }, 429);
  }
  qInsert.run(check.text, await detectCountry(body.tz), device, day, Date.now());
  return json({ ok: true });
}
