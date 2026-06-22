import SubHeader from "@/components/SubHeader";
import TrouvailleForm from "@/components/TrouvailleForm";

export const metadata = { title: "Signaler un animal ou objet — PieYonne" };

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Animal ou objet perdu/trouvé" />
      <TrouvailleForm />
    </div>
  );
}
