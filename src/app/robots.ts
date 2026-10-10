import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pulse.akclnt.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/card"], disallow: ["/api/", "/admin", "/me"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
