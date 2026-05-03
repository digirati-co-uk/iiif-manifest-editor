# `@manifest-editor/tools`

Headless tool-call runtime for the Digirati Manifest Editor.

## Overview

This package exposes a composable tool registry built on top of:

- `@manifest-editor/editor-api` for direct Vault mutations
- `@manifest-editor/creator-api` for creator-backed workflows

It does not own persistence, exports, sharing, or UI state.

## Quick start

```ts
import { createManifestEditorToolRuntime, invokeTool, toOpenAITools } from "@manifest-editor/tools";
import { Vault } from "@iiif/helpers/vault";

const vault = new Vault();
vault.loadManifestSync(manifest.id, manifest);

const runtime = createManifestEditorToolRuntime({
  vault,
  rootResource: { id: manifest.id, type: "Manifest" },
  creators: mappedApp.layout.creators || [],
});

const tools = toOpenAITools(runtime.registry, { exposure: "default" });

const result = await invokeTool(runtime, "me_get_root", {});
```

## Notes

- Pass the active preset's creator list into the runtime.
- Exhibition support is enabled automatically when exhibition creators are present.
- `invokeTool()` validates tool input against each tool's declared JSON schema before execution and returns `INVALID_INPUT` with structured details when validation fails.
- Successful mutation tools return changed refs, created refs, a summary, warnings, and machine-readable `data` fields such as `normalizedInput`, `primaryRef`, and operation-specific named refs.

## Model Exposure

- Use `exposure: "default"` when exporting tools to a model-facing runtime. This exposes curated discovery and workflow tools only.
- Generic escape hatches such as `me_create_resource`, `me_add_reference`, `me_remove_reference`, and `me_reorder_references` are marked as `fallback`.
- The `packages/tools` package no longer carries package-local Vitest coverage. Regression coverage should live in downstream consumers such as OpenRouter, where the actual model-facing tool surface is exercised end to end.
