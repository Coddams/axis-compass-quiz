import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync } from "fs";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:5000/",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),

    // ✅ Copy _redirects after build
    {
      name: "copy-redirects",
      closeBundle() {
        try {
          copyFileSync("public/_redirects", "dist/_redirects");
          console.log("✅ _redirects file copied to dist/");
        } catch (err) {
          console.warn("⚠️ Could not copy _redirects file:", err.message);
        }
      },
    },
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
