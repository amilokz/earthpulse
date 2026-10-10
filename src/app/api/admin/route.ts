import { timingSafeEqual } from "node:crypto";
import { adminList, isContentType, setStatus } from "@/server/content";
import { json, readBody } from "@/server/request";

// Simple moderation: ADMIN_KEY env set karo, phir /admin page se use karo
function authorized(req: Request) {
  const key = process.env.ADMIN_KEY;
  const given = req.headers.get("x-admin-key") ?? "";
  if (!key || key.length < 12) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "kindness";
  const filter = url.searchParams.get("filter") === "recent" ? "recent" : "reported";
  if (!isContentType(type)) return json({ error: "Invalid type" }, 400);
  return json({ items: adminList(type, filter) });
}

export async function POST(req: Request) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);
  const body = await readBody(req);
  const status = body.status;
  if (!isContentType(body.type) || (status !== "hidden" && status !== "live" && status !== "candidate")) {
    return json({ error: "Invalid action" }, 400);
  }
  setStatus(body.type, String(body.id), status);
  return json({ ok: true });
}
