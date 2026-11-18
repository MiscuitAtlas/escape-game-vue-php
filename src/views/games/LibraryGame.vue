<script setup>
import { computed, nextTick, ref } from "vue";
import GameShell from "@/components/GameShell.vue";
import { useEscapeGame } from "@/composables/useEscapeGame.js";
import { gameById } from "@/games/catalog.js";
import { isCorrect } from "@/utils/answers.js";

// Positions en pourcentage de l'image (top, left).
const RIDDLES = [
  {
    id: "livre",
    label: "Le grimoire",
    top: 84,
    left: 30,
    question: "Je peux être brisé sans jamais être tenu. Que suis-je ?",
    answers: ["un secret", "une promesse", "le silence"],
  },
  {
    id: "vitrail",
    label: "Le vitrail",
    top: 15,
    left: 49,
    question: "Je suis invisible, mais vous me sentez. Que suis-je ?",
    answers: ["le vent", "l'air"],
  },
  {
    id: "coffre",
    label: "Le coffret",
    top: 60,
    left: 32,
    question: "Je commence la nuit et je termine le matin. Que suis-je ?",
    answers: ["une étoile", "la lettre N", "N"],
  },
  {
    id: "bougie",
    label: "Le chandelier",
    top: 70,
    left: 7,
    question: "Plus je grandis, moins on voit. Que suis-je ?",
    answers: ["l'obscurité", "le noir", "les ténèbres", "une ombre", "la nuit"],
  },
];

const HINTS = [
  "Le grimoire parle d'une chose fragile que l'on confie à voix basse.",
  "Le vitrail laisse passer quelque chose que l'on sent sur le visage sans jamais le voir.",
  "Le coffret : la réponse se cache dans l'orthographe des mots de l'énigme.",
  "Le chandelier : quand les bougies s'éteignent, qu'est-ce qui gagne la pièce ?",
];

const session = useEscapeGame(gameById(1), HINTS);

const solved = ref([]);
const current = ref(null);
const answer = ref("");
const answerInput = ref(null);

const remaining = computed(() => RIDDLES.length - solved.value.length);

async function open(riddle) {
  if (!session.playing) return;
  if (solved.value.includes(riddle.id)) {
    session.say(`${riddle.label} : énigme déjà résolue.`);
    return;
  }
  current.value = riddle;
  answer.value = "";
  await nextTick();
  answerInput.value?.focus();
}

function submit() {
  const riddle = current.value;
  if (!riddle || !session.playing) return;
  if (isCorrect(answer.value, riddle.answers)) {
    solved.value.push(riddle.id);
    current.value = null;
    session.success(
      remaining.value ? `Bonne réponse ! Encore ${remaining.value} énigme${remaining.value > 1 ? "s" : ""}.` : "Un déclic : la porte est déverrouillée !",
    );
  } else {
    session.error("Ce n'est pas ça. Relisez l'énigme.");
    answerInput.value?.select();
  }
}

function openDoor() {
  if (!session.playing) return;
  if (remaining.value) {
    session.error(`La porte reste verrouillée : ${remaining.value} énigme${remaining.value > 1 ? "s" : ""} à résoudre.`);
    return;
  }
  session.win();
}

function restart() {
  solved.value = [];
  current.value = null;
  answer.value = "";
  session.restart();
}
</script>

<template>
  <GameShell :session="session" intro="Quatre objets cachent une énigme. Résolvez-les toutes pour déverrouiller la porte." @restart="restart">
    <div class="scene">
      <img :src="session.game.image" alt="Une bibliothèque ancienne éclairée à la bougie, avec une grande porte au fond" width="1024" height="1024" />
      <button
        v-for="riddle in RIDDLES"
        :key="riddle.id"
        type="button"
        class="hotspot"
        :class="{ done: solved.includes(riddle.id), active: current?.id === riddle.id }"
        :style="{ top: riddle.top + '%', left: riddle.left + '%' }"
        :disabled="!session.playing"
        :aria-label="riddle.label + (solved.includes(riddle.id) ? ' (résolue)' : '')"
        @click="open(riddle)"
      >
        <span aria-hidden="true">{{ solved.includes(riddle.id) ? "✓" : "?" }}</span>
      </button>
      <button
        type="button"
        class="hotspot door"
        :class="{ done: !remaining }"
        style="top: 50%; left: 49%"
        :disabled="!session.playing"
        aria-label="La porte"
        @click="openDoor"
      >
        <span aria-hidden="true">🚪</span>
      </button>
    </div>

    <template #after>
      <div class="scene-tools">
        <form v-if="current" class="panel riddle" @submit.prevent="submit">
          <h2 class="panel-title">{{ current.label }}</h2>
          <p>«&nbsp;{{ current.question }}&nbsp;»</p>
          <label class="sr-only" for="library-answer">Votre réponse</label>
          <div class="answer-row">
            <input
              id="library-answer"
              ref="answerInput"
              v-model="answer"
              class="input"
              autocomplete="off"
              placeholder="Votre réponse"
              :disabled="!session.playing"
            />
            <button class="btn btn-primary" type="submit" :disabled="!answer.trim() || !session.playing">Valider</button>
            <button class="btn btn-ghost" type="button" @click="current = null">Fermer</button>
          </div>
        </form>
        <p v-else class="muted">Cliquez sur un point d'interrogation pour examiner un objet.</p>

        <section class="panel" aria-labelledby="titre-progression">
          <h2 id="titre-progression" class="panel-title">Énigmes résolues : {{ solved.length }} / {{ RIDDLES.length }}</h2>
          <ul class="chips">
            <li v-for="riddle in RIDDLES" :key="riddle.id" class="chip" :class="{ done: solved.includes(riddle.id) }">
              {{ riddle.label }}
              <span class="sr-only">{{ solved.includes(riddle.id) ? "résolue" : "à résoudre" }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </GameShell>
</template>

<style scoped>
.answer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.answer-row .input {
  flex: 1 1 14rem;
}

.riddle p {
  font-size: 1.1rem;
  font-style: italic;
}

.chip {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted);
}

.chip.done {
  border-color: var(--success);
  color: var(--success);
}
</style>
