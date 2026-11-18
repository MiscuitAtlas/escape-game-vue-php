<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { safeRedirect } from "@/utils/redirect.js";
import { auth } from "@/stores/auth.js";

const route = useRoute();
const router = useRouter();
const form = reactive({ username: "", email: "", password: "", confirm: "" });
const error = ref("");
const submitting = ref(false);

const USERNAME = /^[\p{L}\p{N}_.-]{3,30}$/u;

const problems = computed(() => {
  const list = [];
  if (form.username && !USERNAME.test(form.username.trim())) {
    list.push("Le pseudo doit faire de 3 à 30 caractères : lettres, chiffres, point, tiret ou tiret bas.");
  }
  if (form.password && form.password.length < 8) list.push("Le mot de passe doit contenir au moins 8 caractères.");
  if (form.confirm && form.confirm !== form.password) list.push("Les deux mots de passe ne correspondent pas.");
  return list;
});

const ready = computed(() => form.username && form.email && form.password && form.confirm && !problems.value.length);

async function submit() {
  if (!ready.value) return;
  error.value = "";
  submitting.value = true;
  try {
    await auth.register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
    router.replace(safeRedirect(route.query.redirect));
  } catch (e) {
    error.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="narrow">
    <h1>Créer un compte</h1>
    <p v-if="!auth.state.online" class="alert alert-info">
      Les comptes ne sont pas disponibles dans la version de démonstration.
      <router-link :to="{ name: 'rooms' }">Jouer sans compte</router-link>
    </p>
    <form v-else class="form panel" novalidate @submit.prevent="submit">
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
      <div class="field">
        <label for="register-username">Pseudo</label>
        <input
          id="register-username"
          v-model="form.username"
          class="input"
          autocomplete="username"
          maxlength="30"
          aria-describedby="register-username-help"
          required
        />
        <small id="register-username-help">Affiché dans le classement.</small>
      </div>
      <div class="field">
        <label for="register-email">Email</label>
        <input id="register-email" v-model="form.email" class="input" type="email" autocomplete="email" maxlength="100" required />
      </div>
      <div class="field">
        <label for="register-password">Mot de passe</label>
        <input
          id="register-password"
          v-model="form.password"
          class="input"
          type="password"
          autocomplete="new-password"
          aria-describedby="register-password-help"
          required
        />
        <small id="register-password-help">8 caractères minimum.</small>
      </div>
      <div class="field">
        <label for="register-confirm">Confirmer le mot de passe</label>
        <input id="register-confirm" v-model="form.confirm" class="input" type="password" autocomplete="new-password" required />
      </div>
      <ul v-if="problems.length" class="problems error-text" aria-live="polite">
        <li v-for="problem in problems" :key="problem">{{ problem }}</li>
      </ul>
      <button class="btn btn-primary" type="submit" :disabled="submitting || !ready">
        {{ submitting ? "Création…" : "Créer mon compte" }}
      </button>
      <p class="muted switch">
        Déjà inscrit&nbsp;?
        <router-link :to="{ name: 'login', query: route.query }">Se connecter</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.problems {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.9rem;
}

.switch {
  margin: 0;
}
</style>
