// @ts-check

import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs({ devtools: true }),
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ["@sqlite.org/sqlite-wasm"],
    },
    ssr: {
      // Don't try to bundle sqlite-wasm for SSR - it's browser-only
      noExternal: [],
      external: ["@sqlite.org/sqlite-wasm"],
    },
  },
});
