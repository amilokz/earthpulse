import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/lib/countries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pulse.akclnt.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/mood", "/story", "/kindness", "/capsule", "/about", "/privacy", "/terms"].map((p) => ({
    url: `${SITE}${p}`,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const countries = COUNTRIES.map((c) => ({
    url: `${SITE}/mood/${c.code.toLowerCase()}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));
  return [...pages, ...countries];
}
