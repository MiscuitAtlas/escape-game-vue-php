// localStorage peut être indisponible (navigation privée, stockage bloqué) : on ne fait jamais planter le jeu.
export function readPreference(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writePreference(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // préférence non conservée : sans conséquence
  }
}
