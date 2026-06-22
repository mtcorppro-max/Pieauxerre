"use client";

import { useEffect, useRef, useState } from "react";
import { AUXERRE_BOUNDS } from "@/lib/config";

// Géocodage d'adresse via Nominatim (OpenStreetMap), gratuit et sans clé.
// Limité à la zone d'Auxerre pour des résultats pertinents.
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// viewbox attendu par Nominatim : ouest,nord,est,sud
const VIEWBOX = [
  AUXERRE_BOUNDS[0][1], // ouest (lng min)
  AUXERRE_BOUNDS[1][0], // nord (lat max)
  AUXERRE_BOUNDS[1][1], // est (lng max)
  AUXERRE_BOUNDS[0][0], // sud (lat min)
].join(",");

interface AddressSearchProps {
  onPick: (coords: { lat: number; lng: number }) => void;
}

export default function AddressSearch({ onPick }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);

      const url =
        "https://nominatim.openstreetmap.org/search?format=json&addressdetails=0" +
        "&limit=5&countrycodes=fr&accept-language=fr&bounded=1" +
        `&viewbox=${VIEWBOX}&q=${encodeURIComponent(query)}`;

      fetch(url, { signal: ctrl.signal, headers: { "Accept-Language": "fr" } })
        .then((r) => r.json())
        .then((data: NominatimResult[]) => {
          setResults(data);
          setOpen(true);
        })
        .catch(() => {
          /* annulé ou erreur réseau : on ignore */
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function choisir(r: NominatimResult) {
    onPick({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    // Affiche un libellé court (les 2 premiers segments de l'adresse)
    setQuery(r.display_name.split(",").slice(0, 2).join(", "));
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔎
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tapez une adresse à Auxerre…"
          className="input pl-9"
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-pulse text-xs text-slate-400">
            …
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-[1000] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-card">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => choisir(r)}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-primary-50"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim().length >= 3 && (
        <p className="mt-1 text-xs text-slate-400">
          Aucune adresse trouvée — placez le repère sur la carte.
        </p>
      )}
    </div>
  );
}
