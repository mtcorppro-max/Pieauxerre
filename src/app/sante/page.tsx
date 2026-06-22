import SubHeader from "@/components/SubHeader";
import SanteClient from "@/components/SanteClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pharmacies & Vétérinaires — PieYonne",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Santé & Animaux" />
      <SanteClient />
    </div>
  );
}
