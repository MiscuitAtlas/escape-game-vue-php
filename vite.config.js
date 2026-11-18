import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  // Chemins relatifs : le site fonctionne à la racine d'un domaine comme dans un sous-dossier.
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    // En développement, l'API PHP tourne à part (php -S localhost:8000) : Vite lui relaie /api.
    proxy: {
      "/api": { target: process.env.API_PROXY_TARGET ?? "http://localhost:8000", changeOrigin: true },
    },
  },
  test: {
    include: ["tests/**/*.test.js"],
  },
});
