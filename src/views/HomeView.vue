<script setup>
import RoomList from "@/components/RoomList.vue";
import bibliotheque from "@/assets/bibliotheque.webp";
import { auth } from "@/stores/auth.js";
import { GAME_DURATION, HINT_PENALTY, POINTS_PER_SECOND } from "@/utils/score.js";
</script>

<template>
  <section class="hero" :style="{ '--hero-image': `url(${bibliotheque})` }">
    <div class="hero-text">
      <h1>Trois salles. Trois minutes pour sortir de chacune.</h1>
      <p class="lead">
        Fouillez le décor, résolvez les énigmes et trouvez la sortie avant la fin du chrono. Plus vous êtes rapide, plus votre score
        est élevé.
      </p>
      <div class="hero-actions">
        <router-link class="btn btn-primary" :to="{ name: 'rooms' }">Choisir une salle</router-link>
        <router-link v-if="auth.state.online && !auth.state.user" class="btn btn-ghost" :to="{ name: 'register' }">
          Créer un compte
        </router-link>
      </div>
    </div>
  </section>

  <section class="rules" aria-labelledby="titre-regles">
    <h2 id="titre-regles">Les règles</h2>
    <dl>
      <div>
        <dt>{{ GAME_DURATION / 60 }} minutes</dt>
        <dd>par salle. À zéro, la partie est perdue.</dd>
      </div>
      <div>
        <dt>{{ POINTS_PER_SECOND }} points</dt>
        <dd>par seconde restante quand vous sortez.</dd>
      </div>
      <div>
        <dt>−{{ HINT_PENALTY }} points</dt>
        <dd>par indice révélé. Ils restent là si vous bloquez.</dd>
      </div>
    </dl>
    <p class="muted">
      Vous pouvez jouer sans compte. Avec un compte, vos scores entrent au classement de chaque salle et votre historique est conservé.
    </p>
  </section>

  <section aria-labelledby="titre-salles">
    <h2 id="titre-salles">Les salles</h2>
    <RoomList heading-level="h3" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  align-items: end;
  min-height: 26rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: var(--radius);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(17 21 31 / 0.95) 0%, rgb(17 21 31 / 0.75) 45%, rgb(17 21 31 / 0.2) 100%),
    var(--hero-image) center 40% / cover;
  border: 1px solid var(--border);
}

.hero-text {
  max-width: 34rem;
}

.hero h1 {
  margin: 0 0 1rem;
  font-size: clamp(1.8rem, 1.2rem + 2.4vw, 3rem);
}

.lead {
  font-size: 1.1rem;
  margin: 0 0 1.5rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.rules {
  margin-block: 3rem;
}

.rules dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
  margin: 0 0 1rem;
}

.rules dl > div {
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--accent);
  background: var(--surface);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.rules dt {
  font-family: var(--font-title);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--accent-strong);
}

.rules dd {
  margin: 0.2rem 0 0;
}

@media (max-width: 700px) {
  .hero {
    min-height: 22rem;
    background:
      linear-gradient(0deg, rgb(17 21 31 / 0.95) 0%, rgb(17 21 31 / 0.7) 60%, rgb(17 21 31 / 0.3) 100%),
      var(--hero-image) center 30% / cover;
  }
}
</style>
