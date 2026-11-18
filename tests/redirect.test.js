import { describe, expect, it } from "vitest";
import { safeRedirect } from "../src/utils/redirect.js";

describe("safeRedirect", () => {
  it("garde un chemin interne", () => {
    expect(safeRedirect("/salles/vaisseau")).toBe("/salles/vaisseau");
    expect(safeRedirect("/compte")).toBe("/compte");
  });

  it("refuse une adresse externe ou une valeur invalide", () => {
    for (const value of ["https://exemple.com", "//exemple.com", "/\\exemple.com", "", undefined, ["/compte"]]) {
      expect(safeRedirect(value)).toBe("/salles");
    }
  });
});
