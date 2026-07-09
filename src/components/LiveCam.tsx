"use client";

import { useEffect, useRef, useState } from "react";

// Grayscale TV-static "no signal" texture, generated inline — no external asset.
const NOISE_URL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

type Item = { kind: "live" | "pending" | "video" | "note"; id?: string; channel?: string; title: string; note?: string };
type Menu = { key: string; label: string; icon: string; items: Item[] };

// NOTE: the Salda lake cam has no free public embeddable source yet — shown as
// "no signal" until a real stream is wired up. Everything else below is a
// verified, currently-live-maintained official YouTube channel/video — no
// scraped or unofficially rehosted content.
const MENUS: Menu[] = [
  {
    key: "live", label: "Live TV", icon: "🔴",
    items: [
      { kind: "pending", title: "Salda Gölü — lake cam" },
      { kind: "live", channel: "UCvFudBDDILdDljN4VIZ4Msw", title: "TRT 1" },
      { kind: "live", channel: "UCBgTP2LOFVPmq15W-RH-WXA", title: "TRT Haber" },
      { kind: "live", channel: "UCfYNqluOf8EbQkL44otydMw", title: "TRT Spor" },
      { kind: "live", channel: "UCdVBWUBCuREx1Q2Ikw9R8Mw", title: "TRT Belgesel" },
      { kind: "live", channel: "UCA9hDdBlGptiL0eUftorgHg", title: "TRT Müzik" },
      { kind: "live", channel: "UCrFf5dtMe6M1XJHqbKJ4X6Q", title: "TRT Çocuk" },
      { kind: "live", channel: "UCib1E6oJRLd2pXkxqzxyg7A", title: "TRT Avaz" },
      { kind: "live", channel: "UC7fWeaHhqgM4Ry-RMpM2YYw", title: "TRT World" },
      { kind: "live", channel: "UCFoe1tg8MuHjRzmqXtV816A", title: "Kanal D" },
      { kind: "live", channel: "UC9JMe_We017gYrRc7kZHgmg", title: "Show TV" },
      { kind: "live", channel: "UCUVZ7T_kwkxDOGFcDlFI-hg", title: "atv" },
      { kind: "live", channel: "UCsFINj3y7SjBaeUxiSdRjlA", title: "Star TV" },
      { kind: "live", channel: "UCJe13zu6MyE6Oueac41KAqg", title: "NOW" },
      { kind: "live", channel: "UCp4N3g1zcvp8WE2qJ_JKqBg", title: "TV8" },
      { kind: "live", channel: "UCephDYPmoVrQhEaZb0gS0Iw", title: "Beyaz TV" },
      { kind: "live", channel: "UC0eqqV7viCLfcT39SphmHBQ", title: "Kanal 7" },
      { kind: "live", channel: "UC9TDTjbOjFB9jADmPhSAPsw", title: "NTV" },
      { kind: "live", channel: "UCV6zcRug6Hqp1UX_FdyUeBg", title: "CNN Türk" },
      { kind: "live", channel: "UClGZC_r-sUcBdElAtDSrQ5g", title: "Habertürk" },
      { kind: "live", channel: "UCzgrZ-CndOoylh2_e72nSBQ", title: "TGRT Haber" },
      { kind: "live", channel: "UCKQhfw-lzz0uKnE1fY1PsAA", title: "A Haber" },
      { kind: "live", channel: "UCJElRTCNEmLemgirqvsW63Q", title: "A Spor" },
      { kind: "live", channel: "UCApLxl6oYQafxvykuoC2uxQ", title: "Bloomberg HT" },
      { kind: "live", channel: "UCf_ResXZzE-o18zACUEmyvQ", title: "Halk TV" },
      { kind: "live", channel: "UCOulx_rep5O4i9y6AyDqVvw", title: "Sözcü TV" },
      { kind: "live", channel: "UCoHnRpOS5rL62jTmSDO5Npw", title: "Tele1" },
      { kind: "live", channel: "UC6T0L26KS1NHMPbTwI1L4Eg", title: "Ulusal Kanal" },
      { kind: "live", channel: "UC7nLr-rPOKYhRE4wRZoLxkg", title: "Euronews Türkçe" },
      { kind: "live", channel: "UChNgvcVZ_ggDdZ0zCcuuzFw", title: "Bengütürk TV" },
    ],
  },
  {
    key: "videos", label: "Local videos", icon: "📼",
    items: [
      { kind: "video", id: "Fyr4MM1ztMY", title: "Güney köyü, Yeşilova — 4K drone" },
      { kind: "video", id: "A5LThih7ZZg", title: "Yeşilova, Burdur — 4K UHD" },
      { kind: "video", id: "1w_k-xXU-NE", title: "Burdur Yeşilova — tanıtım" },
      { kind: "video", id: "e3NKWZAc2xg", title: "Salda Gölü — tanıtım filmi" },
      { kind: "video", id: "pvZZD4swQk4", title: "Salda Gölü — 4K drone" },
      { kind: "video", id: "sksE0zD5SI4", title: "Türkiye'nin Maldivleri — Salda Gölü" },
      { kind: "video", id: "926eAXu_Gng", title: "Salda Gölü — drone çekimi" },
      { kind: "video", id: "rcU7o2xnAv0", title: "Niyazlar köyü, Yeşilova" },
    ],
  },
  {
    key: "music", label: "Local music", icon: "🎵",
    items: [
      { kind: "video", id: "4SdVRekdnHI", title: "Erik Dalı Gevrektir — Kadir Türen (Dirmil, Yeşilova)" },
      { kind: "video", id: "1QmigAWH4rQ", title: "Burdur türküleri — Ümran Özdemir" },
      { kind: "video", id: "y8m1k6WrIUU", title: "Burdur türküleri — Mehmet Koparan" },
      { kind: "video", id: "7oQlgihwelQ", title: "Şu Burdur'un Çalgısı — Uğur Önür" },
      { kind: "video", id: "3jlDczTQm_k", title: "Aman Burdur — Nurcan Altınok" },
    ],
  },
  {
    key: "film", label: "Local film", icon: "🎬",
    items: [
      { kind: "video", id: "vNjjlQ8EycA", title: "Tosun Paşa (4K) — Arzu Film" },
      { kind: "video", id: "9mKns5lC0Ms", title: "Kibar Feyzo (4K) — Arzu Film" },
      { kind: "video", id: "EyJRf53lF6g", title: "Süt Kardeşler (4K) — Arzu Film" },
      { kind: "video", id: "ZDoLID8feBU", title: "Şaban Oğlu Şaban — Arzu Film" },
      { kind: "video", id: "0u2XHF5q6pM", title: "Selvi Boylum Al Yazmalım (1977)" },
    ],
  },
];

