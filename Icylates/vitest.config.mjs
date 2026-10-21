import { defineConfig } from "vitest/config";
import { transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    {
      name: "next-javascript-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (id.includes("/src/") && id.endsWith(".js")) {
          return transformWithOxc(code, id, { lang: "jsx", jsx: { runtime: "automatic" } });
        }
      },
    },
    react(),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
    restoreMocks: true,
  },
});
