import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend suite.
 *
 * The DOM environment is supplied by the `test` script
 * (`vitest run --environment jsdom`), so it is not repeated here. This file
 * exists to mirror the app's Vite aliases (`@` and `declarations`) and to load
 * the jest-dom matchers plus the shared test setup.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The app's own CSS is not needed to assert behavior, and importing it
    // would pull PostCSS/Tailwind into every test file.
    css: false,
    // Pin the pool explicitly. The container sets thread bounds through the
    // environment, and Vitest's defaults then conflict with them
    // ("options.minThreads and options.maxThreads must not conflict").
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
