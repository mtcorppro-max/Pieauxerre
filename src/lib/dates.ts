// Helpers de dates en français (sans dépendance externe)

const FMT_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const FMT_HEURE = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateLongue(iso: string): string {
  return FMT_DATE.format(new Date(iso));
}

export function formatHeure(iso: string): string {
  return FMT_HEURE.format(new Date(iso));
}

export function formatDateHeure(iso: string): string {
  return `${formatDateLongue(iso)} à ${formatHeure(iso)}`;
}

function memeJour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** L'événement a-t-il lieu aujourd'hui ? (chevauchement avec le jour courant) */
export function estAujourdhui(
  dateDebut: string,
  dateFin: string | null,
  now: Date = new Date()
): boolean {
  const debut = new Date(dateDebut);
  const fin = dateFin ? new Date(dateFin) : debut;
  if (memeJour(debut, now)) return true;
  // En cours : commencé avant aujourd'hui mais pas encore terminé
  return debut <= now && fin >= now;
}

/** Dans les 7 prochains jours (à partir de maintenant). */
export function estCetteSemaine(
  dateDebut: string,
  now: Date = new Date()
): boolean {
  const debut = new Date(dateDebut);
  const dans7j = new Date(now);
  dans7j.setDate(now.getDate() + 7);
  return debut >= now && debut <= dans7j;
}

/** Temps restant lisible avant une échéance, ex. "encore 2 h 15". */
export function tempsRestant(dateFin: string, now: Date = new Date()): string {
  const diffMin = Math.round((new Date(dateFin).getTime() - now.getTime()) / 60000);
  if (diffMin <= 0) return "terminé";
  if (diffMin < 60) return `encore ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m === 0 ? `encore ${h} h` : `encore ${h} h ${String(m).padStart(2, "0")}`;
}
