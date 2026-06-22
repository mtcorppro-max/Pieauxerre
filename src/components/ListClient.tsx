"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchEvents, fetchPromos } from "@/lib/data";
import { EVENT_CATEGORIES } from "@/lib/config";
import { estAujourdhui, formatDateHeure, tempsRestant } from "@/lib/dates";
import type { EventItem, Promo } from "@/lib/types";

type Tab = "tous" | "soir" | "promos";
type Cat = keyof typeof EVENT_CATEGORIES | null;

const TABS: { key: Tab; label: string }[] = [
  { key: "tous",  label: "Tous" },
  { key: "soir",  label: "Ce soir" },
  { key: "promos", label: "🔥 Promos" },
];

const CAT_GRADIENT: Record<string, string> = {
  musique: "from-purple-500 to-pink-500",
  sport:   "from-green-500 to-emerald-600",
  marche:  "from-orange-400 to-amber-500",
  culture: "from-blue-500 to-indigo-600",
  autre:   "from-slate-500 to-slate-600",
};

const CAT_COLOR: Record<string, string> = {
  musique: "#a855f7",
  sport:   "#22c55e",
  marche:  "#f97316",
  culture: "#3b82f6",
  autre:   "#64748b",
};

export default function ListClient() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [tab, setTab] = useState<Tab>("tous");
  const [cat, setCat] = useState<Cat>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [e, p] = await Promise.all([fetchEvents(), fetchPromos()]);
        if (cancelled) return;
        setEvents(e); setPromos(p); setStatus("ready");
      } catch { if (!cancelled) setStatus("error"); }
    })();
    return () => { cancelled = true; };
  }, []);

  const ceSoir = useMemo(
    () => events.filter((e) => estAujourdhui(e.date_debut, e.date_fin)),
    [events]
  );

  const baseItems = tab === "soir" ? ceSoir : tab === "tous" ? events : [];
  const filtered = cat ? baseItems.filter((e) => e.categorie === cat) : baseItems;

  if (status === "loading") return <p className="p-6 text-center text-slate-400">Chargement…</p>;
  if (status === "error") return (
    <p className="m-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
      Impossible de charger les données.
    </p>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* En-tête */}
      <div className="bg-white px-4 pb-4 pt-5 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Les sorties à Auxerre</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {tab === "promos" ? `${promos.length} bon${promos.length > 1 ? "s" : ""} plan${promos.length > 1 ? "s" : ""}` : `${filtered.length} événement${filtered.length > 1 ? "s" : ""}`} trouvé{filtered.length > 1 || (tab === "promos" && promos.length > 1) ? "s" : ""}
            </p>
          </div>
          <Link
            href="/carte"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm active:scale-95"
          >
            🗺️ Voir la carte
          </Link>
        </div>

        {/* Onglets temps */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setCat(null); }}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
                tab === t.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtre catégories (seulement sur les onglets événements) */}
        {tab !== "promos" && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setCat(null)}
              className={[
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                cat === null ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              Tout
            </button>
            {Object.entries(EVENT_CATEGORIES).map(([key, { emoji, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCat(key as Cat)}
                className={[
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  cat === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bouton proposer */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
        <p className="text-sm text-slate-500">
          {tab === "promos" ? "Une promo à partager ? Bar, magasin, service…" : "Un événement à annoncer ?"}
        </p>
        <Link
          href={tab === "promos" ? "/soumettre?type=promo" : "/soumettre?context=sorties"}
          className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white active:scale-95"
        >
          <span className="text-base leading-none">+</span> Proposer
        </Link>
      </div>

      {/* Grille */}
      <div className="p-4">
        {tab === "promos" ? (
          <PromoGrid items={promos} />
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const gradient = CAT_GRADIENT[event.categorie] ?? CAT_GRADIENT.autre;
  const color = CAT_COLOR[event.categorie] ?? CAT_COLOR.autre;
  const { emoji, label } = EVENT_CATEGORIES[event.categorie] ?? { emoji: "📌", label: "Autre" };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      {event.photo_url ? (
        <div className="relative h-36 w-full">
          <Image src={event.photo_url} alt={event.titre} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
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
          {event.titre}
        </p>
        <p className="mt-1.5 text-xs capitalize text-slate-500">
          {formatDateHeure(event.date_debut)}
        </p>
        {event.lieu_nom && (
          <p className="truncate text-xs text-slate-400">📍 {event.lieu_nom}</p>
        )}
      </div>
    </article>
  );
}

function PromoGrid({ items }: { items: Promo[] }) {
  if (items.length === 0) return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
      <p className="text-3xl">🔥</p>
      <p className="mt-3 font-medium">Aucune promo active en ce moment.</p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <article key={p.id} className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
          {p.photo_url ? (
            <div className="relative h-36 w-full">
              <Image src={p.photo_url} alt={p.nom_commerce ?? "Promo"} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
              <span className="text-5xl">🔥</span>
            </div>
          )}
          <div className="p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">Promo</p>
            {p.nom_commerce && <p className="mt-0.5 text-sm font-semibold text-slate-900">{p.nom_commerce}</p>}
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{p.description}</p>
            <p className="mt-1.5 text-xs font-medium text-orange-600">⏳ {tempsRestant(p.date_fin)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
      <p className="text-3xl">{tab === "soir" ? "🌙" : "📅"}</p>
      <p className="mt-3 font-medium">
        {tab === "soir" ? "Rien de prévu ce soir." : "Aucun événement à venir."}
      </p>
      <Link href="/soumettre?context=sorties" className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        + Proposer le premier
      </Link>
    </div>
  );
}
