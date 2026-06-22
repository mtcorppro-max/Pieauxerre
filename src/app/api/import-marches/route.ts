import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


// 0=Dim 1=Lun 2=Mar 3=Mer 4=Jeu 5=Ven 6=Sam
const MARCHES = [
  { titre: "Marché de Sens",                      commune: "Sens",                    jour: 1, hDebut: 8,  hFin: 19, desc: "Marché couvert, conventionnel",           recurrence: "weekly" },
  { titre: "Marché d'Auxerre",                    commune: "Auxerre",                 jour: 2, hDebut: 8,  hFin: 13, desc: "Marché plein air, mixte",                 recurrence: "weekly" },
  { titre: "Marché d'Avallon",                    commune: "Avallon",                 jour: 2, hDebut: 8,  hFin: 13, desc: "Marché couvert + plein air, mixte",       recurrence: "weekly" },
  { titre: "Marché de Joigny",                    commune: "Joigny",                  jour: 3, hDebut: 8,  hFin: 13, desc: "Marché couvert XIXe, mixte",              recurrence: "weekly" },
  { titre: "Marché de Noyers-sur-Serein",         commune: "Noyers-sur-Serein",       jour: 3, hDebut: 8,  hFin: 13, desc: "Marché village médiéval, mixte",         recurrence: "weekly" },
  { titre: "Marché de Saint-Sauveur-en-Puisaye",  commune: "Saint-Sauveur-en-Puisaye",jour: 3, hDebut: 8,  hFin: 13, desc: "Marché plein air, mixte",                recurrence: "weekly" },
  { titre: "Marché de Tonnerre",                  commune: "Tonnerre",                jour: 3, hDebut: 8,  hFin: 13, desc: "Marché halles historiques, mixte",        recurrence: "weekly" },
  { titre: "Marché bio de Vézelay",               commune: "Vézelay",                 jour: 3, hDebut: 8,  hFin: 12, desc: "Marché saisonnier bio (avr.–déc.)",       recurrence: "weekly" },
  { titre: "Marché d'Avallon",                    commune: "Avallon",                 jour: 4, hDebut: 8,  hFin: 13, desc: "Marché couvert + plein air, mixte",       recurrence: "weekly" },
  { titre: "Marché de Saint-Julien-du-Sault",     commune: "Saint-Julien-du-Sault",   jour: 4, hDebut: 8,  hFin: 12, desc: "Marché circuit court, ~20 producteurs",  recurrence: "weekly" },
  { titre: "Marché d'Auxerre",                    commune: "Auxerre",                 jour: 5, hDebut: 8,  hFin: 13, desc: "Marché plein air, mixte",                 recurrence: "weekly" },
  { titre: "Drive Ferme Vivante 89.10 — Bagneaux",commune: "Bagneaux",                jour: 5, hDebut: 8,  hFin: 18, desc: "Drive fermier, farines bio, lentilles",   recurrence: "monthly:3:5" },
  { titre: "Fermes du Ravillon — Neuilly",         commune: "Neuilly",                 jour: 5, hDebut: 16, hFin: 19, desc: "Vente à la ferme, céréales bio",          recurrence: "monthly:1:5" },
  { titre: "Marché bio de Neuilly-Valravillon",    commune: "Neuilly",                 jour: 5, hDebut: 16, hFin: 19, desc: "Marché associatif 100% bio",              recurrence: "monthly:2:5" },
  { titre: "Drive Ferme Vivante 89.10 — Saint-Clément", commune: "Saint-Clément",    jour: 5, hDebut: 8,  hFin: 18, desc: "Drive fermier, farines bio, lentilles",   recurrence: "monthly:3:5" },
  { titre: "Marché bio de Saint-Fargeau",         commune: "Saint-Fargeau",           jour: 5, hDebut: 8,  hFin: 13, desc: "Marché 100% bio",                         recurrence: "weekly" },
  { titre: "Marché de Sens",                      commune: "Sens",                    jour: 5, hDebut: 8,  hFin: 13, desc: "Marché couvert, conventionnel",           recurrence: "weekly" },
  { titre: "Grand Marché d'Auxerre",              commune: "Auxerre",                 jour: 6, hDebut: 8,  hFin: 13, desc: "Marché plein air, ~100 exposants",        recurrence: "weekly" },
  { titre: "Marché d'Avallon",                    commune: "Avallon",                 jour: 6, hDebut: 8,  hFin: 13, desc: "Marché couvert + plein air, mixte",       recurrence: "weekly" },
  { titre: "Marché de Joigny",                    commune: "Joigny",                  jour: 6, hDebut: 8,  hFin: 13, desc: "Marché couvert + plein air, mixte",       recurrence: "weekly" },
  { titre: "Marché bio de Seignelay",             commune: "Seignelay",               jour: 6, hDebut: 8,  hFin: 13, desc: "Marché bio régulier",                     recurrence: "weekly" },
  { titre: "Marché de Tonnerre",                  commune: "Tonnerre",                jour: 6, hDebut: 8,  hFin: 13, desc: "Marché halles historiques, mixte",        recurrence: "weekly" },
  { titre: "Marché de Toucy",                     commune: "Toucy",                   jour: 6, hDebut: 8,  hFin: 13, desc: "Marché 150 exposants, mixte",             recurrence: "weekly" },
  { titre: "Marché de Lainsecq",                  commune: "Lainsecq",                jour: 6, hDebut: 11, hFin: 13, desc: "Producteurs locaux + bar itinérant",      recurrence: "weekly" },
  { titre: "Marché de Chablis",                   commune: "Chablis",                 jour: 0, hDebut: 8,  hFin: 13, desc: "Marché cité viticole, mixte",             recurrence: "weekly" },
  { titre: "Marché bio de Quarré-les-Tombes",     commune: "Quarré-les-Tombes",       jour: 0, hDebut: 8,  hFin: 13, desc: "Marché bio et local",                    recurrence: "weekly" },
  { titre: "Marché de Saint-Julien-du-Sault",     commune: "Saint-Julien-du-Sault",   jour: 0, hDebut: 8,  hFin: 13, desc: "Marché circuit court",                   recurrence: "weekly" },
];

