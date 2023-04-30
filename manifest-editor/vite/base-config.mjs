/**
 * @param options {{ external: string[]; isShell?: boolean; isNode?: boolean; entry: string; name: string; globalName: string; outDir?: string; react?: boolean; globals: Record<string, string> }}
 */
export function defineConfig(options) {
  return {
    define: {
      "process.env.NODE_ENV": '"production"',
      "window.__TAURI__": "false",
    },
    resolve: {
      alias: options.isShell ? [] : [
        {
          find: /@\/shell\/(.*)/,
          replacement: '@manifest-editor/shell',
        }
      ],
    },
    build: {
      target: options.isNode ? 'node16': undefined,
      copyPublicDir: false,
      sourcemap: true,
      outDir: options.outDir || `dist/${options.name}`,
      lib: {
        entry: options.entry,
        name: options.globalName,
        formats: options.globalName ? ["umd"] : ["es", "cjs"],
        fileName: (format) => {
          if (format === "umd") {
            return `index.umd.js`;
          }
          if (format === "es") {
            return `esm/${options.name}.mjs`;
          }
          return `${format}/${options.name}.cjs`;
        },
      },
      minify: "terser",
      plugins: [],
      rollupOptions: {
        treeshake: true,
        external: options.external,
        output: {
          globals: options.globals,
          inlineDynamicImports: !!options.globalName,
        },
      },
    },
  };
}
