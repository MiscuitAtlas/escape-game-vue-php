/**
 * Client de l'API PHP. Les cookies de session sont envoyés automatiquement (même origine).
 * VITE_API_URL vide : mode démo, sans serveur (comptes et classement désactivés).
 */
const BASE = (import.meta.env.VITE_API_URL ?? "api").replace(/\/$/, "");

export const apiEnabled = BASE !== "";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  if (!apiEnabled) {
    throw new ApiError("Le serveur n'est pas disponible dans cette version de démonstration.");
  }
  let response;
  try {
    response = await fetch(`${BASE}/${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    throw new ApiError(data?.error ?? `Le serveur a répondu avec une erreur (${response.status}).`, response.status);
  }
  return data;
}

export const api = {
  me: () => request("me.php"),
  register: ({ username, email, password }) => request("register.php", { method: "POST", body: { username, email, password } }),
  login: (email, password) => request("login.php", { method: "POST", body: { email, password } }),
  logout: () => request("logout.php", { method: "POST" }),
  changePassword: (currentPassword, newPassword) =>
    request("change_password.php", { method: "POST", body: { current_password: currentPassword, new_password: newPassword } }),
  leaderboard: (gameId) => request(`leaderboard.php?game_id=${encodeURIComponent(gameId)}`),
  history: () => request("history.php"),
  saveSession: ({ gameId, timeRemaining, hintsUsed }) =>
    request("save_session.php", { method: "POST", body: { game_id: gameId, time_remaining: timeRemaining, hints_used: hintsUsed } }),
};
