"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchGardeActuelle } from "@/lib/data";
import type { Garde } from "@/lib/types";

function heuresFin(date_fin: string): string {
  return new Date(date_fin).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GardeWidget() {
  const [garde, setGarde] = useState<Garde | null | undefined>(undefined);

  useEffect(() => {
    fetchGardeActuelle()
      .then(setGarde)
      .catch(() => setGarde(null));
  }, []);

  // undefined = chargement, null = pas de garde active
  if (garde === undefined || garde === null) return null;

  const pharmacie = garde.pharmacie;
  if (!pharmacie) return null;

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-card backdrop-blur">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl">
        💊
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-green-700">
          Garde jusqu'à {heuresFin(garde.date_fin)}
        </p>
        <p className="truncate font-semibold text-slate-900 text-sm">{pharmacie.nom}</p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {pharmacie.telephone && (
          <a
            href={`tel:${pharmacie.telephone.replace(/\s/g, "")}`}
            aria-label="Appeler la pharmacie de garde"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-lg text-white shadow-soft transition active:scale-95"
          >
            📞
          </a>
        )}
        <Link
          href="/sante"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
          aria-label="Voir toutes les pharmacies"
        >
          →
        </Link>
      </div>
    </div>
  );
}
