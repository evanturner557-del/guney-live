"use client";

import { useState } from "react";

const CHANNEL = "UCiTRiRl0BOZmM4bZ5mt2f5g"; // Salda Gölü official channel

export default function LiveCam() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="bg-olive-deep text-cream rounded-2xl p-4 flex flex-col justify-between hover:bg-olive transition-colors col-span-2 md:col-span-1 text-left cursor-pointer w-full">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📹</span>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sage">Salda live camera</h3>
        </div>
        <div className="mt-2">
          <p className="text-sm leading-snug">Watch Lake Salda — live when the channel is streaming, recent footage otherwise.</p>
          <p className="text-xs text-sage mt-2">Watch now →</p>
        </div>
      </button>

      {open && (
        <div onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/live_stream?channel=${CHANNEL}&autoplay=1&rel=0`}
                title="Lake Salda live" allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-sm text-cream">
              <p className="text-white/70">Live feed from the official Salda Gölü channel. Shows the latest stream; if the camera is offline, open the channel for recent footage.</p>
              <a href={`https://www.youtube.com/channel/${CHANNEL}`} target="_blank" rel="noopener noreferrer"
                className="underline whitespace-nowrap ml-4">Open channel ↗</a>
            </div>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white text-3xl leading-none">×</button>
          </div>
        </div>
      )}
    </>
  );
}
