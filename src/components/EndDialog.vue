<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { auth } from "@/stores/auth.js";
import { GAME_DURATION, formatTime } from "@/utils/score.js";

const props = defineProps({
  session: { type: Object, required: true },
});
defineEmits(["restart"]);

// <dialog> natif ouvert avec showModal() : le reste de la page devient inerte et le focus reste dans la fenêtre.
const dialog = ref(null);
const heading = ref(null);
onMounted(async () => {
  dialog.value?.showModal?.();
  await nextTick();
  heading.value?.focus();
});

const route = useRoute();
const loginLink = { name: "login", query: { redirect: route.fullPath } };
const timeUsed = () => formatTime(GAME_DURATION - props.session.timeLeft);
</script>

<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="titre-fin" @cancel.prevent>
    <template v-if="session.status === 'won'">
      <h2 id="titre-fin" ref="heading" class="title-font" tabindex="-1">Bravo, vous êtes sorti !</h2>
      <p class="big-score">{{ session.result.score }} points</p>
      <p class="muted">
        Salle terminée en {{ timeUsed() }}, avec {{ session.hintsUsed }} indice{{ session.hintsUsed > 1 ? "s" : "" }}.
      </p>
      <p v-if="!auth.state.online" class="muted">Version de démonstration : les scores ne sont pas enregistrés.</p>
      <p v-else-if="!auth.state.user" class="muted">
        <router-link :to="loginLink">Connectez-vous</router-link> pour enregistrer vos prochains scores au classement.
      </p>
      <p v-else-if="session.result.saving" class="muted">Enregistrement du score…</p>
      <p v-else-if="session.result.saved" class="success-text">Score enregistré dans le classement.</p>
      <p v-else-if="session.result.error" class="error-text">Score non enregistré : {{ session.result.error }}</p>
    </template>
    <template v-else>
      <h2 id="titre-fin" ref="heading" class="title-font" tabindex="-1">Temps écoulé</h2>
      <p class="muted">La salle vous a gardé prisonnier cette fois. Les indices peuvent vous aider, au prix de quelques points.</p>
    </template>
    <div class="actions">
      <button type="button" class="btn btn-primary" @click="$emit('restart')">Rejouer</button>
      <router-link class="btn btn-ghost" :to="{ name: 'rooms' }">Choisir une autre salle</router-link>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  width: min(28rem, 100% - 2rem);
  text-align: center;
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.5);
}

.dialog::backdrop {
  background: rgb(5 8 15 / 0.75);
}

h2:focus {
  outline: none;
}

.big-score {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--accent);
  margin: 0.5rem 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
