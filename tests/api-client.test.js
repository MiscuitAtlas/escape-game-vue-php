import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, apiEnabled } from "../src/api.js";

function mockFetch(status, body) {
  const fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError("vide")) : Promise.resolve(body)),
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe("client de l'API", () => {
  it("est actif par défaut, sur le dossier api/ du site", () => {
    expect(apiEnabled).toBe(true);
  });

  it("envoie du JSON avec le cookie de session", async () => {
    const fetch = mockFetch(201, { score: 950 });
    await expect(api.saveSession({ gameId: 3, timeRemaining: 95, hintsUsed: 0 })).resolves.toEqual({ score: 950 });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("api/save_session.php");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("same-origin");
    expect(options.headers["Content-Type"]).toBe("application/json");
    // Le score n'est jamais envoyé : le serveur le calcule.
    expect(JSON.parse(options.body)).toEqual({ game_id: 3, time_remaining: 95, hints_used: 0 });
  });

  it("encode les paramètres de l'URL", async () => {
    const fetch = mockFetch(200, { leaderboard: [] });
    await api.leaderboard("1&x=2");
    expect(fetch.mock.calls[0][0]).toBe("api/leaderboard.php?game_id=1%26x%3D2");
  });

  it("transmet le message d'erreur du serveur", async () => {
    mockFetch(401, { error: "Email ou mot de passe incorrect." });
    const error = await api.login("a@b.fr", "mauvais").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Email ou mot de passe incorrect.");
    expect(error.status).toBe(401);
  });

  it("donne un message clair si la réponse n'est pas du JSON", async () => {
    mockFetch(500);
    await expect(api.me()).rejects.toThrow("Le serveur a répondu avec une erreur (500).");
  });

  it("donne un message clair si le serveur est injoignable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(api.me()).rejects.toThrow("Impossible de joindre le serveur.");
  });
});
