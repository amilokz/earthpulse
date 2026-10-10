import "server-only";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

// Roman Urdu / Hindi gaaliyan — zaroorat ke hisaab se barhate rehna
const EXTRA = /\b(madarchod|mc|bc|behenchod|bhenchod|chutiya|chutiye|gandu|harami|haramzada|kutti|kutta|randi|bhosdi\w*|lund|lauda|loda)\b/i;
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|xyz|pk|in|ru|me|co)\b)/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /(\+?\d[\d\s-]{7,}\d)/;
const REPEAT = /(.)\1{7,}/;

export interface CheckResult {
  ok: boolean;
  text: string;
  reason?: string;
}

/** User ka likha text check karo. Links, phone, email aur gaaliyan block. */
export function checkText(raw: unknown, min: number, max: number): CheckResult {
  if (typeof raw !== "string") return { ok: false, text: "", reason: "Write something first." };
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length < min) return { ok: false, text, reason: `Please write at least ${min} characters.` };
  if (text.length > max) return { ok: false, text, reason: `Keep it under ${max} characters.` };
  if (LINK.test(text) || EMAIL.test(text)) return { ok: false, text, reason: "Links and emails aren't allowed." };
  if (PHONE.test(text)) return { ok: false, text, reason: "Phone numbers aren't allowed. Keep it anonymous 🙂" };
  if (REPEAT.test(text)) return { ok: false, text, reason: "That looks like spam." };
  if (matcher.hasMatch(text) || EXTRA.test(text)) return { ok: false, text, reason: "Let's keep EarthPulse kind 💛" };
  return { ok: true, text };
}

export function checkNickname(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const n = raw.replace(/\s+/g, " ").trim().slice(0, 24);
  if (!n) return null;
  const r = checkText(n, 1, 24);
  return r.ok ? n : null;
}

/** Itni reports par content khud chhup jata hai (admin baad mein dekh sakta hai) */
export const REPORT_HIDE_AT = 3;
