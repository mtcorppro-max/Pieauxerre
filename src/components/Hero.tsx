import Link from "next/link";
import FadeIn from "./hero/FadeIn";
import AnimatedHeading from "./hero/AnimatedHeading";
import HeroSlideshow from "./hero/HeroSlideshow";
import WeatherPill from "./WeatherPill";

// Hero plein écran : photo d'Auxerre en fond (brut, sans overlay),
// navbar et cartes en "liquid glass", animations d'entrée échelonnées.
const NAV_LINKS = [
  { label: "Pourquoi ?", href: "/pourquoi" },
  { label: "Sorties", href: "/liste" },
  { label: "Entraide", href: "/entraide" },

  { label: "Perdus & Trouvés", href: "/trouvailles" },
  { label: "💡 Idées & signalements", href: "/idees" },
];

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden text-white">
      <HeroSlideshow />

      {/* Dégradés de lisibilité (photo claire) : la photo reste nette en haut,
          le texte du bas ressort sur un fond assombri. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navbar */}
        <div className="px-6 pt-6 md:px-12 lg:px-16">
          <nav className="liquid-glass flex items-center justify-between rounded-xl px-4 py-2">
            <Link href="/" className="text-2xl font-semibold tracking-tight">
              PieYonne
            </Link>
            <div className="hidden items-center gap-8 text-sm md:flex">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="transition-colors hover:text-gray-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <Link
              href="/carte"
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
            >
              Ouvrir la carte
            </Link>
          </nav>
        </div>

        {/* Bas du hero */}
        <div className="flex flex-1 flex-col justify-end px-6 pb-12 md:px-12 lg:px-16 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end">
            {/* Colonne gauche */}
            <div>
              <FadeIn delay={400} duration={800}>
                <WeatherPill />
              </FadeIn>
              <AnimatedHeading
                text={"Votre ville,\nen temps réel."}
                className="mb-4 text-4xl font-normal drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ letterSpacing: "-0.04em" }}
              />

              <FadeIn delay={800} duration={1000}>
                <p className="mb-5 max-w-xl text-base text-gray-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] md:text-lg">
                  Événements, bons plans des bars et restos, commerces ouverts et vos
                  idées — tout sur une seule carte.
                </p>
              </FadeIn>

              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/carte"
                    className="rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-gray-100"
                  >
                    Ouvrir la carte
                  </Link>
                  <Link
                    href="/soumettre"
                    className="liquid-glass rounded-lg border border-white/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
                  >
                    Partager une idée
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Colonne droite */}
            <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass rounded-xl border border-white/20 px-6 py-3">
                  <span className="text-lg font-light md:text-xl lg:text-2xl">
                    Événements. Bons plans. Idées.
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
