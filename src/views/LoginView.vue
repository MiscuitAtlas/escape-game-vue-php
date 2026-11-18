<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { safeRedirect } from "@/utils/redirect.js";
import { auth } from "@/stores/auth.js";

const route = useRoute();
const router = useRouter();
const form = reactive({ email: "", password: "" });
const error = ref("");
const submitting = ref(false);

async function submit() {
  error.value = "";
  submitting.value = true;
  try {
    await auth.login(form.email.trim(), form.password);
    router.replace(safeRedirect(route.query.redirect));
  } catch (e) {
    error.value = e.message;
    form.password = "";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="narrow">
    <h1>Connexion</h1>
    <p v-if="!auth.state.online" class="alert alert-info">
      Les comptes ne sont pas disponibles dans la version de démonstration.
      <router-link :to="{ name: 'rooms' }">Jouer sans compte</router-link>
    </p>
    <form v-else class="form panel" novalidate @submit.prevent="submit">
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
      <div class="field">
        <label for="login-email">Email</label>
        <input id="login-email" v-model="form.email" class="input" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="login-password">Mot de passe</label>
        <input id="login-password" v-model="form.password" class="input" type="password" autocomplete="current-password" required />
      </div>
      <button class="btn btn-primary" type="submit" :disabled="submitting || !form.email || !form.password">
        {{ submitting ? "Connexion…" : "Se connecter" }}
      </button>
      <p class="muted switch">
        Pas encore de compte&nbsp;?
        <router-link :to="{ name: 'register', query: route.query }">Créer un compte</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.switch {
  margin: 0;
}
</style>
