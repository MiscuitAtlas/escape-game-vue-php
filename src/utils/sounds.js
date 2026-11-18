import { ref } from "vue";
import musicUrl from "@/assets/background-music.mp3";
import correctUrl from "@/assets/correct-answer.mp3";
import wrongUrl from "@/assets/wrong-answer.mp3";
import { readPreference, writePreference } from "./storage.js";

const SOURCES = { correct: correctUrl, wrong: wrongUrl };

export const soundEnabled = ref(readPreference("escape-game:son", true));

let music = null;
const effects = {};

function audio(url) {
  return typeof Audio === "undefined" ? null : new Audio(url);
}

export function playEffect(name) {
  if (!soundEnabled.value) return;
  effects[name] ??= audio(SOURCES[name]);
  const effect = effects[name];
  if (!effect) return;
  effect.currentTime = 0;
  effect.play().catch(() => {});
}

/** À appeler après une action du joueur : les navigateurs bloquent le son lancé sans interaction. */
export function startMusic() {
  if (!soundEnabled.value) return;
  music ??= audio(musicUrl);
  if (!music) return;
  music.loop = true;
  music.volume = 0.4;
  music.play().catch(() => {});
}

export function stopMusic() {
  music?.pause();
}

export function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
  writePreference("escape-game:son", soundEnabled.value);
  if (soundEnabled.value) startMusic();
  else stopMusic();
}
