"use client";

import { useState } from "react";
import Link from "next/link";
import LocationPicker from "./LocationPickerDynamic";
import { supabase } from "@/lib/supabase/client";
import type { TrouvailleCategorie, TrouvailleStatut } from "@/lib/types";

const TYPES: { categorie: TrouvailleCategorie; statut: TrouvailleStatut; emoji: string; label: string; aide: string }[] = [
  { categorie: "animal", statut: "trouve", emoji: "🐕", label: "Animal trouvé", aide: "J'ai trouvé un animal errant" },
  { categorie: "animal", statut: "perdu",  emoji: "🔍", label: "Animal perdu",  aide: "Mon animal a disparu" },
  { categorie: "objet",  statut: "trouve", emoji: "📦", label: "Objet trouvé",  aide: "J'ai trouvé un objet" },
  { categorie: "objet",  statut: "perdu",  emoji: "❓", label: "Objet perdu",   aide: "J'ai perdu quelque chose" },
];

interface Coords { lat: number; lng: number }

export default function TrouvailleForm() {
  const [selected, setSelected] = useState(0);
  const [description, setDescription] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const type = TYPES[selected];

  async function uploadPhoto(): Promise<string | null> {
    if (!photo) return null;
    const ext = photo.name.split(".").pop() ?? "jpg";
    const path = `trouvailles/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("photos").upload(path, photo, { cacheControl: "3600" });
    if (upErr) throw upErr;
    return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!coords) { setError("Merci de placer le repère sur la carte."); return; }
    if (description.trim().length < 5) { setError("La description est trop courte."); return; }

    setSubmitting(true);
    try {
      const photoUrl = await uploadPhoto();
      const { error: err } = await supabase.from("trouvailles").insert({
        categorie: type.categorie,
        statut: type.statut,
        description: description.trim(),
        photo_url: photoUrl,
        lat: coords.lat,
        lng: coords.lng,
        telephone: telephone.trim() || null,
      });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="text-6xl">{type.emoji}</div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Annonce publiée !</h2>
        <p className="mt-2 text-slate-600">
          {type.statut === "trouve"
            ? "Merci ! Si personne ne répond dans 30 jours, l'annonce s'efface automatiquement."
            : "Courage ! Votre annonce est visible par tous les habitants d'Auxerre."}
        </p>
        {type.categorie === "animal" && (
          <Link href="/sante" className="mt-4 inline-block text-sm text-primary underline">
            Voir les vétérinaires d'urgence →
          </Link>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/trouvailles" className="rounded-xl bg-primary px-6 py-3 font-medium text-white">
            Voir toutes les annonces
          </Link>
          <Link href="/carte" className="text-sm text-slate-500 underline">Retour à la carte</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6 p-4 pb-12">

      {/* Type */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">De quoi s'agit-il ? *</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={[
                "rounded-2xl border p-3 text-left transition active:scale-95",
                selected === i ? "border-primary bg-primary-50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div className="text-2xl">{t.emoji}</div>
              <div className="mt-0.5 font-semibold text-slate-900 text-sm">{t.label}</div>
              <div className="text-xs text-slate-500">{t.aide}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Photo */}
      <Field label={`Photo ${type.categorie === "animal" ? "(très recommandée)" : "(optionnelle)"}`}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-primary"
        />
        {photo && <p className="mt-1 text-xs text-green-600">✓ {photo.name}</p>}
      </Field>

      {/* Description */}
      <Field label="Description *">
        <textarea
          className="input min-h-[90px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type.categorie === "animal"
              ? "Ex : labrador marron, sans collier, semblait perdu, très docile…"
              : "Ex : portefeuille noir trouvé devant la boulangerie rue de Paris…"
          }
          required
        />
      </Field>

      {/* Téléphone */}
      <Field label="Votre numéro (pour être contacté)">
        <input
          type="tel"
          className="input"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="06 12 34 56 78"
          autoComplete="tel"
        />
      </Field>

      {/* Localisation */}
      <Field label={type.statut === "trouve" ? "Où l'avez-vous trouvé ? *" : "Dernière localisation connue *"}>
        <LocationPicker value={coords} onChange={setCoords} />
      </Field>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? "Publication…" : "Publier l'annonce"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Publié immédiatement · Expire automatiquement après 30 jours
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
