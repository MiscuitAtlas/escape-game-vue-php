import { reactive, readonly } from "vue";
import { api, apiEnabled } from "@/api.js";

const state = reactive({
  user: null,
  // false : serveur absent (démo GitHub Pages) ou injoignable. Les salles restent jouables.
  online: apiEnabled,
});

let ready = null;

/** Vérifie une seule fois si une session est ouverte côté serveur. */
function init() {
  if (!ready) {
    ready = (async () => {
      if (!apiEnabled) return;
      try {
        state.user = (await api.me()).user;
        state.online = true;
      } catch {
        state.online = false;
      }
    })();
  }
  return ready;
}

export const auth = {
  state: readonly(state),
  init,
  async login(email, password) {
    state.user = (await api.login(email, password)).user;
    return state.user;
  },
  async register(fields) {
    state.user = (await api.register(fields)).user;
    return state.user;
  },
  async logout() {
    try {
      await api.logout();
    } finally {
      state.user = null;
    }
  },
};
