"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HlsPlayer from "@/components/HlsPlayer";

// Grayscale TV-static "no signal" texture, generated inline — no external asset.
const NOISE_URL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

type Item =
  | { kind: "hls"; src: string; title: string }
  | { kind: "video"; id: string; title: string }
  | { kind: "pending"; title: string };
type Menu = { key: string; label: string; icon: string; items: Item[] };

// Live TV: TRT official first-party HLS (24/7, reachable outside Turkey), then
// major private channels via their own CDNs. Dead/geo-blocked ones auto-skip.
const LIVE: Item[] = [
  { kind: "pending", title: "Salda Gölü — lake cam" },
  { kind: "hls", src: "https://tv-trt1.medya.trt.com.tr/master.m3u8", title: "TRT 1" },
  { kind: "hls", src: "https://tv-trthaber.medya.trt.com.tr/master.m3u8", title: "TRT Haber" },
  { kind: "hls", src: "https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8", title: "TRT Belgesel" },
  { kind: "hls", src: "https://tv-trtcocuk.medya.trt.com.tr/master.m3u8", title: "TRT Çocuk" },
  { kind: "hls", src: "https://tv-trtmuzik.medya.trt.com.tr/master.m3u8", title: "TRT Müzik" },
  { kind: "hls", src: "https://tv-trtworld.medya.trt.com.tr/master.m3u8", title: "TRT World" },
  { kind: "hls", src: "https://tv-trtavaz.medya.trt.com.tr/master.m3u8", title: "TRT Avaz" },
  { kind: "hls", src: "https://tv-trtturk.medya.trt.com.tr/master.m3u8", title: "TRT Türk" },
  { kind: "hls", src: "https://demiroren.daioncdn.net/kanald/kanald.m3u8?app=kanald_web&ce=3", title: "Kanal D" },
  { kind: "hls", src: "https://tv8.daioncdn.net/tv8/tv8.m3u8?app=7ddc255a-ef47-4e81-ab14-c0e5f2949788&ce=3", title: "TV8" },
  { kind: "hls", src: "https://demiroren-live.daioncdn.net/teve2/teve2.m3u8", title: "Teve2" },
  { kind: "hls", src: "https://beyaztv.daioncdn.net/beyaztv/beyaztv.m3u8?app=fcd5c66b-da9d-44ba-a410-4f34805c397d&ce=3", title: "Beyaz TV" },
  { kind: "hls", src: "https://ciner-live.daioncdn.net/haberturktv/haberturktv.m3u8", title: "Habertürk" },
  { kind: "hls", src: "https://halktv-live.daioncdn.net/halktv/halktv.m3u8", title: "Halk TV" },
  { kind: "hls", src: "https://ciner-live.daioncdn.net/bloomberght/bloomberght.m3u8", title: "Bloomberg HT" },
  { kind: "hls", src: "https://tele1-live.ercdn.net/tele1/tele1.m3u8", title: "Tele 1" },
  { kind: "hls", src: "https://tv100-live.daioncdn.net/tv100/tv100.m3u8", title: "TV100" },
  { kind: "hls", src: "https://dogus-live.daioncdn.net/kralpoptv/playlist.m3u8", title: "Kral Pop" },
  { kind: "hls", src: "https://livetv.powerapp.com.tr/powerturkTV/powerturkhd.smil/playlist.m3u8", title: "PowerTürk" },
  { kind: "hls", src: "https://tgn.bozztv.com/dvrfl05/gin-minikacocuk/index.m3u8", title: "Minika Çocuk" },
];

