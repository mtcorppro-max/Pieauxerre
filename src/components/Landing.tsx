import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";

const BLOCS = [
  {
    titre: "Votre événement, sur la carte",
    texte: "Concert, expo, marché, soirée associative… n'importe qui peut poster son événement en quelques secondes. Il apparaît aussitôt sur la carte, visible par tous les habitants du département.",
    img: "/EVENEMENT.webp",
  },
  {
    titre: "La même visibilité pour tous",
    texte: "Le petit commerçant sans communauté et le bar d'en face avec 2 000 abonnés sont au même endroit sur la carte. Votre promo du jour mérite d'être vue, peu importe votre nombre de followers.",
    img: "/COMMERCE.webp",
  },
  {
    titre: "Un banc cassé, vu et traité",
    texte: "Une photo, une localisation, et la mairie peut enfin savoir où agir. Plus besoin de deviner qui contacter ou comment.",
    img: "/SIGNALEMENT.jpg",
  },
  {
    titre: "Ce qui se perd, se retrouve",
    texte: "Objets comme animaux perdus sont visibles par tout le quartier, ami ou pas, abonné ou pas. Et celui qui les retrouve sait où le signaler.",
    img: "/icons/trouver.png",
  },
  {
    titre: "L'entraide, ça commence ici",
    texte: "Un coup de main pour un déménagement, une tonte de pelouse, un covoiturage. Demander de l'aide à ses voisins, aussi simple qu'un signalement.",
    img: "/entraide.jpg",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Hero />

      {/* Intro */}
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-lg leading-relaxed text-slate-500">
          Les réseaux sociaux connectent les gens entre eux.{" "}
          <span className="font-semibold text-slate-900">Yonne+ connecte les gens à leur ville.</span>
        </p>
      </div>

      {/* Blocs alternés */}
      <div className="divide-y divide-slate-100">
        {BLOCS.map((b, i) => (
          <section key={b.titre} className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-20 lg:px-12">
            <div className={["relative h-64 overflow-hidden rounded-3xl shadow-lg lg:h-80", i % 2 === 1 ? "lg:order-last" : ""].join(" ")}>
              <Image src={b.img} alt={b.titre} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className={i % 2 === 1 ? "lg:order-first" : ""}>
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">{b.titre}</h2>
              <p className="mt-4 leading-relaxed text-slate-600">{b.texte}</p>
            </div>
          </section>
        ))}
      </div>

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
                alt="Mascotte Yonne+"
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
            <span aria-hidden>📍</span> Yonne+
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
