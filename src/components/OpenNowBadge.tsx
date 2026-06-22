"use client";

import { useEffect, useState } from "react";
import { estOuvertMaintenant } from "@/lib/horaires";
import type { Horaires } from "@/lib/types";

// Calculé côté client : l'heure du serveur (UTC sur Vercel) fausserait l'état.
export default function OpenNowBadge({ horaires }: { horaires: Horaires | null }) {
  const [ouvert, setOuvert] = useState<boolean | null>(null);

  useEffect(() => {
    setOuvert(estOuvertMaintenant(horaires));
    const t = setInterval(() => setOuvert(estOuvertMaintenant(horaires)), 60_000);
    return () => clearInterval(t);
  }, [horaires]);

  if (ouvert === null) return null;
  if (!horaires) return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        ouvert ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", ouvert ? "bg-green-500" : "bg-slate-400"].join(" ")} />
      {ouvert ? "Ouvert maintenant" : "Fermé"}
    </span>
  );
}
