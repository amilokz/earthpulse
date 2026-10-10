import { capsuleFeed, createCapsule, isPeriod } from "@/server/capsule";
import { countToday } from "@/server/content";
import { checkNickname, checkText } from "@/server/moderation";
import { detectCountry, getDevice, json, readBody, today, tooMany } from "@/server/request";

const MAX_PER_DAY = 3;

export async function GET() {
  return json(capsuleFeed((await getDevice())!));
}

export async function POST(req: Request) {
  if (await tooMany("capsule", 6)) return json({ error: "Slow down a little 🙂" }, 429);
  const body = await readBody(req);
  const check = checkText(body.text, 10, 500);
  if (!check.ok) return json({ error: check.reason }, 400);
  if (!isPeriod(body.period)) return json({ error: "Pick when it should open." }, 400);
  const visibility = body.visibility === "private" ? "private" : "public";

  const day = today();
  const device = (await getDevice())!;
  if (countToday("capsules", day, device) >= MAX_PER_DAY) {
    return json({ error: "3 capsules a day is the limit. Come back tomorrow ⏳" }, 429);
  }
  const r = createCapsule({
    device,
    day,
    country: await detectCountry(body.tz),
    text: check.text,
    nickname: checkNickname(body.nickname),
    visibility,
    period: body.period,
  });
  return json({ ok: true, ...r });
}
