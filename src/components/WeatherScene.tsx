// Animated, time-of-day weather backdrop for the weather card.
// Pure CSS animation (no JS) — safe to render server-side. The "phase"
// (night/dawn/day/dusk) is computed from the current Istanbul time vs the
// day's sunrise/sunset; the "sky" (clear/cloud/rain/snow/storm) from the WMO code.

export type Phase = "night" | "dawn" | "day" | "dusk";
type Sky = "clear" | "cloud" | "rain" | "snow" | "storm";

function skyFromCode(code: number): Sky {
  if (code >= 95) return "storm";
  if (code >= 71 && code <= 77) return "snow";
  if (code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 2) return "cloud";
  return "clear";
}

const PHASE_BG: Record<Phase, string> = {
  night: "linear-gradient(180deg,#0b1026 0%,#1a2350 55%,#2a3566 100%)",
  dawn: "linear-gradient(180deg,#2a3566 0%,#7b5aa6 40%,#e8896b 75%,#f6b26b 100%)",
  day: "linear-gradient(180deg,#4a90d9 0%,#7bc4e0 55%,#bfe0f0 100%)",
  dusk: "linear-gradient(180deg,#1a2350 0%,#6b4a8a 38%,#d4663f 74%,#f0a05a 100%)",
};

// grey wash pulled over the sky when it's overcast/raining/snowing
const OVERCAST: Record<Phase, string> = {
  night: "linear-gradient(180deg,#1a1f33 0%,#2b3040 100%)",
  dawn: "linear-gradient(180deg,#3a3a52 0%,#7a6a72 100%)",
  day: "linear-gradient(180deg,#7d8794 0%,#a7b0ba 100%)",
  dusk: "linear-gradient(180deg,#33323f 0%,#6b5a5a 100%)",
};

// Flat time-of-day sky gradient, shared by all dashboard cards so the whole
// "village right now" row takes on the current sky palette.
export function skyGradient(phase: Phase): string {
  return PHASE_BG[phase];
}

export function timePhase(sunriseISO: string, sunsetISO: string, nowMin: number): Phase {
  const toMin = (iso: string) => {
    const h = Number(iso.slice(11, 13)); const m = Number(iso.slice(14, 16));
    return h * 60 + m;
  };
  const sr = toMin(sunriseISO), ss = toMin(sunsetISO);
  const w = 45; // transition window, minutes
  if (nowMin < sr - w || nowMin > ss + w) return "night";
  if (Math.abs(nowMin - sr) <= w) return "dawn";
  if (Math.abs(nowMin - ss) <= w) return "dusk";
  return "day";
}

export default function WeatherScene({ code, phase }: { code: number; phase: Phase }) {
  const sky = skyFromCode(code);
  const overcast = sky === "cloud" || sky === "rain" || sky === "snow" || sky === "storm";
  const bg = overcast ? OVERCAST[phase] : PHASE_BG[phase];
  const lightCelestial = phase === "day" || phase === "dawn"; // sun vs moon

  return (
    <div className="ws" style={{ background: bg }} aria-hidden>
      {/* stars at night when sky is clear-ish */}
      {phase === "night" && sky === "clear" && (
        <div className="ws-stars">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="ws-star" style={{
              left: `${(i * 53) % 100}%`, top: `${(i * 29) % 70}%`,
              animationDelay: `${(i % 6) * 0.4}s`,
            }} />
          ))}
        </div>
      )}

      {/* sun / moon */}
      {sky === "clear" && (
        lightCelestial
          ? <div className="ws-sun" />
          : <div className="ws-moon" />
      )}

      {/* drifting clouds for cloud/rain/snow/storm */}
      {overcast && (
        <>
          <div className="ws-cloud ws-cloud-a" />
          <div className="ws-cloud ws-cloud-b" />
          <div className="ws-cloud ws-cloud-c" />
        </>
      )}

      {/* precipitation */}
      {(sky === "rain" || sky === "storm") && (
        <div className="ws-precip">
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} className="ws-rain" style={{
              left: `${(i * 4.6) % 100}%`, animationDelay: `${(i % 7) * 0.13}s`,
            }} />
          ))}
        </div>
      )}
      {sky === "snow" && (
        <div className="ws-precip">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="ws-snow" style={{
              left: `${(i * 6.3) % 100}%`, animationDelay: `${(i % 8) * 0.4}s`,
            }} />
          ))}
        </div>
      )}
      {sky === "storm" && <div className="ws-flash" />}
    </div>
  );
}