function ytSrc(item: Item, playing: boolean) {
  const auto = playing ? 1 : 0;
  if (item.kind === "live" && item.channel)
    return `https://www.youtube.com/embed/live_stream?channel=${item.channel}&autoplay=${auto}&mute=1&rel=0&enablejsapi=1`;
  if ((item.kind === "video" || item.kind === "live") && item.id)
    return `https://www.youtube.com/embed/${item.id}?autoplay=${auto}&mute=1&rel=0&enablejsapi=1`;
  return "";
}

export default function LiveCam() {
  const [open, setOpen] = useState(false);
  const [power, setPower] = useState(true);
  const [menu, setMenu] = useState(0);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const items = MENUS[menu].items;
  const item = items[idx];

  useEffect(() => { setIdx(0); }, [menu]);

  function cmd(fn: "playVideo" | "pauseVideo") {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: fn, args: [] }), "*");
  }
  function togglePlay() {
    if (item?.kind === "note" || item?.kind === "pending") return;
    if (playing) { cmd("pauseVideo"); setPlaying(false); }
    else { cmd("playVideo"); setPlaying(true); }
  }
  const next = () => { setIdx((i) => (i + 1) % items.length); setPlaying(true); };
  const back = () => { setIdx((i) => (i - 1 + items.length) % items.length); setPlaying(true); };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="bg-olive-deep text-cream rounded-2xl p-4 flex flex-col justify-between hover:bg-olive transition-colors col-span-2 md:col-span-1 text-left cursor-pointer w-full">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📺</span>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sage">Salda TV</h3>
          <span className="ml-auto flex items-center" title="Feeds embedded">
            <span className="led led-live" aria-hidden />
          </span>
        </div>
        <div className="mt-2">
          <p className="text-sm leading-snug">Live lake camera, local videos, music & film — on the village set.</p>
          <p className="text-xs text-sage mt-2">Turn it on →</p>
        </div>
      </button>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
            {/* TV set */}
            <div className="rounded-[2rem] p-4 sm:p-6" style={{ background: "linear-gradient(145deg,#5b4632,#3a2c1d)", boxShadow: "0 30px 60px rgba(0,0,0,.6), inset 0 2px 6px rgba(255,255,255,.15)" }}>
              <div className="flex gap-4">
                {/* Screen */}
                <div className="flex-1">
                  <div className="relative rounded-xl overflow-hidden bg-black border-4 border-[#2a2018]" style={{ paddingTop: "62%" }}>
                    {!power ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <div className="w-full h-full" style={{ background: "repeating-linear-gradient(0deg,#111,#111 2px,#1a1a1a 2px,#1a1a1a 4px)" }} />
                        <span className="absolute w-2 h-2 rounded-full bg-white/40" />
                      </div>
                    ) : item?.kind === "note" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6" style={{ background: "radial-gradient(circle,#1e2a1a,#0c0f0a)" }}>
                        <span className="text-3xl mb-2">{MENUS[menu].icon}</span>
                        <p className="text-cream font-semibold">{item.title}</p>
                        <p className="text-sage text-xs mt-2 max-w-xs">{item.note}</p>
                      </div>
                    ) : item?.kind === "pending" ? (
                      <div className="absolute inset-0 bg-black">
                        <div className="absolute inset-0" style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundSize: "140px 140px", opacity: 0.85, filter: "contrast(1.5)" }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                          <span className="bg-black/75 text-cream text-xs sm:text-sm px-3 py-1.5 rounded tracking-wide">📡 Setup: connect to stream</span>
                          <span className="text-cream/50 text-[10px]">{item.title}</span>
                        </div>
                      </div>
                    ) : (
                      <iframe ref={frameRef} key={`${menu}-${idx}-${playing}`} className="absolute inset-0 w-full h-full"
                        src={ytSrc(item, playing)} title={item.title}
                        allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                    )}
                    {/* scanline overlay */}
                    {power && <div className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg,rgba(0,0,0,.06),rgba(0,0,0,.06) 1px,transparent 1px,transparent 3px)" }} />}
                    {/* channel badge */}
                    {power && (
                      <div className="absolute top-2 left-2 bg-black/60 text-cream text-[11px] px-2 py-0.5 rounded">
                        {MENUS[menu].icon} {MENUS[menu].label} · {idx + 1}/{items.length}
                      </div>
                    )}
                    {/* menu overlay */}
                    {power && showMenu && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                        {MENUS.map((m, i) => (
                          <button key={m.key} onClick={() => { setMenu(i); setShowMenu(false); setPlaying(true); }}
                            className={`px-5 py-1.5 rounded-full text-sm ${i === menu ? "bg-terra text-cream" : "bg-white/10 text-cream hover:bg-white/20"}`}>
                            {m.icon} {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Control panel */}
                <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center gap-2 py-1">
                  <span className="display text-cream text-xs mb-1">SALDA</span>
                  <button onClick={() => setPower((p) => !p)} title="Power"
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${power ? "bg-terra text-cream" : "bg-black/40 text-cream/50"}`}>⏻</button>
                  <button onClick={() => setShowMenu((s) => !s)} disabled={!power} title="Menu"
                    className="w-10 h-10 rounded-full bg-[#2a2018] text-cream flex items-center justify-center disabled:opacity-40">☰</button>
                  <button onClick={back} disabled={!power} title="Back"
                    className="w-10 h-10 rounded-full bg-[#2a2018] text-cream flex items-center justify-center disabled:opacity-40">⏮</button>
                  <button onClick={togglePlay} disabled={!power || item?.kind === "note" || item?.kind === "pending"} title="Play/Pause"
                    className="w-10 h-10 rounded-full bg-[#2a2018] text-cream flex items-center justify-center disabled:opacity-40">{playing ? "⏸" : "▶"}</button>
                  <button onClick={next} disabled={!power} title="Next"
                    className="w-10 h-10 rounded-full bg-[#2a2018] text-cream flex items-center justify-center disabled:opacity-40">⏭</button>
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: power ? "#7ee08a" : "#444" }} />
                    <span className="text-cream/40 text-[8px]">PWR</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <button onClick={() => setOpen(false)} className="text-cream/70 text-sm underline">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
