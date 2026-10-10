import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCountry } from "@/lib/countries";
import { MOODS } from "@/lib/moods";

// Share card PNG: /api/card?c=PK&h=64&m=4&s=5
// Emoji nahi (unke liye CDN chahiye), sirf colors + text, taake hamesha bane.
const icon = readFile(path.join(process.cwd(), "public", "icon-192.png")).then((b) => `data:image/png;base64,${b.toString("base64")}`);

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const country = getCountry((q.get("c") ?? "XX").toUpperCase().slice(0, 2));
  const happy = Math.min(100, Math.max(0, Number(q.get("h")) || 0));
  const mood = MOODS.find((m) => m.value === Number(q.get("m"))) ?? null;
  const streak = Math.min(9999, Math.max(0, Math.floor(Number(q.get("s")) || 0)));
  const hasHappy = q.has("h") && country.code !== "XX";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "white",
          background: "radial-gradient(circle at 50% 0%, #1b2a6b 0%, #050816 65%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={await icon} width={84} height={84} alt="" />
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>
            Earth<span style={{ color: "#FFC93C" }}>Pulse</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 40, color: "#A5B0D6" }}>Today on Earth</div>
          {hasHappy ? (
            <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 1.05 }}>
              <span>{country.name} is</span>
              <span style={{ color: "#FFC93C" }}>{happy}% happy</span>
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1.05 }}>How is the world feeling?</div>
          )}
          {mood && (
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44 }}>
              <div style={{ width: 44, height: 44, borderRadius: 44, background: mood.color, display: "flex" }} />
              I felt {mood.label.toLowerCase()} today
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 38 }}>
          <div style={{ display: "flex", color: "#FFC93C", fontWeight: 800 }}>{streak > 0 ? `Day ${streak} streak` : ""}</div>
          <div style={{ display: "flex", padding: "18px 32px", borderRadius: 999, background: "#FFC93C", color: "#050816", fontWeight: 800 }}>
            Add your dot · one tap
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080, headers: { "Cache-Control": "public, max-age=600" } },
  );
}
