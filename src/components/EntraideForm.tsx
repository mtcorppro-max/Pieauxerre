"use client";

import { useState } from "react";
import Link from "next/link";
import LocationPicker from "./LocationPickerDynamic";
import { supabase } from "@/lib/supabase/client";
import { ENTRAIDE_TYPES, REMUNERATION_OPTIONS } from "@/lib/config";
import type { EntraideType, Remuneration } from "@/lib/types";

interface Coords {
  lat: number;
  lng: number;
}

export default function EntraideForm() {
  const [typeAide, setTypeAide] = useState<EntraideType>("autre");
  const [description, setDescription] = useState("");
  const [remuneration, setRemuneration] = useState<Remuneration>("biere");
  const [telephone, setTelephone] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!coords) {
      setError("Merci de placer le repère sur la carte pour indiquer l'adresse.");
      return;
    }
    if (description.trim().length < 10) {
      setError("La description doit faire au moins 10 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await supabase.from("entraide").insert({
        type_aide: typeAide,
        description: description.trim(),
        lat: coords.lat,
        lng: coords.lng,
        remuneration,
        telephone: telephone.trim() || null,
      });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="mb-4 text-6xl">🤝</div>
        <h2 className="text-xl font-bold text-slate-900">Annonce publiée !</h2>
        <p className="mt-2 text-slate-600">
          Votre demande est en ligne. Elle disparaîtra automatiquement dans 7 jours.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/entraide"
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white active:scale-95"
          >
            Voir toutes les annonces
          </Link>
          <Link href="/carte" className="text-sm text-slate-500 underline">
            Retour à la carte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6 p-4 pb-12">

      {/* Type d'aide */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          De quel type d'aide avez-vous besoin ? *
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(ENTRAIDE_TYPES) as [EntraideType, { emoji: string; label: string }][]).map(
            ([key, { emoji, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeAide(key)}
                className={[
                  "rounded-2xl border p-3 text-left transition active:scale-95",
                  typeAide === key
                    ? "border-primary bg-primary-50"
                    : "border-slate-200 bg-white",
                ].join(" ")}
              >
                <div className="text-2xl">{emoji}</div>
                <div className="mt-0.5 text-sm font-medium text-slate-800">{label}</div>
              </button>
            )
          )}
        </div>
      </fieldset>

      {/* Description */}
      <Field label="Décrivez votre demande *">
        <textarea
          className="input min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : besoin d'un coup de main pour tondre le jardin, environ 1h, samedi matin si possible…"
          required
        />
      </Field>

      {/* Rémunération */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          En échange… *
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(REMUNERATION_OPTIONS) as [Remuneration, { emoji: string; label: string }][]).map(
            ([key, { emoji, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRemuneration(key)}
                className={[
                  "rounded-full border px-3 py-2 text-sm transition active:scale-95",
                  remuneration === key
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                {emoji} {label}
              </button>
            )
          )}
        </div>
      </fieldset>

      {/* Téléphone */}
      <Field label="Votre numéro de téléphone (pour être contacté)">
        <input
          type="tel"
          className="input"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="06 12 34 56 78"
          autoComplete="tel"
        />
        <p className="mt-1 text-xs text-slate-400">
          Visible publiquement — laissez vide si vous préférez.
        </p>
      </Field>

      {/* Localisation */}
      <Field label="Où ? (adresse ou position sur la carte) *">
        <LocationPicker value={coords} onChange={setCoords} />
      </Field>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? "Publication…" : "Publier l'annonce"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Publié immédiatement · Disparaît automatiquement après 7 jours
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
