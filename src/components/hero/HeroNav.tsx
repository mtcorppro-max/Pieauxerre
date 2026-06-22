"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Pourquoi ?", href: "/pourquoi" },
  { label: "Sorties", href: "/liste" },
  { label: "Entraide", href: "/entraide" },
  { label: "Perdus & Trouvés", href: "/trouvailles" },
  { label: "💡 Idées & signalements", href: "/idees" },
];

export default function HeroNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 pt-5 md:px-12 lg:px-16">
      <nav className="liquid-glass rounded-xl px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Yonne+
          </Link>

          {/* Liens desktop */}
          <div className="hidden items-center gap-8 text-sm md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-gray-300">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Hamburger mobile */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition active:scale-95 md:hidden"
            >
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link
              href="/carte"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
            >
              Ouvrir la carte
            </Link>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {open && (
          <div className="mt-2 flex flex-col gap-1 border-t border-white/20 pt-2 md:hidden">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 active:bg-white/20"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
