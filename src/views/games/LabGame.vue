<script setup>
import { computed, ref } from "vue";
import GameShell from "@/components/GameShell.vue";
import { useEscapeGame } from "@/composables/useEscapeGame.js";
import { gameById } from "@/games/catalog.js";

// Cinq cachettes, cinq ingrédients : seuls trois entrent dans la potion, dans un ordre précis.
const SPOTS = [
  { id: 1, ingredient: "Élixir rouge", place: "les tubes à essai", top: 70, left: 26 },
  { id: 2, ingredient: "Poudre d'or", place: "la paillasse du fond", top: 45, left: 41 },
  { id: 3, ingredient: "Essence mystique", place: "le ballon de verre", top: 53, left: 78 },
  { id: 4, ingredient: "Fragment de cristal", place: "l'armoire vitrée", top: 44, left: 17 },
  { id: 5, ingredient: "Herbes fanées", place: "l'étagère du haut", top: 20, left: 63 },
];
const RECIPE = ["Élixir rouge", "Poudre d'or", "Essence mystique"];

const HINTS = [
  "L'élixir rouge est le premier ingrédient de la potion.",
  "La poudre d'or vient stabiliser le mélange, juste après l'élixir.",
  "L'essence mystique se verse en dernier : c'est elle qui active la potion.",
];

const session = useEscapeGame(gameById(2), HINTS);

const found = ref([]); // ingrédients trouvés, dans l'ordre de découverte
const potion = ref([]); // ingrédients versés dans le chaudron, dans l'ordre

const inventory = computed(() => SPOTS.filter((spot) => found.value.includes(spot.id)));

function search(spot) {
  if (!session.playing) return;
  if (found.value.includes(spot.id)) {
    session.say(`Vous avez déjà fouillé ${spot.place}.`);
    return;
  }
  found.value.push(spot.id);
  session.success(`Vous trouvez : ${spot.ingredient}.`);
}

function addToPotion(name) {
  if (!potion.value.includes(name)) potion.value.push(name);
}

function move(index, offset) {
  const target = index + offset;
  if (target < 0 || target >= potion.value.length) return;
  const list = [...potion.value];
  [list[index], list[target]] = [list[target], list[index]];
  potion.value = list;
}

function remove(index) {
  potion.value.splice(index, 1);
}

function brew() {
  if (!session.playing || !potion.value.length) return;
  const ok = potion.value.length === RECIPE.length && potion.value.every((name, i) => name === RECIPE[i]);
  if (ok) {
    session.win();
  } else {
    session.error("La potion bouillonne puis retombe. Ce n'est pas le bon mélange.");
  }
}

function restart() {
  found.value = [];
  potion.value = [];
  session.restart();
}
</script>

<template>
  <GameShell
    :session="session"
    intro="Le chercheur a laissé une note : «&nbsp;Le rouge réveille, l'or apaise, l'esprit libère.&nbsp;» Fouillez la pièce, puis préparez la potion."
    @restart="restart"
  >
    <div class="scene">
      <img
        :src="session.game.image"
        alt="Un laboratoire abandonné, des fioles colorées sur les paillasses et une porte au fond"
        width="1792"
        height="1024"
      />
      <button
        v-for="spot in SPOTS"
        :key="spot.id"
        type="button"
        class="hotspot"
        :class="{ done: found.includes(spot.id) }"
        :style="{ top: spot.top + '%', left: spot.left + '%' }"
        :disabled="!session.playing"
        :aria-label="`Fouiller ${spot.place}` + (found.includes(spot.id) ? ' (déjà fouillé)' : '')"
        @click="search(spot)"
      >
        <span aria-hidden="true">{{ found.includes(spot.id) ? "✓" : "🔍" }}</span>
      </button>
    </div>

    <template #after>
      <div class="lab-tools">
        <section class="panel" aria-labelledby="titre-inventaire">
          <h2 id="titre-inventaire" class="panel-title">Ingrédients trouvés ({{ inventory.length }} / {{ SPOTS.length }})</h2>
          <p v-if="!inventory.length" class="panel-note">Cliquez sur les loupes pour fouiller le laboratoire.</p>
          <ul v-else class="list">
            <li v-for="spot in inventory" :key="spot.id">
              <span>{{ spot.ingredient }}</span>
              <button
                type="button"
                class="btn btn-ghost btn-small"
                :disabled="potion.includes(spot.ingredient) || !session.playing"
                @click="addToPotion(spot.ingredient)"
              >
                {{ potion.includes(spot.ingredient) ? "Dans le chaudron" : "Verser" }}
              </button>
            </li>
          </ul>
        </section>

        <section class="panel" aria-labelledby="titre-chaudron">
          <h2 id="titre-chaudron" class="panel-title">Le chaudron</h2>
          <p v-if="!potion.length" class="panel-note">Versez des ingrédients, puis remettez-les dans le bon ordre.</p>
          <ol v-else class="list potion">
            <li v-for="(name, index) in potion" :key="name">
              <span>{{ name }}</span>
              <span class="row-actions">
                <button
                  type="button"
                  class="btn btn-ghost btn-small btn-icon"
                  :disabled="index === 0 || !session.playing"
                  :aria-label="`Monter ${name}`"
                  @click="move(index, -1)"
                >
                  ▲
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-small btn-icon"
                  :disabled="index === potion.length - 1 || !session.playing"
                  :aria-label="`Descendre ${name}`"
                  @click="move(index, 1)"
                >
                  ▼
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-small btn-icon"
                  :disabled="!session.playing"
                  :aria-label="`Retirer ${name}`"
                  @click="remove(index)"
                >
                  ✕
                </button>
              </span>
            </li>
          </ol>
          <button type="button" class="btn btn-primary brew" :disabled="!potion.length || !session.playing" @click="brew">
            Préparer la potion
          </button>
        </section>
      </div>
    </template>
  </GameShell>
</template>

<style scoped>
.lab-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.potion {
  counter-reset: etape;
}

.potion li > span:first-child::before {
  counter-increment: etape;
  content: counter(etape) ". ";
  color: var(--accent);
  font-weight: 700;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}

.brew {
  margin-top: 1rem;
  width: 100%;
}
</style>
