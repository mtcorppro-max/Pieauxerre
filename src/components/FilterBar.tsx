"use client";

import type { MapLayer } from "@/lib/types";

interface FilterDef {
  keys: MapLayer[];
  emoji: string;
  label: string;
}

const FILTERS: FilterDef[] = [
  { keys: ["events", "promos"], emoji: "📅", label: "Sorties" },
  { keys: ["signalements"],     emoji: "🚧", label: "Signalements" },
  { keys: ["entraide"],         emoji: "🤝", label: "Entraide" },
  { keys: ["trouvailles"],      emoji: "🐕", label: "Perdus/Trouvés" },
];

interface FilterBarProps {
  active: Record<MapLayer, boolean>;
  counts: Record<MapLayer, number>;
  onToggle: (keys: MapLayer[]) => void;
}

export default function FilterBar({ active, counts, onToggle }: FilterBarProps) {
  return (
    <nav
      aria-label="Filtres de la carte"
      className="pointer-events-auto flex gap-1.5 overflow-x-auto rounded-2xl bg-white/95 p-2 shadow-card backdrop-blur"
    >
      {FILTERS.map((f) => {
        const isOn = f.keys.some((k) => active[k]);
        const count = f.keys.reduce((sum, k) => sum + counts[k], 0);
        return (
          <button
            key={f.keys.join("+")}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(f.keys)}
            className={[
              "flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-xs font-medium transition active:scale-95",
              isOn
                ? "bg-primary-50 text-primary"
                : "text-slate-400 hover:bg-slate-50",
            ].join(" ")}
          >
            <span className={["text-xl leading-none", isOn ? "" : "grayscale opacity-60"].join(" ")}>
              {f.emoji}
            </span>
            <span className="leading-tight">{f.label}</span>
            <span className="text-[10px] text-slate-400">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}
