import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Empreinte anti-spam = hash(IP + identifiant client). Ni l'IP ni l'id
// ne sont stockés en clair, seulement le hash.
function fingerprint(ip: string, clientId: string): string {
  return createHash("sha256").update(`${ip}|${clientId}`).digest("hex");
}

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(req: Request) {
  let body: { id?: string; clientId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { id, clientId } = body;
  if (!id || !clientId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const fp = fingerprint(getIp(req), clientId);

  try {
    const { data, error } = await supabaseAdmin().rpc("vote_signalement", {
      p_id: id,
      p_fingerprint: fp,
    });
    if (error) throw error;

    if (data === -1) {
      return NextResponse.json({ alreadyVoted: true }, { status: 409 });
    }
    return NextResponse.json({ votes: data });
  } catch {
    return NextResponse.json({ error: "Vote impossible" }, { status: 500 });
  }
}
