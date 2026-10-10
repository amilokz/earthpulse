# EarthPulse 🌍

How is the world feeling today? One tap, no login: share your mood and watch the whole world's pulse live on a glowing globe.

## Status

- ✅ Step 0: Next.js 16 + Tailwind 4 + Motion + react-globe.gl
- ✅ Step 1: Mood UI (mock data): globe, 5-emoji vote, country result, kindness note on low moods, happiest countries, streak
- ⏳ Step 2: Mood backend (Prisma + SQLite, `/api/mood`, geoip country)
- ⏳ Capsule → Story + Kindness → Streak/share card/PWA → deploy to `pulse.akclnt.com`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

```
src/config/modules.ts      Pulse Cards registry (naya feature = 1 line)
src/modules/<id>/          Har feature ka apna folder
src/components/            Shared UI (PulseGlobe)
src/lib/moods.ts           Mood definitions + helpers
src/lib/local.ts           Client-side personal data (localStorage)
src/lib/mock.ts            Mock data (Step 2 mein API se replace)
public/textures/           Self-hosted globe textures (WebP)
```
