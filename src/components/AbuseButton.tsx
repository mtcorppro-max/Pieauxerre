"use client";

import { useState } from "react";

export default function AbuseButton({ signalementId }: { signalementId: string }) {
  const [done, setDone] = useState(false);

  async function report() {
    if (done) return;
    if (!confirm("Signaler ce contenu comme inapproprié ?")) return;
    setDone(true);
    try {
      await fetch("/api/abus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: signalementId }),
      });
    } catch {
      /* silencieux */
    }
  }

  return (
    <button
      type="button"
      onClick={report}
      disabled={done}
      className="text-xs text-slate-400 underline-offset-2 hover:underline disabled:no-underline"
    >
      {done ? "Merci, signalé" : "Signaler un abus"}
    </button>
  );
}
