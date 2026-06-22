export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const MOIS: Record<string, number> = {
  janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

function parseDate(texte: string): { debut: string; fin: string | null } | null {
  // "Vendredi 19 juin 2026 (21h30)" ou "Du lundi 6 au vendredi 10 juillet 2026"
  const heureMatch = texte.match(/\((\d+)h(\d*)\)/);
  const heure = heureMatch ? parseInt(heureMatch[1]) : 20;
  const minutes = heureMatch?.[2] ? parseInt(heureMatch[2]) : 0;

  // Multi-jours : "Du ... au ..."
  const multiMatch = texte.match(/[Dd]u\s+\w+\s+(\d+)\s+au\s+\w+\s+(\d+)\s+(\w+)\s+(\d{4})/);
  if (multiMatch) {
    const [, jourDebut, jourFin, moisStr, annee] = multiMatch;
    const mois = MOIS[moisStr.toLowerCase()];
    if (!mois) return null;
    const debut = new Date(parseInt(annee), mois - 1, parseInt(jourDebut), heure, minutes).toISOString();
    const fin   = new Date(parseInt(annee), mois - 1, parseInt(jourFin), 23, 59).toISOString();
    return { debut, fin };
  }

  // Jour unique : "Vendredi 19 juin 2026"
  const simpleMatch = texte.match(/(\d+)\s+(\w+)\s+(\d{4})/);
  if (simpleMatch) {
    const [, jour, moisStr, annee] = simpleMatch;
    const mois = MOIS[moisStr.toLowerCase()];
    if (!mois) return null;
    const debut = new Date(parseInt(annee), mois - 1, parseInt(jour), heure, minutes).toISOString();
    return { debut, fin: null };
  }

  return null;
}

function slugToCategory(slug: string): string {
  if (/concert|musique|festival|jazz|rock|harmonie|chant|chorale|orchestre/.test(slug)) return "musique";
  if (/theatre|expo|spectacle|culture|cinema|conference|lecture|humour|comedie/.test(slug)) return "culture";
  if (/sport|foot|rugby|basket|tennis|natation|velo|course|match|tournoi/.test(slug)) return "sport";
  if (/marche|brocante|vide.grenier|foire|salon|artisan/.test(slug)) return "marche";
  if (/bar|cabaret|guinguette|soiree/.test(slug)) return "bar";
  return "autre";
}

// Géocode une commune via l'API adresse du gouvernement français
async function geocodeCommune(commune: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${commune}, Yonne`);
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${query}&type=municipality&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const feat = data.features?.[0];
    if (!feat) return null;
    return { lng: feat.geometry.coordinates[0], lat: feat.geometry.coordinates[1] };
  } catch {
    return null;
  }
}

// Extrait la commune (avant la parenthèse du lieu)
function parseCommune(lieuTexte: string): string {
  return lieuTexte.split("(")[0].trim();
}

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.IMPORT_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const html = await fetch("https://my89.fr/sortir-dans-l-yonne.php", {
      headers: { "User-Agent": "PieYonne/1.0 (agenda citoyen Yonne)" },
    }).then((r) => r.text());

    const $ = cheerio.load(html);
    const events: Record<string, unknown>[] = [];
    const geocodeCache: Record<string, { lat: number; lng: number } | null> = {};

    const anchors = $("a[href*='agenda.php?sortie=']").toArray();

    for (const el of anchors) {
      const a = $(el);
      const slug = a.attr("href")?.replace("agenda.php?sortie=", "") ?? "";
      const titre = a.find("h4").text().trim() || a.find("h3").text().trim();
      const dateTexte = a.find(".w").first().text().trim();
      const ville     = a.find(".ville").text().trim();
      const lieuNom   = a.find(".lieu").text().trim();
      const lieuTexte = lieuNom ? `${ville} (${lieuNom})` : ville;
      const photoSrc  = a.find("img").attr("src") ?? "";
      const photo_url = photoSrc.startsWith("http") ? photoSrc : `https://www.my89.fr/${photoSrc}`;

      if (!titre || !dateTexte) continue;

      const dates = parseDate(dateTexte);
      if (!dates) continue;

      // On ne prend que les événements futurs ou d'aujourd'hui
      if (new Date(dates.debut) < new Date(Date.now() - 86_400_000)) continue;

      const commune = ville || parseCommune(lieuTexte);
      const categorie = slugToCategory(slug);

      // Géocode avec cache pour éviter les doublons d'appels
      if (commune && !geocodeCache[commune]) {
        geocodeCache[commune] = await geocodeCommune(commune);
      }
      const coords = commune ? geocodeCache[commune] : null;
      if (!coords) continue;

      events.push({
        titre,
        description: lieuTexte || null,
        categorie,
        date_debut: dates.debut,
        date_fin: dates.fin,
        lat: coords.lat,
        lng: coords.lng,
        lieu_nom: lieuTexte || commune,
        photo_url: photo_url.includes("mini-") ? photo_url : null,
        email_contact: null,
        valide: true,
        source_slug: slug,
      });
    }

    if (events.length === 0) {
      return NextResponse.json({ inserted: 0, message: "Aucun événement futur trouvé." });
    }

    // Upsert sur source_slug pour éviter les doublons
    const { error } = await supabase
      .from("events")
      .upsert(events, { onConflict: "source_slug", ignoreDuplicates: true })
      .select("id");

    if (error) throw error;

    return NextResponse.json({
      message: `Import terminé`,
      parsed: events.length,
      inserted: events.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
