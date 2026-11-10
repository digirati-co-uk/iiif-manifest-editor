<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/workspace-private-lightgrey" alt="Private workspace package">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @repo/typescript-config

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Private shared TypeScript configurations for this monorepo. This package contains JSON configuration files, not runtime code.

## Quick start

Add `"@repo/typescript-config": "workspace:*"` to a workspace package's development dependencies, then extend the appropriate configuration:

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src"],
  "compilerOptions": { "outDir": "dist" }
}
```

## Configuration overview

- `base.json`: strict checking, ES2022, bundler module resolution, and browser libraries.
- `library.json`: base settings plus declaration files and declaration maps.
- `react-library.json`: library settings plus the React JSX transform.
- `nextjs.json`: Next.js checking with preserved JSX, incremental checking, and no emit.

Override paths and include/exclude patterns in the consuming package.

## Source workspace checks and publication

The public `@manifest-editor/i18n`, `/core`, and `/nl` workspace exports resolve to real TypeScript source. Bundler resolution supports their extensionless internal imports. The runtime's implementation also reaches the private languages package, whose Node-native helpers use explicit `.ts` imports. A package checking this graph needs a local `"allowImportingTsExtensions": true` and must run its check with `--noEmit`:

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": { "allowImportingTsExtensions": true },
  "include": ["src"]
}
```

Run the installed compiler from the repository root, for example `node node_modules/typescript/bin/tsc --noEmit -p packages/i18n/tsconfig.json`. Library configurations retain declaration settings and do not disable emission globally. Do not invoke bare `tsc -p` on the example above: allowing TypeScript import extensions requires an appropriate emit policy, and this workspace check deliberately uses no emit. Importing only a public type from the React barrel can still bring its re-exported source graph into checking. The allowance belongs to each checking package/configuration that reaches that graph, including hosts and plugins as they migrate.

Keep the private languages package's `NodeNext`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, ES2023 and empty ambient-types configuration local. UI packages do not need those semantics to consume the runtime. Do not change shared module resolution to NodeNext: the runtime's current source-relative imports are extensionless and fail its ESM path checks.

Publication is a separate boundary. The public runtime must bundle its private helpers/catalog data, expose public types, and replace workspace exports with built JS/declaration entry points. Independently published consumers must depend on and externalize the public runtime. `allowImportingTsExtensions` is a workspace checking requirement here, not a required setting for users of built npm packages. Emitted ESM/CJS declarations must later be checked with the private workspace absent under Bundler and Node16/NodeNext consumer resolution. Source checks cannot establish emitted declaration validity, tarball resolution, RSC boundaries, or installed provider identity.

Run `npm --prefix internal-packages/typescript-config test` from the repository root after a scripts-disabled dependency install. The tests use installed TypeScript 7, temporary source fixtures and symlinks to real workspace package exports. They check React/plugin/core/Dutch API usage, primitive message values, the server-safe source graph, local import-extension requirements and unchanged shared semantics. A bounded source-signature guard checks the current public runtime entry implementations for private imported symbols; it is not a declaration emitter. The suite does not build, emit, invoke prepack, or create handmade declaration stand-ins.
