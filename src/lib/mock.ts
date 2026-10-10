// MOCK DATA — Step 2 mein ye backend API (/api/mood) se aayega.
import type { MoodCounts } from "./moods";

export interface CountryMood {
  code: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  counts: MoodCounts;
}

const c = (a: number, b: number, d: number, e: number, f: number): MoodCounts => ({ 5: a, 4: b, 3: d, 2: e, 1: f });

export const MOCK_COUNTRIES: CountryMood[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰", lat: 30.4, lng: 69.3, counts: c(820, 1240, 610, 330, 140) },
  { code: "IN", name: "India", flag: "🇮🇳", lat: 22.4, lng: 79.1, counts: c(2100, 2900, 1800, 900, 420) },
  { code: "US", name: "United States", flag: "🇺🇸", lat: 39.8, lng: -98.6, counts: c(1500, 2200, 1900, 1100, 600) },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", lat: 54.0, lng: -2.5, counts: c(420, 700, 680, 410, 190) },
  { code: "TR", name: "Turkey", flag: "🇹🇷", lat: 39.0, lng: 35.2, counts: c(380, 520, 400, 260, 120) },
  { code: "BR", name: "Brazil", flag: "🇧🇷", lat: -10.3, lng: -53.1, counts: c(900, 1000, 500, 300, 150) },
  { code: "JP", name: "Japan", flag: "🇯🇵", lat: 36.2, lng: 138.3, counts: c(210, 480, 720, 520, 230) },
  { code: "DE", name: "Germany", flag: "🇩🇪", lat: 51.2, lng: 10.4, counts: c(350, 640, 600, 330, 140) },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", lat: 9.1, lng: 8.7, counts: c(700, 650, 300, 200, 110) },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", lat: -2.5, lng: 118.0, counts: c(800, 900, 420, 210, 90) },
  { code: "EG", name: "Egypt", flag: "🇪🇬", lat: 26.8, lng: 30.8, counts: c(300, 420, 380, 260, 150) },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", lat: 23.9, lng: 45.1, counts: c(380, 410, 240, 120, 60) },
  { code: "MX", name: "Mexico", flag: "🇲🇽", lat: 23.6, lng: -102.5, counts: c(600, 700, 400, 220, 100) },
  { code: "AU", name: "Australia", flag: "🇦🇺", lat: -25.3, lng: 133.8, counts: c(330, 520, 380, 200, 90) },
  { code: "CA", name: "Canada", flag: "🇨🇦", lat: 56.1, lng: -106.3, counts: c(300, 560, 470, 260, 110) },
  { code: "FR", name: "France", flag: "🇫🇷", lat: 46.2, lng: 2.2, counts: c(280, 500, 560, 360, 160) },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", lat: -30.6, lng: 22.9, counts: c(310, 380, 300, 210, 120) },
  { code: "KR", name: "South Korea", flag: "🇰🇷", lat: 35.9, lng: 127.8, counts: c(200, 380, 520, 400, 200) },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", lat: 23.7, lng: 90.4, counts: c(420, 500, 330, 200, 90) },
  { code: "PH", name: "Philippines", flag: "🇵🇭", lat: 12.9, lng: 121.8, counts: c(650, 600, 300, 160, 80) },
];

// Kindness Notes — Step 4 mein users ke likhe (moderated) notes DB se aayenge.
export const MOCK_KINDNESS = [
  { text: "Jo bhi ye parh raha hai — mushkil waqt hamesha guzar jata hai. 🌱", from: "Turkey", flag: "🇹🇷" },
  { text: "You matter more than you know. Drink some water and rest a little.", from: "Canada", flag: "🇨🇦" },
  { text: "Aaj ka din bura ho sakta hai, lekin tumhari zindagi buri nahi hai. 💛", from: "Pakistan", flag: "🇵🇰" },
  { text: "Someone out here is rooting for you. Today, that someone is me.", from: "Brazil", flag: "🇧🇷" },
  { text: "Small steps still count. Proud of you for getting through today.", from: "Japan", flag: "🇯🇵" },
];

// Step 2 mein server IP se country detect karega. Abhi default:
export const MOCK_USER_COUNTRY = "PK";
