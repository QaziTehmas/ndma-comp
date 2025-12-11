import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      proxy: {
      // Proxy /api requests to local backend to avoid CORS in development
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // preserve path (no rewrite)
      },
    },
  },
});
