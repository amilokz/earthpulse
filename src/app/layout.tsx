import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "EarthPulse — How is the world feeling today?",
  description: "One tap, no login. Share your mood and see the whole world's pulse live on a glowing globe.",
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppHeader />
        <div className="pb-24">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
