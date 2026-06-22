"use client";

import { useEffect, useState } from "react";
import { fetchPharmacies, fetchVeterinaires } from "@/lib/data";
import type { Pharmacie, Veterinaire } from "@/lib/types";

type Tab = "garde" | "pharmacies" | "vetos";

const TABS: { key: Tab; label: string }[] = [
  { key: "garde", label: "💊 Garde" },
  { key: "pharmacies", label: "Pharmacies" },
  { key: "vetos", label: "🐾 Vétérinaires" },
];

export default function SanteClient() {
  const [tab, setTab] = useState<Tab>("garde");
  const [pharmacies, setPharmacies] = useState<Pharmacie[]>([]);
  const [vetos, setVetos] = useState<Veterinaire[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    Promise.all([fetchPharmacies(), fetchVeterinaires()])
      .then(([ph, v]) => { setPharmacies(ph); setVetos(v); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") return <p className="p-6 text-center text-slate-400">Chargement…</p>;
  if (status === "error") return (
    <p className="m-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
      Impossible de charger les données.
    </p>
  );

  return (
    <div className="pb-24 md:pb-12">
      {/* Onglets */}
      <div className="sticky top-[57px] z-10 flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={[
              "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
              tab === t.key ? "bg-primary text-white" : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-4">
        {tab === "garde" && <GardeTab />}
        {tab === "pharmacies" && <PharmaciesTab items={pharmacies} />}
        {tab === "vetos" && <VetosTab items={vetos} />}
      </div>
    </div>
  );
}

/* ─── Onglet Garde ─────────────────────────────────────────────── */
function GardeTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-green-100 bg-green-50 p-6 text-center">
        <p className="text-4xl">💊</p>
        <h2 className="mt-3 text-lg font-bold text-slate-900">Pharmacie de garde</h2>
        <p className="mt-2 text-sm text-slate-600">
          Consultez la pharmacie de garde actuellement ouverte dans l'Yonne via le site de la CPTS.
        </p>
        <a
          href="https://www.cpts-yonne.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-base font-semibold text-white shadow-soft transition active:scale-95"
        >
          Voir la pharmacie de garde →
        </a>
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        En cas d'urgence : appelez le <strong>15</strong> (SAMU) ou le <strong>3237</strong>.
      </p>
    </div>
  );
}

/* ─── Onglet Pharmacies ────────────────────────────────────────── */
function PharmaciesTab({ items }: { items: Pharmacie[] }) {
  if (items.length === 0) return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
      <p className="text-3xl">💊</p>
      <p className="mt-3 font-medium">Aucune pharmacie enregistrée.</p>
      <p className="mt-1 text-sm">Lancez le script de seed OSM pour les importer.</p>
    </div>
  );
  return (
    <>
      {items.map((p) => (
        <article key={p.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">💊</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{p.nom}</p>
              {p.adresse && <p className="text-sm text-slate-500">📍 {p.adresse}</p>}
            </div>
            {p.telephone && (
              <a
                href={`tel:${p.telephone.replace(/\s/g, "")}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-lg text-white shadow-soft active:scale-95"
              >
                📞
              </a>
            )}
          </div>
        </article>
      ))}
    </>
  );
}

/* ─── Onglet Vétérinaires ──────────────────────────────────────── */
function VetosTab({ items }: { items: Veterinaire[] }) {
  if (items.length === 0) return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
      <p className="text-3xl">🐾</p>
      <p className="mt-3 font-medium">Aucun vétérinaire enregistré.</p>
      <p className="mt-1 text-sm">Lancez le script de seed OSM pour les importer.</p>
    </div>
  );
  return (
    <>
      {items.filter((v) => v.urgences).length > 0 && (
        <p className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Urgences 24h/24
        </p>
      )}
      {items.map((v) => (
        <article
          key={v.id}
          className={[
            "rounded-2xl border p-4 shadow-soft",
            v.urgences
              ? "border-orange-200 bg-orange-50"
              : "border-slate-100 bg-white",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xl">🐾</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{v.nom}</p>
                {v.urgences && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Urgences
                  </span>
                )}
              </div>
              {v.adresse && <p className="text-sm text-slate-500">📍 {v.adresse}</p>}
            </div>
            {v.telephone && (
              <a
                href={`tel:${v.telephone.replace(/\s/g, "")}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-lg text-white shadow-soft active:scale-95"
              >
                📞
              </a>
            )}
          </div>
        </article>
      ))}
    </>
  );
}
