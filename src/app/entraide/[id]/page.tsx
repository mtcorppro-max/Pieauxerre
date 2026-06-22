import { notFound } from "next/navigation";
import SubHeader from "@/components/SubHeader";
import { supabaseServer } from "@/lib/supabase/server";
import { ENTRAIDE_TYPES, REMUNERATION_OPTIONS } from "@/lib/config";
import type { Entraide } from "@/lib/types";

async function getEntraide(id: string): Promise<Entraide | null> {
  const { data } = await supabaseServer().from("entraide").select("*").eq("id", id).single();
  return data ?? null;
}

function tempsRestant(expires_at: string): string {
  const diff = new Date(expires_at).getTime() - Date.now();
  if (diff <= 0) return "Annonce expirée";
  const jours = Math.floor(diff / 86_400_000);
  if (jours > 1) return `Expire dans ${jours} jours`;
  const heures = Math.floor(diff / 3_600_000);
  if (heures > 0) return `Expire dans ${heures} h`;
  return "Expire bientôt";
}

export default async function Page({ params }: { params: { id: string } }) {
  const item = await getEntraide(params.id);
  if (!item) notFound();

  const type = ENTRAIDE_TYPES[item.type_aide];
  const rem = REMUNERATION_OPTIONS[item.remuneration];
  const publieLe = new Date(item.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title={type?.label ?? "Entraide"} />

      <div className="mx-auto max-w-lg space-y-4 p-4 pb-12">
        {/* Carte principale */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
              {type?.emoji ?? "🤝"}
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{type?.label ?? "Entraide"}</h1>
              <p className="text-sm text-slate-400">Publié le {publieLe}</p>
            </div>
          </div>

          <p className="mt-5 leading-relaxed text-slate-700">{item.description}</p>
        </div>

        {/* Rémunération */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            En échange
          </p>
          <p className="mt-1 text-lg font-medium text-slate-900">
            {rem?.emoji} {rem?.label}
          </p>
        </div>

        {/* Expiration */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Validité
          </p>
          <p className="mt-1 font-medium text-slate-900">{tempsRestant(item.expires_at)}</p>
        </div>

        {/* Contact */}
        {item.telephone ? (
          <a
            href={`tel:${item.telephone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-lg font-semibold text-white shadow-card transition active:scale-95"
          >
            <span>📞</span>
            <span>{item.telephone}</span>
          </a>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
            Pas de numéro renseigné — contactez via la carte ou la liste.
          </div>
        )}
      </div>
    </div>
  );
}
