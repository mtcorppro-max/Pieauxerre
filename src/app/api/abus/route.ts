import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Signaler un abus sur un signalement/idée. Le masquage automatique
// au-delà du seuil est géré côté base (fonction signaler_abus).
export async function POST(req: Request) {
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin().rpc("signaler_abus", { p_id: body.id });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Signalement impossible" }, { status: 500 });
  }
}
