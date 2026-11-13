import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "static-guide-preview",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const url = new URL(request.url || "/", "http://localhost");
          if (url.pathname === "/guide.html") {
            response.writeHead(301, { Location: `/guide${url.search}` });
            response.end();
            return;
          }
          if (url.pathname === "/guide") request.url = `/guide.html${url.search}`;
          next();
        });
      },
      transformIndexHtml: {
        order: "pre",
        async handler(html, context) {
          if (context.path !== "/guide.html" || !context.server) return html;
          const { renderGuide } = await context.server.ssrLoadModule("/src/entry-server.tsx");
          return html.replace(
            '<div id="root"></div>',
            () => `<div id="root">${renderGuide()}</div>`,
          );
        },
      },
      handleHotUpdate(context) {
        if (context.file.endsWith(".tsx"))
          context.server.ws.send({ type: "full-reload", path: "/guide" });
      },
    },
  ],
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
