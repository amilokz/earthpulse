import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import ct from "countries-and-timezones";
import { isCountry } from "@/lib/countries";

const DEVICE_COOKIE = "ep_did";
const SALT = process.env.IP_SALT || "earthpulse-dev-salt";

/** UTC din — poori duniya ke liye aik hi reset time */
export const today = (d = new Date()) => d.toISOString().slice(0, 10);

/** Anonymous device id (httpOnly cookie, 2 saal). Login ki zaroorat nahi. */
export async function getDevice(create = true): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
  if (!create) return null;
  const id = randomUUID();
  jar.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 730,
    path: "/",
  });
  return id;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    "0.0.0.0"
  );
}

/** Raw IP kabhi store nahi hoti, sirf salted hash (privacy) */
export async function ipHash(): Promise<string> {
  return createHash("sha256").update(SALT + (await clientIp())).digest("hex").slice(0, 32);
}

/**
 * Country: pehle Cloudflare ka CF-IPCountry header (free, accurate),
 * phir browser ka timezone, warna "XX" (Earth 🌍).
 * geoip-lite isliye nahi ke woh ~100MB RAM leta hai.
 */
export async function detectCountry(tz?: unknown): Promise<string> {
  const h = await headers();
  const cf = h.get("cf-ipcountry")?.toUpperCase();
  if (cf && isCountry(cf)) return cf;
  if (typeof tz === "string" && tz.length < 64) {
    const c = ct.getCountryForTimezone(tz)?.id;
    if (c && isCountry(c)) return c;
  }
  return "XX";
}

// Chhota in-memory limiter (per IP per minute) — bots ko rokne ke liye
const hits = new Map<string, { n: number; t: number }>();
export async function tooMany(bucket: string, max = 20): Promise<boolean> {
  const key = bucket + ":" + (await clientIp());
  const now = Date.now();
  const e = hits.get(key);
  if (!e || now - e.t > 60_000) {
    hits.set(key, { n: 1, t: now });
    if (hits.size > 50_000) hits.clear();
    return false;
  }
  e.n++;
  return e.n > max;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Server components ke liye abhi ka waqt (request time par, connection() ke baad) */
export const serverNow = () => Date.now();
