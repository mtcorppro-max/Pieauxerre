import SubHeader from "@/components/SubHeader";
import ListClient from "@/components/ListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sorties dans l'Yonne — événements & promos",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Sorties dans l'Yonne" />
      <ListClient />
    </div>
  );
}
