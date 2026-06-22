import type { Horaires, JourCle } from "./types";

const JOURS: JourCle[] = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
// getDay() : 0 = dimanche … 6 = samedi

export const JOURS_LABELS: Record<JourCle, string> = {
  lun: "Lundi",
  mar: "Mardi",
  mer: "Mercredi",
  jeu: "Jeudi",
  ven: "Vendredi",
  sam: "Samedi",
  dim: "Dimanche",
};

export const JOURS_ORDRE: JourCle[] = [
  "lun",
  "mar",
  "mer",
  "jeu",
  "ven",
  "sam",
  "dim",
];

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Indique si un commerce est ouvert maintenant d'après ses horaires.
 * `now` est injectable pour les tests / le rendu serveur.
 */
export function estOuvertMaintenant(
  horaires: Horaires | null | undefined,
  now: Date = new Date()
): boolean {
  if (!horaires) return false;
  const jour = JOURS[now.getDay()];
  const creneaux = horaires[jour];
  if (!creneaux || creneaux.length === 0) return false;

  const t = now.getHours() * 60 + now.getMinutes();
  return creneaux.some(([debut, fin]) => {
    const d = minutes(debut);
    const f = minutes(fin);
    // Gère les créneaux qui passent minuit (ex. bar 19:00 → 02:00)
    return f > d ? t >= d && t < f : t >= d || t < f;
  });
}

/** Formate les créneaux d'un jour : "12:00–14:00, 19:00–22:00" ou "Fermé". */
export function formatJour(creneaux: [string, string][] | undefined): string {
  if (!creneaux || creneaux.length === 0) return "Fermé";
  return creneaux.map(([d, f]) => `${d}–${f}`).join(", ");
}
