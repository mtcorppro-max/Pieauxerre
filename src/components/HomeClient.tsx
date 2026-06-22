"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MapView from "./MapDynamic";
import {
  entraideToPoint,
  eventToPoint,
  fetchEntraide,
  fetchEvents,
  fetchPromos,
  fetchSignalements,
  fetchTrouvailles,
  promoToPoint,
  signalementToPoint,
  trouvailleToPoint,
} from "@/lib/data";
import type { MapLayer, MapPoint } from "@/lib/types";
import { WeatherCompact } from "./WeatherWidget";

const ALL_ON: Record<MapLayer, boolean> = {
  events: true,
  promos: true,
  pois: false,
  signalements: true,
  entraide: true,
  trouvailles: true,
};

const MAP_FILTERS: { keys: MapLayer[]; emoji: string; label: string }[] = [
  { keys: ["events", "promos"], emoji: "📅", label: "Sorties" },
  { keys: ["signalements"],     emoji: "🚧", label: "Signalements" },
  { keys: ["entraide"],         emoji: "🤝", label: "Entraide" },
  { keys: ["trouvailles"],      emoji: "🐕", label: "Perdus/Trouvés" },
];

export default function HomeClient() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [active, setActive] = useState<Record<MapLayer, boolean>>(ALL_ON);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filterOpen, setFilterOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [events, promos, signalements, entraide, trouvailles] = await Promise.all([
          fetchEvents(),
          fetchPromos(),
          fetchSignalements(),
          fetchEntraide(),
          fetchTrouvailles(),
        ]);
        if (cancelled) return;
        setPoints([
          ...events.map(eventToPoint),
          ...promos.map(promoToPoint),
          ...signalements.map(signalementToPoint),
          ...entraide.map(entraideToPoint),
          ...trouvailles.map(trouvailleToPoint),
        ]);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Ferme le panneau si on clique dehors
  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  const counts = useMemo(() => {
    const c: Record<MapLayer, number> = { events: 0, promos: 0, pois: 0, signalements: 0, entraide: 0, trouvailles: 0 };
    for (const p of points) c[p.layer]++;
    return c;
  }, [points]);

  const visiblePoints = useMemo(
    () => points.filter((p) => active[p.layer]),
    [points, active]
  );

  const totalVisible = visiblePoints.length;

  function toggle(keys: MapLayer[]) {
    setActive((a) => {
      const allOn = keys.every((k) => a[k]);
      const next = { ...a };
      for (const k of keys) next[k] = !allOn;
      return next;
    });
  }

  const activeFilterCount = MAP_FILTERS.filter((f) => f.keys.some((k) => active[k])).length;

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Barre supérieure compacte */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-3 pt-3">
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Retour accueil */}
          <Link
            href="/"
            aria-label="Accueil"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-card backdrop-blur active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Bouton filtres (3 barres) */}
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="relative flex h-11 grow items-center gap-2 rounded-2xl bg-white/95 px-3 shadow-card backdrop-blur active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Filtres</span>
            {activeFilterCount < MAP_FILTERS.length && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeFilterCount}/{MAP_FILTERS.length}
              </span>
            )}
            <span className="ml-auto text-xs text-slate-400">{totalVisible} sur la carte</span>
          </button>

          {/* Météo compacte */}
          <WeatherCompact className="flex h-11 shrink-0 items-center gap-1 rounded-2xl bg-white/95 px-3 text-sm font-medium text-slate-700 shadow-card backdrop-blur" />

          {/* Bouton proposer */}
          <Link
            href="/soumettre"
            aria-label="Proposer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-card backdrop-blur active:scale-95"
          >
            +
          </Link>
        </div>

        {/* Panneau filtres déroulant */}
        {filterOpen && (
          <div
            ref={panelRef}
            className="mt-2 overflow-hidden rounded-2xl bg-white/98 shadow-card backdrop-blur"
          >
            <div className="grid grid-cols-2 gap-2 p-3">
              {MAP_FILTERS.map((f) => {
                const isOn = f.keys.some((k) => active[k]);
                const count = f.keys.reduce((s, k) => s + counts[k], 0);
                return (
                  <button
                    key={f.keys.join("+")}
                    type="button"
                    onClick={() => toggle(f.keys)}
                    className={[
                      "flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition active:scale-95",
                      isOn
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    <span className="text-base leading-none">{f.emoji}</span>
                    <span className="flex-1 text-left">{f.label}</span>
                    {count > 0 && (
                      <span className={[
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isOn ? "bg-white/25 text-white" : "bg-slate-200 text-slate-500",
                      ].join(" ")}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="absolute inset-0">
        <MapView points={visiblePoints} />
      </div>

      {status === "error" && (
        <div className="absolute inset-x-3 top-20 z-[1000] rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
          Impossible de charger les données.
        </div>
      )}
    </main>
  );
}
