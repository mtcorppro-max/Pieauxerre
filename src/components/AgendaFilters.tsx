"use client";

import { useEffect, useRef, useState } from "react";
import { AUXERRE_CENTER, EVENT_CATEGORIES } from "@/lib/config";
import type { EventCategorie } from "@/lib/types";

export interface AgendaFiltres {
  centre: { lat: number; lng: number };
  villeLabel: string;
  rayon: number;
  categories: EventCategorie[];
}

export const FILTRES_DEFAUT: AgendaFiltres = {
  centre: { lat: AUXERRE_CENTER[0], lng: AUXERRE_CENTER[1] },
  villeLabel: "Auxerre",
  rayon: 0,
  categories: [],
};

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  filtres: AgendaFiltres;
  onChange: (f: AgendaFiltres) => void;
  nbActifs?: number;
}

export default function AgendaFilters({ filtres, onChange }: Props) {
  const [rechercheVille, setRechercheVille] = useState(false);
  const [query, setQuery] = useState(filtres.villeLabel);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loadingVille, setLoadingVille] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setQuery(filtres.villeLabel); }, [filtres.villeLabel]);

  useEffect(() => {
    if (!rechercheVille || query.trim().length < 2) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoadingVille(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=fr` +
        `&accept-language=fr&q=${encodeURIComponent(query)}`,
        { signal: ctrl.signal, headers: { "Accept-Language": "fr" } }
      )
        .then((r) => r.json())
        .then(setSuggestions)
        .catch(() => {})
        .finally(() => setLoadingVille(false));
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, rechercheVille]);

  function choisirVille(r: NominatimResult) {
    const label = r.display_name.split(",").slice(0, 2).join(", ");
    setQuery(label);
    setSuggestions([]);
    setRechercheVille(false);
    onChange({ ...filtres, centre: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) }, villeLabel: label });
  }

  function ouvrirRechercheVille() {
    setRechercheVille(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function annulerRechercheVille() {
    setRechercheVille(false);
    setQuery(filtres.villeLabel);
    setSuggestions([]);
  }

  function toggleCategorie(cat: EventCategorie) {
    const next = filtres.categories.includes(cat)
      ? filtres.categories.filter((c) => c !== cat)
      : [...filtres.categories, cat];
    onChange({ ...filtres, categories: next });
  }

  function reset() {
    setQuery("Auxerre");
    setSuggestions([]);
    setRechercheVille(false);
    onChange(FILTRES_DEFAUT);
  }

  const hasActiveFilters = filtres.rayon > 0 || filtres.categories.length > 0;
  const pct = (filtres.rayon / 50) * 100;
  const sliderBg = `linear-gradient(to right, #1d4ed8 ${pct}%, #e2e8f0 ${pct}%)`;
  const villeShort = filtres.villeLabel.split(",")[0];

  return (
    <div className="border-b border-slate-100 bg-white px-4 pb-4 pt-3">

      {/* Ligne localisation */}
      {rechercheVille ? (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
            <span className="shrink-0 text-sm">📍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Appoigny, Monéteau, Auxerre…"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              autoComplete="off"
            />
            {loadingVille && (
              <span className="shrink-0 animate-pulse text-xs text-slate-400">…</span>
            )}
            <button
              type="button"
              onClick={annulerRechercheVille}
              className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-slate-800"
            >
              Annuler
            </button>
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-[1000] mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-100 bg-white shadow-lg">
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onClick={() => choisirVille(s)}
                    className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    {s.display_name.split(",").slice(0, 3).join(", ")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={ouvrirRechercheVille}
            className="flex items-center gap-1.5 transition active:opacity-70"
          >
            <span className="text-sm">📍</span>
            <span className="text-sm font-semibold text-slate-800">{villeShort}</span>
            {filtres.rayon > 0 && (
              <span className="text-sm font-normal text-slate-400">et alentours</span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={ouvrirRechercheVille}
              className="text-xs text-slate-400 transition hover:text-primary"
            >
              Changer
            </button>
            {hasActiveFilters && (
              <>
                <span className="text-slate-200 select-none">|</span>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-medium text-primary transition hover:text-blue-700"
                >
                  Effacer
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Slider rayon */}
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={filtres.rayon}
          onChange={(e) => onChange({ ...filtres, rayon: Number(e.target.value) })}
          className="rayon-slider flex-1"
          style={{ background: sliderBg }}
        />
        <span className="min-w-[52px] text-right text-sm font-semibold text-slate-700">
          {filtres.rayon === 0 ? "Tout" : `${filtres.rayon} km`}
        </span>
      </div>

      {/* Chips catégories — scroll horizontal */}
      <div className="no-scrollbar mt-3 -mx-4 flex gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => onChange({ ...filtres, categories: [] })}
          className={[
            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition active:scale-95",
            filtres.categories.length === 0
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          Tous
        </button>
        {(Object.entries(EVENT_CATEGORIES) as [EventCategorie, { emoji: string; label: string }][]).map(
          ([key, { emoji, label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCategorie(key)}
              className={[
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition active:scale-95",
                filtres.categories.includes(key)
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {emoji} {label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
