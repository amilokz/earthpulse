import { checkNickname, checkText } from "@/server/moderation";
import { detectCountry, getDevice, json, readBody, today, tooMany } from "@/server/request";
import { getStory, submitLine, voteLine } from "@/server/story";

export async function GET() {
  return json(getStory(today(), (await getDevice())!));
}

// body: { action: "vote", id } ya { action: "write", text, nickname }
export async function POST(req: Request) {
  if (await tooMany("story", 10)) return json({ error: "Slow down a little 🙂" }, 429);
  const body = await readBody(req);
  const day = today();
  const device = (await getDevice())!;

  if (body.action === "vote") {
    const id = Number(body.id);
    if (!Number.isInteger(id)) return json({ error: "Invalid line" }, 400);
    const r = voteLine(day, device, id);
    if (!r.ok) return json({ error: r.error }, 400);
  } else if (body.action === "write") {
    const check = checkText(body.text, 10, 140);
    if (!check.ok) return json({ error: check.reason }, 400);
    const r = submitLine(day, device, await detectCountry(body.tz), check.text, checkNickname(body.nickname));
    if (!r.ok) return json({ error: r.error }, 400);
  } else {
    return json({ error: "Unknown action" }, 400);
  }
  return json(getStory(day, device));
}
