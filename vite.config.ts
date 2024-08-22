import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@splinetool/react-spline")) {
              return "react-spline";
            }
          }
        },
      },
    },
  },
  // esbuild: {
  //   keepNames: true,
  // },
});
