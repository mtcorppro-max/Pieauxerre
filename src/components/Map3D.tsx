"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MlMap, type Marker as MlMarker } from "maplibre-gl";
import {
  AUXERRE_BOUNDS,
  AUXERRE_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
} from "@/lib/config";
import type { MapPoint } from "@/lib/types";

// Tuiles vectorielles gratuites (sans clé API) — rues modernes + hauteurs bâtiments.
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Conversions Leaflet (lat,lng) -> MapLibre (lng,lat)
const CENTER: [number, number] = [AUXERRE_CENTER[1], AUXERRE_CENTER[0]];
const BOUNDS: [[number, number], [number, number]] = [
  [AUXERRE_BOUNDS[0][1], AUXERRE_BOUNDS[0][0]], // sud-ouest [lng,lat]
  [AUXERRE_BOUNDS[1][1], AUXERRE_BOUNDS[1][0]], // nord-est [lng,lat]
];

const DEFAULT_PITCH = 50;

function markerElement(point: MapPoint): HTMLElement {
  const el = document.createElement("div");
  const classes = ["emoji-marker"];
  if (point.isPromo) classes.push("emoji-marker--promo");
  else if (point.isToday) classes.push("emoji-marker--today");
  el.className = classes.join(" ");
  el.textContent = point.emoji;
  el.setAttribute("aria-hidden", "true");
  return el;
}

const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;

function popupHtml(point: MapPoint): string {
  const sous = point.sousTitre
    ? `<p style="margin:.25rem 0 0;color:#475569">${escapeHtml(point.sousTitre)}</p>`
    : "";
  const lien = point.href && point.layer !== "trouvailles"
    ? `<a href="${point.href}" style="display:inline-flex;align-items:center;gap:4px;margin-top:.4rem;font-size:13px;font-weight:600;color:#1D4ED8">Voir le détail ${CHEVRON_RIGHT}</a>`
    : "";
  const navOnclick = `(function(){var u=/iPad|iPhone|iPod/.test(navigator.userAgent)?'maps://maps.apple.com/?daddr=${point.lat},${point.lng}':'https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}';window.open(u,'_blank')})()`;
  const navBtn = `<button onclick="${navOnclick}" style="display:inline-flex;align-items:center;gap:5px;margin-top:.5rem;padding:5px 12px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">${CHEVRON_RIGHT} M'y emmener</button>`;
  return `<div style="min-width:170px;font-size:14px;line-height:1.45">
      <p style="margin:0;font-weight:600;color:#0f172a">${point.emoji} ${escapeHtml(point.titre)}</p>
      ${sous}
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px">
        ${navBtn}${lien}
      </div>
    </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string
  );
}

// Ajoute une couche d'extrusion 3D des bâtiments si le style ne l'a pas déjà.
function add3dBuildings(map: MlMap) {
  const style = map.getStyle();
  const hasExtrusion = style.layers?.some((l) => l.type === "fill-extrusion");
  if (hasExtrusion) return;

  // Trouve la 1re couche de libellés pour insérer les bâtiments en dessous.
  const firstSymbol = style.layers?.find((l) => l.type === "symbol")?.id;
  try {
    map.addLayer(
      {
        id: "auxerre-3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#d9dee8",
          "fill-extrusion-height": [
            "interpolate", ["linear"], ["zoom"],
            14, 0,
            15.5, ["coalesce", ["get", "render_height"], 6],
          ],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.9,
        },
      },
      firstSymbol
    );
  } catch {
    /* la source n'existe pas dans ce style : on ignore */
  }
}

interface Map3DProps {
  points: MapPoint[];
}

export default function Map3D({ points }: Map3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<MlMarker[]>([]);
  const orbitRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [is3d, setIs3d] = useState(true);
  const [orbiting, setOrbiting] = useState(false);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: -18,
      maxBounds: BOUNDS,
      attributionControl: { compact: true },
      dragRotate: true,
      cooperativeGestures: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      add3dBuildings(map);
      setReady(true);
    });

    map.on("mousedown", stopOrbit);
    map.on("touchstart", stopOrbit);
    map.on("wheel", stopOrbit);

    return () => {
      stopOrbit();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Re)place les marqueurs quand les points changent
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const p of points) {
      const marker = new maplibregl.Marker({ element: markerElement(p), anchor: "center" })
        .setLngLat([p.lng, p.lat])
        .setPopup(new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(popupHtml(p)))
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [points, ready]);

  function stopOrbit() {
    if (orbitRef.current !== null) {
      cancelAnimationFrame(orbitRef.current);
      orbitRef.current = null;
    }
    setOrbiting(false);
  }

  function toggleOrbit() {
    const map = mapRef.current;
    if (!map) return;
    if (orbitRef.current !== null) {
      stopOrbit();
      return;
    }
    setOrbiting(true);
    const step = () => {
      map.setBearing(map.getBearing() + 0.25);
      orbitRef.current = requestAnimationFrame(step);
    };
    orbitRef.current = requestAnimationFrame(step);
  }

  function toggle3d() {
    const map = mapRef.current;
    if (!map) return;
    const next = !is3d;
    setIs3d(next);
    map.easeTo({ pitch: next ? DEFAULT_PITCH : 0, bearing: next ? -18 : 0, duration: 700 });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" style={{ touchAction: "none" }} />

      {/* Bandeau d'aide */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-medium text-white backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="font-semibold">Auxerre 3D</span>
          <span className="hidden text-slate-300 sm:inline">
            molette : zoom · glisser : déplacer · clic droit : incliner
          </span>
        </div>
      </div>

      {/* Contrôles (droite) */}
      <div className="absolute right-3 top-1/2 z-[500] flex -translate-y-1/2 flex-col gap-2">
        <CtrlBtn label="Zoomer" onClick={() => mapRef.current?.zoomIn()}>+</CtrlBtn>
        <CtrlBtn label="Dézoomer" onClick={() => mapRef.current?.zoomOut()}>−</CtrlBtn>
        <CtrlBtn label={is3d ? "Vue du dessus" : "Vue 3D"} onClick={toggle3d}>
          {is3d ? "2D" : "3D"}
        </CtrlBtn>
        <CtrlBtn label="Orbite" active={orbiting} onClick={toggleOrbit}>
          ⟳
        </CtrlBtn>
      </div>
    </div>
  );
}

function CtrlBtn({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold shadow-soft backdrop-blur transition active:scale-95",
        active ? "bg-primary text-white" : "bg-white/95 text-slate-700 hover:bg-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
