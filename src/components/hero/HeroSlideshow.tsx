"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/AUXERRE.png",    label: "Auxerre" },
  { src: "/appoigny.jpg",   label: "Appoigny" },
  { src: "/chablis.jpg",    label: "Chablis" },
  { src: "/monteau.webp",   label: "Monéteau" },
  { src: "/migennes.jpg",   label: "Migennes" },
];

const INTERVAL = 5000;  // ms entre chaque photo
const FADE     = 1400;  // ms de la transition

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Images empilées — seule la courante est opaque */}
      {SLIDES.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt={s.label}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === current ? 1 : 0, transition: `opacity ${FADE}ms ease-in-out` }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Nom du lieu — haut droite sous la navbar */}
      <div className="absolute top-[84px] right-4 z-10">
        <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
          📍 {SLIDES[current].label}
        </span>
      </div>

      {/* Indicateurs de slide — bas centré, masqués sur mobile */}
      <div className="absolute bottom-6 left-1/2 z-10 hidden md:flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={SLIDES[i].label}
            onClick={() => setCurrent(i)}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === current ? "1.5rem" : "0.375rem",
              background: i === current ? "white" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </>
  );
}
