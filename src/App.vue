<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/stores/auth.js";

const router = useRouter();
const logoutError = ref("");

function focusMain() {
  document.getElementById("contenu")?.focus();
}

async function logout() {
  logoutError.value = "";
  try {
    await auth.logout();
    router.push({ name: "home" });
  } catch (e) {
    logoutError.value = e.message;
  }
}
</script>

<template>
  <!-- Avec l'historique « hash », un lien #contenu changerait de page : le focus est déplacé en JavaScript. -->
  <a class="skip-link" href="#contenu" @click.prevent="focusMain">Aller au contenu</a>

  <header class="site-header">
    <div class="container header-inner">
      <router-link class="brand" :to="{ name: 'home' }">
        <span aria-hidden="true">🔐</span>
        Escape Game
      </router-link>
      <nav aria-label="Navigation principale">
        <ul class="nav">
          <li><router-link :to="{ name: 'rooms' }">Les salles</router-link></li>
          <template v-if="auth.state.user">
            <li><router-link :to="{ name: 'account' }">{{ auth.state.user.username }}</router-link></li>
            <li><button type="button" class="link-button" @click="logout">Se déconnecter</button></li>
          </template>
          <template v-else-if="auth.state.online">
            <li><router-link :to="{ name: 'login' }">Connexion</router-link></li>
            <li><router-link class="btn btn-primary btn-small" :to="{ name: 'register' }">Créer un compte</router-link></li>
          </template>
        </ul>
      </nav>
    </div>
    <p v-if="logoutError" class="container alert alert-error" role="alert">{{ logoutError }}</p>
  </header>

  <p v-if="!auth.state.online" class="demo-banner">
    Version de démonstration : les trois salles sont jouables, mais les comptes et le classement demandent le serveur PHP.
  </p>

  <main id="contenu" class="container site-main" tabindex="-1">
    <router-view />
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>Escape game réalisé en licence professionnelle DLWM, puis retravaillé.</p>
      <p>
        <a href="https://github.com/MiscuitAtlas/escape-game-vue-php">Code source</a>
        <span aria-hidden="true"> · </span>
        <a href="https://miscuitatlas.github.io">Maxence Français</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  z-index: 30;
  padding: 0.5rem 1rem;
  background: var(--accent);
  color: var(--on-accent);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.skip-link:focus {
  top: 1rem;
}

.site-header {
  border-bottom: 1px solid var(--border);
  background: rgb(17 21 31 / 0.92);
}

.header-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding-block: 0.85rem;
}

.brand {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text);
  text-decoration: none;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav a:not(.btn),
.link-button {
  color: var(--text);
  text-decoration: none;
  font: inherit;
  font-weight: 500;
}

.nav a:not(.btn):hover,
.nav a.router-link-active:not(.btn),
.link-button:hover {
  color: var(--accent-strong);
}

.link-button {
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.demo-banner {
  margin: 0;
  padding: 0.6rem 1rem;
  text-align: center;
  background: var(--accent-soft);
  border-bottom: 1px solid rgb(224 179 84 / 0.35);
  font-size: 0.9rem;
}

.site-main {
  padding-block: 2rem 3rem;
  min-height: 70vh;
}

.site-main:focus {
  outline: none;
}

.site-footer {
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.9rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  padding-block: 1.25rem;
}

.footer-inner p {
  margin: 0;
}

.site-footer a {
  color: var(--text);
}
</style>
