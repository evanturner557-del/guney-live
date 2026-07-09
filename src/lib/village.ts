// Live village data — all free, no-API-key sources. Server-side, cached.
export const GUNEY = { lat: 37.505, lon: 29.55 };

const wmoMap: Record<number, string> = {
  0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow",
  75: "Heavy snow", 77: "Snow grains", 80: "Light showers", 81: "Showers",
  82: "Violent showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm",
  96: "Thunderstorm + hail", 99: "Thunderstorm + hail",
};
export const wmoLabel = (c: number) => wmoMap[c] ?? "—";
export const wmoIcon = (c: number, isDay = true) => {
  if (c === 0) return isDay ? "☀️" : "🌙";
  if (c <= 2) return isDay ? "🌤️" : "☁️";
  if (c <= 3) return "☁️";
  if (c <= 48) return "🌫️";
  if (c <= 55) return "🌦️";
  if (c <= 65) return "🌧️";
  if (c <= 77) return "🌨️";
  if (c <= 82) return "🌧️";
  if (c <= 86) return "🌨️";
  return "⛈️";
};

export type Weather = {
  now: { temp: number; code: number; wind: number; humidity: number; isDay: boolean };
  today: { min: number; max: number; sunrise: string; sunset: string; uv: number };
  daily: { date: string; min: number; max: number; code: number }[];
} | null;

