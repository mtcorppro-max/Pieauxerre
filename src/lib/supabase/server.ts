import { createClient } from "@supabase/supabase-js";

// Client serveur. Deux usages :
//  - lectures publiques (anon, comme le navigateur) via supabaseServer()
//  - opérations privilégiées (votes, modération) via supabaseAdmin()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon";

export function supabaseServer() {
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

// Clé service_role : contourne la RLS. À n'utiliser QUE dans les route handlers.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante (requise côté serveur).");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
