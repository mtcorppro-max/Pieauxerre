"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MlMap, type Marker as MlMarker } from "maplibre-gl";
import Supercluster from "supercluster";
import {
  AUXERRE_BOUNDS,
  AUXERRE_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
} from "@/lib/config";
import type { MapPoint } from "@/lib/types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

const CENTER: [number, number] = [AUXERRE_CENTER[1], AUXERRE_CENTER[0]];
const BOUNDS: [[number, number], [number, number]] = [
  [AUXERRE_BOUNDS[0][1], AUXERRE_BOUNDS[0][0]],
  [AUXERRE_BOUNDS[1][1], AUXERRE_BOUNDS[1][0]],
];

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

// Pastille de regroupement (plusieurs activités au même endroit)
function clusterElement(count: number): HTMLElement {
  const el = document.createElement("div");
  el.className = "cluster-marker";
  el.textContent = String(count);
  return el;
}

const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string
  );
}

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

interface Map3DProps {
  points: MapPoint[];
}

type ClusterProps = { cluster: true; cluster_id: number; point_count: number };
type LeafProps = { cluster?: false; point: MapPoint };

export default function Map3D({ points }: Map3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<MlMarker[]>([]);
  const clusterRef = useRef<Supercluster<LeafProps, ClusterProps> | null>(null);
  const renderRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      pitch: 0,
      bearing: 0,
      maxBounds: BOUNDS,
      attributionControl: { compact: true },
      dragRotate: false,
      cooperativeGestures: false,
    });
    mapRef.current = map;

    map.on("load", () => setReady(true));

    // Recalcule les marqueurs/pastilles à chaque déplacement ou zoom
    const onMove = () => renderRef.current();
    map.on("moveend", onMove);
    map.on("zoomend", onMove);

    return () => {
      map.off("moveend", onMove);
      map.off("zoomend", onMove);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // (Re)construit l'index de clustering quand les points changent
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const index = new Supercluster<LeafProps, ClusterProps>({
      radius: 48,
      maxZoom: 16,
    });
    index.load(
      points.map((p) => ({
        type: "Feature" as const,
        properties: { point: p },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      }))
    );
    clusterRef.current = index;

    // Dessine les marqueurs visibles pour la vue courante
    const render = () => {
      const m = mapRef.current;
      const idx = clusterRef.current;
      if (!m || !idx) return;

      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];

      const b = m.getBounds();
      const bbox: [number, number, number, number] = [
        b.getWest(), b.getSouth(), b.getEast(), b.getNorth(),
      ];
      const zoom = Math.round(m.getZoom());
      const clusters = idx.getClusters(bbox, zoom);

      for (const c of clusters) {
        const [lng, lat] = c.geometry.coordinates;
        const props = c.properties;

        if ("cluster" in props && props.cluster) {
          const el = clusterElement(props.point_count);
          el.addEventListener("click", () => {
            const expansion = idx.getClusterExpansionZoom(props.cluster_id);
            m.easeTo({ center: [lng, lat], zoom: Math.min(expansion, MAX_ZOOM), duration: 500 });
          });
          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(m);
          markersRef.current.push(marker);
        } else {
          const p = props.point;
          const el = markerElement(p);
          const popup = new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(popupHtml(p));
          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(m);
          markersRef.current.push(marker);
        }
      }
    };

    renderRef.current = render;
    render();
  }, [points, ready]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" style={{ touchAction: "none" }} />

      {/* Contrôles zoom */}
      <div className="absolute right-3 top-1/2 z-[500] flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          aria-label="Zoomer"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-xl font-semibold shadow-soft backdrop-blur active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Dézoomer"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-xl font-semibold shadow-soft backdrop-blur active:scale-95"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Ma position"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition((pos) => {
              mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 });
            });
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-lg shadow-soft backdrop-blur active:scale-95"
        >
          📍
        </button>
      </div>
    </div>
  );
}
