# Auxerre Map 📍

La **carte citoyenne** d'Auxerre (89000) : événements du soir, bons plans des bars
et restos, commerces ouverts, et signalements pour améliorer la ville.
PWA installable, gratuite, sans pub, sans compte.

- **Stack** : Next.js 14 (App Router) · Supabase (BDD + Storage) · Leaflet + OpenStreetMap · Tailwind CSS
- **Déploiement** : Vercel
- **Mobile-first**, palette blanc & bleu (`#1D4ED8`), pensé pour être compris en 10 secondes.

---

## 1. Installation locale

```bash
npm install
cp .env.local.example .env.local   # puis renseignez vos clés Supabase
npm run dev                         # http://localhost:3000
```

## 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (gratuit).
2. **SQL Editor** → collez et exécutez le contenu de [`supabase/schema.sql`](supabase/schema.sql).
   Cela crée les tables, la RLS, les fonctions de vote et le bucket `photos`.
3. **Project Settings → API** → copiez dans `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, **jamais** exposé au navigateur)

> Le bucket `photos` doit être **public** (le script SQL le crée ; sinon créez-le via Storage).

## 3. Pré-remplir les commerces depuis OpenStreetMap

```bash
npm run seed
```

Récupère les restaurants, bars, fast-foods et commerces d'Auxerre via l'API
Overpass et les insère dans la table `pois` (`source = 'osm'`). Relançable :
les anciens imports OSM sont remplacés.

## 4. Déploiement sur Vercel

1. Importez le dépôt dans Vercel.
2. Ajoutez les 3 variables d'environnement (mêmes valeurs que `.env.local`).
3. Déployez. Le service worker et le manifest rendent l'app installable.

---

## Fonctionnalités

| Page | Rôle |
|------|------|
| `/` | Site vitrine : présentation de l'app (hero, fonctionnalités, « comment ça marche ») |
| `/carte` | Carte plein écran + barre de filtres (Événements 🎵 / Promos 🔥 / Commerces 🍽️ / Signalements 🚧) |
| `/liste` | Vue liste : « Ce soir », « Cette semaine », promos actives, idées les plus votées |
| `/soumettre` | Formulaire unique adaptatif (événement / promo / signalement / idée) |
| `/poi/[id]` | Fiche commerce : photo, horaires, badge « Ouvert maintenant », appel & itinéraire |

- **Marqueurs emoji** par catégorie ; événements du jour avec halo bleu ; promos actives qui **pulsent** 🔥.
- **Promos** avec heure de fin → expirent automatiquement (filtrées par la RLS).
- **Signalements & idées** publiés directement, **vote +1** anti-spam (localStorage + hash IP côté serveur), bouton « Signaler un abus » (masquage auto à 3 signalements).

## Modération

- **Événements & promos** : insérés avec `valide = false`, invisibles tant que vous ne les validez pas
  dans le **Table Editor** de Supabase (passez `valide` à `true`).
- **Signalements & idées** : visibles immédiatement ; masqués automatiquement au-delà de 3 abus.

## Sécurité

- La clé `anon` est protégée par la **Row Level Security** (lecture publique limitée, écritures encadrées).
- Les votes et la modération passent par des fonctions `SECURITY DEFINER` ou la clé `service_role`,
  utilisée **uniquement** dans les routes API serveur (`/api/vote`, `/api/abus`).

## Structure

```
src/
  app/            pages (carte, liste, soumettre, poi/[id]) + routes API
  components/     MapView, FilterBar, SubmitForm, VoteButton, …
  lib/            supabase, types, config (catégories/emojis), horaires, dates
supabase/schema.sql   schéma complet à exécuter
scripts/seed-osm.mjs  import OpenStreetMap
public/               manifest, service worker, icônes
```
