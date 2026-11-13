import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { host: "127.0.0.1" },
  build: isSsrBuild
    ? {}
    : {
        rolldownOptions: {
          input: {
            home: path.resolve(import.meta.dirname, "index.html"),
            guide: path.resolve(import.meta.dirname, "guide.html"),
          },
        },
      },
}));
