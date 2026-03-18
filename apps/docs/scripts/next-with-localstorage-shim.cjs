const { spawnSync } = require("node:child_process");
const path = require("node:path");

const shimPath = path.resolve(__dirname, "localstorage-shim.cjs");
const nextBin = require.resolve("next/dist/bin/next");
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const shimNodeOption = `--require=${shimPath}`;

process.env.NODE_OPTIONS = [existingNodeOptions, shimNodeOption].filter(Boolean).join(" ");

const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
