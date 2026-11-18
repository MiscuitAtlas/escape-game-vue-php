// Mêmes constantes et même formule que l'API (api/lib/bootstrap.php) : le serveur recalcule le score.
export const GAME_DURATION = 180;
export const POINTS_PER_SECOND = 10;
export const HINT_PENALTY = 100;

export function computeScore(timeLeft, hintsUsed) {
  return Math.max(0, timeLeft * POINTS_PER_SECOND - hintsUsed * HINT_PENALTY);
}

/** 125 → « 2:05 » */
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function formatDate(value) {
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
