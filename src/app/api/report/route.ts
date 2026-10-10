import { isContentType, report } from "@/server/content";
import { getDevice, json, readBody, tooMany } from "@/server/request";

export async function POST(req: Request) {
  if (await tooMany("report", 10)) return json({ error: "Slow down a little 🙂" }, 429);
  const body = await readBody(req);
  if (!isContentType(body.type) || (typeof body.id !== "string" && typeof body.id !== "number")) {
    return json({ error: "Invalid report" }, 400);
  }
  const ok = report(body.type, String(body.id), (await getDevice())!);
  return ok ? json({ ok: true }) : json({ error: "Not found" }, 404);
}
