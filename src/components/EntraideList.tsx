"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchEntraide } from "@/lib/data";
import { ENTRAIDE_TYPES, REMUNERATION_OPTIONS } from "@/lib/config";
import type { Entraide, EntraideType } from "@/lib/types";

type Filtre = EntraideType | "tous";

function tempsRestant(expires_at: string): string {
  const diff = new Date(expires_at).getTime() - Date.now();
  if (diff <= 0) return "Expirée";
  const jours = Math.floor(diff / 86_400_000);
  if (jours > 1) return `${jours} jours`;
  const heures = Math.floor(diff / 3_600_000);
  if (heures > 0) return `${heures} h`;
  return "Bientôt";
}

export default function EntraideList() {
  const [items, setItems] = useState<Entraide[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filtre, setFiltre] = useState<Filtre>("tous");

  useEffect(() => {
    let cancelled = false;
    fetchEntraide()
      .then((data) => { if (!cancelled) { setItems(data); setStatus("ready"); } })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => (filtre === "tous" ? items : items.filter((i) => i.type_aide === filtre)),
    [items, filtre]
  );

  if (status === "loading") return <p className="p-6 text-center text-slate-400">Chargement…</p>;
  if (status === "error") return (
    <p className="m-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Impossible de charger les annonces.</p>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* En-tête */}
      <div className="bg-white px-4 pb-4 pt-5 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">L'entraide à Auxerre</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {filtered.length} annonce{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              href="/carte"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm active:scale-95"
            >
              🗺️ Voir la carte
            </Link>
            <Link
              href="/entraide/new"
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white active:scale-95"
            >
              <span className="text-base leading-none">+</span> Poster
            </Link>
          </div>
        </div>

        {/* Filtres catégories */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFiltre("tous")}
            className={[
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
              filtre === "tous" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            Tout
          </button>
          {(Object.entries(ENTRAIDE_TYPES) as [EntraideType, { emoji: string; label: string }][]).map(([key, { emoji, label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFiltre(key)}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
                filtre === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>


      {/* Grille */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
            <p className="text-3xl">🤝</p>
            <p className="mt-3 font-medium">Aucune annonce pour l'instant.</p>
            <Link
              href="/entraide/new"
              className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              + Poster la première
            </Link>
          </div>
        ) : (
          filtered.map((item) => <EntraideCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function EntraideCard({ item }: { item: Entraide }) {
  const type = ENTRAIDE_TYPES[item.type_aide];
  const rem = REMUNERATION_OPTIONS[item.remuneration];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Bandeau couleur */}
      <div className="flex h-14 items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4">
        <span className="text-3xl">{type?.emoji ?? "🤝"}</span>
        <p className="font-semibold text-slate-900">{type?.label ?? "Entraide"}</p>
        <span className="ml-auto shrink-0 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 shadow-sm">
          ⏳ {tempsRestant(item.expires_at)}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-700 line-clamp-3">{item.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">
            {rem?.emoji} {rem?.label}
          </span>
          {item.adresse && <span>📍 {item.adresse}</span>}
        </div>

        {item.telephone && (
          <a
            href={`tel:${item.telephone.replace(/\s/g, "")}`}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            📞 {item.telephone}
          </a>
        )}
      </div>
    </article>
  );
}
