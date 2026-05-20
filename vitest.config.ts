import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/modules/**/*.test.ts", "modules/**/*.test.ts", "tests/**/*.test.ts", "app/api/**/*.test.ts", "src/app/api/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/modules/**/*", "app/api/**/*", "src/app/api/**/*"],
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
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./components"),
    },
  },
});
