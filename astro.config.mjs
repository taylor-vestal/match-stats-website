// @ts-check

import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs({ devtools: true })],
  vite: {
    optimizeDeps: {
      exclude: ["@sqlite.org/sqlite-wasm"],
    },

    // https://github.com/withastro/astro/issues/14030
    plugins: [tailwind({ applyBaseStyles: false })],
  },
});
