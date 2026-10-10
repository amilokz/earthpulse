// Client-side API helpers (browser se backend ko call)
import { getCountry, type Country } from "./countries";
import type { MoodCounts, MoodValue } from "./moods";

export interface CountryMood extends Country {
  counts: MoodCounts;
}

interface RawCountry {
  code: string;
  c: [number, number, number, number, number];
}

export interface TodayData {
  day: string;
  countries: CountryMood[];
  me: { mood: MoodValue | null; country: string };
}

export interface KindnessNote {
  id: number;
  text: string;
  country: string;
}

const tz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

export const toCountryMood = (r: RawCountry): CountryMood => ({
  ...getCountry(r.code),
  counts: { 1: r.c[0], 2: r.c[1], 3: r.c[2], 4: r.c[3], 5: r.c[4] },
});

export class ApiError extends Error {}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Try again.");
  return data as T;
}

export const post = <T>(url: string, body: unknown) => call<T>(url, { method: "POST", body: JSON.stringify({ ...(body as object), tz: tz() }) });
export const get = <T>(url: string) => call<T>(url);

export async function fetchToday(): Promise<TodayData> {
  const d = await get<{ day: string; countries: RawCountry[]; me: TodayData["me"] }>(`/api/today?tz=${encodeURIComponent(tz() ?? "")}`);
  return { ...d, countries: d.countries.map(toCountryMood) };
}

export async function sendMood(mood: MoodValue) {
  const d = await post<{ day: string; countries: RawCountry[]; me: TodayData["me"]; note: KindnessNote | null }>("/api/mood", { mood });
  return { ...d, countries: d.countries.map(toCountryMood) };
}
