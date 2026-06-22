import { createClient } from "@supabase/supabase-js";

// Client navigateur : clé anonyme uniquement (protégé par RLS).
// Réutilisé entre les composants (singleton).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Avertissement clair en dev plutôt qu'une erreur cryptique plus loin.
  // eslint-disable-next-line no-console
  console.warn(
    "[PieYonne] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants. " +
      "Copiez .env.local.example en .env.local et renseignez vos clés."
  );
}

export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon", {
  auth: { persistSession: false },
});
