"use client";

import { useState } from "react";

export default function ExchangeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="mt-2 w-full text-center text-[11px] font-medium text-terra hover:text-terra-deep border border-terra/40 hover:border-terra rounded-full py-1.5 transition-colors cursor-pointer">
        💱 Exchange / transfer funds
      </button>
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <p className="text-3xl mb-2">🏦</p>
            <h3 className="display text-xl font-semibold text-olive-deep mb-1">Quick exchange</h3>
            <p className="text-sm text-faded">
              Coming soon — convert or send money between GBP / EUR / USD and ₺, banking-style, right from Guney.live.
            </p>
            <button onClick={() => setOpen(false)}
              className="mt-4 px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep transition-colors cursor-pointer">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
