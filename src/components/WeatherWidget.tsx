"use client";

import { useEffect, useState } from "react";

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

function weatherLabel(code: number): string {
  if (code === 0) return "Ensoleillé";
  if (code <= 2) return "Peu nuageux";
  if (code === 3) return "Nuageux";
  if (code <= 48) return "Brouillard";
  if (code <= 55) return "Bruine";
  if (code <= 65) return "Pluie";
  if (code <= 77) return "Neige";
  if (code <= 82) return "Averses";
  if (code <= 86) return "Neige";
  return "Orage";
}

interface WeatherData {
  current: { temp: number; code: number; humidity: number; wind: number };
  daily: { max: number; min: number };
  hourly: { label: string; temp: number; code: number }[];
}

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=47.85&longitude=3.55" +
    "&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m" +
    "&daily=temperature_2m_max,temperature_2m_min" +
    "&hourly=temperature_2m,weather_code" +
    "&timezone=Europe%2FParis&forecast_days=1"
  );
  const d = await res.json();

  const nowHour = new Date().getHours();
  const hours: number[] = d.hourly.time.map((t: string) => parseInt(t.slice(11, 13)));

  // 8 créneaux à partir de l'heure actuelle
  const slots: { label: string; temp: number; code: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const h = (nowHour + i) % 24;
    const idx = hours.indexOf(h);
    if (idx === -1) continue;
    slots.push({
      label: i === 0 ? "Maint." : `${String(h).padStart(2, "0")}h`,
      temp: Math.round(d.hourly.temperature_2m[idx]),
      code: d.hourly.weather_code[idx],
    });
  }

  return {
    current: {
      temp: Math.round(d.current.temperature_2m),
      code: d.current.weather_code,
      humidity: d.current.relative_humidity_2m,
      wind: Math.round(d.current.wind_speed_10m),
    },
    daily: {
      max: Math.round(d.daily.temperature_2m_max[0]),
      min: Math.round(d.daily.temperature_2m_min[0]),
    },
    hourly: slots,
  };
}

// Pastille compacte pour la carte
export function WeatherCompact({ className = "" }: { className?: string }) {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    fetchWeather().then((d) => setData(d.current)).catch(() => {});
  }, []);

  if (!data) return null;
  return (
    <div className={className}>
      {weatherEmoji(data.code)} {data.temp}°
    </div>
  );
}

// Widget détaillé pour la page d'accueil
export default function WeatherWidget({ className = "" }: { className?: string }) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeather().then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <div className={`animate-pulse rounded-2xl bg-slate-100 h-28 ${className}`} />
  );

  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-soft ${className}`}>
      {/* Ligne principale */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">{weatherEmoji(data.current.code)}</span>
          <div>
            <p className="text-3xl font-bold text-slate-900">{data.current.temp}°</p>
            <p className="text-xs text-slate-400">{weatherLabel(data.current.code)}</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 space-y-1">
          <p>↑ {data.daily.max}° &nbsp; ↓ {data.daily.min}°</p>
          <p>💧 {data.current.humidity}% &nbsp; 💨 {data.current.wind} km/h</p>
        </div>
      </div>

      {/* Créneaux horaires */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pt-1">
        {data.hourly.map(({ label, temp, code }) => (
          <div
            key={label}
            className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-slate-50 px-3 py-2"
          >
            <p className="text-[10px] font-medium text-slate-400">{label}</p>
            <span className="text-base leading-none">{weatherEmoji(code)}</span>
            <p className="text-xs font-semibold text-slate-700">{temp}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}
