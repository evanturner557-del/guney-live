"use client";

import { useEffect, useRef } from "react";

// Plays an .m3u8 HLS stream in a <video>. Uses native HLS on Safari/iOS,
// hls.js everywhere else. Calls onError() on a fatal load error so the TV
// can auto-skip a dead channel. muted so autoplay is allowed.
export default function HlsPlayer({ src, muted, onError }: {
  src: string; muted: boolean; onError?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any;

    async function setup() {
      if (!video) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.play().catch(() => {});
        video.onerror = () => onError?.();
        return;
      }
      try {
        const Hls = (await import("hls.js")).default;
        if (cancelled || !video) return;
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, maxBufferLength: 20 });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
          hls.on(Hls.Events.ERROR, (_evt: unknown, data: { fatal: boolean }) => {
            if (data?.fatal) onError?.();
          });
        } else {
          onError?.();
        }
      } catch {
        onError?.();
      }
    }
    setup();
    return () => { cancelled = true; if (hls) hls.destroy(); };
  }, [src, onError]);

  return (
    <video ref={ref} className="absolute inset-0 w-full h-full bg-black object-cover"
      muted={muted} playsInline autoPlay />
  );
}
