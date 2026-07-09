import {
  Weather, Air, Prayer, Rates, Quakes,
  wmoLabel, wmoIcon, moonPhase, fmtTime, dayName,
} from "@/lib/village";
import LiveCam from "@/components/LiveCam";

function Led({ live }: { live: boolean }) {
  return (
    <span className="ml-auto flex items-center" title={live ? "Live" : "Unavailable right now"}>
      <span className={`led ${live ? "led-live" : "led-dead"}`} aria-hidden />
    </span>
  );
}

function Card({ title, icon, live, children, className = "" }: {
  title: string; icon?: string; live: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-sand p-4 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-sm">{icon}</span>}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-faded">{title}</h3>
        <Led live={live} />
      </div>
      {children}
    </div>
  );
}

function Dead({ label = "Feed unavailable right now." }: { label?: string }) {
  return <p className="text-sm text-faded py-1">{label}</p>;
}

export function Dashboard({ weather, air, prayer, rates, quakes }: {
  weather: Weather; air: Air; prayer: Prayer; rates: Rates; quakes: Quakes;
}) {
  const moon = moonPhase();
  return (
    <section className="mt-4">
      <h2 className="display text-2xl font-semibold text-olive-deep mb-4">The village, right now</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Weather — spans 2 */}
        <Card title="Weather" icon={weather ? wmoIcon(weather.now.code, weather.now.isDay) : "⛅"} live={Boolean(weather)} className="col-span-2">
          {weather ? (
            <>
              <div className="flex items-end gap-3">
                <span className="display text-4xl font-semibold leading-none">{Math.round(weather.now.temp)}°</span>
                <div className="text-sm text-faded pb-0.5">
                  <p className="text-ink">{wmoLabel(weather.now.code)}</p>
                  <p>{Math.round(weather.today.min)}–{Math.round(weather.today.max)}° · 💨 {Math.round(weather.now.wind)} km/h</p>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-sand">
                {weather.daily.slice(1, 6).map((d) => (
                  <div key={d.date} className="text-center">
                    <p className="text-[11px] text-faded">{dayName(d.date)}</p>
                    <p className="text-base leading-tight">{wmoIcon(d.code)}</p>
                    <p className="text-[11px]"><span className="text-ink">{Math.round(d.max)}°</span> <span className="text-faded">{Math.round(d.min)}°</span></p>
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
              <p className="flex justify-between"><span className="text-faded">Sunrise</span><span>{fmtTime(weather.today.sunrise)}</span></p>
              <p className="flex justify-between"><span className="text-faded">Sunset</span><span>{fmtTime(weather.today.sunset)}</span></p>
              <p className="flex justify-between pt-1 border-t border-sand"><span className="text-faded">UV max</span><span>{Math.round(weather.today.uv)}</span></p>
              <p className="flex justify-between"><span className="text-faded">Moon</span><span>{moon.icon} {moon.name.split(" ")[0]}</span></p>
            </div>
          ) : <Dead />}
        </Card>

        {/* Prayer times */}
        <Card title="Prayer times" icon="🕌" live={Boolean(prayer)}>
          {prayer ? (
            <>
              <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
                {prayer.timings.map((p) => (
                  <div key={p.name} className={p.name === prayer.next ? "text-terra-deep font-semibold" : ""}>
                    <p className="text-[10px] text-faded uppercase leading-tight">{p.name}</p>
                    <p className="leading-tight">{p.time}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-faded mt-2 pt-2 border-t border-sand">{prayer.hijri} · Diyanet</p>
            </>
          ) : <Dead />}
        </Card>

        {/* Air quality */}
        <Card title="Air quality" icon="💨" live={Boolean(air)}>
          {air ? (
            <>
              <div className="flex items-end gap-2">
                <span className="display text-3xl font-semibold leading-none" style={{ color: air.color }}>{air.aqi}</span>
                <span className="text-sm pb-0.5" style={{ color: air.color }}>{air.label}</span>
              </div>
              <p className="text-xs text-faded mt-2">PM2.5 {air.pm25} µg/m³ · EU index</p>
            </>
          ) : <Dead />}
        </Card>

        {/* Currency */}
        <Card title="Exchange (→ ₺)" icon="💷" live={Boolean(rates)}>
          {rates ? (
            <div className="space-y-1 text-sm">
              <p className="flex justify-between"><span className="text-faded">£1 GBP</span><span>₺{rates.GBP.toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-faded">€1 EUR</span><span>₺{rates.EUR.toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-faded">$1 USD</span><span>₺{rates.USD.toFixed(2)}</span></p>
            </div>
          ) : <Dead />}
        </Card>

        {/* Earthquakes */}
        <Card title="Quakes (250 km)" icon="🌍" live={Boolean(quakes)} className="col-span-2 md:col-span-1">
          {quakes ? (
            <>
              {quakes.list.length === 0 ? (
                <p className="text-sm text-faded">Nothing notable.</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {quakes.list.slice(0, 3).map((q, i) => (
                    <p key={i} className="flex justify-between gap-2">
                      <span className={`font-semibold ${q.mag >= 4 ? "text-terra-deep" : "text-ink"}`}>M{q.mag.toFixed(1)}</span>
                      <span className="text-faded truncate text-[13px]">{q.place || "nearby"}</span>
                    </p>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-faded mt-2 pt-2 border-t border-sand">USGS</p>
            </>
          ) : <Dead />}
        </Card>

        {/* Live camera — honest link-out */}
        <LiveCam />
      </div>
    </section>
  );
}
