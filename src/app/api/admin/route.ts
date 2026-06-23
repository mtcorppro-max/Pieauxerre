export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

function auth(req: Request): boolean {
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

const TABLES = ["events", "signalements", "entraide", "trouvailles"] as const;
type AllowedTable = (typeof TABLES)[number];

function validTable(t: string | null): t is AllowedTable {
  return TABLES.includes(t as AllowedTable);
}

export async function GET(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  if (!validTable(table)) return NextResponse.json({ error: "Table invalide" }, { status: 400 });

  const { data, error } = await supabase()
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");
  if (!validTable(table) || !id) return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });

  const { error } = await supabase().from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");
  if (!validTable(table) || !id) return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });

  const body = await req.json();
  const { error } = await supabase().from(table).update(body).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
