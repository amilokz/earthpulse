import { MOODS } from "@/lib/moods";

// Server-safe mood ribbon. counts index 0 = sad ... 4 = great
export default function MoodRibbon({ counts, className = "h-3" }: { counts: number[]; className?: string }) {
  const t = counts.reduce((a, b) => a + b, 0);
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      {t > 0 &&
        MOODS.map((m) => (
          <div key={m.value} style={{ width: `${(counts[m.value - 1] / t) * 100}%`, background: m.color }} title={`${m.emoji} ${m.label}`} />
        ))}
    </div>
  );
}
