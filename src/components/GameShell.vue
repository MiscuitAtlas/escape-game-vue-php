<script setup>
import EndDialog from "./EndDialog.vue";
import HintPanel from "./HintPanel.vue";
import LeaderboardPanel from "./LeaderboardPanel.vue";
import { GAME_DURATION, formatTime } from "@/utils/score.js";
import { soundEnabled, toggleSound } from "@/utils/sounds.js";

defineProps({
  session: { type: Object, required: true },
  intro: { type: String, required: true },
});
defineEmits(["restart"]);
</script>

<template>
  <div class="game">
    <header class="game-header">
      <div class="game-heading">
        <p class="eyebrow">{{ session.game.level }}</p>
        <h1>{{ session.game.title }}</h1>
        <p class="muted">{{ intro }}</p>
      </div>
      <div class="game-meta">
        <dl class="game-status">
          <div :class="{ urgent: session.timeLeft <= 30 }">
            <dt>Temps restant</dt>
            <dd><span role="timer">{{ formatTime(session.timeLeft) }}</span></dd>
          </div>
          <div>
            <dt>Score possible</dt>
            <dd>{{ session.potentialScore }}</dd>
          </div>
          <div>
            <dt>Indices utilisés</dt>
            <dd>{{ session.hintsUsed }} / {{ session.hints.length }}</dd>
          </div>
        </dl>
        <button type="button" class="btn btn-ghost btn-small" @click="toggleSound">
          {{ soundEnabled ? "Son activé" : "Son coupé" }}
        </button>
      </div>
      <div class="clock-bar" aria-hidden="true">
        <div :style="{ width: (session.timeLeft / GAME_DURATION) * 100 + '%' }" />
      </div>
    </header>

    <div class="game-body">
      <section class="game-scene" aria-label="Salle de jeu">
        <slot />
        <p class="feedback" :class="session.feedback.tone" role="status" aria-live="polite">{{ session.feedback.message }}</p>
        <slot name="after" />
      </section>
      <aside class="game-side">
        <HintPanel :hints="session.hints" :revealed="session.revealed" :disabled="!session.playing" @reveal="session.revealHint" />
        <LeaderboardPanel :rows="session.leaderboard.rows" :loading="session.leaderboard.loading" :error="session.leaderboard.error" />
      </aside>
    </div>

    <EndDialog v-if="!session.playing" :session="session" @restart="$emit('restart')" />
  </div>
</template>

<style scoped>
.game-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem 2rem;
  align-items: end;
  margin-bottom: 1.5rem;
}

.game-heading h1 {
  margin: 0.15rem 0 0.35rem;
}

.game-status {
  display: flex;
  gap: 1.5rem;
  margin: 0;
}

.game-status dt {
  font-size: 0.75rem;
  color: var(--muted);
}

.game-status dd {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.game-status .urgent dd {
  color: var(--danger);
}

.game-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem 1.5rem;
}

.clock-bar {
  grid-column: 1 / -1;
  height: 0.35rem;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
}

.clock-bar div {
  height: 100%;
  background: var(--accent);
  transition: width 1s linear;
}

.game-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  gap: 1.5rem;
  align-items: start;
}

.game-side {
  display: grid;
  gap: 1rem;
}

.feedback {
  min-height: 1.5rem;
  margin: 0.75rem 0;
  font-weight: 600;
}

.feedback.success {
  color: var(--success);
}

.feedback.error {
  color: var(--danger);
}

@media (max-width: 900px) {
  .game-header,
  .game-body {
    grid-template-columns: 1fr;
  }

}
</style>
