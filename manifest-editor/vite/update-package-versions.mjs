// Loop through the package.json files in the npm directory and update the version of the package to the version of the root package.json file.
// This should check the dependencies object.
import path from "node:path";
import fs from "node:fs/promises";
import { cwd } from "node:process";

(async function main() {
  const rootPackageJson = JSON.parse((await fs.readFile(path.join(cwd(), 'package.json'))).toString());
  const packagesDir = path.join(cwd(), 'npm');
  const packageJsonFiles = await fs.readdir(packagesDir);
  for (const packageJsonFile of packageJsonFiles) {
    if (packageJsonFile === '.gitignore') continue;

    const packageJsonPath = path.join(packagesDir, packageJsonFile, 'package.json');
    const packageJson = JSON.parse((await fs.readFile(packageJsonPath)).toString());
    const packageJsonDependencies = packageJson.dependencies;
    const rootPackageJsonDependencies = rootPackageJson.dependencies;
    let changed = false;
    for (const [key, value] of Object.entries(packageJsonDependencies)) {
      if (rootPackageJsonDependencies[key]) {
        if (value !== rootPackageJsonDependencies[key]) {
          changed = true;
          packageJsonDependencies[key] = rootPackageJsonDependencies[key];
        }
      }
    }
    if (changed) {
      console.log('changed', packageJsonPath);
    }
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }



})();
