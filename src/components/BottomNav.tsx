"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

function IconCalendar({ active }: { active: boolean }) {
  const c = active ? "#1d4ed8" : "#475569";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconHandshake({ active }: { active: boolean }) {
  const c = active ? "#1d4ed8" : "#475569";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconSearch({ active }: { active: boolean }) {
  const c = active ? "#1d4ed8" : "#475569";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}

function IconFlag({ active }: { active: boolean }) {
  const c = active ? "#1d4ed8" : "#475569";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l9 3 9-3v13l-9 3-9-3V4z" />
    </svg>
  );
}

const TABS = [
  { href: "/liste",       label: "Sorties",      Icon: IconCalendar },
  { href: "/entraide",    label: "Entraide",     Icon: IconHandshake },
  { href: "/trouvailles", label: "Trouvailles",  Icon: IconSearch },
  { href: "/idees",       label: "Signalement",  Icon: IconFlag },
];

function NavContent() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[2000] flex border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-2px_16px_rgba(15,23,42,0.1)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3"
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
            )}
            <Icon active={active} />
            <span className={[
              "text-[11px] font-semibold leading-none",
              active ? "text-primary" : "text-slate-600",
            ].join(" ")}>
              {label}
            </span>
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
