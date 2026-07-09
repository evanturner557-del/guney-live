"use client";

import { useEffect, useRef, useState } from "react";

// A little ops mascot. Idles in the corner with a chat bubble; when a job
// button fires a `robot:clean` event it springs off (overshooting physics),
// runs to the target row, scrubs it clean, then triggers the real action.

type Job = { rect: { left: number; top: number; width: number; height: number }; label: string; run: () => void };

const IDLE_TIPS = [
  "Tap 🤖 on a flagged item and I'll scrub it for you.",
  "Clean content publishes on its own — I only chase the suspicious stuff.",
  "All quiet? Then the village is behaving.",
];

export default function OpsRobot({ flaggedCount }: { flaggedCount: number }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null); // null = docked corner
  const [busy, setBusy] = useState(false);
  const [scrub, setScrub] = useState<Job["rect"] | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [bubble, setBubble] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMsg(flaggedCount > 0
      ? `${flaggedCount} item${flaggedCount > 1 ? "s" : ""} need a look — point me at one.`
      : IDLE_TIPS[0]);
  }, [flaggedCount]);

  useEffect(() => {
    const t = timers.current;
    function onClean(e: Event) {
      const job = (e as CustomEvent<Job>).detail;
      if (busy) { job.run(); return; }
      setBusy(true); setBubble(true); setMsg(job.label);
      // run to the target
      setPos({ x: job.rect.left + job.rect.width / 2 - 26, y: job.rect.top + job.rect.height / 2 - 26 });
      t.push(setTimeout(() => setScrub(job.rect), 720));          // arrive → start scrubbing
      t.push(setTimeout(() => { job.run(); }, 1500));             // scrub done → fire action
      t.push(setTimeout(() => { setScrub(null); setPos(null); setBusy(false); setMsg("Done ✨"); }, 1700));
      t.push(setTimeout(() => setMsg(IDLE_TIPS[Math.floor((job.rect.top) % IDLE_TIPS.length)]), 4200));
    }
    window.addEventListener("robot:clean", onClean);
    return () => { window.removeEventListener("robot:clean", onClean); t.forEach(clearTimeout); };
  }, [busy]);

  const docked = pos === null;

  return (
    <>
      {/* scrub overlay */}
      {scrub && (
        <div className="fixed z-[60] pointer-events-none overflow-hidden rounded-xl"
          style={{ left: scrub.left, top: scrub.top, width: scrub.width, height: scrub.height }}>
          <div className="robot-scrub absolute inset-y-0 w-16 flex items-center justify-center text-2xl">🧽</div>
          <div className="robot-wipe absolute inset-0 bg-white/70" />
        </div>
      )}

      {/* the robot */}
      <div className={`fixed z-[61] ${busy ? "" : "robot-bob"}`}
        style={docked
          ? { right: 20, bottom: 20, transition: "all .7s cubic-bezier(.5,-0.4,.3,1.4)" }
          : { left: pos!.x, top: pos!.y, transition: "all .7s cubic-bezier(.5,-0.4,.3,1.4)" }}>
        {/* bubble */}
        {bubble && msg && (
          <div className={`absolute ${docked ? "right-0 bottom-16" : "left-14 top-0"} w-52 bg-white text-ink text-xs rounded-2xl border border-sand shadow-lg px-3 py-2`}>
            {msg}
            <button onClick={() => setBubble(false)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sand text-faded text-[10px] leading-none cursor-pointer">×</button>
          </div>
        )}
        <button onClick={() => setBubble((b) => !b)} aria-label="Ops robot"
          className="w-[52px] h-[52px] rounded-2xl bg-olive-deep text-cream text-3xl flex items-center justify-center shadow-xl border-2 border-olive cursor-pointer">
          <span className={busy ? "robot-shake inline-block" : "inline-block"}>🤖</span>
        </button>
      </div>
    </>
  );
}
