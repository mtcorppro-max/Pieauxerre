"use client";

import { useEffect, useMemo, useState } from "react";
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

  const counts = useMemo(() => {
    const c: Record<MapLayer, number> = { events: 0, promos: 0, pois: 0, signalements: 0, entraide: 0, trouvailles: 0 };
    for (const p of points) c[p.layer]++;
    return c;
  }, [points]);

  const visiblePoints = useMemo(
    () => points.filter((p) => active[p.layer]),
    [points, active]
  );

  function toggle(keys: MapLayer[]) {
    setActive((a) => {
      const allOn = keys.every((k) => a[k]);
      const next = { ...a };
      for (const k of keys) next[k] = !allOn;
      return next;
    });
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Barre supérieure : logo + filtres + bouton proposer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-3 pt-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Retour accueil */}
          <Link
            href="/"
            className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-2.5 shadow-card backdrop-blur"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Accueil</span>
          </Link>

          {/* Filtres catégories */}
          {MAP_FILTERS.map((f) => {
            const isOn = f.keys.some((k) => active[k]);
            const count = f.keys.reduce((s, k) => s + counts[k], 0);
            return (
              <button
                key={f.keys.join("+")}
                type="button"
                onClick={() => toggle(f.keys)}
                className={[
                  "pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-medium shadow-card backdrop-blur transition active:scale-95",
                  isOn
                    ? "bg-slate-900 text-white"
                    : "bg-white/95 text-slate-700 hover:bg-white",
                ].join(" ")}
              >
                <span className="text-base leading-none">{f.emoji}</span>
                <span>{f.label}</span>
                {count > 0 && (
                  <span className={[
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isOn ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500",
                  ].join(" ")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Météo */}
          <WeatherCompact className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-2xl bg-white/95 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-card backdrop-blur" />

          {/* Bouton proposer */}
          <Link
            href="/soumettre"
            aria-label="Proposer un événement, une idée…"
            className="pointer-events-auto flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-lg font-bold text-white shadow-card backdrop-blur transition active:scale-95"
          >
            +
          </Link>
        </div>
      </div>

      {/* Carte */}
      <div className="absolute inset-0">
        <MapView points={visiblePoints} />
      </div>

      {/* États */}
      {status === "error" && (
        <div className="absolute inset-x-3 top-20 z-[1000] rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
          Impossible de charger les données.
        </div>
      )}
    </main>
  );
}
