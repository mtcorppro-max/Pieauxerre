"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchTrouvailles } from "@/lib/data";
import type { Trouvaille } from "@/lib/types";

type Tab = "animal_trouve" | "animal_perdu" | "objet_trouve" | "objet_perdu";

const TABS: { key: Tab; emoji: string; label: string }[] = [
  { key: "animal_trouve", emoji: "🐕", label: "Animaux trouvés" },
  { key: "animal_perdu",  emoji: "🔍", label: "Animaux perdus" },
  { key: "objet_trouve",  emoji: "📦", label: "Objets trouvés" },
  { key: "objet_perdu",   emoji: "❓", label: "Objets perdus" },
];

function joursRestants(expires_at: string): string {
  const diff = new Date(expires_at).getTime() - Date.now();
  if (diff <= 0) return "Expirée";
  const j = Math.floor(diff / 86_400_000);
  return j > 1 ? `${j} j` : "Aujourd'hui";
}

export default function TrouvaillesClient() {
  const [tab, setTab] = useState<Tab>("animal_trouve");
  const [items, setItems] = useState<Trouvaille[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetchTrouvailles()
      .then((data) => { setItems(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  async function resoudre(id: string) {
    const res = await fetch("/api/trouvailles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      alert("Erreur lors de la suppression. Réessayez.");
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = items.filter((t) => `${t.categorie}_${t.statut}` === tab);
  const total = items.length;

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
            <h1 className="text-2xl font-bold text-slate-900">Perdus & Trouvés</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {total} annonce{total !== 1 ? "s" : ""} active{total !== 1 ? "s" : ""}
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
              href="/trouvailles/new"
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white active:scale-95"
            >
              <span className="text-base leading-none">+</span> Signaler
            </Link>
          </div>
        </div>

        {/* Onglets */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const count = items.filter((i) => `${i.categorie}_${i.statut}` === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={[
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition",
                  tab === t.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {t.emoji} {t.label}
                <span className={["rounded-full px-1.5 text-xs", tab === t.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"].join(" ")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Grille */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
            <p className="text-3xl">{TABS.find((t) => t.key === tab)?.emoji}</p>
            <p className="mt-3 font-medium">Aucune annonce dans cette catégorie.</p>
            <Link
              href="/trouvailles/new"
              className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              + Poster une annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((t) => <TrouvailleCard key={t.id} item={t} onResoudre={resoudre} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const TAB_COLOR: Record<Tab, string> = {
  animal_trouve: "#22c55e",
  animal_perdu:  "#ef4444",
  objet_trouve:  "#3b82f6",
  objet_perdu:   "#f97316",
};

const TAB_GRADIENT: Record<Tab, string> = {
  animal_trouve: "from-green-400 to-emerald-500",
  animal_perdu:  "from-red-400 to-rose-500",
  objet_trouve:  "from-blue-400 to-indigo-500",
  objet_perdu:   "from-orange-400 to-amber-500",
};

function TrouvailleCard({ item, onResoudre }: { item: Trouvaille; onResoudre: (id: string) => void }) {
  const [confirme, setConfirme] = useState(false);

  const tabKey = `${item.categorie}_${item.statut}` as Tab;
  const emoji = item.categorie === "animal"
    ? (item.statut === "trouve" ? "🐕" : "🔍")
    : (item.statut === "trouve" ? "📦" : "❓");
  const label = item.categorie === "animal"
    ? (item.statut === "trouve" ? "Animal trouvé" : "Animal perdu")
    : (item.statut === "trouve" ? "Objet trouvé" : "Objet perdu");
  const color    = TAB_COLOR[tabKey]    ?? "#64748b";
  const gradient = TAB_GRADIENT[tabKey] ?? "from-slate-400 to-slate-500";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      {item.photo_url ? (
        <div className="relative h-36 w-full">
          <Image src={item.photo_url} alt="Photo" fill sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" className="object-cover" />
        </div>
      ) : (
        <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${gradient}`}>
          <span className="text-5xl drop-shadow-sm">{emoji}</span>
        </div>
      )}

      <div className="p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
          {label}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {item.description}
        </p>
        <p className="mt-1.5 text-xs text-slate-400">⏳ {joursRestants(item.expires_at)}</p>

        <div className="mt-2 flex flex-col gap-1.5">
          {item.telephone && (
            <a
              href={`tel:${item.telephone.replace(/\s/g, "")}`}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary py-2 text-xs font-semibold text-white active:scale-95"
            >
              📞 Appeler
            </a>
          )}
          {!confirme ? (
            <button
              type="button"
              onClick={() => setConfirme(true)}
              className="w-full rounded-xl border border-green-200 bg-green-50 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 active:scale-95"
            >
              {item.categorie === "animal"
                ? item.statut === "perdu" ? "🐕 Animal retrouvé !" : "🏠 Rendu au propriétaire"
                : item.statut === "perdu" ? "📦 Objet retrouvé !" : "✅ Rendu au propriétaire"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onResoudre(item.id)}
              className="w-full rounded-xl bg-green-600 py-2 text-xs font-semibold text-white active:scale-95"
            >
              Confirmer — retirer l'annonce
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
