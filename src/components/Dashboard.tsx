import {
  Weather, Air, Prayer, Rates, Quakes, AirCompare,
  wmoLabel, wmoIcon, moonPhase, fmtTime, dayName,
} from "@/lib/village";
import { timeAgo } from "@/components/ui";
import LiveCam from "@/components/LiveCam";
import ExchangeButton from "@/components/ExchangeButton";
import WeatherScene, { timePhase, celestialPos, type Phase } from "@/components/WeatherScene";
import AirInfo from "@/components/AirInfo";
import PrayerInfo from "@/components/PrayerInfo";

function Led({ live }: { live: boolean }) {
  return (
    <span className="flex items-center" title={live ? "Live" : "Unavailable right now"}>
      <span className={`led ${live ? "led-live" : "led-dead"}`} aria-hidden />
    </span>
  );
}

// Glass tile — translucent so the one shared sky behind the grid shows through,
// making the six cards read as a single sky divided into panes.
function Card({ title, icon, live, info, children, className = "" }: {
  title: string; icon?: string; live: boolean; info?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/20 bg-black/25 backdrop-blur-md text-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-sm">{icon}</span>}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">{title}</h3>
        {info}
        <span className="ml-auto"><Led live={live} /></span>
      </div>
      {children}
    </div>
  );
}

function Dead({ label = "Feed unavailable right now." }: { label?: string }) {
  return <p className="text-sm text-white/70 py-1">{label}</p>;
}

export function Dashboard({ weather, air, airCompare, prayer, rates, quakes }: {
  weather: Weather; air: Air; airCompare: AirCompare; prayer: Prayer; rates: Rates; quakes: Quakes;
}) {
  const moon = moonPhase();
  const generatedAt = new Date();
  const stamp = generatedAt.toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });
  const istHM = generatedAt.toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false });
  const nowMin = Number(istHM.slice(0, 2)) * 60 + Number(istHM.slice(3, 5));
  const phase: Phase = weather ? timePhase(weather.today.sunrise, weather.today.sunset, nowMin) : "day";
  const celestial = weather ? celestialPos(weather.today.sunrise, weather.today.sunset, nowMin) : undefined;

  return (
    <section className="mt-4">
      <div className="flex items-baseline justify-between flex-wrap gap-1 mb-4">
        <h2 className="display text-2xl font-semibold text-olive-deep">The village, right now</h2>
        <p className="text-[11px] text-faded" title="This page regenerates from live APIs roughly every 30 minutes.">
          Data refreshed {stamp} · Europe/Istanbul · every ~30 min
        </p>
      </div>

      {/* One continuous sky behind all six cards */}
      <div className="relative rounded-3xl overflow-hidden p-2 sm:p-3">
        <div className="absolute inset-0" aria-hidden>
          <WeatherScene code={weather ? weather.now.code : 0} phase={phase} celestial={celestial} />
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {/* Weather — spans 2 */}
          <Card title="Weather" icon={weather ? wmoIcon(weather.now.code, weather.now.isDay) : "⛅"} live={Boolean(weather)} className="col-span-2">
            {weather ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="display text-4xl font-semibold leading-none drop-shadow">{Math.round(weather.now.temp)}°</span>
                  <div className="text-sm pb-0.5 drop-shadow-sm">
                    <p>{wmoLabel(weather.now.code)}</p>
                    <p className="text-white/85">{Math.round(weather.today.min)}–{Math.round(weather.today.max)}° · 💨 {Math.round(weather.now.wind)} km/h</p>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-white/25">
                  {weather.daily.slice(1, 6).map((d) => (
                    <div key={d.date} className="text-center drop-shadow-sm">
                      <p className="text-[11px] text-white/80">{dayName(d.date)}</p>
                      <p className="text-base leading-tight">{wmoIcon(d.code)}</p>
                      <p className="text-[11px]"><span>{Math.round(d.max)}°</span> <span className="text-white/70">{Math.round(d.min)}°</span></p>
                    </div>
                  ))}
                </div>
              </>
            ) : <Dead label="Weather feed unavailable right now." />}
          </Card>

          {/* Sun & Moon */}
          <Card title="Sun & moon" icon="🌅" live={Boolean(weather)}>
            {weather ? (
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-white/70">Sunrise</span><span>{fmtTime(weather.today.sunrise)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">Sunset</span><span>{fmtTime(weather.today.sunset)}</span></p>
                <p className="flex justify-between pt-1 border-t border-white/20"><span className="text-white/70">UV max</span><span>{Math.round(weather.today.uv)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">Moon</span><span>{moon.icon} {moon.name.split(" ")[0]}</span></p>
              </div>
            ) : <Dead />}
          </Card>

          {/* Prayer times */}
          <Card title="Prayer times" icon="🕌" live={Boolean(prayer)} info={<PrayerInfo />}>
            {prayer ? (
              <>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
                  {prayer.timings.map((p) => (
                    <div key={p.name} className={p.name === prayer.next ? "text-amber-200 font-semibold" : ""}>
                      <p className="text-[10px] text-white/60 uppercase leading-tight">{p.name}</p>
                      <p className="leading-tight">{p.time}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/60 mt-2 pt-2 border-t border-white/20">{prayer.hijri} · Diyanet</p>
              </>
            ) : <Dead />}
          </Card>

          {/* Air quality */}
          <Card title="Air quality" icon="💨" live={Boolean(air)} info={<AirInfo compare={airCompare} />}>
            {air ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="display text-3xl font-semibold leading-none drop-shadow">{air.aqi}</span>
                  <span className="text-xs pb-1 px-2 py-0.5 rounded-full font-medium" style={{ background: air.color }}>{air.label}</span>
                </div>
                <p className="text-xs text-white/70 mt-2">PM2.5 {air.pm25} µg/m³ · EU index</p>
              </>
            ) : <Dead />}
          </Card>

          {/* Currency */}
          <Card title="Exchange (→ ₺)" icon="💷" live={Boolean(rates)}>
            {rates ? (
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-white/70">£1 GBP</span><span>₺{rates.GBP.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">€1 EUR</span><span>₺{rates.EUR.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">$1 USD</span><span>₺{rates.USD.toFixed(2)}</span></p>
              </div>
            ) : <Dead />}
            <ExchangeButton />
          </Card>

          {/* Earthquakes */}
          <Card title="Quakes (250 km)" icon="🌍" live={Boolean(quakes)} className="col-span-2 md:col-span-1">
            {quakes ? (
              <>
                {quakes.list.length === 0 ? (
                  <p className="text-sm text-white/70">Nothing notable.</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {quakes.list.slice(0, 3).map((q, i) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span className="flex items-baseline gap-1.5 min-w-0">
                          <span className={`font-semibold shrink-0 ${q.mag >= 4 ? "text-amber-200" : "text-white"}`}>M{q.mag.toFixed(1)}</span>
                          <span className="text-white/70 truncate text-[13px]">{q.place || "nearby"}</span>
                        </span>
                        <span className="text-white/60 text-[11px] shrink-0">{timeAgo(new Date(q.time).toISOString())}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-white/60 mt-2 pt-2 border-t border-white/20">USGS</p>
              </>
            ) : <Dead />}
          </Card>
        </div>
      </div>

      {/* Salda TV — its own tile below the sky */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <LiveCam />
      </div>
    </section>
  );
}
