// @ts-check

import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs({ devtools: true })],
  vite: {
    optimizeDeps: {
      exclude: ["@sqlite.org/sqlite-wasm"],
    },

    // @ts-expect-error
    // https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
  },
});
