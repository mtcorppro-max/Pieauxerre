import Link from "next/link";
import FadeIn from "./hero/FadeIn";
import AnimatedHeading from "./hero/AnimatedHeading";
import HeroSlideshow from "./hero/HeroSlideshow";
import HeroNav from "./hero/HeroNav";
import WeatherPill from "./WeatherPill";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden text-white">
      <HeroSlideshow />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navbar */}
        <HeroNav />

        {/* Bas du hero */}
        <div className="flex flex-1 flex-col justify-end px-5 pb-8 md:px-12 md:pb-12 lg:px-16 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end">
            {/* Colonne gauche */}
            <div>
              <FadeIn delay={400} duration={800}>
                <div className="mb-3">
                  <WeatherPill />
                </div>
              </FadeIn>
              <AnimatedHeading
                text={"Votre ville,\nen temps réel."}
                className="mb-3 text-3xl font-normal drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ letterSpacing: "-0.04em" }}
              />

              <FadeIn delay={800} duration={1000}>
                <p className="mb-4 max-w-xl text-sm text-gray-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-base md:text-lg">
                  Événements, bons plans, marchés, idées — tout sur une seule carte.
                </p>
              </FadeIn>

              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/carte"
                    className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-100 sm:px-8"
                  >
                    Ouvrir la carte
                  </Link>
                  <Link
                    href="/soumettre"
                    className="liquid-glass rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black sm:px-8"
                  >
                    Partager une idée
                  </Link>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
