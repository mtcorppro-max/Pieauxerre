import HomeClient from "@/components/HomeClient";

// La carte plein écran (le cœur applicatif). Toute la logique est côté client
// (Leaflet + données temps réel), donc on délègue à HomeClient.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "La carte — PieYonne",
};

export default function Page() {
  return <HomeClient />;
}
