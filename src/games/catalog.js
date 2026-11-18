import bibliotheque from "@/assets/bibliotheque.webp";
import laboratoire from "@/assets/laboratoire.webp";
import vaisseau from "@/assets/vaisseau.webp";

// Les identifiants correspondent à la table « games » de la base de données.
export const GAMES = [
  {
    id: 1,
    route: "game-library",
    title: "La Bibliothèque Mystérieuse",
    level: "Facile",
    summary: "Quatre énigmes cachées dans les rayonnages gardent la porte secrète.",
    image: bibliotheque,
  },
  {
    id: 2,
    route: "game-lab",
    title: "Le Laboratoire Abandonné",
    level: "Intermédiaire",
    summary: "Retrouvez les bons ingrédients et préparez la potion dans le bon ordre.",
    image: laboratoire,
  },
  {
    id: 3,
    route: "game-ship",
    title: "Le Vaisseau Perdu",
    level: "Difficile",
    summary: "Ramassez les pièces et réparez le vaisseau pour rentrer sur Terre.",
    image: vaisseau,
  },
];

export function gameById(id) {
  return GAMES.find((game) => game.id === id);
}
