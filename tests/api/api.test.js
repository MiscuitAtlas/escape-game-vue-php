/*
 * Tests d'intégration de l'API PHP, contre un vrai serveur et une vraie base MySQL/MariaDB.
 * Ignorés si API_TEST_URL n'est pas défini. Voir « Tests » dans le README.
 *
 *   API_TEST_URL=http://localhost:8000/api npm run test:api
 */
import { beforeAll, describe, expect, it } from "vitest";

const BASE = process.env.API_TEST_URL?.replace(/\/$/, "");

/** Petit client qui garde le cookie de session, comme un navigateur. */
function client() {
  let cookie = "";
  return async function call(path, { method = "GET", body, headers = {}, raw } = {}) {
    const response = await fetch(`${BASE}/${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const pair = setCookie.split(";")[0];
      cookie = pair.endsWith("=deleted") || pair.endsWith("=") ? "" : pair;
    }
    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: response.status, data, headers: response.headers };
  };
}

const unique = Date.now().toString(36);
const player = { username: `joueur_${unique}`, email: `joueur_${unique}@exemple.fr`, password: "motdepasse-solide" };

describe.skipIf(!BASE)("API PHP", () => {
  const alice = client();

  beforeAll(async () => {
    const res = await alice("register.php", { method: "POST", body: player });
    expect(res.status).toBe(201);
  });

  describe("inscription", () => {
    it("connecte le joueur et ne renvoie jamais le mot de passe", async () => {
      const res = await alice("me.php");
      expect(res.status).toBe(200);
      expect(res.data.user).toMatchObject({ username: player.username, email: player.email });
      expect(JSON.stringify(res.data)).not.toMatch(/password|motdepasse/i);
    });

    it("refuse un email ou un pseudo déjà pris", async () => {
      const res = await client()("register.php", { method: "POST", body: { ...player, username: `autre_${unique}` } });
      expect(res.status).toBe(409);
      const res2 = await client()("register.php", { method: "POST", body: { ...player, email: `autre_${unique}@exemple.fr` } });
      expect(res2.status).toBe(409);
    });

    it("valide les champs", async () => {
      const bob = client();
      const cases = [
        { username: "ab", email: "b@exemple.fr", password: "motdepasse" },
        { username: "<script>", email: "b@exemple.fr", password: "motdepasse" },
        { username: "bob_ok", email: "pas-un-email", password: "motdepasse" },
        { username: "bob_ok", email: "b@exemple.fr", password: "court" },
        { username: "bob_ok", email: "b@exemple.fr", password: "x".repeat(73) },
      ];
      for (const body of cases) {
        const res = await bob("register.php", { method: "POST", body });
        expect(res.status, JSON.stringify(body)).toBe(422);
      }
    });

    it("refuse un corps qui n'est pas du JSON (formulaire envoyé depuis un autre site)", async () => {
      const res = await client()("register.php", {
        method: "POST",
        raw: "username=x&email=x@x.fr&password=12345678",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      expect(res.status).toBe(415);
    });

    it("refuse une mauvaise méthode HTTP", async () => {
      const res = await client()("register.php");
      expect(res.status).toBe(405);
    });
  });

  describe("connexion", () => {
    it("donne le même message pour un email inconnu et un mauvais mot de passe", async () => {
      const unknown = await client()("login.php", { method: "POST", body: { email: `inconnu_${unique}@exemple.fr`, password: "peu-importe" } });
      const wrong = await client()("login.php", { method: "POST", body: { email: player.email, password: "mauvais-mot-de-passe" } });
      expect(unknown.status).toBe(401);
      expect(wrong.status).toBe(401);
      expect(unknown.data.error).toBe(wrong.data.error);
    });

    it("pose un cookie de session HttpOnly et SameSite", async () => {
      const res = await client()("login.php", { method: "POST", body: { email: player.email.toUpperCase(), password: player.password } });
      expect(res.status).toBe(200);
      const cookie = res.headers.get("set-cookie");
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/SameSite=Lax/i);
    });
  });

  describe("parties", () => {
    it("exige une session pour enregistrer une partie", async () => {
      const res = await client()("save_session.php", { method: "POST", body: { game_id: 1, time_remaining: 100, hints_used: 0 } });
      expect(res.status).toBe(401);
    });

    it("calcule le score côté serveur et ignore un score envoyé par le client", async () => {
      const res = await alice("save_session.php", {
        method: "POST",
        body: { game_id: 1, time_remaining: 120, hints_used: 1, score: 999999, user_id: 1 },
      });
      expect(res.status).toBe(201);
      expect(res.data.score).toBe(1100);
    });

    it("refuse des valeurs impossibles", async () => {
      const cases = [
        { game_id: 1, time_remaining: 181, hints_used: 0 },
        { game_id: 1, time_remaining: -1, hints_used: 0 },
        { game_id: 1, time_remaining: 100, hints_used: 5 },
        { game_id: 1, time_remaining: "100", hints_used: 0 },
      ];
      for (const body of cases) {
        const res = await alice("save_session.php", { method: "POST", body });
        expect(res.status, JSON.stringify(body)).toBe(400);
      }
      const unknownGame = await alice("save_session.php", { method: "POST", body: { game_id: 99, time_remaining: 100, hints_used: 0 } });
      expect(unknownGame.status).toBe(404);
    });

    it("garde le meilleur score de chaque joueur dans le classement", async () => {
      await alice("save_session.php", { method: "POST", body: { game_id: 1, time_remaining: 150, hints_used: 0 } });
      await alice("save_session.php", { method: "POST", body: { game_id: 1, time_remaining: 30, hints_used: 0 } });
      const res = await client()("leaderboard.php?game_id=1");
      expect(res.status).toBe(200);
      const mine = res.data.leaderboard.filter((row) => row.username === player.username);
      expect(mine).toHaveLength(1);
      expect(mine[0]).toMatchObject({ score: 1500, time_remaining: 150, hints_used: 0 });
      expect(Object.keys(mine[0]).sort()).toEqual(["hints_used", "played_at", "score", "time_remaining", "username"]);
    });

    it("valide l'identifiant de salle du classement", async () => {
      expect((await client()("leaderboard.php?game_id=abc")).status).toBe(400);
      expect((await client()("leaderboard.php")).status).toBe(400);
    });

    it("renvoie l'historique du joueur connecté uniquement", async () => {
      const res = await alice("history.php");
      expect(res.status).toBe(200);
      expect(res.data.history).toHaveLength(3);
      expect(res.data.history[0]).toMatchObject({ game_id: 1, game_name: "La Bibliothèque Mystérieuse" });
      expect((await client()("history.php")).status).toBe(401);
    });
  });

  describe("mot de passe", () => {
    it("exige le mot de passe actuel", async () => {
      const res = await alice("change_password.php", {
        method: "POST",
        body: { current_password: "mauvais", new_password: "nouveau-mot-de-passe" },
      });
      expect(res.status).toBe(403);
    });

    it("change le mot de passe, puis l'ancien ne fonctionne plus", async () => {
      const res = await alice("change_password.php", {
        method: "POST",
        body: { current_password: player.password, new_password: "nouveau-mot-de-passe" },
      });
      expect(res.status).toBe(200);
      const old = await client()("login.php", { method: "POST", body: { email: player.email, password: player.password } });
      expect(old.status).toBe(401);
      const fresh = await client()("login.php", { method: "POST", body: { email: player.email, password: "nouveau-mot-de-passe" } });
      expect(fresh.status).toBe(200);
    });
  });

  describe("déconnexion", () => {
    it("ferme la session", async () => {
      expect((await alice("logout.php", { method: "POST" })).status).toBe(200);
      const res = await alice("me.php");
      expect(res.data.user).toBeNull();
    });
  });

  describe("erreurs", () => {
    it("ne divulgue aucun détail technique", async () => {
      const res = await client()("login.php", { method: "POST", raw: "{pas du json", headers: { "Content-Type": "application/json" } });
      expect(res.status).toBe(400);
      expect(JSON.stringify(res.data)).not.toMatch(/PDO|SQL|Stack|\.php:/i);
    });
  });
});
