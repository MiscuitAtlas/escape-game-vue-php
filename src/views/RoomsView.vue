<script setup>
import RoomList from "@/components/RoomList.vue";
import { auth } from "@/stores/auth.js";
</script>

<template>
  <h1>Choisissez une salle</h1>
  <p class="muted intro">
    Les salles sont classées de la plus simple à la plus difficile. Le chrono démarre dès l'entrée.
    <template v-if="auth.state.user">Vos scores sont enregistrés au classement.</template>
    <template v-else-if="auth.state.online">
      <router-link :to="{ name: 'login', query: { redirect: '/salles' } }">Connectez-vous</router-link> pour enregistrer vos scores.
    </template>
  </p>
  <RoomList />
</template>

<style scoped>
.intro {
  max-width: 44rem;
  margin: 0 0 2rem;
}
</style>
