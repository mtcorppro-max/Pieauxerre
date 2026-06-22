import Link from "next/link";

// En-tête simple pour les pages secondaires, avec retour à la carte.
export default function SubHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
      <Link
        href="/carte"
        aria-label="Retour à la carte"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </header>
  );
}
