export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function nextWeekday(targetDay: number, hour: number): Date {
  const now = new Date();
  let diff = (targetDay - now.getDay() + 7) % 7;
  if (diff === 0 && now.getHours() >= hour + 1) diff = 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function nthWeekdayOfMonth(n: number, targetDay: number, hour: number): Date {
  const now = new Date();
  function calc(year: number, month: number): Date {
    const first = new Date(year, month, 1);
    const diff = (targetDay - first.getDay() + 7) % 7;
    return new Date(year, month, 1 + diff + (n - 1) * 7, hour, 0, 0, 0);
  }
  let result = calc(now.getFullYear(), now.getMonth());
  if (result <= now) {
    const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    result = calc(nm.getFullYear(), nm.getMonth());
  }
  return result;
}

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.IMPORT_SECRET)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Récupère tous les événements récurrents dont la date est passée
  const { data: events, error } = await supabase
    .from("events")
    .select("id, recurrence_rule, date_debut, date_fin")
    .not("recurrence_rule", "is", null)
    .lt("date_debut", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!events?.length) return NextResponse.json({ updated: 0 });

  let updated = 0;
  for (const ev of events) {
    const rule: string = ev.recurrence_rule;
    const oldDebut = new Date(ev.date_debut);
    const oldFin   = ev.date_fin ? new Date(ev.date_fin) : null;
    const duree    = oldFin ? oldFin.getTime() - oldDebut.getTime() : 5 * 3600 * 1000;

    let newDebut: Date;
    if (rule === "weekly") {
      newDebut = nextWeekday(oldDebut.getDay(), oldDebut.getHours());
    } else if (rule.startsWith("monthly:")) {
      const [, n, day] = rule.split(":").map(Number);
      newDebut = nthWeekdayOfMonth(n, day, oldDebut.getHours());
    } else continue;

    const newFin = new Date(newDebut.getTime() + duree);
    await supabase
      .from("events")
      .update({ date_debut: newDebut.toISOString(), date_fin: newFin.toISOString() })
      .eq("id", ev.id);
    updated++;
  }

  return NextResponse.json({ updated });
}
