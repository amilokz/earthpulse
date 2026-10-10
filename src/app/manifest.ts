import type { MetadataRoute } from "next";

// PWA: "Add to Home Screen" → phone par app jaisa icon, full screen
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EarthPulse",
    short_name: "EarthPulse",
    description: "How is the world feeling today? One tap, no login.",
    start_url: "/?source=pwa",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0a2e",
    theme_color: "#0e0a2e",
    categories: ["social", "lifestyle", "entertainment"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
