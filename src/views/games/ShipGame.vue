<script setup>
import { computed, nextTick, ref } from "vue";
import GameShell from "@/components/GameShell.vue";
import { useEscapeGame } from "@/composables/useEscapeGame.js";
import { gameById } from "@/games/catalog.js";
import { isCorrect } from "@/utils/answers.js";
import card from "@/assets/card.webp";
import fuse from "@/assets/fuse.png";
import key from "@/assets/key.webp";

// Objets à ramasser et zones à réparer, positionnés en pourcentage de l'image (top, left).
const ITEMS = [
  { id: "fuse", name: "Fusible", image: fuse, top: 45, left: 64 },
  { id: "card", name: "Carte d'accès", image: card, top: 70, left: 20 },
  { id: "key", name: "Clé de sécurité", image: key, top: 80, left: 64 },
];

const ZONES = [
  {
    id: "power",
    name: "Boîtier électrique",
    item: "fuse",
    top: 45,
    left: 23,
    question: "Quelle est la première sonde à avoir quitté le système solaire ?",
    answers: ["Voyager 1", "Voyager", "Voyager I"],
  },
  {
    id: "panel",
    name: "Panneau de contrôle",
    item: "card",
    top: 75,
    left: 93,
    question: "Combien de planètes tournent autour du Soleil ?",
    answers: ["8", "huit"],
  },
  {
    id: "engine",
    name: "Démarreur",
    item: "key",
    top: 55,
    left: 55,
    question: "Quel est le nom de notre galaxie ?",
    answers: ["la Voie lactée", "Voie lactée", "Milky Way"],
  },
];

const HINTS = [
  "Depuis que Pluton n'est plus considérée comme une planète, le système solaire en compte une de moins.",
  "Lancée en 1977, elle a franchi l'héliopause en 2012.",
  "Notre galaxie doit son nom à la traînée blanchâtre qu'elle dessine dans le ciel nocturne.",
];

const session = useEscapeGame(gameById(3), HINTS);

const collected = ref([]); // objets ramassés, pas encore utilisés
const selected = ref(null);
const repaired = ref([]); // zones réparées
const current = ref(null); // zone dont la question est affichée
const answer = ref("");
const answerInput = ref(null);

const itemById = (id) => ITEMS.find((item) => item.id === id);
const onFloor = computed(() => ITEMS.filter((item) => !collected.value.includes(item.id) && !isUsed(item.id)));
const inventory = computed(() => collected.value.map(itemById));

function isUsed(itemId) {
  return repaired.value.some((zoneId) => ZONES.find((zone) => zone.id === zoneId).item === itemId);
}

function pickUp(item) {
  if (!session.playing) return;
  collected.value.push(item.id);
  session.success(`${item.name} ramassé${item.id === "card" ? "e" : ""}.`);
}

function select(item) {
  selected.value = selected.value === item.id ? null : item.id;
}

async function useOn(zone) {
  if (!session.playing) return;
  if (repaired.value.includes(zone.id)) {
    session.say(`${zone.name} : déjà réparé.`);
    return;
  }
  if (zone.id === "engine" && repaired.value.length < 2) {
    session.error("Le moteur reste muet. Rétablissez d'abord le courant et le panneau de contrôle.");
    return;
  }
  if (!selected.value) {
    session.say("Sélectionnez d'abord un objet dans l'inventaire.");
    return;
  }
  if (selected.value !== zone.item) {
    session.error(`${itemById(selected.value).name} ne sert à rien ici.`);
    return;
  }
  current.value = zone;
  answer.value = "";
  await nextTick();
  answerInput.value?.focus();
}

function submit() {
  const zone = current.value;
  if (!zone || !session.playing) return;
  if (!isCorrect(answer.value, zone.answers)) {
    session.error("Accès refusé. Mauvaise réponse.");
    answerInput.value?.select();
    return;
  }
  repaired.value.push(zone.id);
  collected.value = collected.value.filter((id) => id !== zone.item);
  selected.value = null;
  current.value = null;
  if (zone.id === "engine") {
    session.win();
  } else {
    session.success(`${zone.name} réparé.`);
  }
}

