import { defineConfig } from "./base-config.mjs";
import { build } from "vite";
import chalk from "chalk";

(async () => {
  const NPM = "npm";
  const external = [];

  buildMsg("@manifest-editor/test");
  await build(
    defineConfig({
      entry: `src/npm/editor-api.ts`,
      name: "index",
      outDir: `${NPM}/editor-api/dist`,
      external,
    })
  );

  function buildMsg(name) {
    console.log(chalk.grey(`\n\nBuilding ${chalk.blue(name)}\n`));
  }
  function listItem(name) {
    console.log(chalk.gray(`- ${chalk.green(name)}`));
  }
})();
