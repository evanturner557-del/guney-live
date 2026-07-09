// Photo categories for the gallery. Salda is seeded with CC images;
// the rest are community-filled (upload-ready).
export type CatKey = "salda" | "village" | "eseler" | "food" | "lavender" | "faces";

export const CATEGORIES: { key: CatKey; name: string; emoji: string; blurb: string; grad: string }[] = [
  { key: "salda", name: "Lake Salda", emoji: "💧", blurb: "The turquoise lake, its beaches and nature park — Tabiat Parkı, the plaj, Doğanbaba.", grad: "from-sky-300 to-cyan-600" },
  { key: "village", name: "The village", emoji: "🏡", blurb: "Güney itself — the çay bahçesi, seyir tepesi, Kale Tepesi, the mosques, the old houses, the little lake and the dam.", grad: "from-olive to-olive-deep" },
  { key: "eseler", name: "Eşeler Dağı", emoji: "⛰️", blurb: "The mountain and its views — Salda Kayak Merkezi, the highland cabin, Eşeler restaurant.", grad: "from-stone-400 to-stone-700" },
  { key: "food", name: "Food & drink", emoji: "🍽️", blurb: "Where the village eats — Yılmaz köfte & kokoreç, the tea garden, local tables.", grad: "from-amber-400 to-terra" },
  { key: "lavender", name: "Lavender", emoji: "💜", blurb: "Salda lavanta — the lavender fields in bloom.", grad: "from-purple-300 to-purple-600" },
  { key: "faces", name: "Faces of Güney", emoji: "👵", blurb: "The people who make the village — elders, families, everyday life.", grad: "from-rose-300 to-rose-600" },
];

export const catByKey = (k: string) => CATEGORIES.find((c) => c.key === k);
