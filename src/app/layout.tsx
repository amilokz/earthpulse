import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/nunito";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/caveat/600.css";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import RegisterSW from "@/components/RegisterSW";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pulse.akclnt.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "EarthPulse — How is the world feeling today?",
  description: "One tap, no login. Share your mood and see the whole world's pulse live on a glowing globe.",
  applicationName: "EarthPulse",
  appleWebApp: { capable: true, title: "EarthPulse", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "EarthPulse",
    title: "How is the world feeling today? 🌍",
    description: "One tap, no login. Add your dot to the world's live mood.",
    images: [{ url: "/api/card", width: 1080, height: 1080, alt: "EarthPulse" }],
  },
  twitter: { card: "summary_large_image", images: ["/api/card"] },
};

export const viewport: Viewport = {
  themeColor: "#0e0a2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppHeader />
        <div className="pb-24 lg:pb-10">
          {children}
          <footer className="text-muted mx-auto mt-16 flex max-w-6xl flex-wrap justify-center gap-x-5 gap-y-2 px-4 text-xs font-bold">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>© 2026 EarthPulse</span>
          </footer>
        </div>
        <BottomNav />
        <RegisterSW />
      </body>
    </html>
  );
}
