// Types du domaine PieYonne

export type PoiCategorie = "restaurant" | "bar" | "fast_food" | "commerce";
export type EventCategorie = "musique" | "sport" | "marche" | "culture" | "bar" | "autre";
export type SignalementType = "probleme" | "idee";
export type EntraideType = "tondeuse" | "demenagement" | "courses" | "bricolage" | "garde" | "covoiturage" | "autre";
export type Remuneration = "argent" | "biere" | "service" | "cafe" | "rien";

// Horaires : pour chaque jour, une liste de créneaux [ouverture, fermeture]
export type JourCle = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";
export type Horaires = Partial<Record<JourCle, [string, string][]>>;

export interface Poi {
  id: string;
  nom: string;
  categorie: PoiCategorie;
  lat: number;
  lng: number;
  adresse: string | null;
  horaires: Horaires | null;
  telephone: string | null;
  website: string | null;
  photo_url: string | null;
  source: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  titre: string;
  description: string | null;
  categorie: EventCategorie;
  date_debut: string;
  date_fin: string | null;
  lat: number;
  lng: number;
  lieu_nom: string | null;
  photo_url: string | null;
  email_contact: string | null;
  valide: boolean;
  created_at: string;
}

export interface Promo {
  id: string;
  poi_id: string | null;
  nom_commerce: string | null;
  description: string;
  lat: number;
  lng: number;
  date_fin: string;
  email_contact: string | null;
  photo_url: string | null;
  valide: boolean;
  created_at: string;
}

export interface Signalement {
  id: string;
  type: SignalementType;
  categorie: string;
  description: string;
  commune: string | null;
  photo_url: string | null;
  lat: number;
  lng: number;
  votes: number;
  abus: number;
  masque: boolean;
  created_at: string;
}

export type TrouvailleCategorie = "animal" | "objet";
export type TrouvailleStatut = "trouve" | "perdu";

export interface Trouvaille {
  id: string;
  categorie: TrouvailleCategorie;
  statut: TrouvailleStatut;
  description: string;
  photo_url: string | null;
  lat: number;
  lng: number;
  telephone: string | null;
  resolu: boolean;
  created_at: string;
  expires_at: string;
}

export interface Pharmacie {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  lat: number;
  lng: number;
  source: string | null;
  created_at: string;
}

export interface Garde {
  id: string;
  pharmacie_id: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
  pharmacie?: Pharmacie;
}

export interface Veterinaire {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  urgences: boolean;
  lat: number;
  lng: number;
  source: string | null;
  created_at: string;
}

export interface Entraide {
  id: string;
  type_aide: EntraideType;
  description: string;
  adresse: string | null;
  lat: number;
  lng: number;
  remuneration: Remuneration;
  telephone: string | null;
  created_at: string;
  expires_at: string;
  actif: boolean;
}

// Élément unifié posé sur la carte (tous types confondus)
export type MapLayer = "events" | "promos" | "pois" | "signalements" | "entraide" | "trouvailles";

export interface MapPoint {
  id: string;
  layer: MapLayer;
  lat: number;
  lng: number;
  emoji: string;
  titre: string;
  sousTitre?: string;
  isToday?: boolean;   // halo bleu
  isPromo?: boolean;   // pulse orange
  href?: string;       // lien vers une fiche
  raw: Poi | EventItem | Promo | Signalement | Entraide | Trouvaille;
}
