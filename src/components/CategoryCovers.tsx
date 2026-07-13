import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export type CatStat = { count: number; cover: string | null };

export default function CategoryCovers({ stats }: { stats: Record<string, CatStat> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {CATEGORIES.map((c) => {
        const s = stats[c.key] ?? { count: 0, cover: null };
        return (
          <Link key={c.key} href={`/guide/gallery/${c.key}`}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-sand group block">
            {s.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.cover} alt={c.name} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
                <span className="text-4xl opacity-80">{c.emoji}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/70">{c.emoji} category</p>
                  <h3 className="font-semibold text-lg leading-tight">{c.name}</h3>
                </div>
                <span className="shrink-0 w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center text-lg font-semibold group-hover:bg-terra group-hover:text-cream transition-colors">+</span>
              </div>
              <p className="text-[11px] text-white/80 mt-1">
                {s.count > 0 ? `${s.count} ${s.count > 1 ? "photos" : "photo"}` : "Add the first photo"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
