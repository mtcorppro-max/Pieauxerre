/**
 * Seed pharmacies + vétérinaires à Auxerre depuis OpenStreetMap (Overpass API).
 * Usage : node --env-file=.env.local scripts/seed-sante.mjs
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const BBOX = "47.4382,3.0366,48.1590,4.1096";

async function overpassQuery(query) {
  const body = `[out:json][timeout:25];\n${query}\nout body;`;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`  → ${endpoint}`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "User-Agent": "AuxerreMap/1.0 (contact: bymrts.pro@gmail.com)" },
        body: new URLSearchParams({ data: body }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.elements ?? [];
      }
      console.log(`  ⚠️  ${res.status} — essai suivant…`);
    } catch {
      console.log("  ⚠️  Erreur réseau — essai suivant…");
    }
  }
  throw new Error("Tous les endpoints Overpass ont échoué.");
}

function extractTags(el) {
  const t = el.tags ?? {};
  const nom = t.name ?? t["name:fr"] ?? null;
  const adresse = [t["addr:housenumber"], t["addr:street"], t["addr:city"]]
    .filter(Boolean)
    .join(" ") || null;
  const telephone = t.phone ?? t["contact:phone"] ?? null;

  let lat = el.lat;
  let lng = el.lon;
  if (el.type === "way" || el.type === "relation") {
    lat = el.center?.lat;
    lng = el.center?.lon;
  }
  return { nom, adresse, telephone, lat, lng };
}

async function seedPharmacies() {
  console.log("🔍 Recherche des pharmacies à Auxerre…");
  const elements = await overpassQuery(
    `(node[amenity=pharmacy](${BBOX});way[amenity=pharmacy](${BBOX}););out center;`
  );

  const rows = elements
    .map(extractTags)
    .filter((r) => r.nom && r.lat && r.lng)
    .map((r) => ({ ...r, source: "osm" }));

  if (rows.length === 0) {
    console.log("  ⚠️  Aucune pharmacie trouvée.");
    return;
  }

  await supabase.from("pharmacies").delete().eq("source", "osm");
  const { error } = await supabase.from("pharmacies").insert(rows);

  if (error) {
    console.error("  ❌ Erreur insertion pharmacies :", error.message);
  } else {
    console.log(`  ✅ ${rows.length} pharmacies importées.`);
    rows.forEach((r) => console.log(`     - ${r.nom} (${r.adresse ?? "sans adresse"})`));
  }
}

async function seedVeterinaires() {
  console.log("🔍 Recherche des vétérinaires à Auxerre…");
  const elements = await overpassQuery(
    `(node[amenity=veterinary](${BBOX});way[amenity=veterinary](${BBOX}););out center;`
  );

  const rows = elements
    .map(extractTags)
    .filter((r) => r.nom && r.lat && r.lng)
    .map((r) => ({ ...r, urgences: false, source: "osm" }));

  if (rows.length === 0) {
    console.log("  ⚠️  Aucun vétérinaire trouvé.");
    return;
  }

  await supabase.from("veterinaires").delete().eq("source", "osm");
  const { error } = await supabase.from("veterinaires").insert(rows);

  if (error) {
    console.error("  ❌ Erreur insertion vétérinaires :", error.message);
  } else {
    console.log(`  ✅ ${rows.length} vétérinaires importés.`);
    rows.forEach((r) => console.log(`     - ${r.nom} (${r.adresse ?? "sans adresse"})`));
  }
}

async function main() {
  console.log("🏥 Seed santé — Auxerre Map\n");
  await seedPharmacies();
  console.log();
  await seedVeterinaires();
  console.log("\n✔ Terminé. Pensez à :");
  console.log("  1. Vérifier/compléter les numéros de téléphone dans Supabase");
  console.log("  2. Marquer les vétérinaires d'urgence (urgences = true)");
  console.log("  3. Saisir le planning de gardes dans la table gardes");
}

main().catch((e) => { console.error(e); process.exit(1); });
