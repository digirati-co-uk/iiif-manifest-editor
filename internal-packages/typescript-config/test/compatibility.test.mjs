import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { parseSync } from "oxc-parser";

const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, "../../..");
const compiler = join(root, "node_modules/typescript/bin/tsc");
// Real package resolution (including exports), without adding dependencies to the config package.
// Only temporary source/configs and symlinks are written; the compiler always runs with --noEmit.
const temporary = mkdtempSync(join(directory, ".consumer-"));
after(() => rmSync(temporary, { recursive: true, force: true }));
cpSync(join(directory, "fixtures"), temporary, { recursive: true });
mkdirSync(join(temporary, "node_modules/@manifest-editor"), { recursive: true });
symlinkSync(join(root, "packages/i18n"), join(temporary, "node_modules/@manifest-editor/i18n"), "dir");
symlinkSync(join(root, "packages/i18n/node_modules/react"), join(temporary, "node_modules/react"), "dir");
mkdirSync(join(temporary, "node_modules/@types"), { recursive: true });
symlinkSync(join(root, "packages/i18n/node_modules/@types/react"), join(temporary, "node_modules/@types/react"), "dir");
writeFileSync(join(temporary, "package.json"), JSON.stringify({ type: "module" }));

function check(files, overrides = {}, flags = []) {
  const config = join(temporary, "tsconfig.json");
  writeFileSync(
    config,
    JSON.stringify({
      extends: resolve(directory, "../react-library.json"),
      compilerOptions: { types: [], allowImportingTsExtensions: true, ...overrides },
      files,
    })
  );
  const result = spawnSync(process.execPath, [compiler, "--noEmit", "--pretty", "false", "-p", config, ...flags], {
    cwd: root,
    encoding: "utf8",
  });
  assert.ifError(result.error);
  return { status: result.status, output: result.stdout + result.stderr };
}

test("Bundler consumers check the real React/core/Dutch source exports", () => {
  const result = check(["consumer.tsx", "core.mts"]);
  assert.equal(result.status, 0, result.output);
});

test("core and Dutch source graph does not pull in the React provider", () => {
  const result = check(["core.mts"], {}, ["--listFiles"]);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /packages\/i18n\/src\/core\.ts/);
  assert.match(result.output, /languages\/src\/schema\.ts/);
  assert.doesNotMatch(result.output, /I18nProvider|@types\/react\/|react-i18next/);
});

test("source checking needs the local .ts import allowance", () => {
  const result = check(["core.mts"], { allowImportingTsExtensions: false });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /error TS5097:/);
  const codes = [...result.output.matchAll(/error (TS\d+):/g)].map((match) => match[1]);
  assert.ok(
    codes.every((code) => code === "TS5097"),
    result.output
  );
});

test("NodeNext cannot validate the extensionless workspace source as published ESM", () => {
  const result = check(["core.mts"], { module: "NodeNext", moduleResolution: "NodeNext" });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /error TS2835:/);
  assert.match(result.output, /packages\/i18n\/src\/core\.ts/);
});

test("shared configs retain Bundler/library semantics and Node-native options stay local", () => {
  const result = check(["consumer.tsx"], {}, ["--showConfig"]);
  assert.equal(result.status, 0, result.output);
  const { compilerOptions } = JSON.parse(result.output);
  assert.equal(compilerOptions.moduleResolution, "bundler");
  assert.equal(compilerOptions.target, "es2022");
  assert.equal(compilerOptions.strict, true);
  assert.equal(compilerOptions.noUncheckedIndexedAccess, true);
  assert.equal(compilerOptions.declaration, true);
  assert.equal(compilerOptions.declarationMap, true);
  assert.equal(compilerOptions.jsx, "react-jsx");
  for (const file of ["base.json", "library.json", "react-library.json"]) {
    const config = JSON.parse(readFileSync(resolve(directory, "..", file), "utf8"));
    for (const option of ["noEmit", "allowImportingTsExtensions", "erasableSyntaxOnly", "exactOptionalPropertyTypes"]) {
      assert.equal(config.compilerOptions[option], undefined, `${file}: ${option} must remain a local choice`);
    }
  }
});

test("public runtime source signatures do not reference private imported symbols", () => {
  // A source-level guard, not an emitted-declaration or tarball test. Check the current
  // public entry implementations; implementation-body imports are intentionally allowed.
  for (const file of ["index.ts", "core.ts", "types.ts", "messages.ts", "runtime.ts", "I18nProvider.tsx", "nl.ts"]) {
    const source = readFileSync(join(root, "packages/i18n/src", file), "utf8");
    const parsed = parseSync(file, source);
    assert.equal(parsed.errors.length, 0, file);
    const statements = parsed.program.body;
    const privateNames = new Set(
      statements
        .filter(
          (node) => node.type === "ImportDeclaration" && node.source.value.startsWith("@manifest-editor/languages")
        )
        .flatMap((node) => node.specifiers.map((specifier) => specifier.local.name))
    );
    function inspect(node) {
      if (!node || typeof node !== "object") return;
      if (node.type === "Identifier")
        assert.ok(!privateNames.has(node.name), `${file}: private signature symbol ${node.name}`);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(inspect);
        else if (value && typeof value === "object") inspect(value);
      }
    }
    for (const node of statements.filter((statement) => statement.type.startsWith("Export"))) {
      assert.ok(!node.source?.value.startsWith("@manifest-editor/languages"), `${file}: private re-export`);
      const declaration = node.declaration;
      if (declaration?.type === "FunctionDeclaration") {
        assert.ok(declaration.returnType, `${file}: exported functions require explicit public return types`);
        inspect(declaration.returnType);
        inspect(declaration.params);
        inspect(declaration.typeParameters);
      } else if (declaration?.type === "VariableDeclaration") {
        for (const variable of declaration.declarations) inspect(variable.id.typeAnnotation ?? variable.init);
      } else {
        inspect(declaration);
      }
    }
  }
  const manifest = JSON.parse(readFileSync(join(root, "packages/i18n/package.json"), "utf8"));
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    assert.equal(manifest[field]?.["@manifest-editor/languages"], undefined, field);
  }
});
