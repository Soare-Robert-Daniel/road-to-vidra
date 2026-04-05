import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), preact()],
  server: {
    proxy: {
      "/api/busData": {
        target: "https://maps.mo-bi.ro",
        changeOrigin: true,
      },
      "/data/layers": {
        target: "https://maps.mo-bi.ro",
        changeOrigin: true,
      },
    },
  },
});
