import Image from "next/image";
import { notFound } from "next/navigation";
import SubHeader from "@/components/SubHeader";
import OpenNowBadge from "@/components/OpenNowBadge";
import { supabaseServer } from "@/lib/supabase/server";
import { POI_CATEGORIES } from "@/lib/config";
import { JOURS_LABELS, JOURS_ORDRE, formatJour } from "@/lib/horaires";
import type { Poi } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPoi(id: string): Promise<Poi | null> {
  const { data } = await supabaseServer().from("pois").select("*").eq("id", id).single();
  return (data as Poi) ?? null;
}

export default async function Page({ params }: { params: { id: string } }) {
  const poi = await getPoi(params.id);
  if (!poi) notFound();

  const cat = POI_CATEGORIES[poi.categorie];
  const itineraire = `https://www.openstreetmap.org/directions?to=${poi.lat},${poi.lng}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title={cat?.label ?? "Commerce"} />

      {poi.photo_url ? (
        <div className="relative h-52 w-full bg-slate-200">
          <Image
            src={poi.photo_url}
            alt={poi.nom}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-primary-50 text-6xl">
          {cat?.emoji ?? "🛒"}
        </div>
      )}

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{poi.nom}</h2>
            <p className="text-sm text-slate-500">
              {cat?.emoji} {cat?.label}
            </p>
          </div>
          <OpenNowBadge horaires={poi.horaires} />
        </div>

        {poi.adresse && (
          <p className="text-sm text-slate-600">📍 {poi.adresse}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {poi.telephone && (
            <a
              href={`tel:${poi.telephone}`}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white active:scale-95"
            >
              📞 Appeler
            </a>
          )}
          <a
            href={itineraire}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-primary-50 px-4 py-2 text-sm font-medium text-primary active:scale-95"
          >
            🧭 Itinéraire
          </a>
        </div>

        {poi.horaires && (
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
            <h3 className="mb-2 font-semibold text-slate-900">Horaires</h3>
            <ul className="divide-y divide-slate-50 text-sm">
              {JOURS_ORDRE.map((j) => (
                <li key={j} className="flex justify-between py-1.5">
                  <span className="text-slate-500">{JOURS_LABELS[j]}</span>
                  <span className="text-slate-800">{formatJour(poi.horaires?.[j])}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
