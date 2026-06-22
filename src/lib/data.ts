// Récupération des données depuis Supabase et transformation en MapPoint.
import { supabase } from "./supabase/client";
import {
  ENTRAIDE_EMOJI,
  ENTRAIDE_TYPES,
  EVENT_CATEGORIES,
  POI_CATEGORIES,
  PROMO_EMOJI,
  signalementEmoji,
  signalementLabel,
} from "./config";
import { estAujourdhui } from "./dates";
import type {
  Entraide,
  EventItem,
  Garde,
  MapPoint,
  Pharmacie,
  Poi,
  Promo,
  Signalement,
  Trouvaille,
  Veterinaire,
} from "./types";

export async function fetchPois(): Promise<Poi[]> {
  const { data, error } = await supabase.from("pois").select("*").limit(5000);
  if (error) throw error;
  return data ?? [];
}

export async function fetchEvents(): Promise<EventItem[]> {
  // La RLS ne renvoie que les events validés.
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date_debut", new Date(Date.now() - 12 * 3600 * 1000).toISOString())
    .order("date_debut", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPromos(): Promise<Promo[]> {
  // La RLS ne renvoie que les promos validées et non expirées.
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .order("date_fin", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSignalements(): Promise<Signalement[]> {
  const { data, error } = await supabase
    .from("signalements")
    .select("*")
    .order("votes", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Conversion en points cartographiques ----------------------------------

export function poiToPoint(p: Poi): MapPoint {
  return {
    id: p.id,
    layer: "pois",
    lat: p.lat,
    lng: p.lng,
    emoji: POI_CATEGORIES[p.categorie]?.emoji ?? "🛒",
    titre: p.nom,
    sousTitre: p.adresse ?? undefined,
    href: p.website ?? undefined,
    raw: p,
  };
}

export function eventToPoint(e: EventItem): MapPoint {
  return {
    id: e.id,
    layer: "events",
    lat: e.lat,
    lng: e.lng,
    emoji: EVENT_CATEGORIES[e.categorie]?.emoji ?? "📌",
    titre: e.titre,
    sousTitre: e.lieu_nom ?? undefined,
    isToday: estAujourdhui(e.date_debut, e.date_fin),
    raw: e,
  };
}

export function promoToPoint(p: Promo): MapPoint {
  return {
    id: p.id,
    layer: "promos",
    lat: p.lat,
    lng: p.lng,
    emoji: PROMO_EMOJI,
    titre: p.description,
    sousTitre: p.nom_commerce ?? undefined,
    isPromo: true,
    href: p.poi_id ? `/poi/${p.poi_id}` : undefined,
    raw: p,
  };
}

export function signalementToPoint(s: Signalement): MapPoint {
  return {
    id: s.id,
    layer: "signalements",
    lat: s.lat,
    lng: s.lng,
    emoji: signalementEmoji(s.type, s.categorie),
    titre: signalementLabel(s.type, s.categorie),
    sousTitre: s.description,
    raw: s,
  };
}

export async function fetchPharmacies(): Promise<Pharmacie[]> {
  const { data, error } = await supabase
    .from("pharmacies")
    .select("*")
    .order("nom", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchGardeActuelle(): Promise<Garde | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("gardes")
    .select("*, pharmacie:pharmacies(*)")
    .lte("date_debut", now)
    .gte("date_fin", now)
    .order("date_debut", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchProchainesGardes(): Promise<Garde[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("gardes")
    .select("*, pharmacie:pharmacies(*)")
    .gte("date_fin", now)
    .order("date_debut", { ascending: true })
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function fetchVeterinaires(): Promise<Veterinaire[]> {
  const { data, error } = await supabase
    .from("veterinaires")
    .select("*")
    .order("urgences", { ascending: false })
    .order("nom", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTrouvailles(): Promise<Trouvaille[]> {
  const { data, error } = await supabase
    .from("trouvailles")
    .select("*")
    .eq("resolu", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function trouvailleToPoint(t: Trouvaille): MapPoint {
  const emoji = t.categorie === "animal"
    ? (t.statut === "trouve" ? "🐕" : "🔍")
    : (t.statut === "trouve" ? "📦" : "🔍");
  const titre = t.categorie === "animal"
    ? (t.statut === "trouve" ? "Animal trouvé" : "Animal perdu")
    : (t.statut === "trouve" ? "Objet trouvé" : "Objet perdu");
  return {
    id: t.id,
    layer: "trouvailles",
    lat: t.lat,
    lng: t.lng,
    emoji,
    titre,
    sousTitre: t.description,
    href: `/trouvailles/${t.id}`,
    raw: t,
  };
}

export async function fetchEntraide(): Promise<Entraide[]> {
  const { data, error } = await supabase
    .from("entraide")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function entraideToPoint(e: Entraide): MapPoint {
  return {
    id: e.id,
    layer: "entraide",
    lat: e.lat,
    lng: e.lng,
    emoji: ENTRAIDE_TYPES[e.type_aide]?.emoji ?? ENTRAIDE_EMOJI,
    titre: ENTRAIDE_TYPES[e.type_aide]?.label ?? "Entraide",
    sousTitre: e.description,
    href: `/entraide/${e.id}`,
    raw: e,
  };
}