function restart() {
  collected.value = [];
  selected.value = null;
  repaired.value = [];
  current.value = null;
  answer.value = "";
  session.restart();
}
</script>

<template>
  <GameShell
    :session="session"
    intro="Ramassez les pièces, puis utilisez chacune au bon endroit : le courant, le panneau de contrôle, enfin le démarreur."
    @restart="restart"
  >
    <div class="scene">
      <img :src="session.game.image" alt="Le couloir d'un vaisseau spatial, des consoles allumées de chaque côté" width="1792" height="1024" />

      <button
        v-for="item in onFloor"
        :key="item.id"
        type="button"
        class="floor-item"
        :style="{ top: item.top + '%', left: item.left + '%' }"
        :disabled="!session.playing"
        :aria-label="`Ramasser : ${item.name}`"
        @click="pickUp(item)"
      >
        <img :src="item.image" alt="" />
      </button>

      <button
        v-for="zone in ZONES"
        :key="zone.id"
        type="button"
        class="hotspot zone"
        :class="{ done: repaired.includes(zone.id), active: current?.id === zone.id }"
        :style="{ top: zone.top + '%', left: zone.left + '%' }"
        :disabled="!session.playing"
        :aria-label="zone.name + (repaired.includes(zone.id) ? ' (réparé)' : '')"
        @click="useOn(zone)"
      >
        <img v-if="repaired.includes(zone.id)" :src="itemById(zone.item).image" alt="" class="installed" />
        <span v-else aria-hidden="true">⚙</span>
      </button>
    </div>

    <template #after>
      <div class="scene-tools">
        <form v-if="current" class="panel" @submit.prevent="submit">
          <h2 class="panel-title">{{ current.name }}</h2>
          <p>Le système demande un code de sécurité : «&nbsp;{{ current.question }}&nbsp;»</p>
          <label class="sr-only" for="ship-answer">Votre réponse</label>
          <div class="answer-row">
            <input
              id="ship-answer"
              ref="answerInput"
              v-model="answer"
              class="input"
              autocomplete="off"
              placeholder="Votre réponse"
              :disabled="!session.playing"
            />
            <button class="btn btn-primary" type="submit" :disabled="!answer.trim() || !session.playing">Valider</button>
            <button class="btn btn-ghost" type="button" @click="current = null">Annuler</button>
          </div>
        </form>

        <section class="panel" aria-labelledby="titre-inventaire">
          <h2 id="titre-inventaire" class="panel-title">Inventaire</h2>
          <p v-if="!inventory.length" class="panel-note">
            {{ repaired.length ? "Aucun objet en main." : "Cliquez sur les objets éparpillés dans le vaisseau pour les ramasser." }}
          </p>
          <ul v-else class="chips">
            <li v-for="item in inventory" :key="item.id">
              <button
                type="button"
                class="btn btn-small inventory-item"
                :class="selected === item.id ? 'btn-primary' : 'btn-ghost'"
                :aria-pressed="String(selected === item.id)"
                :disabled="!session.playing"
                @click="select(item)"
              >
                <img :src="item.image" alt="" width="28" height="28" />
                {{ item.name }}
              </button>
            </li>
          </ul>
          <p class="panel-note repairs">
            Réparations : {{ repaired.length }} / {{ ZONES.length }}.
            <template v-if="selected">Cliquez sur une zone ⚙ pour utiliser l'objet sélectionné.</template>
          </p>
        </section>
      </div>
    </template>
  </GameShell>
</template>

<style scoped>
.floor-item {
  position: absolute;
  transform: translate(-50%, -50%);
  width: clamp(2.5rem, 7%, 5rem);
  aspect-ratio: 1;
  padding: 0.2rem;
  border: 2px dashed rgb(224 179 84 / 0.8);
  border-radius: var(--radius-sm);
  background: rgb(17 21 31 / 0.45);
  cursor: pointer;
  transition: transform 0.15s;
}

.floor-item:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.1);
}

.floor-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.zone .installed {
  width: 75%;
  height: 75%;
  object-fit: contain;
}

.answer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.answer-row .input {
  flex: 1 1 14rem;
}

.inventory-item img {
  object-fit: contain;
}

.repairs {
  margin: 0.75rem 0 0;
}
</style>
