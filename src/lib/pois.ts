// Points of interest around Güney. Coordinates are approximate (for map placement);
// "Directions" uses a Google Maps place-name search, which resolves accurately.
import type { CatKey } from "@/lib/categories";

export type Poi = {
  key: string; name: string; emoji: string; cat: CatKey;
  lat: number; lng: number; desc: string; q: string;
};

export const POIS: Poi[] = [
  { key: "village", name: "Güney village", emoji: "🏡", cat: "village", lat: 37.505, lng: 29.550, desc: "The village itself — the square, the streets, the old stone houses.", q: "Güney, Yeşilova, Burdur" },
  { key: "caybahcesi", name: "Güney Çay Bahçesi", emoji: "🍵", cat: "food", lat: 37.5065, lng: 29.5515, desc: "The tea garden — where the village gathers.", q: "Güney Çay Bahçesi, Yeşilova, Burdur" },
  { key: "seyir", name: "Güney Seyir Tepesi", emoji: "🌄", cat: "village", lat: 37.5085, lng: 29.5465, desc: "The viewpoint over the valley and the lake beyond.", q: "Güney Seyir Tepesi, Yeşilova, Burdur" },
  { key: "kale", name: "Kale Tepesi", emoji: "🏔️", cat: "village", lat: 37.5105, lng: 29.5440, desc: "The castle hill above the village.", q: "Kale Tepesi, Güney, Yeşilova, Burdur" },
  { key: "mezarlik", name: "Güney Mezarlığı", emoji: "🌳", cat: "village", lat: 37.5030, lng: 29.5525, desc: "The village cemetery, generations deep.", q: "Güney Mezarlığı, Yeşilova, Burdur" },
  { key: "salda", name: "Lake Salda", emoji: "💧", cat: "salda", lat: 37.550, lng: 29.683, desc: "The turquoise lake and its nature park, 8 km east.", q: "Salda Gölü Tabiat Parkı, Yeşilova, Burdur" },
  { key: "plaj", name: "Salda Plajı", emoji: "🏖️", cat: "salda", lat: 37.541, lng: 29.661, desc: "The white mineral beach — the 'Turkish Maldives'.", q: "Salda Gölü Plajı, Yeşilova, Burdur" },
  { key: "doganbaba", name: "Doğanbaba Plajı", emoji: "🏝️", cat: "salda", lat: 37.575, lng: 29.695, desc: "The quieter beach on the lake's north shore.", q: "Doğanbaba Plajı, Salda Gölü, Burdur" },
  { key: "lavanta", name: "Salda Lavanta", emoji: "💜", cat: "lavender", lat: 37.530, lng: 29.600, desc: "Lavender fields in bloom near the lake.", q: "Salda Lavanta Bahçesi, Yeşilova, Burdur" },
  { key: "eseler", name: "Eşeler Dağı", emoji: "⛰️", cat: "eseler", lat: 37.427, lng: 29.615, desc: "The mountain south of the lake — views and highland air (2,269 m).", q: "Eşeler Dağı, Yeşilova, Burdur" },
  { key: "kayak", name: "Salda Kayak Merkezi", emoji: "🎿", cat: "eseler", lat: 37.433, lng: 29.611, desc: "The little ski centre on Eşeler in winter.", q: "Salda Kayak Merkezi, Yeşilova, Burdur" },
];

export const poisByCat = (cat: string) => POIS.filter((p) => p.cat === cat);

// Coordinate confidence, for transparency: verified against Wikipedia/PeakVisor
// (village, salda, eseler); the rest (tea garden, viewpoint, castle hill,
// cemetery, lavender field, exact beach spots) have no public geodata —
// they're best-estimate placements near the village/lake, not geocoded.
