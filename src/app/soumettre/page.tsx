import SubHeader from "@/components/SubHeader";
import SubmitForm from "@/components/SubmitForm";

export const metadata = {
  title: "Partager — PieYonne",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SubHeader title="Partager" />
      <SubmitForm />
    </div>
  );
}
