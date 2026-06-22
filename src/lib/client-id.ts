// Identité anonyme de l'appareil + suivi local des votes (anti-spam côté client,
// complété par le contrôle IP côté serveur).

const ID_KEY = "auxerre_client_id";
const VOTES_KEY = "auxerre_votes";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function hasVotedLocally(signalementId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list: string[] = JSON.parse(localStorage.getItem(VOTES_KEY) ?? "[]");
    return list.includes(signalementId);
  } catch {
    return false;
  }
}

export function markVotedLocally(signalementId: string): void {
  if (typeof window === "undefined") return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem(VOTES_KEY) ?? "[]");
    if (!list.includes(signalementId)) {
      list.push(signalementId);
      localStorage.setItem(VOTES_KEY, JSON.stringify(list));
    }
  } catch {
    localStorage.setItem(VOTES_KEY, JSON.stringify([signalementId]));
  }
}
