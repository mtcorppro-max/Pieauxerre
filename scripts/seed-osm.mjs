// Pré-remplit la table `pois` avec les commerces d'Auxerre depuis OpenStreetMap
// (API Overpass). Usage :  npm run seed
//
// Requiert NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
// (lancé via `node --env-file=.env.local`).

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  process.exit(1);
}

// Boîte englobante : 40 km de rayon autour d'Auxerre (sud, ouest, nord, est)
const BBOX = "47.4382,3.0366,48.1590,4.1096";

// Endpoints alternatifs si le principal est surchargé
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const QUERY = `
[out:json][timeout:60];
(
  node["amenity"~"^(restaurant|bar|cafe|pub|fast_food)$"]["name"](${BBOX});
  node["shop"]["name"](${BBOX});
);
out body;
`;

function mapCategorie(tags) {
  const a = tags.amenity;
  if (a === "restaurant") return "restaurant";
  if (a === "fast_food") return "fast_food";
  if (a === "bar" || a === "pub" || a === "cafe") return "bar";
  if (tags.shop) return "commerce";
  return null;
}

function buildAdresse(tags) {
  const num = tags["addr:housenumber"];
  const rue = tags["addr:street"];
  if (rue) return [num, rue].filter(Boolean).join(" ");
  return null;
}

async function fetchOverpass(query) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`  → ${endpoint}`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "AuxerreMap/1.0 (contact: bymrts.pro@gmail.com)",
        },
        body: query,
      });
      if (res.ok) return res.json();
      console.log(`  ⚠️  ${res.status} — essai suivant…`);
    } catch {
      console.log("  ⚠️  Erreur réseau — essai suivant…");
    }
  }
  throw new Error("Tous les endpoints Overpass ont échoué.");
}

async function main() {
  console.log("📡 Requête Overpass pour Auxerre…");
  const json = await fetchOverpass(QUERY);

  const rows = [];
  const vus = new Set();
  for (const el of json.elements ?? []) {
    if (el.type !== "node" || !el.tags?.name) continue;
    const categorie = mapCategorie(el.tags);
    if (!categorie) continue;

    // Dédoublonne par nom + position arrondie
    const cle = `${el.tags.name}-${el.lat.toFixed(4)}-${el.lon.toFixed(4)}`;
    if (vus.has(cle)) continue;
    vus.add(cle);

    rows.push({
      nom: el.tags.name,
      categorie,
      lat: el.lat,
      lng: el.lon,
      adresse: buildAdresse(el.tags),
      telephone: el.tags.phone ?? el.tags["contact:phone"] ?? null,
      website: el.tags.website ?? el.tags["contact:website"] ?? null,
      horaires: null,
      photo_url: null,
      source: "osm",
    });
  }

  console.log(`✅ ${rows.length} commerces trouvés.`);
  if (rows.length === 0) return;

  const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

  // Remplace les imports OSM précédents pour éviter les doublons.
  console.log("🧹 Suppression des anciens imports OSM…");
  await supabase.from("pois").delete().eq("source", "osm");

  console.log("⬆️  Insertion…");
  const TAILLE = 200;
  for (let i = 0; i < rows.length; i += TAILLE) {
    const lot = rows.slice(i, i + TAILLE);
    const { error } = await supabase.from("pois").insert(lot);
    if (error) {
      console.error("❌ Erreur d'insertion :", error.message);
      process.exit(1);
    }
    console.log(`   ${Math.min(i + TAILLE, rows.length)}/${rows.length}`);
  }

  console.log("🎉 Terminé. Les commerces apparaissent sur la carte.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
