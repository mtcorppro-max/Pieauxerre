// Configuration centrale : Auxerre, catégories, emojis, libellés.
// Tout ce qui pilote les marqueurs, filtres et formulaires est ici.

import type {
  EntraideType,
  EventCategorie,
  PoiCategorie,
  Remuneration,
  SignalementType,
} from "./types";

// Centre du département de l'Yonne (89)
export const AUXERRE_CENTER: [number, number] = [47.85, 3.55];
export const DEFAULT_ZOOM = 9;
export const MIN_ZOOM = 8;
export const MAX_ZOOM = 19;

// Limite de pan : tout le département de l'Yonne
// [sud-ouest, nord-est]
export const AUXERRE_BOUNDS: [[number, number], [number, number]] = [
  [47.25, 2.80],
  [48.45, 4.35],
];

// --- Événements -------------------------------------------------------------
export const EVENT_CATEGORIES: Record<
  EventCategorie,
  { emoji: string; label: string }
> = {
  musique: { emoji: "🎵", label: "Musique" },
  sport:   { emoji: "⚽", label: "Sport" },
  marche:  { emoji: "🛍️", label: "Marché / Brocante" },
  culture: { emoji: "🎭", label: "Culture" },
  bar:     { emoji: "🍺", label: "Bar / Restaurant" },
  autre:   { emoji: "📌", label: "Autre" },
};

// --- Commerces (POI) --------------------------------------------------------
export const POI_CATEGORIES: Record<
  PoiCategorie,
  { emoji: string; label: string }
> = {
  restaurant: { emoji: "🍽️", label: "Restaurant" },
  bar: { emoji: "🍺", label: "Bar" },
  fast_food: { emoji: "🍔", label: "Fast-food" },
  commerce: { emoji: "🛒", label: "Commerce" },
};

// --- Signalements (problèmes) ----------------------------------------------
export const SIGNALEMENT_CATEGORIES: Record<
  string,
  { emoji: string; label: string }
> = {
  voirie: { emoji: "🚧", label: "Voirie" },
  mobilier: { emoji: "🪑", label: "Mobilier urbain" },
  eclairage: { emoji: "💡", label: "Éclairage" },
  vegetalisation: { emoji: "🌳", label: "Espaces verts" },
  proprete: { emoji: "🚮", label: "Propreté" },
  mobilite: { emoji: "🚲", label: "Mobilité douce" },
};

// --- Idées citoyennes -------------------------------------------------------
export const IDEE_CATEGORIES: Record<
  string,
  { emoji: string; label: string }
> = {
  amenagement: { emoji: "🪑", label: "Aménagement" },
  vegetalisation: { emoji: "🌳", label: "Végétalisation" },
  culture: { emoji: "🎨", label: "Culture" },
  mobilite: { emoji: "🚲", label: "Mobilité" },
  animation: { emoji: "🎪", label: "Animation" },
};

export const PROMO_EMOJI = "🔥";

// --- Entraide citoyenne -------------------------------------------------------
export const ENTRAIDE_TYPES: Record<EntraideType, { emoji: string; label: string }> = {
  tondeuse:    { emoji: "🌿", label: "Tondeuse / Taille" },
  demenagement:{ emoji: "📦", label: "Déménagement" },
  courses:     { emoji: "🛒", label: "Courses" },
  bricolage:   { emoji: "🔧", label: "Bricolage" },
  garde:       { emoji: "🐾", label: "Garde (animaux / enfants)" },
  covoiturage: { emoji: "🚗", label: "Covoiturage" },
  autre:       { emoji: "🤝", label: "Autre" },
};

export const REMUNERATION_OPTIONS: Record<Remuneration, { emoji: string; label: string }> = {
  argent:  { emoji: "💰", label: "Rémunéré (argent)" },
  biere:   { emoji: "🍺", label: "Bières offertes" },
  service: { emoji: "🔄", label: "Service rendu" },
  cafe:    { emoji: "☕", label: "Café offert" },
  rien:    { emoji: "❤️", label: "Bénévolat" },
};

export const ENTRAIDE_EMOJI = "🤝";

// Emoji d'un signalement/idée selon son type et sa catégorie
export function signalementEmoji(
  type: SignalementType,
  categorie: string
): string {
  const table = type === "idee" ? IDEE_CATEGORIES : SIGNALEMENT_CATEGORIES;
  return table[categorie]?.emoji ?? (type === "idee" ? "💡" : "🚧");
}

export function signalementLabel(
  type: SignalementType,
  categorie: string
): string {
  const table = type === "idee" ? IDEE_CATEGORIES : SIGNALEMENT_CATEGORIES;
  return table[categorie]?.label ?? categorie;
}
