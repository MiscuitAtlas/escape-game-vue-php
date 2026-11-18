<script setup>
import { HINT_PENALTY } from "@/utils/score.js";

defineProps({
  hints: { type: Array, required: true },
  revealed: { type: Array, required: true },
  disabled: Boolean,
});
defineEmits(["reveal"]);
</script>

<template>
  <section class="panel" aria-labelledby="titre-indices">
    <h2 id="titre-indices" class="panel-title">Indices</h2>
    <p class="panel-note">Chaque indice coûte {{ HINT_PENALTY }} points.</p>
    <ol class="hints">
      <li v-for="(hint, index) in hints" :key="index">
        <p v-if="revealed.includes(index)" class="hint-text">{{ hint }}</p>
        <button v-else type="button" class="btn btn-ghost btn-small" :disabled="disabled" @click="$emit('reveal', index)">
          Révéler l'indice {{ index + 1 }}
        </button>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.hints {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
}

.hint-text {
  margin: 0;
  color: var(--text);
}
</style>
