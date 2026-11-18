<script setup>
import { auth } from "@/stores/auth.js";
import { GAME_DURATION, formatTime } from "@/utils/score.js";

defineProps({
  rows: { type: Array, required: true },
  loading: Boolean,
  error: { type: String, default: "" },
});
</script>

<template>
  <section class="panel" aria-labelledby="titre-classement">
    <h2 id="titre-classement" class="panel-title">Classement</h2>
    <p v-if="!auth.state.online" class="panel-note">Le classement n'est pas disponible dans la version de démonstration.</p>
    <p v-else-if="loading && !rows.length" class="panel-note">Chargement…</p>
    <p v-else-if="error" class="panel-note error-text">{{ error }}</p>
    <p v-else-if="!rows.length" class="panel-note">Aucun score pour l'instant. Soyez le premier !</p>
    <ol v-else class="leaderboard">
      <li v-for="(row, index) in rows" :key="row.username" :class="{ me: row.username === auth.state.user?.username }">
        <span class="rank">{{ index + 1 }}</span>
        <span class="name">{{ row.username }}</span>
        <span class="score">{{ row.score }} pts</span>
        <span class="time">en {{ formatTime(GAME_DURATION - row.time_remaining) }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.leaderboard {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}

.leaderboard li {
  display: grid;
  grid-template-columns: 1.5rem 1fr auto;
  grid-template-areas: "rank name score" "rank time time";
  column-gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-sm);
}

.leaderboard li.me {
  background: var(--accent-soft);
}

.rank {
  grid-area: rank;
  font-weight: 700;
  color: var(--accent);
}

.name {
  grid-area: name;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score {
  grid-area: score;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.time {
  grid-area: time;
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
