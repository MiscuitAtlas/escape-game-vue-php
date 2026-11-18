// Articles retirés en début de réponse : « un secret », « le secret » et « secret » se valent.
const LEADING_ARTICLE = /^(?:l'|le |la |les |un |une |des |du |de la |de l')/;

/** Minuscules, sans accents, sans article initial ni ponctuation : « L'Étoile ! » → « etoile ». */
export function normalizeAnswer(text) {
  const plain = String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(LEADING_ARTICLE, "");
  return plain.replace(/[^a-z0-9]/g, "");
}

export function isCorrect(input, accepted) {
  const answer = normalizeAnswer(input);
  return answer !== "" && accepted.some((candidate) => normalizeAnswer(candidate) === answer);
}
