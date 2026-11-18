import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { api } from "@/api.js";
import { auth } from "@/stores/auth.js";
import { GAME_DURATION, computeScore } from "@/utils/score.js";
import { playEffect, startMusic, stopMusic } from "@/utils/sounds.js";

/**
 * Logique commune aux trois salles : chronomètre, indices, score, messages, classement et sauvegarde.
 * Chaque salle ne gère que ses propres énigmes.
 */
export function useEscapeGame(game, hints) {
  const timeLeft = ref(GAME_DURATION);
  const status = ref("playing"); // « playing », « won » ou « lost »
  const revealed = ref([]);
  const feedback = reactive({ message: "", tone: "info" });
  const leaderboard = reactive({ rows: [], loading: false, error: "" });
  const result = reactive({ score: 0, saving: false, saved: false, error: "" });

  let timer = null;
  let feedbackTimer = null;

  const hintsUsed = computed(() => revealed.value.length);
  const potentialScore = computed(() => computeScore(timeLeft.value, hintsUsed.value));
  const playing = computed(() => status.value === "playing");

  function startClock() {
    stopClock();
    timer = setInterval(() => {
      timeLeft.value = Math.max(0, timeLeft.value - 1);
      if (timeLeft.value === 0) lose();
    }, 1000);
  }

  function stopClock() {
    clearInterval(timer);
    timer = null;
  }

  function say(message, tone = "info", duration = 3000) {
    feedback.message = message;
    feedback.tone = tone;
    clearTimeout(feedbackTimer);
    if (duration) feedbackTimer = setTimeout(() => (feedback.message = ""), duration);
  }

  function success(message) {
    playEffect("correct");
    say(message, "success");
  }

  function error(message) {
    playEffect("wrong");
    say(message, "error");
  }

  function revealHint(index) {
    if (playing.value && !revealed.value.includes(index)) revealed.value.push(index);
  }

  async function loadLeaderboard() {
    await auth.init();
    if (!auth.state.online) return;
    leaderboard.loading = true;
    leaderboard.error = "";
    try {
      leaderboard.rows = (await api.leaderboard(game.id)).leaderboard;
    } catch (e) {
      leaderboard.error = e.message;
    } finally {
      leaderboard.loading = false;
    }
  }

  async function saveResult() {
    if (!auth.state.user) return;
    result.saving = true;
    try {
      const { score } = await api.saveSession({ gameId: game.id, timeRemaining: timeLeft.value, hintsUsed: hintsUsed.value });
      result.score = score;
      result.saved = true;
      await loadLeaderboard();
    } catch (e) {
      result.error = e.message;
    } finally {
      result.saving = false;
    }
  }

  function win() {
    if (!playing.value) return;
    stopClock();
    status.value = "won";
    result.score = potentialScore.value;
    playEffect("correct");
    saveResult();
  }

  function lose() {
    if (!playing.value) return;
    stopClock();
    status.value = "lost";
    playEffect("wrong");
  }

  function restart() {
    timeLeft.value = GAME_DURATION;
    status.value = "playing";
    revealed.value = [];
    Object.assign(result, { score: 0, saving: false, saved: false, error: "" });
    feedback.message = "";
    startClock();
  }

  // La musique démarre au premier clic dans la page (lecture automatique bloquée sinon).
  const firstInteraction = () => startMusic();

  onMounted(() => {
    startClock();
    loadLeaderboard();
    document.addEventListener("pointerdown", firstInteraction, { once: true });
  });

  onBeforeUnmount(() => {
    stopClock();
    clearTimeout(feedbackTimer);
    stopMusic();
    document.removeEventListener("pointerdown", firstInteraction);
  });

  // reactive() déballe les refs : les composants lisent session.timeLeft, pas session.timeLeft.value.
  return reactive({
    game,
    hints,
    timeLeft,
    status,
    playing,
    revealed,
    hintsUsed,
    potentialScore,
    feedback,
    leaderboard,
    result,
    say,
    success,
    error,
    revealHint,
    win,
    lose,
    restart,
  });
}
