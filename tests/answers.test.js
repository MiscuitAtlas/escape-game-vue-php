import { describe, expect, it } from "vitest";
import { isCorrect, normalizeAnswer } from "../src/utils/answers.js";

describe("normalizeAnswer", () => {
  it("ignore la casse, les accents, la ponctuation et les espaces", () => {
    expect(normalizeAnswer("  La Voie Lactée ! ")).toBe("voielactee");
    expect(normalizeAnswer("ÉTOILE")).toBe("etoile");
  });

  it("retire l'article en début de réponse", () => {
    for (const input of ["un secret", "le secret", "Secret", "UN SECRET"]) {
      expect(normalizeAnswer(input)).toBe("secret");
    }
    expect(normalizeAnswer("l'air")).toBe("air");
    expect(normalizeAnswer("L’obscurité")).toBe("obscurite");
  });

  it("garde les chiffres", () => {
    expect(normalizeAnswer("Voyager 1")).toBe("voyager1");
  });

  it("accepte une valeur vide ou absente", () => {
    expect(normalizeAnswer("")).toBe("");
    expect(normalizeAnswer(undefined)).toBe("");
  });
});

describe("isCorrect", () => {
  it("accepte chacune des réponses prévues", () => {
    const accepted = ["une étoile", "la lettre N", "N"];
    expect(isCorrect("Étoile", accepted)).toBe(true);
    expect(isCorrect("n", accepted)).toBe(true);
    expect(isCorrect("la lettre n", accepted)).toBe(true);
  });

  it("refuse une mauvaise réponse ou une réponse vide", () => {
    expect(isCorrect("lune", ["une étoile"])).toBe(false);
    expect(isCorrect("   ", ["une étoile"])).toBe(false);
    expect(isCorrect("le", ["le vent"])).toBe(false);
  });
});
