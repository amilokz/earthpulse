"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import type { CountryMood } from "@/lib/api";
import { dominantMood, totalVotes } from "@/lib/moods";

// three.js browser-only hai, isliye SSR off
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface Props {
  countries: CountryMood[];
  highlight?: string; // user ki country code — iska ring bara chamkega
}

export default function PulseGlobe({ countries, highlight }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const points = useMemo(() => {
    const list = countries.filter((c) => c.code !== "XX" && totalVotes(c.counts) > 0);
    const max = Math.max(1, ...list.map((c) => totalVotes(c.counts)));
    return list.map((c) => ({
      ...c,
      color: dominantMood(c.counts).color,
      alt: 0.02 + (totalVotes(c.counts) / max) * 0.12,
    }));
  }, [countries]);

  const rings = useMemo(
    () => points.map((p) => ({ ...p, big: p.code === highlight })),
    [points, highlight],
  );

  const onReady = () => {
    const g = globeRef.current;
    if (!g) return;
    const ctl = g.controls();
    ctl.autoRotate = true;
    ctl.autoRotateSpeed = 0.5;
    ctl.enableZoom = false;
    const h = countries.find((c) => c.code === highlight && c.code !== "XX");
    g.pointOfView({ lat: h?.lat ?? 20, lng: h?.lng ?? 40, altitude: 2.2 }, 0);
  };

  // Vote ke baad globe user ki country ki taraf ghoom jaye
  useEffect(() => {
    const h = countries.find((c) => c.code === highlight && c.code !== "XX");
    if (h) globeRef.current?.pointOfView({ lat: h.lat, lng: h.lng, altitude: 2 }, 1200);
  }, [highlight, countries]);

  return (
    <div ref={wrapRef} className="relative aspect-square w-full max-w-[560px]">
      {size > 0 && (
        <Globe
          ref={globeRef}
          width={size}
          height={size}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/textures/earth-night.webp"
          bumpImageUrl="/textures/earth-topology.webp"
          showAtmosphere
          atmosphereColor="#7c9cff"
          atmosphereAltitude={0.18}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude="alt"
          pointRadius={0.9}
          pointLabel={(d: object) => {
            const p = d as (typeof points)[number];
            const m = dominantMood(p.counts);
            return `<div style="font:600 13px Nunito,sans-serif;padding:6px 10px;border-radius:10px;background:#0b1026e6;color:#fff">${p.flag} ${p.name} · ${m.emoji} ${m.label}</div>`;
          }}
          ringsData={rings}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: object) => {
            const r = d as (typeof rings)[number];
            return (t: number) => `${r.color}${Math.round((1 - t) * 255).toString(16).padStart(2, "0")}`;
          }}
          ringMaxRadius={(d: object) => ((d as (typeof rings)[number]).big ? 7 : 3)}
          ringPropagationSpeed={(d: object) => ((d as (typeof rings)[number]).big ? 3 : 1.5)}
          ringRepeatPeriod={(d: object) => ((d as (typeof rings)[number]).big ? 700 : 1600)}
          onGlobeReady={onReady}
        />
      )}
    </div>
  );
}
