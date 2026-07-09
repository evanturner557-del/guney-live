// Points of interest around Güney.
//
// COORDINATE POLICY (this is why some markers look different on the map):
//  - verified:true  → coordinate cross-checked against an authoritative source
//                     (Wikipedia, PeakVisor, or the village's own site). Solid pin.
//  - verified:false → no public geodata exists for this exact spot; the point is
//                     a best estimate placed near the village/lake. Faded pin, and
//                     the popup invites the community to pin the real location.
//
// Confirmed anchors:
//  - Güney village center: 37°30′N 29°33′E → 37.500, 29.550  (guneykasabasi.jimdofree.com)
//  - Lake Salda center:    37°33′N 29°41′E → 37.550, 29.683  (Wikipedia: Lake Salda)
//  - Eşeler Dağı peak:      37.4272, 29.6155, 2269 m         (PeakVisor)
import type { CatKey } from "@/lib/categories";

export type Poi = {
  key: string; name: string; emoji: string; cat: CatKey;
  lat: number; lng: number; desc: string; q: string; verified: boolean;
};

export const POIS: Poi[] = [
  // ---- verified anchors ----
  { key: "village", name: "Güney village", emoji: "🏡", cat: "village", lat: 37.500, lng: 29.550, verified: true,
    desc: "The village itself — the square, the streets, the old stone houses. 8 km west of Lake Salda.", q: "Güney, Yeşilova, Burdur" },
  { key: "salda", name: "Lake Salda", emoji: "💧", cat: "salda", lat: 37.550, lng: 29.683, verified: true,
    desc: "The turquoise lake and its nature park, 8 km east.", q: "Salda Gölü Tabiat Parkı, Yeşilova, Burdur" },
  { key: "eseler", name: "Eşeler Dağı", emoji: "⛰️", cat: "eseler", lat: 37.4272, lng: 29.6155, verified: true,
    desc: "The mountain south of the lake — 2,269 m, views and highland air.", q: "Eşeler Dağı, Yeşilova, Burdur" },

  // ---- approximate (no public geodata — community can pin the real spot) ----
  { key: "plaj", name: "Salda Plajı (Beyaz Adalar)", emoji: "🏖️", cat: "salda", lat: 37.560, lng: 29.665, verified: false,
    desc: "The white mineral beach — the 'Turkish Maldives'. Approximate.", q: "Salda Gölü Plajı, Yeşilova, Burdur" },
  { key: "doganbaba", name: "Doğanbaba Plajı", emoji: "🏝️", cat: "salda", lat: 37.535, lng: 29.702, verified: false,
    desc: "The quieter beach on the lake's south shore. Approximate.", q: "Doğanbaba Plajı, Salda Gölü, Burdur" },
  { key: "caybahcesi", name: "Güney Çay Bahçesi", emoji: "🍵", cat: "food", lat: 37.5015, lng: 29.5515, verified: false,
    desc: "The tea garden — where the village gathers. Approximate.", q: "Güney Çay Bahçesi, Yeşilova, Burdur" },
  { key: "lavanta", name: "Salda Lavanta", emoji: "💜", cat: "lavender", lat: 37.545, lng: 29.630, verified: false,
    desc: "Lavender fields near the lake. Approximate.", q: "Salda Lavanta Bahçesi, Yeşilova, Burdur" },
  { key: "kayak", name: "Salda Kayak Merkezi", emoji: "🎿", cat: "eseler", lat: 37.435, lng: 29.610, verified: false,
    desc: "The little ski centre on Eşeler in winter. Approximate.", q: "Salda Kayak Merkezi, Yeşilova, Burdur" },
];

export const poisByCat = (cat: string) => POIS.filter((p) => p.cat === cat);
