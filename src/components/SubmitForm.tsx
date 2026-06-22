"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LocationPicker from "./LocationPickerDynamic";
import { supabase } from "@/lib/supabase/client";
import { IDEE_CATEGORIES, SIGNALEMENT_CATEGORIES } from "@/lib/config";

// "sport" et "marche" sont des types UI qui s'insèrent en DB comme event+categorie
type SubmitType = "event" | "promo" | "sport" | "marche" | "probleme" | "idee";

const TYPES_SORTIES: { key: SubmitType; emoji: string; label: string; aide: string }[] = [
  { key: "event",  emoji: "🎵", label: "Événement",       aide: "Concert, expo, festival…" },
  { key: "sport",  emoji: "🏆", label: "Événement sportif", aide: "Match, tournoi, course…" },
  { key: "marche", emoji: "🛍️", label: "Marché / Brocante", aide: "Marché, vide-grenier…" },
  { key: "promo",  emoji: "🔥", label: "Promo",            aide: "Soldes, réduction, offre spéciale…" },
];

const TYPES_IDEES: { key: SubmitType; emoji: string; label: string; aide: string }[] = [
  { key: "probleme", emoji: "🚧", label: "Signalement", aide: "Un problème à signaler" },
  { key: "idee",     emoji: "💡", label: "Idée",        aide: "Une idée pour la ville" },
];

const TYPES_ALL = [...TYPES_SORTIES, ...TYPES_IDEES];

// Catégories événement affichées quand type=event (sport et marche ont leur propre carte)
const EVENT_CATEGORIES_LIBRES = [
  { key: "musique",  emoji: "🎵", label: "Musique" },
  { key: "culture",  emoji: "🎭", label: "Culture" },
  { key: "bar",      emoji: "🍺", label: "Bar / Restaurant" },
  { key: "autre",    emoji: "📌", label: "Autre" },
];

const SPORTS = [
  { key: "football",      emoji: "⚽", label: "Football" },
  { key: "rugby",         emoji: "🏉", label: "Rugby" },
  { key: "basketball",    emoji: "🏀", label: "Basketball" },
  { key: "tennis",        emoji: "🎾", label: "Tennis" },
  { key: "natation",      emoji: "🏊", label: "Natation" },
  { key: "cyclisme",      emoji: "🚴", label: "Cyclisme" },
  { key: "athletisme",    emoji: "🏃", label: "Athlétisme" },
  { key: "volley",        emoji: "🏐", label: "Volley" },
  { key: "arts_martiaux", emoji: "🥋", label: "Arts martiaux" },
  { key: "autre",         emoji: "🏆", label: "Autre" },
];

interface Coords { lat: number; lng: number; }

function detectContext(params: URLSearchParams): "sorties" | "idees" | "all" {
  const ctx = params.get("context");
  if (ctx === "sorties") return "sorties";
  if (ctx === "idees") return "idees";
  const t = params.get("type");
  if (t === "event" || t === "promo" || t === "sport" || t === "marche") return "sorties";
  if (t === "idee" || t === "probleme") return "idees";
  return "all";
}

