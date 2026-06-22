import SubHeader from "@/components/SubHeader";
import TrouvaillesClient from "@/components/TrouvaillesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Animaux & objets perdus/trouvés — PieYonne" };

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Perdus & Trouvés" />
      <TrouvaillesClient />
    </div>
  );
}
