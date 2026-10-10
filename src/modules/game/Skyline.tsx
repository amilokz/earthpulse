"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Chapter, CountryId } from "@/game/levels";

type Phase = "night" | "dawn" | "day" | "dusk";
type Weather = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

const SKY: Record<Phase, [string, string, string]> = {
  night: ["#070a24", "#151a4a", "#2a2160"],
  dawn: ["#2b2160", "#a0527a", "#ffb07a"],
  day: ["#3d8bef", "#79b8ff", "#cfe9ff"],
  dusk: ["#1d1650", "#7a3b7a", "#ff8a5c"],
};
const LAND: Record<Phase, string> = { night: "#090717", dawn: "#2a1a3e", day: "#2c3d6b", dusk: "#21143a" };

function phaseAt(timeZone: string): Phase {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date()));
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

function localTime(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date());
}

// Har minute dobara check (din/raat badalta rahe)
function useClock(timeZone: string) {
  return useSyncExternalStore(
    (cb) => {
      const t = setInterval(cb, 60_000);
      return () => clearInterval(t);
    },
    () => `${phaseAt(timeZone)}|${localTime(timeZone)}`,
    () => "day|",
  );
}

/** Open-Meteo (free, key nahi chahiye) se us shehar ka asli mausam */
function useWeather(lat: number, lng: number): Weather | null {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=weather_code`)
      .then((r) => r.json())
      .then((d) => {
        const c: number = d?.current?.weather_code ?? 0;
        const kind: Weather =
          c >= 95 ? "storm" : (c >= 71 && c <= 77) || c === 85 || c === 86 ? "snow" : (c >= 51 && c <= 67) || (c >= 80 && c <= 82) ? "rain" : c === 45 || c === 48 ? "fog" : c >= 2 ? "cloudy" : "clear";
        if (alive) setW(kind);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lat, lng]);
  return w;
}

const WEATHER_LABEL: Record<Weather, string> = {
  clear: "☀️ clear",
  cloudy: "☁️ cloudy",
  fog: "🌫️ foggy",
  rain: "🌧️ raining",
  snow: "❄️ snowing",
  storm: "⛈️ stormy",
};

export default function Skyline({ chapter, children }: { chapter: Chapter; children?: React.ReactNode }) {
  const [phase, time] = useClock(chapter.timeZone).split("|") as [Phase, string];
  const weather = useWeather(chapter.lat, chapter.lng);
  const [top, mid, low] = SKY[phase];
  const land = LAND[phase];
  const night = phase === "night";

  return (
    <div className="relative isolate overflow-hidden rounded-[1.75rem]" style={{ background: `linear-gradient(180deg, ${top}, ${mid} 55%, ${low})` }}>
      {night && <div className="absolute inset-0 -z-10 bg-[radial-gradient(1px_1px_at_10%_12%,#fff,transparent),radial-gradient(1px_1px_at_30%_25%,#fffc,transparent),radial-gradient(1.5px_1.5px_at_60%_8%,#fff,transparent),radial-gradient(1px_1px_at_80%_20%,#fffa,transparent),radial-gradient(1px_1px_at_45%_15%,#fff9,transparent)]" />}
      {/* sooraj / chaand */}
      <div
        className="absolute -z-10 rounded-full"
        style={
          night
            ? { right: "12%", top: "6%", width: 46, height: 46, background: "#fff6dc", boxShadow: "0 0 40px #fff6dc88" }
            : phase === "day"
              ? { right: "14%", top: "5%", width: 60, height: 60, background: "#fff3b0", boxShadow: "0 0 70px #ffe27a" }
              : { left: "50%", bottom: "26%", width: 90, height: 90, transform: "translateX(-50%)", background: "#ffcf7a", boxShadow: "0 0 80px #ff9a5a" }
        }
      />
      {(weather === "cloudy" || weather === "rain" || weather === "storm" || weather === "snow") && <Clouds dark={weather !== "cloudy"} />}

      <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 -z-10 h-[38%] w-full" aria-hidden>
        <Silhouette id={chapter.id} fill={land} lit={night || phase === "dusk"} />
      </svg>

      {weather === "rain" || weather === "storm" ? <Rain storm={weather === "storm"} /> : null}
      {weather === "snow" && <Snow />}
      {weather === "fog" && <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-white/40 to-white/5" />}

      <div className="absolute left-4 top-3 z-10 rounded-full bg-black/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        {chapter.flag} {chapter.city} · {time}
        {weather ? ` · ${WEATHER_LABEL[weather]}` : ""}
      </div>
      {children}
    </div>
  );
}

function Clouds({ dark }: { dark: boolean }) {
  const c = dark ? "#8890b0" : "#ffffff";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 opacity-70">
      {[10, 45, 75].map((x, i) => (
        <div key={i} className="absolute animate-[drift_40s_linear_infinite] rounded-full" style={{ left: `${x}%`, top: `${8 + i * 9}%`, width: 120, height: 34, background: c, filter: "blur(6px)", animationDelay: `${-i * 12}s` }} />
      ))}
      <style>{`@keyframes drift{from{transform:translateX(-30px)}to{transform:translateX(30px)}}`}</style>
    </div>
  );
}

function Rain({ storm }: { storm: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: storm ? 60 : 40 }, (_, i) => (
        <span
          key={i}
          className="absolute block h-6 w-px bg-white/45"
          style={{ left: `${(i * 37) % 100}%`, top: "-10%", animation: `rain ${0.6 + ((i * 13) % 5) / 10}s linear infinite`, animationDelay: `${-((i * 7) % 10) / 10}s` }}
        />
      ))}
      {storm && <div className="absolute inset-0 animate-[flash_7s_infinite] bg-white/0" />}
      <style>{`@keyframes rain{to{transform:translateY(120vh) translateX(-30px)}}@keyframes flash{0%,92%,96%,100%{background:transparent}94%{background:rgba(255,255,255,.35)}}`}</style>
    </div>
  );
}

function Snow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white/80"
          style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${(i * 29) % 100}%`, top: "-5%", animation: `snow ${4 + (i % 5)}s linear infinite`, animationDelay: `${-(i % 9)}s` }}
        />
      ))}
      <style>{`@keyframes snow{to{transform:translateY(110vh) translateX(20px)}}`}</style>
    </div>
  );
}

