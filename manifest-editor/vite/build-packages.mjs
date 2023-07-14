import { defineConfig } from "./base-config.mjs";
import { build } from "vite";
import chalk from "chalk";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { existsSync } from "node:fs";
import execa from "execa";

const onlyPackage = process.argv[2];

(async () => {
  const NPM = "npm";
  const external = [];

  const sourceDir = "src/npm";
  const distDir = "npm";


  const sources = await readdir(path.join(cwd(), sourceDir));
  for (const source of sources) {
    let pkg = path.basename(source, ".ts");

    if (onlyPackage && pkg !== onlyPackage) {
      continue;
    }

    if (pkg.endsWith(".umd") && pkg !== 'iiif-browser-bundle.umd') {
      continue;
    }

    if (pkg === 'iiif-browser-bundle.umd') {
      pkg = 'iiif-browser-bundle';
    }

    const npmPath = path.join(cwd(), distDir, pkg);
    const umdPath = path.join(cwd(), sourceDir, `${pkg}.umd.ts`);
    const npmSourcePath = path.join(cwd(), sourceDir, `${pkg}.ts`);
    const dist = path.join(npmPath, "dist");
    const distUmd = path.join(npmPath, "dist-umd");
    const packageJson = path.join(npmPath, "package.json");
    const entry = `src/npm/${pkg}.ts`;
    const umdEntry = `src/npm/${pkg}.umd.ts`;

    if (
      !existsSync(npmPath) || !existsSync(packageJson)
    ) {
      throw new Error(`Invalid package: ${pkg}`);
    }

    const packageJsonContents = JSON.parse(await readFile(packageJson, "utf-8"));

    const isNode = !!packageJsonContents.nodeDependencies;

    const external = Object.keys(packageJsonContents.dependencies || {});
    if (packageJsonContents.nodeDependencies) {
      external.push(...packageJsonContents.nodeDependencies);
    }
    if (packageJsonContents.peerDependencies) {
      external.push(...Object.keys(packageJsonContents.peerDependencies));
    }

    if (existsSync(npmSourcePath)) {
      buildMsg(`@manifest-editor/${pkg}`);
      await build(
        defineConfig({
          entry: entry,
          name: "index",
          isNode: isNode,
          outDir: dist,
          external: external,
          isShell: pkg === 'shell'
        }),
      );
    }

    if (packageJsonContents.globalName) {
      const umdEntry = existsSync(umdPath) ? umdPath : entry;

      const globals = external.includes("react") ? {
        react: "React",
        "react-dom": "ReactDOM",
        "@manifest-editor/shell": "ManifestEditorShell",
      } : {};

      listItem(`Building UMD - ${packageJsonContents.globalName}`);
      listItem(`Entry: ${umdEntry}`);

      const umdExternal =external.includes("react") ? ["react", "react-dom", "react-dom/server"] : [];

      if (external.includes('@manifest-editor/shell')) {
        umdExternal.push('@manifest-editor/shell');
        external.push('styled-components')
      }

      await build(
        defineConfig({
          entry: umdEntry,
          name: "index",
          outDir: distUmd,
          globalName: packageJsonContents.globalName,
          external: umdExternal,
          globals,
        }),
      );
    }

    if (packageJsonContents.types) {
      listItem("Building typescript definitions");

      const validPath = existsSync(npmSourcePath) ? entry : umdEntry;

      try {
        await execa("./node_modules/.bin/dts-bundle-generator", [`--out-file=${npmPath}/index.d.ts`, `./${validPath}`, "--no-check"]);
      } catch (e) {
        console.log(e.stdout);
        console.error(e.stderr);
        process.exit(1);
      }
    }
  }

  function buildMsg(name) {
    console.log(chalk.grey(`\n\nBuilding ${chalk.blue(name)}\n`));
  }

  function listItem(name) {
    console.log(chalk.gray(`- ${chalk.green(name)}`));
  }
})();
