import SubHeader from "@/components/SubHeader";
import ListClient from "@/components/ListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ce qui se passe à Auxerre — événements & promos",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="À Auxerre en ce moment" />
      <ListClient />
    </div>
  );
}
