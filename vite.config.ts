import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), preact()],
  server: {
    proxy: {
      "/api/v1": {
        target: "https://robertsoare.xyz/bus-watcher",
        changeOrigin: true,
      },
    },
  },
});
