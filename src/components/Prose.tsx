export default function Prose({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      {updated && <p className="text-muted mt-1 text-sm">Last updated: {updated}</p>}
      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-white/85 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-white [&_a]:text-[var(--gold)] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1">
        {children}
      </div>
    </main>
  );
}
