import SubHeader from "@/components/SubHeader";
import EntraideForm from "@/components/EntraideForm";

export const metadata = {
  title: "Demander de l'aide — Yonne+",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Demander de l'aide" />
      <EntraideForm />
    </div>
  );
}
