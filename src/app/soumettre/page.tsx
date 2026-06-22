import { Suspense } from "react";
import SubHeader from "@/components/SubHeader";
import SubmitForm from "@/components/SubmitForm";

export const metadata = {
  title: "Partager — Yonne+",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Partager" />
      <Suspense fallback={<p className="p-6 text-center text-slate-400">Chargement…</p>}>
        <SubmitForm />
      </Suspense>
    </div>
  );
}