const MENUS: Menu[] = [
  { key: "live", label: "Live TV", icon: "🔴", items: LIVE },
  {
    key: "videos", label: "Local videos", icon: "📼",
    items: [
      { kind: "video", id: "Fyr4MM1ztMY", title: "Güney köyü, Yeşilova — 4K drone" },
      { kind: "video", id: "A5LThih7ZZg", title: "Yeşilova, Burdur — 4K UHD" },
      { kind: "video", id: "1w_k-xXU-NE", title: "Burdur Yeşilova — tanıtım" },
      { kind: "video", id: "e3NKWZAc2xg", title: "Salda Gölü — tanıtım filmi" },
      { kind: "video", id: "pvZZD4swQk4", title: "Salda Gölü — 4K drone" },
      { kind: "video", id: "sksE0zD5SI4", title: "Türkiye'nin Maldivleri — Salda" },
      { kind: "video", id: "926eAXu_Gng", title: "Salda Gölü — drone çekimi" },
      { kind: "video", id: "rcU7o2xnAv0", title: "Niyazlar köyü, Yeşilova" },
    ],
  },
  {
    key: "music", label: "Local music", icon: "🎵",
    items: [
      { kind: "video", id: "4SdVRekdnHI", title: "Erik Dalı Gevrektir — Kadir Türen (Dirmil)" },
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

function ytSrc(id: string, playing: boolean) {
  return `https://www.youtube.com/embed/${id}?autoplay=${playing ? 1 : 0}&mute=1&rel=0&enablejsapi=1`;
}

export default function LiveCam() {
  const [open, setOpen] = useState(false);
  const [power, setPower] = useState(true);
  const [menu, setMenu] = useState(0);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [dead, setDead] = useState(false); // all channels unreachable
  const frameRef = useRef<HTMLIFrameElement>(null);
  const skips = useRef(0);

  const items = MENUS[menu].items;
  const item = items[idx];
  const isYouTube = item?.kind === "video";

  useEffect(() => { setIdx(0); setDead(false); skips.current = 0; }, [menu]);

  const go = useCallback((delta: number) => {
    setDead(false); skips.current = 0;
    setIdx((i) => (i + delta + items.length) % items.length);
    setPlaying(true);
  }, [items.length]);

  // auto-skip a dead HLS channel; give up once we've cycled the whole list
  const onStreamError = useCallback(() => {
    skips.current += 1;
    if (skips.current >= items.length) { setDead(true); return; }
    setIdx((i) => (i + 1) % items.length);
  }, [items.length]);

  function cmd(fn: "playVideo" | "pauseVideo") {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: fn, args: [] }), "*");
  }
  function togglePlay() {
    if (item?.kind === "pending") return;
    if (isYouTube) { playing ? cmd("pauseVideo") : cmd("playVideo"); }
    setPlaying((p) => !p);
  }

  return (
    <>
      {/* Retro TV tile — no descriptive text, just the set + a power button */}
      <button onClick={() => setOpen(true)} aria-label="Turn the Salda TV on"
        className="col-span-2 md:col-span-1 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer w-full transition-transform hover:-translate-y-0.5"
        style={{ background: "linear-gradient(145deg,#5b4632,#3a2c1d)" }}>
        <div className="relative w-full rounded-lg overflow-hidden border-4 border-[#2a2018]" style={{ paddingTop: "56%" }}>
          <div className="absolute inset-0" style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundSize: "120px 120px", opacity: .7 }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">📺</span>
          </div>
        </div>
        <span className="mt-1 px-4 py-1.5 rounded-full bg-terra text-cream text-sm font-semibold shadow">
          ⏻ Turn TV on
        </span>
      </button>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-6">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
            {/* TV set — wooden body, big screen, controls beneath */}
            <div className="rounded-[1.75rem] p-3 sm:p-5" style={{ background: "linear-gradient(145deg,#5b4632,#3a2c1d)", boxShadow: "0 30px 60px rgba(0,0,0,.6), inset 0 2px 6px rgba(255,255,255,.15)" }}>
              {/* Screen (large, 16:9) */}
              <div className="relative rounded-xl overflow-hidden bg-black border-4 sm:border-8 border-[#241b13]" style={{ paddingTop: "56.25%", boxShadow: "inset 0 0 40px rgba(0,0,0,.8)" }}>
                {!power ? (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
                ) : dead ? (
                  <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0" style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundSize: "160px 160px", opacity: .85, filter: "contrast(1.5)" }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <span className="bg-black/75 text-cream text-sm px-3 py-1.5 rounded tracking-wide">📡 No signal reachable</span>
                      <span className="text-cream/50 text-[11px]">Try another channel or category</span>
                    </div>
                  </div>
                ) : item?.kind === "pending" ? (
                  <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0" style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundSize: "160px 160px", opacity: .85, filter: "contrast(1.5)" }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <span className="bg-black/75 text-cream text-sm px-3 py-1.5 rounded tracking-wide">📡 Setup: connect to stream</span>
                      <span className="text-cream/50 text-[11px]">{item.title}</span>
                    </div>
                  </div>
                ) : item?.kind === "hls" ? (
                  <HlsPlayer key={item.src} src={item.src} muted={muted} onError={onStreamError} />
                ) : (
                  <iframe ref={frameRef} key={`${menu}-${idx}-${playing}`} className="absolute inset-0 w-full h-full"
                    src={ytSrc(item.id, playing)} title={item.title}
                    allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                )}
                {/* scanlines */}
                {power && <div className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg,rgba(0,0,0,.06),rgba(0,0,0,.06) 1px,transparent 1px,transparent 3px)" }} />}
                {/* channel badge */}
                {power && !dead && item && (
                  <div className="absolute top-2 left-2 bg-black/60 text-cream text-[11px] px-2 py-0.5 rounded">
                    {MENUS[menu].icon} {item.title} · {idx + 1}/{items.length}
                  </div>
                )}
                {/* menu overlay */}
                {power && showMenu && (
                  <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2">
                    {MENUS.map((m, i) => (
                      <button key={m.key} onClick={() => { setMenu(i); setShowMenu(false); setPlaying(true); }}
                        className={`px-6 py-2 rounded-full text-sm ${i === menu ? "bg-terra text-cream" : "bg-white/10 text-cream hover:bg-white/20"}`}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Control bar — BENEATH the screen */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="display text-cream text-sm tracking-wide pl-1 hidden sm:block">SALDA</span>
                <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0">
                  <TVBtn onClick={() => setPower((p) => !p)} title="Power" active={power}>⏻</TVBtn>
                  <TVBtn onClick={() => setShowMenu((s) => !s)} disabled={!power} title="Menu">☰</TVBtn>
                  <TVBtn onClick={() => go(-1)} disabled={!power} title="Previous channel">⏮</TVBtn>
                  <TVBtn onClick={togglePlay} disabled={!power || item?.kind === "pending"} title="Play / pause">{playing ? "⏸" : "▶"}</TVBtn>
                  <TVBtn onClick={() => go(1)} disabled={!power} title="Next channel">⏭</TVBtn>
                  <TVBtn onClick={() => setMuted((m) => !m)} disabled={!power || isYouTube} title={muted ? "Unmute" : "Mute"}>{muted ? "🔇" : "🔊"}</TVBtn>
                </div>
                <button onClick={() => setOpen(false)} className="text-cream/70 text-xs underline pr-1 hidden sm:block">Close</button>
              </div>
            </div>
            <div className="text-center mt-3 sm:hidden">
              <button onClick={() => setOpen(false)} className="text-cream/70 text-sm underline">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TVBtn({ children, onClick, disabled, title, active }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string; active?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors disabled:opacity-40 ${
        active ? "bg-terra text-cream" : "bg-[#2a2018] text-cream hover:bg-[#3a2c1d]"
      }`}>
      {children}
    </button>
  );
}
