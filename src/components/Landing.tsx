import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";

// Site vitrine : page d'accueil épurée qui présente l'application.
// Hero plein écran (photo + liquid glass) suivi des sections de présentation.

const FEATURES = [
  {
    emoji: "🎵",
    titre: "Événements",
    texte: "Concerts, brocantes, matchs… Voyez ce qui se passe ce soir et cette semaine, près de chez vous.",
    img: "/EVENEMENT.webp",
  },
  {
    emoji: "🔥",
    titre: "Bons plans",
    texte: "Retrouvez ici tous les bons plans de chaque commerce, que ce soit un restaurant, un magasin, une vente ou autre. Ils s'affichent en temps réel et disparaissent à la fin.",
    img: "/BONPLAN.jpg",
  },
  {
    emoji: "🛍️",
    titre: "Marchés & Vide-greniers",
    texte: "Marché de producteurs, brocante, vide-grenier… Chaque habitant peut ajouter l'événement de sa commune. L'info est là bien avant le jour J, visible par tous.",
    img: "/marche.png",
  },
  {
    emoji: "🚧",
    titre: "Signalements & idées",
    texte: "Un lampadaire cassé, un banc qui manque ? Signalez, proposez, votez. La ville s'améliore ensemble.",
    img: "/SIGNALEMENT.jpg",
  },
  {
    emoji: "🤝",
    titre: "Entraide",
    texte: "Tondeuse, déménagement, covoiturage… Postez une annonce en 30 secondes et un voisin vous répond.",
    img: "/entraide.jpg",
  },
  {
    emoji: "🐕",
    titre: "Perdus & Trouvés",
    texte: "Un chien vu au bord de la route, un portefeuille trouvé… Signalez en photo et les Auxerrois vous aident.",
    img: "/icons/trouver.png",
  },
];


const STEPS = [
  { n: "1", titre: "Ouvrez la carte", texte: "Aucun compte, aucune installation obligatoire. Tout est là, tout de suite." },
  { n: "2", titre: "Repérez près de vous", texte: "Les marqueurs vous montrent les événements du jour et les bons plans actifs." },
  { n: "3", titre: "Partagez en 30 s", texte: "Un événement, une promo, un signalement ou une idée : un formulaire, c'est tout." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero plein écran (photo d'Auxerre + liquid glass) */}
      <Hero />

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Ce que vous y trouvez
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Six raisons d'ouvrir l'app chaque jour
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.titre}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card"
            >
              {/* Photo de couverture + titre en surimpression */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={f.img}
                  alt={f.titre}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 flex items-center gap-3 p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-2xl shadow-soft backdrop-blur">
                    {f.emoji}
                  </span>
                  <h3 className="text-2xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    {f.titre}
                  </h3>
                </div>
              </div>
              <p className="p-6 leading-relaxed text-slate-600">{f.texte}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="etapes" className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Simple, vraiment
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Compris en 10 secondes
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{s.titre}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{s.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau gratuit / CTA final */}
      <section id="gratuit" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary shadow-card">
          <div className="pointer-events-none absolute -left-10 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col items-center gap-0 md:flex-row">
            {/* Texte + CTA */}
            <div className="flex-1 px-8 py-16 text-white md:px-16 md:py-20">
              <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-5xl">
                Faite par et pour les habitants de l'Yonne
              </h2>
              <p className="mt-5 max-w-lg text-lg text-blue-100">
                Gratuit, sans publicité, sans paiement. Une appli citoyenne pour mieux
                vivre sa ville, jour après jour.
              </p>
              <Link
                href="/carte"
                className="mt-9 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-primary shadow-soft transition hover:bg-blue-50 active:scale-95"
              >
                Découvrir la carte →
              </Link>
            </div>

            {/* Mascotte */}
            <div className="relative h-64 w-64 shrink-0 self-end md:h-80 md:w-80">
              <Image
                src="/mascotte.png"
                alt="Mascotte PieYonne"
                fill
                sizes="(min-width: 768px) 320px, 256px"
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span aria-hidden>📍</span> PieYonne
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/carte" className="hover:text-primary">La carte</Link>
            <Link href="/liste" className="hover:text-primary">Agenda</Link>
            <Link href="/entraide" className="hover:text-primary">Entraide</Link>

            <Link href="/trouvailles" className="hover:text-primary">Perdus & Trouvés</Link>
            <Link href="/soumettre" className="hover:text-primary">Contribuer</Link>
          </nav>
          <p>© {new Date().getFullYear()} · Auxerre, 89000</p>
        </div>
      </footer>
    </div>
  );
}