// Prochain jour de semaine à partir d'aujourd'hui
function nextWeekday(targetDay: number, hour: number): Date {
  const now = new Date();
  let diff = (targetDay - now.getDay() + 7) % 7;
  if (diff === 0 && now.getHours() >= hour + 1) diff = 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// Nième jour de semaine du mois (ex: 1er vendredi)
function nthWeekdayOfMonth(n: number, targetDay: number, hour: number): Date {
  const now = new Date();
  function calc(year: number, month: number): Date {
    const first = new Date(year, month, 1);
    const diff = (targetDay - first.getDay() + 7) % 7;
    const d = new Date(year, month, 1 + diff + (n - 1) * 7, hour, 0, 0, 0);
    return d;
  }
  let result = calc(now.getFullYear(), now.getMonth());
  if (result <= now) {
    const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    result = calc(nm.getFullYear(), nm.getMonth());
  }
  return result;
}

function nextOccurrence(recurrence: string, jour: number, hDebut: number): Date {
  if (recurrence === "weekly") return nextWeekday(jour, hDebut);
  const parts = recurrence.split(":");
  if (parts[0] === "monthly") {
    const n = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return nthWeekdayOfMonth(n, day, hDebut);
  }
  return nextWeekday(jour, hDebut);
}

async function geocodeCommune(commune: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${commune}, Yonne`);
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${q}&type=municipality&limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const feat = data.features?.[0];
    if (!feat) return null;
    return { lng: feat.geometry.coordinates[0], lat: feat.geometry.coordinates[1] };
  } catch { return null; }
}

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.IMPORT_SECRET)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const cache: Record<string, { lat: number; lng: number } | null> = {};
  const rows = [];
  const skipped = [];

  for (const m of MARCHES) {
    if (!cache[m.commune]) cache[m.commune] = await geocodeCommune(m.commune);
    const coords = cache[m.commune];
    if (!coords) { skipped.push(m.commune); continue; }

    const debut = nextOccurrence(m.recurrence, m.jour, m.hDebut);
    const fin   = new Date(debut);
    fin.setHours(m.hFin, 0, 0, 0);

    rows.push({
      titre: `🛍️ ${m.titre}`,
      description: m.desc,
      categorie: "marche",
      date_debut: debut.toISOString(),
      date_fin: fin.toISOString(),
      lat: coords.lat,
      lng: coords.lng,
      lieu_nom: m.commune,
      photo_url: "/marchai.png",
      valide: true,
      recurrence_rule: m.recurrence,
      source_slug: `marche-${m.titre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${m.jour}`,
    });
  }

  const { error } = await supabase
    .from("events")
    .upsert(rows, { onConflict: "source_slug", ignoreDuplicates: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ inserted: rows.length, skipped });
}
