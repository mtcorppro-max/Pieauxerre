import SubHeader from "@/components/SubHeader";
import EntraideList from "@/components/EntraideList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entraide à Auxerre — PieYonne",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Entraide" />
      <EntraideList />
    </div>
  );
}
