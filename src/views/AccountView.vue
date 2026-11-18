<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/api.js";
import { auth } from "@/stores/auth.js";
import { GAME_DURATION, formatDate, formatTime } from "@/utils/score.js";

const router = useRouter();
const history = reactive({ rows: [], loading: true, error: "" });

const stats = computed(() => ({
  played: history.rows.length,
  best: history.rows.reduce((max, row) => Math.max(max, row.score), 0),
  rooms: new Set(history.rows.map((row) => row.game_id)).size,
}));

onMounted(async () => {
  try {
    history.rows = (await api.history()).history;
  } catch (e) {
    history.error = e.message;
  } finally {
    history.loading = false;
  }
});

const password = reactive({ current: "", next: "", confirm: "" });
const passwordState = reactive({ submitting: false, error: "", success: "" });
const passwordProblem = computed(() => {
  if (password.next && password.next.length < 8) return "Le nouveau mot de passe doit contenir au moins 8 caractères.";
  if (password.confirm && password.confirm !== password.next) return "Les deux mots de passe ne correspondent pas.";
  return "";
});
const passwordReady = computed(() => password.current && password.next && password.confirm && !passwordProblem.value);

async function changePassword() {
  if (!passwordReady.value) return;
  Object.assign(passwordState, { submitting: true, error: "", success: "" });
  try {
    passwordState.success = (await api.changePassword(password.current, password.next)).message;
    Object.assign(password, { current: "", next: "", confirm: "" });
  } catch (e) {
    passwordState.error = e.message;
  } finally {
    passwordState.submitting = false;
  }
}

const logoutError = ref("");
async function logout() {
  try {
    await auth.logout();
    router.push({ name: "home" });
  } catch (e) {
    logoutError.value = e.message;
  }
}
</script>

<template>
  <!-- v-if : à la déconnexion depuis l'en-tête, l'utilisateur disparaît avant le changement de page. -->
  <div v-if="auth.state.user" class="account">
    <header class="account-header">
      <div>
        <h1>{{ auth.state.user.username }}</h1>
        <p class="muted">{{ auth.state.user.email }}</p>
      </div>
      <button type="button" class="btn btn-ghost" @click="logout">Se déconnecter</button>
      <p v-if="logoutError" class="alert alert-error" role="alert">{{ logoutError }}</p>
    </header>

    <section class="panel" aria-labelledby="titre-historique">
      <h2 id="titre-historique" class="panel-title">Mes parties</h2>
      <p v-if="history.loading" class="panel-note">Chargement…</p>
      <p v-else-if="history.error" class="alert alert-error">{{ history.error }}</p>
      <template v-else-if="history.rows.length">
        <dl class="stats">
          <div>
            <dt>Parties gagnées</dt>
            <dd>{{ stats.played }}</dd>
          </div>
          <div>
            <dt>Meilleur score</dt>
            <dd>{{ stats.best }}</dd>
          </div>
          <div>
            <dt>Salles terminées</dt>
            <dd>{{ stats.rooms }} / 3</dd>
          </div>
        </dl>
        <div class="table-wrap">
          <table>
            <caption class="sr-only">
              Vos 50 dernières parties gagnées
            </caption>
            <thead>
              <tr>
                <th scope="col">Salle</th>
                <th scope="col" class="num">Score</th>
                <th scope="col" class="num">Temps</th>
                <th scope="col" class="num">Indices</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in history.rows" :key="index">
                <td>{{ row.game_name }}</td>
                <td class="num">{{ row.score }}</td>
                <td class="num">{{ formatTime(GAME_DURATION - row.time_remaining) }}</td>
                <td class="num">{{ row.hints_used }}</td>
                <td>{{ formatDate(row.played_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <p v-else class="panel-note">
        Aucune partie gagnée pour l'instant. <router-link :to="{ name: 'rooms' }">Choisir une salle</router-link>
      </p>
    </section>

    <section class="panel" aria-labelledby="titre-mot-de-passe">
      <h2 id="titre-mot-de-passe" class="panel-title">Changer de mot de passe</h2>
      <form class="form password-form" novalidate @submit.prevent="changePassword">
        <p v-if="passwordState.error" class="alert alert-error" role="alert">{{ passwordState.error }}</p>
        <p v-if="passwordState.success" class="alert alert-success" role="status">{{ passwordState.success }}</p>
        <div class="field">
          <label for="current-password">Mot de passe actuel</label>
          <input id="current-password" v-model="password.current" class="input" type="password" autocomplete="current-password" />
        </div>
        <div class="field">
          <label for="new-password">Nouveau mot de passe</label>
          <input id="new-password" v-model="password.next" class="input" type="password" autocomplete="new-password" />
        </div>
        <div class="field">
          <label for="confirm-password">Confirmer le nouveau mot de passe</label>
          <input id="confirm-password" v-model="password.confirm" class="input" type="password" autocomplete="new-password" />
        </div>
        <p v-if="passwordProblem" class="error-text problem" aria-live="polite">{{ passwordProblem }}</p>
        <button class="btn btn-primary" type="submit" :disabled="passwordState.submitting || !passwordReady">
          {{ passwordState.submitting ? "Modification…" : "Changer le mot de passe" }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.account {
  display: grid;
  gap: 1.5rem;
}

.account-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.account-header h1,
.account-header p {
  margin: 0;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  margin: 0 0 1rem;
}

.stats dt {
  color: var(--muted);
  font-size: 0.85rem;
}

.stats dd {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 0.55rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

th {
  color: var(--muted);
  font-weight: 600;
  font-size: 0.85rem;
}

.num {
  text-align: right;
}

.password-form {
  max-width: 26rem;
}

.problem {
  margin: 0;
}
</style>
