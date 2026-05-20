import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["modules/**/*.test.ts", "app/api/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["modules/**/*", "app/api/**/*"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "./components"),
    },
  },
});
