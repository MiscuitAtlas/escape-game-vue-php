/**
 * Destination après connexion, lue dans « ?redirect= ». Seuls les chemins internes sont acceptés :
 * un lien piégé ne peut pas renvoyer le joueur vers un autre site.
 */
export function safeRedirect(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : "/salles";
}