/** Har shehar ki pehchan: Lahore (Badshahi Masjid, Minar-e-Pakistan), Istanbul (masjid ke gumbad, Galata), Tokyo (Fuji, pagoda, Tokyo Tower) */
function Silhouette({ id, fill, lit }: { id: CountryId; fill: string; lit: boolean }) {
  const win = lit ? "#ffd27a" : "transparent";
  if (id === "PK")
    return (
      <g fill={fill}>
        {/* Minar-e-Pakistan */}
        <path d="M44 140 L50 40 L54 30 L58 40 L64 140 Z" />
        <rect x="38" y="120" width="32" height="20" />
        {/* Badshahi Masjid */}
        <rect x="120" y="96" width="180" height="44" />
        <ellipse cx="210" cy="92" rx="30" ry="26" />
        <rect x="207" y="58" width="6" height="12" />
        <ellipse cx="160" cy="98" rx="18" ry="15" />
        <ellipse cx="260" cy="98" rx="18" ry="15" />
        {[112, 300].map((x) => (
          <g key={x}>
            <rect x={x} y="50" width="9" height="90" />
            <path d={`M${x - 3} 50 h15 l-7.5 -12 z`} />
          </g>
        ))}
        <path d="M180 140 v-26 a30 30 0 0 1 60 0 v26 z" fill={win} opacity="0.5" />
        <rect x="0" y="132" width="400" height="8" />
        <rect x="330" y="110" width="70" height="30" />
        {[340, 360, 380].map((x) => <rect key={x} x={x} y="118" width="6" height="6" fill={win} />)}
      </g>
    );
  if (id === "TR")
    return (
      <g fill={fill}>
        {/* Galata tower */}
        <rect x="40" y="62" width="26" height="70" />
        <path d="M36 62 L53 30 L70 62 Z" />
        <rect x="46" y="76" width="4" height="7" fill={win} />
        <rect x="56" y="76" width="4" height="7" fill={win} />
        {/* Blue Mosque jaisa: seedhiyon ki tarah gumbad + 6 minaar */}
        <rect x="140" y="104" width="170" height="28" />
        <ellipse cx="225" cy="88" rx="34" ry="28" />
        <ellipse cx="185" cy="100" rx="20" ry="15" />
        <ellipse cx="265" cy="100" rx="20" ry="15" />
        <ellipse cx="160" cy="106" rx="12" ry="9" />
        <ellipse cx="290" cy="106" rx="12" ry="9" />
        {[128, 150, 300, 322, 176, 274].map((x, i) => (
          <g key={x}>
            <rect x={x} y={i < 4 ? 46 : 60} width="5" height={i < 4 ? 86 : 72} />
            <path d={`M${x - 1} ${i < 4 ? 46 : 60} l3.5 -16 l3.5 16 z`} />
          </g>
        ))}
        {/* Bosphorus */}
        <rect x="0" y="132" width="400" height="8" opacity="0.7" />
      </g>
    );
  return (
    <g fill={fill}>
      {/* Mt Fuji, barf ke saath */}
      <path d="M150 140 L230 52 L310 140 Z" opacity="0.75" />
      <path d="M212 72 L230 52 L248 72 L240 70 L232 76 L224 69 Z" fill="#f4f6ff" opacity="0.85" />
      {/* Pagoda */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={70 + i * 2} y={120 - i * 16} width={36 - i * 4} height="10" />
          <path d={`M${60 + i * 2} ${120 - i * 16} h${56 - i * 4} l-6 -6 h${-44 + i * 4} z`} />
        </g>
      ))}
      <rect x="86" y="40" width="2" height="16" />
      {/* Tokyo Tower */}
      <path d="M340 140 L352 70 L356 40 L360 70 L372 140 L364 140 L356 90 L348 140 Z" fill={lit ? "#ff7a59" : fill} />
      <rect x="346" y="100" width="20" height="3" fill={lit ? "#ff7a59" : fill} />
      {/* Torii */}
      <rect x="250" y="112" width="5" height="28" fill={lit ? "#c94f3d" : fill} />
      <rect x="280" y="112" width="5" height="28" fill={lit ? "#c94f3d" : fill} />
      <rect x="244" y="106" width="47" height="5" fill={lit ? "#c94f3d" : fill} />
      <rect x="248" y="115" width="39" height="3" fill={lit ? "#c94f3d" : fill} />
      <rect x="0" y="134" width="400" height="6" />
      {[0, 20, 120, 140, 180, 390].map((x) => <rect key={x} x={x} y="124" width="14" height="16" />)}
    </g>
  );
}
