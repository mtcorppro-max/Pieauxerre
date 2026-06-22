"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TABS = [
  { href: "/carte",    emoji: "🗺️",  label: "Carte",       param: null },
  { href: "/liste",    emoji: "📅",  label: "Sorties",     param: null },
  { href: "/idees",    emoji: "🚧",  label: "Signalem.",   param: "probleme" },
  { href: "/idees",    emoji: "💡",  label: "Idées",       param: "idee" },
  { href: "/soumettre", emoji: "+", label: "Proposer",    param: null, fab: true },
];

function NavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFiltre = searchParams.get("filtre");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[2000] flex border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_-1px_12px_rgba(15,23,42,0.07)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((t, i) => {
        const onPath = pathname === t.href || (t.href !== "/idees" && pathname.startsWith(t.href + "/"));
        const isActive = t.param
          ? pathname === "/idees" && currentFiltre === t.param
          : onPath;

        if (t.fab) {
          return (
            <Link
              key={i}
              href={t.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              <span className="flex h-10 w-10 -translate-y-2 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-md">
                +
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-1">Proposer</span>
            </Link>
          );
        }

        const href = t.param ? `${t.href}?filtre=${t.param}` : t.href;

        return (
          <Link
            key={i}
            href={href}
            className={[
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-slate-400",
            ].join(" ")}
          >
            <span className="text-xl leading-none">{t.emoji}</span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Suspense fallback={null}>
      <NavContent />
    </Suspense>
  );
}
