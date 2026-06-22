-- ============================================================================
--  Auxerre Map — Schéma Supabase (PostgreSQL)
--  À exécuter dans le SQL Editor du dashboard Supabase.
--  Inclut : tables, index, fonction de vote anti-spam, RLS et bucket Storage.
-- ============================================================================

-- Extensions utiles
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
--  1. POIs (commerces) : restaurants, bars, fast-foods, commerces
-- ----------------------------------------------------------------------------
create table if not exists public.pois (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  categorie   text not null check (categorie in ('restaurant', 'bar', 'fast_food', 'commerce')),
  lat         double precision not null,
  lng         double precision not null,
  adresse     text,
  horaires    jsonb,            -- { "lun": [["12:00","14:00"],["19:00","22:00"]], ... }
  telephone   text,
  website     text,
  photo_url   text,
  source      text default 'manuel',  -- 'osm' | 'manuel'
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  2. Événements (soumis par commerces / associations, modérés)
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  titre         text not null,
  description   text,
  categorie     text not null check (categorie in ('musique', 'sport', 'marche', 'culture', 'autre')),
  date_debut    timestamptz not null,
  date_fin      timestamptz,
  lat           double precision not null,
  lng           double precision not null,
  lieu_nom      text,
  photo_url     text,
  email_contact text,
  valide        boolean not null default false,   -- modération manuelle
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  3. Promos en temps réel (expirent automatiquement via date_fin)
-- ----------------------------------------------------------------------------
create table if not exists public.promos (
  id            uuid primary key default gen_random_uuid(),
  poi_id        uuid references public.pois (id) on delete set null,
  nom_commerce  text,                              -- si pas de POI lié
  description   text not null,
  lat           double precision not null,
  lng           double precision not null,
  date_fin      timestamptz not null,
  email_contact text,
  valide        boolean not null default false,    -- modération manuelle
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  4. Signalements & idées citoyennes (publiés directement)
-- ----------------------------------------------------------------------------
create table if not exists public.signalements (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('probleme', 'idee')),
  categorie   text not null,   -- voirie, mobilier, eclairage, proprete, vegetalisation, mobilite, animation, amenagement, culture
  description text not null,
  photo_url   text,
  lat         double precision not null,
  lng         double precision not null,
  commune     text,
  votes       integer not null default 0,
  abus        integer not null default 0,   -- nombre de signalements d'abus
  masque      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Empreintes de vote (anti-spam : 1 vote par appareil/IP par signalement)
create table if not exists public.votes_log (
  signalement_id uuid not null references public.signalements (id) on delete cascade,
  fingerprint    text not null,        -- hash IP + client id
  created_at     timestamptz not null default now(),
  primary key (signalement_id, fingerprint)
);

-- ----------------------------------------------------------------------------
--  Index pour les requêtes carte / liste
-- ----------------------------------------------------------------------------
create index if not exists idx_events_valide_date on public.events (valide, date_debut);
create index if not exists idx_promos_valide_fin   on public.promos (valide, date_fin);
create index if not exists idx_signalements_type   on public.signalements (type, masque, votes desc);
create index if not exists idx_pois_categorie      on public.pois (categorie);

-- ----------------------------------------------------------------------------
--  Fonction RPC de vote (atomique + anti-spam par empreinte)
--  Retourne le nouveau total de votes, ou -1 si déjà voté.
-- ----------------------------------------------------------------------------
create or replace function public.vote_signalement(p_id uuid, p_fingerprint text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
begin
  -- Tente d'enregistrer l'empreinte ; conflit = déjà voté
  insert into public.votes_log (signalement_id, fingerprint)
  values (p_id, p_fingerprint)
  on conflict do nothing;

  if not found then
    return -1;  -- déjà voté depuis cet appareil
  end if;

  update public.signalements
     set votes = votes + 1
   where id = p_id
  returning votes into v_total;

  return coalesce(v_total, -1);
end;
$$;

-- Signaler un abus (incrémente le compteur, masque au-delà du seuil)
create or replace function public.signaler_abus(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.signalements
     set abus = abus + 1,
         masque = (abus + 1 >= 3)   -- masqué automatiquement à partir de 3 abus
   where id = p_id;
end;
$$;

-- ============================================================================
--  Row Level Security (RLS)
-- ============================================================================
alter table public.pois         enable row level security;
alter table public.events       enable row level security;
alter table public.promos       enable row level security;
alter table public.signalements enable row level security;
alter table public.votes_log    enable row level security;

-- Lecture publique : POIs (tous)
create policy "pois lisibles par tous"
  on public.pois for select using (true);

-- Lecture publique : seuls les events validés
create policy "events valides lisibles"
  on public.events for select using (valide = true);

-- Lecture publique : seules les promos validées et non expirées
create policy "promos valides lisibles"
  on public.promos for select using (valide = true and date_fin > now());

-- Lecture publique : signalements non masqués
create policy "signalements visibles"
  on public.signalements for select using (masque = false);

-- Insertion publique anonyme : events (publication directe)
create policy "soumission event anonyme"
  on public.events for insert with check (true);

-- Insertion publique anonyme : promos (en attente de modération)
create policy "soumission promo anonyme"
  on public.promos for insert with check (valide = false);

-- Insertion publique anonyme : signalements / idées (publiés directement)
create policy "soumission signalement anonyme"
  on public.signalements for insert with check (true);

-- NB : les votes et la modération (update/delete) passent par les fonctions
-- SECURITY DEFINER ou par la clé service_role côté serveur, jamais par anon.

-- ----------------------------------------------------------------------------
--  5. Entraide citoyenne (expire automatiquement après 7 jours)
-- ----------------------------------------------------------------------------
create table if not exists public.entraide (
  id            uuid primary key default gen_random_uuid(),
  type_aide     text not null check (type_aide in ('tondeuse', 'demenagement', 'courses', 'bricolage', 'garde', 'covoiturage', 'autre')),
  description   text not null,
  adresse       text,
  lat           double precision not null,
  lng           double precision not null,
  remuneration  text not null default 'biere'
                  check (remuneration in ('argent', 'biere', 'service', 'cafe', 'rien')),
  telephone     text,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '7 days',
  actif         boolean not null default true
);

create index if not exists idx_entraide_actif on public.entraide (actif, expires_at);

alter table public.entraide enable row level security;

create policy "entraide lisible par tous"
  on public.entraide for select
  using (actif = true and expires_at > now());

create policy "soumission entraide anonyme"
  on public.entraide for insert
  with check (true);

-- ----------------------------------------------------------------------------
--  6. Pharmacies & planning de gardes
-- ----------------------------------------------------------------------------
create table if not exists public.pharmacies (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  adresse     text,
  telephone   text,
  lat         double precision not null,
  lng         double precision not null,
  source      text default 'manuel',
  created_at  timestamptz not null default now()
);

create table if not exists public.gardes (
  id             uuid primary key default gen_random_uuid(),
  pharmacie_id   uuid not null references public.pharmacies (id) on delete cascade,
  date_debut     timestamptz not null,
  date_fin       timestamptz not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_gardes_dates on public.gardes (date_debut, date_fin);

alter table public.pharmacies enable row level security;
alter table public.gardes     enable row level security;

create policy "pharmacies lisibles par tous"
  on public.pharmacies for select using (true);

create policy "gardes lisibles par tous"
  on public.gardes for select using (true);

-- ----------------------------------------------------------------------------
--  7. Vétérinaires
-- ----------------------------------------------------------------------------
create table if not exists public.veterinaires (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  adresse     text,
  telephone   text,
  urgences    boolean not null default false,
  lat         double precision not null,
  lng         double precision not null,
  source      text default 'manuel',
  created_at  timestamptz not null default now()
);

alter table public.veterinaires enable row level security;

create policy "veterinaires lisibles par tous"
  on public.veterinaires for select using (true);

-- ============================================================================
--  Storage : bucket public pour les photos (signalements & commerces)
--  Exécutez aussi ceci, ou créez le bucket "photos" (public) via l'UI.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "upload photos anonyme"
  on storage.objects for insert
  with check (bucket_id = 'photos');

create policy "lecture photos publique"
  on storage.objects for select
  using (bucket_id = 'photos');
