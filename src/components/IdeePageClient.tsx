"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchSignalements } from "@/lib/data";
import { signalementEmoji, signalementLabel } from "@/lib/config";
import type { Signalement } from "@/lib/types";
import VoteButton from "./VoteButton";
import AbuseButton from "./AbuseButton";

type Filtre = "tous" | "idee" | "probleme";

export default function IdeePageClient() {
  const searchParams = useSearchParams();
  const initFiltre = (searchParams.get("filtre") as Filtre | null) ?? "tous";

  const [items, setItems] = useState<Signalement[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filtre, setFiltre] = useState<Filtre>(initFiltre);

  useEffect(() => {
    const f = (searchParams.get("filtre") as Filtre | null) ?? "tous";
    setFiltre(f);
  }, [searchParams]);

  useEffect(() => {
    fetchSignalements()
      .then((data) => { setItems(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  const visibles = useMemo(
    () => (filtre === "tous" ? items : items.filter((s) => s.type === filtre)),
    [items, filtre]
  );

  if (status === "loading") return <p className="p-6 text-center text-slate-400">Chargement…</p>;
  if (status === "error") return (
    <p className="m-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Impossible de charger les données.</p>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* En-tête */}
      <div className="bg-white px-4 pb-4 pt-5 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Idées & signalements</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {visibles.length} contribution{visibles.length !== 1 ? "s" : ""} trouvée{visibles.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/carte"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm active:scale-95"
          >
            🗺️ Voir la carte
          </Link>
        </div>

        {/* Onglets */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {(["tous", "idee", "probleme"] as const).map((k) => {
            const count = k === "tous" ? items.length : items.filter((s) => s.type === k).length;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFiltre(k)}
                className={[
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition",
                  filtre === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {k === "tous" ? "Tout" : k === "idee" ? "💡 Idées" : "🚧 Signalements"}
                <span className={["rounded-full px-1.5 text-xs", filtre === k ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"].join(" ")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
        <p className="text-sm text-slate-500">Une idée ou un problème à signaler ?</p>
        <Link
          href="/soumettre?context=idees"
          className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white active:scale-95"
        >
          <span className="text-base leading-none">+</span> Proposer
        </Link>
      </div>

      {/* Liste */}
      <div className="space-y-3 p-4">
        {visibles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
            <p className="text-3xl">{filtre === "idee" ? "💡" : filtre === "probleme" ? "🚧" : "🏙️"}</p>
            <p className="mt-3 font-medium">Aucune contribution pour l'instant.</p>
            <Link
              href="/soumettre?context=idees"
              className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              + Être le premier
            </Link>
          </div>
        ) : (
          visibles.map((s) => (
            <article key={s.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl">
                  {signalementEmoji(s.type, s.categorie)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {s.type === "idee" ? "💡 Idée" : "🚧 Signalement"} · {signalementLabel(s.type, s.categorie)}
                    {s.commune && <span> · 📍 {s.commune}</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{s.description}</p>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <VoteButton signalementId={s.id} initialVotes={s.votes} />
                    <AbuseButton signalementId={s.id} />
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
