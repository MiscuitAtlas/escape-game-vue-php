<script setup>
import { GAMES } from "@/games/catalog.js";

defineProps({
  headingLevel: { type: String, default: "h2" },
});
</script>

<template>
  <ul class="rooms">
    <li v-for="game in GAMES" :key="game.id" class="room">
      <img :src="game.image" alt="" width="640" height="400" loading="lazy" />
      <div class="room-body">
        <p class="eyebrow">{{ game.level }}</p>
        <component :is="headingLevel" class="room-title title-font">
          <router-link :to="{ name: game.route }">{{ game.title }}</router-link>
        </component>
        <p class="muted">{{ game.summary }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.rooms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.room {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.15s, transform 0.15s;
}

.room:hover,
.room:focus-within {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.room img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.room-body {
  padding: 1rem 1.25rem 1.25rem;
}

.room-title {
  margin: 0.2rem 0 0.4rem;
  font-size: 1.2rem;
}

.room-title a {
  color: var(--text);
  text-decoration: none;
}

/* Toute la carte est cliquable, mais un seul lien est annoncé. */
.room-title a::after {
  content: "";
  position: absolute;
  inset: 0;
}

.room-title a:focus-visible {
  outline: none;
}

.room:has(a:focus-visible) {
  outline: 3px solid var(--accent-strong);
  outline-offset: 2px;
}

.room p:last-child {
  margin: 0;
}
</style>
