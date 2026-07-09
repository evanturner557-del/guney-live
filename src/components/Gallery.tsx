"use client";

import { useState } from "react";

export type Photo = {
  id: string; url: string; caption: string | null;
  credit: string | null; credit_url: string | null; license: string | null;
};

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<Photo | null>(null);
  if (photos.length === 0)
    return <p className="text-sm text-faded py-8">No photos yet — be the first to share one.</p>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden border border-sand group bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? "Güney / Salda"} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {p.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[11px] p-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                {p.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out">
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.url} alt={open.caption ?? ""} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="text-cream text-sm mt-3 flex justify-between gap-4">
              <p>{open.caption}</p>
              {open.credit && (
                <p className="text-white/60 whitespace-nowrap">
                  {open.credit_url ? (
                    <a href={open.credit_url} target="_blank" rel="noopener noreferrer" className="underline">{open.credit}</a>
                  ) : open.credit}
                  {open.license ? ` · ${open.license}` : ""}
                </p>
              )}
            </div>
            <button onClick={() => setOpen(null)} className="absolute top-4 right-4 text-white text-3xl leading-none">×</button>
          </div>
        </div>
      )}
    </>
  );
}