export default function SubmitForm() {
  const searchParams = useSearchParams();
  const context = detectContext(searchParams);
  const types = context === "sorties" ? TYPES_SORTIES : context === "idees" ? TYPES_IDEES : TYPES_ALL;

  const defaultType = ((): SubmitType => {
    const t = searchParams.get("type") as SubmitType | null;
    if (t && TYPES_ALL.some((x) => x.key === t)) return t;
    return types[0].key;
  })();

  const [type, setType] = useState<SubmitType>(defaultType);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "modere" | "publie">(null);
  const [error, setError] = useState<string | null>(null);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [sportType, setSportType] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [ville, setVille] = useState("Auxerre");
  const [nomCommerce, setNomCommerce] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const t = searchParams.get("type") as SubmitType | null;
    if (t && TYPES_ALL.some((x) => x.key === t)) setType(t);
  }, [searchParams]);

  // catégorie auto-définie pour sport et marche
  const autoCategorie: Record<string, string> = { sport: "sport", marche: "marche" };
  const categorieEffective = autoCategorie[type] ?? categorie;

  function resetMessages() { setError(null); }

  async function uploadPhoto(): Promise<string | null> {
    if (!photo) return null;
    const ext = photo.name.split(".").pop() ?? "jpg";
    const path = `${type}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("photos").upload(path, photo, { cacheControl: "3600", upsert: false });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    if (!coords) { setError("Merci de placer le repère sur la carte."); return; }

    setSubmitting(true);
    try {
      const isEvent = type === "event" || type === "sport" || type === "marche";

      if (isEvent) {
        if (!titre || !categorieEffective || !dateDebut)
          throw new Error("Titre, catégorie et date de début sont obligatoires.");
        const sport = SPORTS.find((s) => s.key === sportType);
        const titreComplet = type === "sport" && sport
          ? `${sport.emoji} ${sport.label} — ${titre}`
          : titre;
        const photoUrl = await uploadPhoto();
        const { error: err } = await supabase.from("events").insert({
          titre: titreComplet,
          description: description || null,
          categorie: categorieEffective,
          date_debut: new Date(dateDebut).toISOString(),
          date_fin: dateFin ? new Date(dateFin).toISOString() : null,
          lat: coords.lat,
          lng: coords.lng,
          lieu_nom: ville || null,
          photo_url: photoUrl,
          email_contact: null,
          valide: true,
        });
        if (err) throw err;
        setDone("publie");
      } else if (type === "promo") {
        if (!description || !dateFin)
          throw new Error("Description et heure de fin sont obligatoires.");
        const photoUrl = await uploadPhoto();
        const { error: err } = await supabase.from("promos").insert({
          description,
          nom_commerce: nomCommerce || null,
          date_fin: new Date(dateFin).toISOString(),
          lat: coords.lat,
          lng: coords.lng,
          email_contact: null,
          photo_url: photoUrl,
          valide: false,
        });
        if (err) throw err;
        setDone("modere");
      } else {
        if (!categorie || !description)
          throw new Error("Catégorie et description sont obligatoires.");
        const photoUrl = await uploadPhoto();
        const { error: err } = await supabase.from("signalements").insert({
          type: type === "idee" ? "idee" : "probleme",
          categorie,
          description,
          photo_url: photoUrl,
          lat: coords.lat,
          lng: coords.lng,
        });
        if (err) throw err;
        setDone("publie");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  function changeType(t: SubmitType) {
    setType(t);
    setCategorie("");
    resetMessages();
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mb-4 text-6xl">🎉</div>
        <h2 className="text-xl font-bold text-slate-900">Merci !</h2>
        <p className="mt-2 text-slate-600">
          {done === "modere"
            ? "Votre soumission a bien été reçue. Elle sera publiée après une rapide validation."
            : "C'est en ligne ! Merci de contribuer à votre ville."}
        </p>
        <a href="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-medium text-white active:scale-95">
          Retour à la carte
        </a>
      </div>
    );
  }

  const isEvent = type === "event" || type === "sport" || type === "marche";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5 p-4 pb-28 md:pb-12">
      {/* Choix du type */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Qu'aimeriez-vous partager ?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {types.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => changeType(t.key)}
              className={[
                "rounded-2xl border p-3 text-left transition active:scale-95",
                type === t.key ? "border-primary bg-primary-50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div className="text-2xl">{t.emoji}</div>
              <div className="font-semibold text-slate-900">{t.label}</div>
              <div className="text-xs text-slate-500">{t.aide}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Titre (événements) */}
      {isEvent && (
        <Field label="Titre *">
          <input
            className="input"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder={
              type === "sport" ? "Match AJA vs Lyon…"
              : type === "marche" ? "Marché de Noël d'Auxerre…"
              : "Concert au bord de l'Yonne…"
            }
          />
        </Field>
      )}

      {/* Nom du commerce (promo) */}
      {type === "promo" && (
        <Field label="Nom du commerce">
          <input className="input" value={nomCommerce} onChange={(e) => setNomCommerce(e.target.value)} placeholder="Le Café de la Paix" />
        </Field>
      )}

      {/* Catégorie libre pour "event" seulement (sport et marche sont auto) */}
      {type === "event" && (
        <Field label="Catégorie *">
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES_LIBRES.map(({ key, emoji, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategorie(key)}
                className={[
                  "rounded-full border px-3 py-2 text-sm transition active:scale-95",
                  categorie === key ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Catégorie pour signalement / idée */}
      {(type === "probleme" || type === "idee") && (
        <Field label="Catégorie *">
          <div className="flex flex-wrap gap-2">
            {Object.entries(type === "idee" ? IDEE_CATEGORIES : SIGNALEMENT_CATEGORIES).map(([key, { emoji, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategorie(key)}
                className={[
                  "rounded-full border px-3 py-2 text-sm transition active:scale-95",
                  categorie === key ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Description */}
      <Field label={type === "promo" ? "La promo *" : "Description"}>
        <textarea
          className="input min-h-[90px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === "promo" ? "-20% sur toute la boutique ce week-end !"
            : isEvent ? "Quelques mots pour donner envie…"
            : "Décrivez en une phrase."
          }
        />
      </Field>

      {/* Sélecteur de sport */}
      {type === "sport" && (
        <Field label="Sport *">
          <div className="flex flex-wrap gap-2">
            {SPORTS.map(({ key, emoji, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSportType(key)}
                className={[
                  "rounded-full border px-3 py-2 text-sm transition active:scale-95",
                  sportType === key ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Champs événements */}
      {isEvent && (
        <>
          <Field label="Ville">
            <input className="input" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Auxerre" />
          </Field>
          <Field label="Date et heure de début *">
            <input type="datetime-local" className="input" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </Field>
          <Field label="Fin (optionnel)">
            <input type="datetime-local" className="input" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </Field>
        </>
      )}

      {/* Fin de promo */}
      {type === "promo" && (
        <Field label="La promo se termine à *">
          <input type="datetime-local" className="input" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
        </Field>
      )}

      {/* Photo */}
      {(isEvent || type === "probleme" || type === "idee" || type === "promo") && (
        <Field label="Photo (optionnel)">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-primary"
          />
        </Field>
      )}


      {/* Localisation */}
      <Field label="Où ? *">
        <LocationPicker value={coords} onChange={setCoords} />
      </Field>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? "Envoi…" : "Partager"}
      </button>

      <p className="text-center text-xs text-slate-400">
        {type === "promo"
          ? "Validé manuellement avant publication."
          : "Publié immédiatement et visible par tous."}
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
