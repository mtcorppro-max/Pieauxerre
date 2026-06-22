"use client";

import { useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  AUXERRE_BOUNDS,
  AUXERRE_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from "@/lib/config";
import type { MapPoint } from "@/lib/types";

function makeIcon(point: MapPoint): L.DivIcon {
  const classes = ["emoji-marker"];
  if (point.isPromo) classes.push("emoji-marker--promo");
  else if (point.isToday) classes.push("emoji-marker--today");

  return L.divIcon({
    // className "emoji-divicon" remplace le 'leaflet-div-icon' par défaut
    // (qui ajoute un fond blanc et une bordure indésirables).
    className: "emoji-divicon",
    html: `<div class="${classes.join(" ")}" aria-hidden="true">${point.emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

interface MapViewProps {
  points: MapPoint[];
  className?: string;
}

export default function MapView({ points, className }: MapViewProps) {
  // Mémorise les icônes pour éviter de les recréer à chaque rendu.
  const items = useMemo(
    () => points.map((p) => ({ point: p, icon: makeIcon(p) })),
    [points]
  );

  return (
    <MapContainer
      center={AUXERRE_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={AUXERRE_BOUNDS}
      maxBoundsViscosity={0.8}
      zoomControl={false}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      {/* Fond moderne CARTO Voyager (retina via {r}) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {items.map(({ point, icon }) => (
        <Marker key={`${point.layer}-${point.id}`} position={[point.lat, point.lng]} icon={icon}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-slate-900">
                {point.emoji} {point.titre}
              </p>
              {point.sousTitre && (
                <p className="mt-0.5 text-slate-600 line-clamp-3">{point.sousTitre}</p>
              )}
              {point.href && (
                <Link
                  href={point.href}
                  className="mt-2 inline-block font-medium text-primary"
                >
                  Voir la fiche →
                </Link>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
