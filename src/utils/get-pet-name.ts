import { GameStats } from "../models/game-stats";

export function getPetName(petType: GameStats["petType"]): string {
  switch (petType) {
    case "cat":
      return "Fluffy";
    case "dog":
      return "Buddy";
    case "hamster":
      return "Nibbles";
    case "rabbit":
      return "Bunny";
    default:
      return "Pet";
  }
}