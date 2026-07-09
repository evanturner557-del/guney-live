"use client";

import { useState } from "react";

// Small "(i)" button that opens a modal. Used by dashboard cards.
export default function InfoModal({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-label={label}
        className="w-4 h-4 rounded-full border border-white/60 text-white/80 text-[10px] leading-none flex items-center justify-center hover:bg-white/20 cursor-pointer">
        i
      </button>
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white text-ink rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-sand px-5 py-3 flex items-center justify-between">
              <h3 className="display text-lg font-semibold text-olive-deep">{label}</h3>
              <button onClick={() => setOpen(false)} className="text-faded hover:text-ink text-xl leading-none cursor-pointer">×</button>
            </div>
            <div className="px-5 py-4 text-sm">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
