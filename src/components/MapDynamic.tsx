"use client";

import dynamic from "next/dynamic";

// MapLibre GL a besoin du DOM : on désactive le rendu serveur.
const MapView = dynamic(() => import("./Map3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <p className="animate-pulse text-slate-500">Chargement de la carte…</p>
    </div>
  ),
});

export default MapView;
