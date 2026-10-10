export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface Mood {
  value: MoodValue;
  emoji: string;
  label: string;
  color: string;
}

// 5 = sab se khush. Colors: gold, green, blue, purple, grey.
export const MOODS: Mood[] = [
  { value: 5, emoji: "😄", label: "Great", color: "#FFC93C" },
  { value: 4, emoji: "😊", label: "Good", color: "#4ADE80" },
  { value: 3, emoji: "😐", label: "Okay", color: "#60A5FA" },
  { value: 2, emoji: "😔", label: "Low", color: "#A78BFA" },
  { value: 1, emoji: "😢", label: "Sad", color: "#94A3B8" },
];

export const moodByValue = (v: MoodValue) => MOODS.find((m) => m.value === v)!;

export type MoodCounts = Record<MoodValue, number>;

export function totalVotes(c: MoodCounts) {
  return c[1] + c[2] + c[3] + c[4] + c[5];
}

/** Great + Good ka percentage */
export function happyPercent(c: MoodCounts) {
  const t = totalVotes(c);
  return t ? Math.round(((c[4] + c[5]) / t) * 100) : 0;
}

/** Sab se zyada vote wala mood */
export function dominantMood(c: MoodCounts): Mood {
  const v = ([5, 4, 3, 2, 1] as MoodValue[]).reduce((best, k) => (c[k] > c[best] ? k : best), 5 as MoodValue);
  return moodByValue(v);
}
