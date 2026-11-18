import { nextTick } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { auth } from "@/stores/auth.js";
import HomeView from "@/views/HomeView.vue";

/*
 * Historique « hash » (#/salles) : l'application fonctionne sur n'importe quel hébergement statique,
 * y compris GitHub Pages ou un sous-dossier, sans règle de réécriture côté serveur.
 */
const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/salles", name: "rooms", component: () => import("@/views/RoomsView.vue"), meta: { title: "Les salles" } },
  {
    path: "/salles/bibliotheque",
    name: "game-library",
    component: () => import("@/views/games/LibraryGame.vue"),
    meta: { title: "La Bibliothèque Mystérieuse" },
  },
  {
    path: "/salles/laboratoire",
    name: "game-lab",
    component: () => import("@/views/games/LabGame.vue"),
    meta: { title: "Le Laboratoire Abandonné" },
  },
  {
    path: "/salles/vaisseau",
    name: "game-ship",
    component: () => import("@/views/games/ShipGame.vue"),
    meta: { title: "Le Vaisseau Perdu" },
  },
  { path: "/connexion", name: "login", component: () => import("@/views/LoginView.vue"), meta: { title: "Connexion", guestOnly: true } },
  {
    path: "/inscription",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
    meta: { title: "Inscription", guestOnly: true },
  },
  { path: "/compte", name: "account", component: () => import("@/views/AccountView.vue"), meta: { title: "Mon compte", requiresAuth: true } },
  { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue"), meta: { title: "Page introuvable" } },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  await auth.init();
  if (to.meta.requiresAuth && !auth.state.user) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.state.user) {
    return { name: "account" };
  }
});

router.afterEach((to, from) => {
  document.title = to.meta.title ? `${to.meta.title} – Escape Game` : "Escape Game";
  // Après une navigation, le focus revient au début du contenu (lecteurs d'écran, clavier).
  if (from.matched.length) nextTick(() => document.getElementById("contenu")?.focus({ preventScroll: true }));
});
