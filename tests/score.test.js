import { describe, expect, it } from "vitest";
import { GAME_DURATION, computeScore, formatDate, formatTime } from "../src/utils/score.js";

describe("computeScore", () => {
  it("donne 10 points par seconde restante", () => {
    expect(computeScore(GAME_DURATION, 0)).toBe(1800);
    expect(computeScore(95, 0)).toBe(950);
  });

  it("retire 100 points par indice", () => {
    expect(computeScore(95, 2)).toBe(750);
  });

  it("ne descend jamais sous zéro", () => {
    expect(computeScore(5, 4)).toBe(0);
  });
});

describe("formatTime", () => {
  it("affiche minutes et secondes", () => {
    expect(formatTime(180)).toBe("3:00");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(9)).toBe("0:09");
    expect(formatTime(-3)).toBe("0:00");
  });
});

describe("formatDate", () => {
  it("formate une date MySQL en français", () => {
    expect(formatDate("2025-02-15 17:54:26")).toBe("15 févr. 2025");
  });

  it("renvoie la valeur telle quelle si elle n'est pas une date", () => {
    expect(formatDate("inconnue")).toBe("inconnue");
  });
});
