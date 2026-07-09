"use client";

import { useEffect, useRef, useState } from "react";
import { POIS, type Poi } from "@/lib/pois";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

type Layer = "street" | "satellite" | "terrain";
const layers: Record<Layer, { url: string; attr: string; label: string }> = {
  street: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "© OpenStreetMap", label: "Map" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "© Esri", label: "Satellite" },
  terrain: { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attr: "© OpenTopoMap", label: "Terrain" },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { L?: any; }
}

const dirUrl = (q: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

export default function VillageMap({
  pois = POIS, center = [37.52, 29.6], zoom = 11, height = 340, controls = true,
}: { pois?: Poi[]; center?: [number, number]; zoom?: number; height?: number; controls?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileRef = useRef<any>(null);
  const [layer, setLayer] = useState<Layer>("street");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = LEAFLET_CSS; document.head.appendChild(l);
    }
    function init() {
      const L = window.L!;
      if (!ref.current || mapRef.current) return;
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
      mapRef.current = map;
      tileRef.current = L.tileLayer(layers.street.url, { attribution: layers.street.attr, maxZoom: 17 }).addTo(map);
      const icon = (emoji: string) => L.divIcon({
        html: `<div style="font-size:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">${emoji}</div>`,
        className: "", iconSize: [26, 26], iconAnchor: [13, 13],
      });
      for (const p of pois) {
        L.marker([p.lat, p.lng], { icon: icon(p.emoji) }).addTo(map).bindPopup(
          `<div style="min-width:150px">
             <b>${p.emoji} ${p.name}</b>
             <p style="margin:4px 0;font-size:12px;color:#555">${p.desc}</p>
             <a href="/gallery/${p.cat}" style="color:#b85c38;font-size:12px">Photos →</a>
             &nbsp;·&nbsp;
             <a href="${dirUrl(p.q)}" target="_blank" rel="noopener" style="color:#b85c38;font-size:12px">Directions ↗</a>
           </div>`
        );
      }
      setReady(true);
    }
    if (window.L) init();
    else if (!document.querySelector(`script[src="${LEAFLET_JS}"]`)) {
      const s = document.createElement("script"); s.src = LEAFLET_JS; s.onload = init; document.body.appendChild(s);
    } else {
      const t = setInterval(() => { if (window.L) { clearInterval(t); init(); } }, 100);
      return () => clearInterval(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchLayer(next: Layer) {
    const L = window.L!;
    if (!mapRef.current || !L) return;
    if (tileRef.current) mapRef.current.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(layers[next].url, { attribution: layers[next].attr, maxZoom: 17 }).addTo(mapRef.current);
    setLayer(next);
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-sand" style={{ height }}>
      <div ref={ref} className="w-full h-full bg-sand z-0" />
      {controls && ready && (
        <div className="absolute top-3 right-3 z-[400] flex gap-1 bg-white/90 backdrop-blur rounded-full p-1 shadow">
          {(Object.keys(layers) as Layer[]).map((k) => (
            <button key={k} onClick={() => switchLayer(k)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${layer === k ? "bg-olive text-cream" : "text-faded hover:bg-sand"}`}>
              {layers[k].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