export async function getWeather(): Promise<Weather> {
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${GUNEY.lat}&longitude=${GUNEY.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=Europe%2FIstanbul&forecast_days=7`;
    const r = await fetch(u, { next: { revalidate: 1800 } });
    if (!r.ok) return null;
    const d = await r.json();
    return {
      now: {
        temp: d.current.temperature_2m, code: d.current.weather_code,
        wind: d.current.wind_speed_10m, humidity: d.current.relative_humidity_2m,
        isDay: d.current.is_day === 1,
      },
      today: {
        min: d.daily.temperature_2m_min[0], max: d.daily.temperature_2m_max[0],
        sunrise: d.daily.sunrise[0], sunset: d.daily.sunset[0], uv: d.daily.uv_index_max[0],
      },
      daily: d.daily.time.map((t: string, i: number) => ({
        date: t, min: d.daily.temperature_2m_min[i], max: d.daily.temperature_2m_max[i],
        code: d.daily.weather_code[i],
      })),
    };
  } catch { return null; }
}

export type Air = { aqi: number; pm25: number; label: string; color: string } | null;
export async function getAir(): Promise<Air> {
  try {
    const u = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${GUNEY.lat}&longitude=${GUNEY.lon}&current=european_aqi,pm2_5&timezone=Europe%2FIstanbul`;
    const r = await fetch(u, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    const aqi = Math.round(d.current.european_aqi);
    const [label, color] =
      aqi <= 20 ? ["Very good", "#5c6b3f"] : aqi <= 40 ? ["Good", "#7a8a4e"] :
      aqi <= 60 ? ["Moderate", "#c99a2e"] : aqi <= 80 ? ["Poor", "#b85c38"] :
      aqi <= 100 ? ["Very poor", "#9a4527"] : ["Extremely poor", "#7a2d1a"];
    return { aqi, pm25: Math.round(d.current.pm2_5), label, color };
  } catch { return null; }
}

// AQI for a few comparison cities (same EU index), for the air-quality info box.
export type AirCompare = { city: string; aqi: number; label: string; color: string }[];
function aqiBand(aqi: number): [string, string] {
  return aqi <= 20 ? ["Very good", "#5c6b3f"] : aqi <= 40 ? ["Good", "#7a8a4e"] :
    aqi <= 60 ? ["Moderate", "#c99a2e"] : aqi <= 80 ? ["Poor", "#b85c38"] :
    aqi <= 100 ? ["Very poor", "#9a4527"] : ["Extremely poor", "#7a2d1a"];
}
export async function getAirCompare(): Promise<AirCompare> {
  const cities = [
    { city: "Burdur", lat: 37.72, lon: 30.29 },
    { city: "Denizli", lat: 37.78, lon: 29.09 },
    { city: "İstanbul", lat: 41.01, lon: 28.98 },
    { city: "Ankara", lat: 39.93, lon: 32.86 },
  ];
  try {
    const out = await Promise.all(cities.map(async (c) => {
      const u = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}&current=european_aqi&timezone=Europe%2FIstanbul`;
      const r = await fetch(u, { next: { revalidate: 3600 } });
      if (!r.ok) return null;
      const d = await r.json();
      const aqi = Math.round(d.current.european_aqi);
      const [label, color] = aqiBand(aqi);
      return { city: c.city, aqi, label, color };
    }));
    return out.filter(Boolean) as AirCompare;
  } catch { return []; }
}

export type Prayer = { timings: { name: string; time: string }[]; hijri: string; next: string } | null;
export async function getPrayer(): Promise<Prayer> {
  try {
    const u = `https://api.aladhan.com/v1/timings?latitude=${GUNEY.lat}&longitude=${GUNEY.lon}&method=13`;
    const r = await fetch(u, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    const t = d.data.timings;
    const order = [["Fajr", "İmsak"], ["Sunrise", "Güneş"], ["Dhuhr", "Öğle"], ["Asr", "İkindi"], ["Maghrib", "Akşam"], ["Isha", "Yatsı"]];
    const timings = order.map(([k, name]) => ({ name, time: (t[k] as string).slice(0, 5) }));
    const hij = d.data.date.hijri;
    const hijri = `${hij.day} ${hij.month.en} ${hij.year}`;
    // find next prayer
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    const next = timings.find((p) => {
      const [h, m] = p.time.split(":").map(Number);
      return h * 60 + m > nowM;
    })?.name ?? timings[0].name;
    return { timings, hijri, next };
  } catch { return null; }
}

export type Rates = { GBP: number; EUR: number; USD: number } | null;
export async function getRates(): Promise<Rates> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/TRY", { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    if (d.result !== "success") return null;
    // rates are TRY->X; invert for X->TRY
    return {
      GBP: 1 / d.rates.GBP, EUR: 1 / d.rates.EUR, USD: 1 / d.rates.USD,
    };
  } catch { return null; }
}

export type Quake = { mag: number; place: string; time: number; km: number } | null;
export type Quakes = { list: NonNullable<Quake>[]; max: number } | null;
export async function getQuakes(): Promise<Quakes> {
  try {
    const u = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${GUNEY.lat}&longitude=${GUNEY.lon}&maxradiuskm=250&minmagnitude=2&orderby=time&limit=6`;
    const r = await fetch(u, { next: { revalidate: 1800 } });
    if (!r.ok) return null;
    const d = await r.json();
    const list = d.features.map((f: { properties: { mag: number; place: string; time: number } }) => ({
      mag: f.properties.mag,
      place: (f.properties.place || "").replace(/^\d+\s*km\s*/i, "").replace(/, Turkey$/i, ""),
      time: f.properties.time, km: 0,
    }));
    const max = list.reduce((a: number, q: { mag: number }) => Math.max(a, q.mag), 0);
    return { list, max };
  } catch { return null; }
}

// Moon phase (no API) — returns emoji + name for a given date
export function moonPhase(date = new Date()) {
  const lp = 2551443; // lunar period seconds
  const known = Date.UTC(1970, 0, 7, 20, 35, 0) / 1000; // known new moon
  const now = date.getTime() / 1000;
  const phase = ((now - known) % lp) / lp;
  const idx = Math.round(phase * 8) % 8;
  const phases = [
    ["🌑", "New moon"], ["🌒", "Waxing crescent"], ["🌓", "First quarter"],
    ["🌔", "Waxing gibbous"], ["🌕", "Full moon"], ["🌖", "Waning gibbous"],
    ["🌗", "Last quarter"], ["🌘", "Waning crescent"],
  ];
  return { icon: phases[idx][0], name: phases[idx][1] };
}

// Open-Meteo already returns Istanbul local wall-clock (timezone param) — just take HH:MM.
export const fmtTime = (iso: string) => iso.slice(11, 16);
export const dayName = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short" });
