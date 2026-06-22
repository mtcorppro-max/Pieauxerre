"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      Chargement de la carte…
    </div>
  ),
});

export default LocationPicker;
