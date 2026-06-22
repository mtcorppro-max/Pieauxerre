"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import {
  AUXERRE_BOUNDS,
  AUXERRE_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from "@/lib/config";
import AddressSearch from "./AddressSearch";

const pinIcon = L.divIcon({
  className: "emoji-divicon",
  html: `<div class="emoji-marker" style="border-color:#1D4ED8">📍</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// Recentre la carte quand la position change de l'extérieur (géoloc).
function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 16));
  }, [map, position]);
  return null;
}

// Place le pin au clic sur la carte.
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [geolocStatus, setGeolocStatus] = useState<"idle" | "loading" | "error">(
    "idle"
  );

  const position: [number, number] = useMemo(
    () => (value ? [value.lat, value.lng] : AUXERRE_CENTER),
    [value]
  );

  function localiser() {
    if (!("geolocation" in navigator)) {
      setGeolocStatus("error");
      return;
    }
    setGeolocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeolocStatus("idle");
      },
      () => setGeolocStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="space-y-2">
      {/* Option 1 : taper une adresse (géocodée et posée sur la carte) */}
      <AddressSearch onPick={onChange} />

      <p className="text-center text-xs text-slate-400">— ou positionnez sur la carte —</p>

      {/* Option 2 : positionner directement sur la carte */}
      <div className="h-64 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          center={position}
          zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          maxBounds={AUXERRE_BOUNDS}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          <ClickHandler onPick={(lat, lng) => onChange({ lat, lng })} />
          {value && (
            <>
              <Recenter position={[value.lat, value.lng]} />
              <Marker
                position={[value.lat, value.lng]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend(e) {
                    const m = e.target.getLatLng();
                    onChange({ lat: m.lat, lng: m.lng });
                  },
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={localiser}
          className="rounded-xl bg-primary-50 px-4 py-2 text-sm font-medium text-primary active:scale-95"
        >
          📍 Me localiser
        </button>
        <p className="text-xs text-slate-500">
          {value
            ? "Glissez le pin ou touchez la carte pour ajuster."
            : "Touchez la carte pour placer le repère."}
        </p>
      </div>
      {geolocStatus === "error" && (
        <p className="text-xs text-red-600">
          Localisation indisponible — placez le repère manuellement sur la carte.
        </p>
      )}
    </div>
  );
}
