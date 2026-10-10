# EarthPulse 🌍

How is the world feeling today? One tap, no login: share your mood and watch the whole world's pulse live on a glowing globe.

## Status

- ✅ World Mood: globe, 1-tap vote, country + world results, streak, share card
- ✅ Kindness Notes: write, filter, reports, shown to people who feel low
- ✅ Time Capsule: public/private, 1 month to 10 years, server-enforced unlock
- ✅ World's Story: 1 line + 1 vote per day, daily winner (no cron)
- ✅ PWA (installable), About/Privacy/Terms, /admin moderation
- ⏳ Deploy to `pulse.akclnt.com` (VPS + PM2 + Nginx + Cloudflare)
- ✅ Pulse Journey game (/play): 30 levels, daily challenge, live local time + weather
- ✅ Country pages, kindness wall, My Pulse, Country of the day
- ⏳ Phase 2: languages, push notifications, more game countries

## Tech

Next.js 16 · Tailwind 4 · Motion · react-globe.gl · better-sqlite3 · obscenity · next/og

Copy `.env.example` to `.env.local` and fill in the values.

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
src/server/                Backend logic (db, mood, story, capsule, moderation)
src/app/api/               API routes
public/textures/           Self-hosted globe textures (WebP)
```
