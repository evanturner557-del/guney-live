import InfoModal from "@/components/InfoModal";
import type { AirCompare } from "@/lib/village";

const BANDS = [
  { range: "0–20", label: "Very good", color: "#5c6b3f" },
  { range: "20–40", label: "Good", color: "#7a8a4e" },
  { range: "40–60", label: "Moderate", color: "#c99a2e" },
  { range: "60–80", label: "Poor", color: "#b85c38" },
  { range: "80–100", label: "Very poor", color: "#9a4527" },
  { range: "100+", label: "Extremely poor", color: "#7a2d1a" },
];

export default function AirInfo({ compare }: { compare: AirCompare }) {
  return (
    <InfoModal label="Air quality">
      <p>The number is the <strong>European Air Quality Index (EU AQI)</strong> — lower is cleaner air. It blends particulates (PM2.5, PM10), nitrogen dioxide, ozone and sulphur dioxide into one 0–100+ score.</p>

      <div className="mt-3 space-y-1">
        {BANDS.map((b) => (
          <div key={b.range} className="flex items-center gap-2 text-[13px]">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: b.color }} />
            <span className="w-14 text-faded">{b.range}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-faded">Güney's mountain air is usually <strong>very good to good</strong>. Expect it to worsen a little in <strong>winter</strong> (wood-stove smoke settling in the valley on still, cold nights) and during <strong>summer dust</strong> spells when southerly winds carry Saharan dust; ozone can also rise on hot, sunny afternoons.</p>

      {compare.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-faded mb-1.5">Right now, for comparison</p>
          <div className="grid grid-cols-2 gap-1.5">
            {compare.map((c) => (
              <div key={c.city} className="flex items-center gap-2 bg-sand/50 rounded-lg px-2.5 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-[13px] flex-1">{c.city}</span>
                <span className="text-[13px] font-semibold" style={{ color: c.color }}>{c.aqi}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-faded mt-2">Big cities usually sit higher than Güney. Source: Open-Meteo, EU index.</p>
        </div>
      )}
    </InfoModal>
  );
}
