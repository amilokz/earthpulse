// EarthPulse "Pulse Cards" registry.
// Naya feature = src/modules/<id> folder + yahan aik line.
export type ModuleId = "mood" | "kindness" | "story" | "capsule" | "spotlight" | "game";

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  emoji: string;
  active: boolean;
  order: number;
  start?: string; // ISO date: is din se khud on
  end?: string; // ISO date: is din ke baad khud off
}

export const modules: ModuleConfig[] = [
  { id: "mood", title: "World Mood", emoji: "😊", active: true, order: 1 },
  { id: "kindness", title: "Kindness Notes", emoji: "💌", active: true, order: 2 },
  { id: "story", title: "World's Story", emoji: "📖", active: false, order: 3 },
  { id: "capsule", title: "Time Capsule", emoji: "⏳", active: false, order: 4 },
  { id: "spotlight", title: "Country Spotlight", emoji: "🌍", active: false, order: 5 },
  { id: "game", title: "Pulse Journey", emoji: "🎮", active: false, order: 6 },
];

export function activeModules(now = new Date()): ModuleConfig[] {
  return modules
    .filter((m) => m.active)
    .filter((m) => !m.start || new Date(m.start) <= now)
    .filter((m) => !m.end || new Date(m.end) >= now)
    .sort((a, b) => a.order - b.order);
}
