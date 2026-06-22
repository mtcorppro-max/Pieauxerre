"use client";

import { useEffect, useRef, useState } from "react";

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

const JOURS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

interface HourSlot { label: string; temp: number; code: number; }
interface DaySlot  { label: string; max: number; min: number; code: number; }

interface WeatherData {
  current: { temp: number; code: number; humidity: number; wind: number };
  todayMax: number;
  todayMin: number;
  hourly: HourSlot[];
  weekly: DaySlot[];
}

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=47.85&longitude=3.55" +
    "&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
    "&hourly=temperature_2m,weather_code" +
    "&timezone=Europe%2FParis&forecast_days=7"
  );
  const d = await res.json();

  // Créneaux horaires : toutes les heures du jour actuel
  const nowHour = new Date().getHours();
  const allTimes: string[] = d.hourly.time;
  const todayStr = new Date().toISOString().slice(0, 10);
  const hourly: HourSlot[] = allTimes
    .map((t: string, i: number) => ({ t, i }))
    .filter(({ t }) => t.startsWith(todayStr))
    .filter(({ t }) => parseInt(t.slice(11, 13)) >= nowHour)
    .map(({ t, i }) => ({
      label: parseInt(t.slice(11, 13)) === nowHour ? "Maint." : `${t.slice(11, 13)}h`,
      temp: Math.round(d.hourly.temperature_2m[i]),
      code: d.hourly.weather_code[i],
    }));

  // Prévisions 7 jours
  const weekly: DaySlot[] = (d.daily.time as string[]).map((t: string, i: number) => {
    const date = new Date(t + "T12:00:00");
    const isToday = t === todayStr;
    return {
      label: isToday ? "Auj." : JOURS[date.getDay()],
      max: Math.round(d.daily.temperature_2m_max[i]),
      min: Math.round(d.daily.temperature_2m_min[i]),
      code: d.daily.weather_code[i],
    };
  });

  return {
    current: {
      temp: Math.round(d.current.temperature_2m),
      code: d.current.weather_code,
      humidity: d.current.relative_humidity_2m,
      wind: Math.round(d.current.wind_speed_10m),
    },
    todayMax: Math.round(d.daily.temperature_2m_max[0]),
    todayMin: Math.round(d.daily.temperature_2m_min[0]),
    hourly,
    weekly,
  };
}

type View = "today" | "week";

export default function WeatherPill() {
  const [data, setData]   = useState<WeatherData | null>(null);
  const [open, setOpen]   = useState(false);
  const [view, setView]   = useState<View>("today");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchWeather().then(setData).catch(() => {}); }, []);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!data) return null;

  return (
    <div ref={ref} className="relative inline-block">
      {/* Pilule */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(255,255,255,0.2)] backdrop-blur-sm ring-1 ring-white/20 transition hover:bg-white/25 active:scale-95"
      >
        <span>{weatherEmoji(data.current.code)}</span>
        <span>{data.current.temp}°</span>
        <svg
          className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Carte détaillée */}
      <div
        className={[
          "absolute left-0 bottom-full z-50 mb-2 w-80 origin-bottom-left",
          "rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl",
          "transition-all duration-300",
          open
            ? "pointer-events-auto translate-y-0 opacity-100 scale-100"
            : "pointer-events-none translate-y-2 opacity-0 scale-95",
        ].join(" ")}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{weatherEmoji(data.current.code)}</span>
            <div>
              <p className="text-2xl font-bold text-white">{data.current.temp}°C</p>
              <p className="text-xs text-white/60">{weatherLabel(data.current.code)}</p>
            </div>
          </div>
          <div className="text-right text-xs text-white/70 space-y-1">
            <p>↑ {data.todayMax}° &nbsp; ↓ {data.todayMin}°</p>
            <p>💧 {data.current.humidity}% &nbsp; 💨 {data.current.wind} km/h</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="mt-3 flex gap-1 rounded-xl bg-white/10 p-1">
          {(["today", "week"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "flex-1 rounded-lg py-1 text-xs font-semibold transition",
                view === v ? "bg-white text-slate-900" : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              {v === "today" ? "Aujourd'hui" : "7 jours"}
            </button>
          ))}
        </div>

        <div className="my-3 h-px bg-white/10" />

        {/* Vue aujourd'hui : créneaux horaires scrollables */}
        {view === "today" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {data.hourly.map(({ label, temp, code }) => (
              <div key={label} className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-white/10 px-2.5 py-2">
                <p className="text-[10px] font-medium text-white/50">{label}</p>
                <span className="text-base leading-none">{weatherEmoji(code)}</span>
                <p className="text-xs font-semibold text-white">{temp}°</p>
              </div>
            ))}
          </div>
        )}

        {/* Vue 7 jours */}
        {view === "week" && (
          <div className="space-y-1.5">
            {data.weekly.map(({ label, max, min, code }) => (
              <div key={label} className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-white/5">
                <p className="w-10 text-xs font-semibold text-white">{label}</p>
                <span className="text-lg leading-none">{weatherEmoji(code)}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-white">{max}°</span>
                  <span className="text-white/40">{min}°</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
