import Link from "next/link";
import Image from "next/image";
import SubHeader from "@/components/SubHeader";

export const metadata = {
  title: "Pourquoi PieYonne ?",
  description: "Ce qu'on essaie de changer pour notre ville.",
};

const BLOCS = [
  {
    titre: "Ce qui se perd, se retrouve",
    texte: [
      "Un chien échappé posté sur Facebook ne touche que les amis de son propriétaire. Un trousseau de clés ou un téléphone oublié sur un banc finit aussi noyé dans le fil d'actualité de quelqu'un d'autre.",
      "Ici, objets comme animaux perdus sont visibles par tout le quartier, ami ou pas, abonné ou pas. Et celui qui les retrouve sait où le signaler.",
    ],
    img: "/icons/trouver.png",
    alt: "Animal perdu retrouvé",
  },
  {
    titre: "La même visibilité, pour tous",
    texte: [
      "Le petit commerçant sans communauté et le bar d'en face avec 2 000 abonnés sont au même endroit sur la carte.",
      "Votre promo du jour mérite d'être vue, peu importe votre nombre de followers.",
    ],
    img: "/COMMERCE.webp",
    alt: "Commerces locaux",
  },
  {
    titre: "Un banc cassé, vu et traité",
    texte: [
      "Une photo, une localisation, et la mairie peut enfin savoir où agir.",
      "Plus besoin de deviner qui contacter ou comment.",
    ],
    img: "/SIGNALEMENT.jpg",
    alt: "Signalement d'un problème",
  },
  {
    titre: "Votre avis compte vraiment",
    texte: [
      "Une idée pour améliorer votre village, partagée et soutenue par d'autres habitants, ça peut réellement voir le jour.",
      "Chaque citoyen a le droit à la parole, pas seulement ceux qui ont un micro.",
    ],
    img: "/AUXERRE.png",
    alt: "Auxerre, la cathédrale",
  },
  {
    titre: "Votre événement, sur la carte",
    texte: [
      "Concert, expo, soirée associative… n'importe qui peut poster son événement en quelques secondes.",
      "Il apparaît aussitôt sur la carte et dans la liste des sorties, visible par tous les habitants du département.",
      "Plus besoin de payer une plateforme ou d'avoir une grosse communauté pour faire connaître ce que vous organisez.",
    ],
    img: "/EVENEMENT.webp",
    alt: "Événements dans l'Yonne",
  },
  {
    titre: "Le vide-grenier que personne n'a vu passer",
    texte: [
      "Combien de fois vous avez appris qu'il y avait un marché ou une brocante... le jour même ? L'annonce est passée sur Facebook, mais l'algorithme ne l'a montrée qu'à une poignée de personnes.",
      "Sur PieYonne, n'importe quel habitant peut ajouter le vide-grenier ou le marché de sa commune. L'info est là, visible par tous, bien avant le jour J.",
    ],
    img: "/marche.png",
    alt: "Marché et brocante dans l'Yonne",
  },
  {
    titre: "Remplissez les gradins",
    texte: [
      "Un match de foot, de basket, peu importe le club. Annoncez-le et il apparaît sur la carte de tous ceux qui cherchent quoi faire ce week-end.",
    ],
    img: "/gradins.jpg",
    alt: "Gradins",
  },
  {
    titre: "L'entraide, ça commence ici",
    texte: [
      "Un coup de main pour un déménagement, une tonte de pelouse, un covoiturage.",
      "Demander de l'aide à ses voisins, ça devrait être aussi simple qu'un signalement.",
    ],
    img: "/entraide.jpg",
    alt: "Entraide entre voisins",
  },
  {
    titre: "Réalisé et géré par tout le monde",
    texte: [
      "Sur les autres plateformes, c'est l'équipe du site qui décide ce qui est affiché. Ici, c'est vous.",
      "Chacun peut poster son événement, signaler un problème, proposer une idée ou demander un coup de main. Sans inscription, sans algorithme.",
      "Une modération est effectuée quotidiennement pour que tout reste sous contrôle et bienveillant.",
    ],
    img: "/ensemble.jpg.avif",
    alt: "Communauté ensemble",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SubHeader title="Pourquoi PieYonne ?" />

      {/* Intro */}
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-lg leading-relaxed text-slate-600">
          Les réseaux sociaux connectent les gens entre eux. PieYonne connecte les gens à leur ville.
          Voici pourquoi c'est différent.
        </p>
      </div>

      {/* Blocs alternés */}
      <div className="divide-y divide-slate-100">
        {BLOCS.map((b, i) => {
          const imgLeft = i % 2 === 1;
          return (
            <section
              key={b.titre}
              className={[
                "mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-20 lg:px-12",
                imgLeft ? "" : "",
              ].join(" ")}
            >
              {/* Image */}
              <div className={["relative h-72 overflow-hidden rounded-3xl shadow-xl lg:h-96", imgLeft ? "lg:order-first" : "lg:order-last"].join(" ")}>
                <Image
                  src={b.img}
                  alt={b.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Texte */}
              <div className={imgLeft ? "lg:order-last" : "lg:order-first"}>
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 lg:text-4xl">
                  {b.titre}
                </h2>
                <div className="mt-5 space-y-4">
                  {b.texte.map((p, j) => (
                    <p key={j} className="text-base leading-relaxed text-slate-600">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Phrase de conclusion */}
      <section className="border-t border-slate-100 px-6 py-16 text-center">
        <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-slate-500 md:text-2xl">
          <span className="font-semibold text-slate-900">Tout, au même endroit.</span>{" "}
          Cette carte ne remplace pas les sites touristiques ou les outils qui existent déjà. Elle regroupe les bons plans et résout les petites galères du quotidien, pour que la vie de chacun soit un peu plus simple.
        </p>
      </section>

      {/* CTA final */}
      <div className="bg-slate-900 px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-bold">Prêt à essayer ?</h2>
        <p className="mt-4 text-slate-400">
          Gratuit, sans inscription, sans pub. Juste votre ville.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/carte"
            className="rounded-xl bg-white px-8 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-95"
          >
            Ouvrir la carte
          </Link>
          <Link
            href="/soumettre"
            className="rounded-xl border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
          >
            Partager une idée
          </Link>
        </div>
      </div>
    </div>
  );
}
