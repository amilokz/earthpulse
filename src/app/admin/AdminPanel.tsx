"use client";

import { useState } from "react";

type Type = "kindness" | "capsule" | "story";
interface Item {
  id: string | number;
  text: string;
  country: string;
  status: string;
  reports: number;
  created_at: number;
}

// Moderation panel: ADMIN_KEY (VPS .env) se login
export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [type, setType] = useState<Type>("kindness");
  const [filter, setFilter] = useState<"reported" | "recent">("reported");
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (t = type, f = filter) => {
    setError(null);
    const res = await fetch(`/api/admin?type=${t}&filter=${f}`, { headers: { "x-admin-key": key } });
    const d = await res.json();
    if (!res.ok) return setError(d.error);
    setItems(d.items);
  };

  const act = async (id: Item["id"], status: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "x-admin-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, status }),
    });
    load();
  };

  const restore = type === "story" ? "candidate" : "live";

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-black">EarthPulse Admin</h1>
      <div className="card flex flex-wrap items-center gap-2">
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key" className="flex-1 rounded-xl bg-black/40 p-2" />
        <select value={type} onChange={(e) => { setType(e.target.value as Type); load(e.target.value as Type); }} className="rounded-xl bg-black/40 p-2">
          <option value="kindness">Kindness</option>
          <option value="capsule">Capsules</option>
          <option value="story">Story</option>
        </select>
        <select value={filter} onChange={(e) => { setFilter(e.target.value as "reported"); load(type, e.target.value as "reported"); }} className="rounded-xl bg-black/40 p-2">
          <option value="reported">Reported / hidden</option>
          <option value="recent">Recent</option>
        </select>
        <button onClick={() => load()} className="bg-gold rounded-xl px-4 py-2 font-bold text-black">Load</button>
      </div>
      {error && <p className="mt-3 text-red-300">{error}</p>}
      <ul className="mt-4 flex flex-col gap-2">
        {items?.length === 0 && <li className="text-muted">Nothing here 🎉</li>}
        {items?.map((i) => (
          <li key={i.id} className="card flex items-start gap-3 !p-3">
            <div className="flex-1">
              <p>{i.text}</p>
              <p className="text-muted text-xs">
                {i.country} · {i.status} · {i.reports} reports · {new Date(i.created_at).toLocaleString()}
              </p>
            </div>
            {i.status === "hidden" ? (
              <button onClick={() => act(i.id, restore)} className="rounded-lg bg-green-500/20 px-3 py-1 text-sm">Restore</button>
            ) : (
              <button onClick={() => act(i.id, "hidden")} className="rounded-lg bg-red-500/20 px-3 py-1 text-sm">Hide</button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
