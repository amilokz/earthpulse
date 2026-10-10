import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 pt-5">
      <Link href="/" className="display flex items-center gap-2 text-[1.35rem] font-extrabold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={30} height={30} className="rounded-full" />
        EarthPulse
      </Link>
      <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-cream">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ember)] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ember)]" />
        </span>
        Live now
      </span>
    </header>
  );
}
