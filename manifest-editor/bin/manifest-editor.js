#!/usr/bin/env node

import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { join } from "node:path";
import express from "express";
import { existsSync } from "fs";

async function createServer() {
  const app = express();

  const viteConfigPath = join(process.cwd(), ".manifest-editor", "vite.config.js");
  const mainPath = join(process.cwd(), ".manifest-editor", "main.js");
  const previewPath = join(process.cwd(), ".manifest-editor", "preview.js");

  let viteBaseConfig = {
    server: { middlewareMode: "ssr" },
    plugins: [react()],
    optimizeDeps: {
      // exclude: ["@atlas-viewer/atlas", "react-iiif-vault", "debounce"],
    },
  };
  try {
    if (existsSync(viteConfigPath)) {
      const { plugins = [], ...extraConfig } = (await import(viteConfigPath)).default;
      Object.assign(viteBaseConfig, extraConfig);
      viteBaseConfig.plugins = [...viteBaseConfig.plugins, ...(plugins || [])];
    }
  } catch (e) {
    console.log(e);
    //
  }

  // Create Vite server in middleware mode.
  const vite = await createViteServer(viteBaseConfig);
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const { apps = [], ...mainConfig } = (await import(mainPath)).default;

    try {
      res
        .status(200)
        .set({ "Content-Type": "text/html" })
        .end(
          await vite.transformIndexHtml(
            req.originalUrl,
            `<!doctype html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Manifest editor</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="application/json" id="config">${JSON.stringify(mainConfig)}</script>
          <script type="module">
            import { init } from 'manifest-editor';

            const element = document.getElementById('root');
            const config = JSON.parse(document.getElementById('config').innerText);

            const imports = [
              ${apps.map((app) => `import.meta.globEager(\`${app}\`)`).join(",")}
            ];

            init(element, imports, config);
          </script>
        </body>
        </html>`
          )
        );
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return [app, vite];
}

const [server] = await createServer({
  configFile: false,

  root: process.cwd(),
  server: {},
});

await server.listen(3007);

console.log(`Manifest editor: http://localhost:${3007}`);
