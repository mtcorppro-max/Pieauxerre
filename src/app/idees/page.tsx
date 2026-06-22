import { Suspense } from "react";
import SubHeader from "@/components/SubHeader";
import IdeePageClient from "@/components/IdeePageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Idées & signalements — Yonne+",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Idées & signalements" />
      <Suspense fallback={<p className="p-6 text-center text-slate-400">Chargement…</p>}>
        <IdeePageClient />
      </Suspense>
    </div>
  );
}
