<template>
  <div class="narrow not-found">
    <h1>Cette porte ne mène nulle part</h1>
    <p class="muted">La page demandée n'existe pas ou a été déplacée.</p>
    <router-link class="btn btn-primary" :to="{ name: 'rooms' }">Voir les salles</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding-block: 3rem;
}
</style>
