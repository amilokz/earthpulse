"use client";

import { useState } from "react";
import { post } from "@/lib/api";

export default function ReportButton({ type, id }: { type: "kindness" | "capsule" | "story"; id: string | number }) {
  const [done, setDone] = useState(false);
  if (done) return <span className="text-muted text-xs">Reported. Thanks for keeping it kind 💛</span>;
  return (
    <button
      onClick={() => {
        setDone(true);
        post("/api/report", { type, id }).catch(() => {});
      }}
      className="text-muted text-xs underline decoration-dotted underline-offset-2 hover:text-white"
    >
      Report
    </button>
  );
}
