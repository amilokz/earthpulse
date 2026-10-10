import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-5">
      <Link href="/" className="text-xl font-black tracking-tight">
        Earth<span className="text-gold">Pulse</span>
      </Link>
      <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        LIVE
      </span>
    </header>
  );
}
