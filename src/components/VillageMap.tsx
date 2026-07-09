"use client";

import { useEffect, useRef, useState } from "react";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

type Layer = "street" | "satellite" | "terrain";

const layers: Record<Layer, { url: string; attr: string; label: string }> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "© OpenStreetMap", label: "Map",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri", label: "Satellite",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: "© OpenTopoMap", label: "Terrain",
  },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { L?: any; }
}

export default function VillageMap() {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileRef = useRef<any>(null);
  const [layer, setLayer] = useState<Layer>("street");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = LEAFLET_CSS;
      document.head.appendChild(l);
    }
    function init() {
      const L = window.L!;
      if (!ref.current || mapRef.current) return;
      const map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true }).setView([37.505, 29.55], 12);
      mapRef.current = map;
      tileRef.current = L.tileLayer(layers.street.url, { attribution: layers.street.attr, maxZoom: 17 }).addTo(map);
      const icon = (emoji: string) => L.divIcon({
        html: `<div style="font-size:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">${emoji}</div>`,
        className: "", iconSize: [24, 24], iconAnchor: [12, 12],
      });
      L.marker([37.505, 29.55], { icon: icon("🏡") }).addTo(map).bindPopup("<b>Güney</b><br>The village");
      L.marker([37.556, 29.679], { icon: icon("💧") }).addTo(map).bindPopup("<b>Lake Salda</b><br>~8 km east");
      L.marker([37.503, 29.757], { icon: icon("🏛️") }).addTo(map).bindPopup("<b>Yeşilova</b><br>District town");
      setReady(true);
    }
    if (window.L) init();
    else if (!document.querySelector(`script[src="${LEAFLET_JS}"]`)) {
      const s = document.createElement("script");
      s.src = LEAFLET_JS; s.onload = init; document.body.appendChild(s);
    } else {
      const t = setInterval(() => { if (window.L) { clearInterval(t); init(); } }, 100);
      return () => clearInterval(t);
    }
  }, []);

  function switchLayer(next: Layer) {
    const L = window.L!;
    if (!mapRef.current || !L) return;
    if (tileRef.current) mapRef.current.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(layers[next].url, { attribution: layers[next].attr, maxZoom: 17 }).addTo(mapRef.current);
    setLayer(next);
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-sand" style={{ height: 340 }}>
      <div ref={ref} className="w-full h-full bg-sand z-0" />
      {ready && (
        <div className="absolute top-3 right-3 z-[400] flex gap-1 bg-white/90 backdrop-blur rounded-full p-1 shadow">
          {(Object.keys(layers) as Layer[]).map((k) => (
            <button key={k} onClick={() => switchLayer(k)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                layer === k ? "bg-olive text-cream" : "text-faded hover:bg-sand"}`}>
              {layers[k].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
