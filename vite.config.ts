import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import svg from "./dev/vite/plugins/svg.ts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svg(), react(), visualizer()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
