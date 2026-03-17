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

const tools = toOpenAITools(runtime.registry);

const result = await invokeTool(runtime, "me_get_root", {});
```

## Notes

- Pass the active preset's creator list into the runtime.
- Exhibition support is enabled automatically when exhibition creators are present.
- Successful mutation tools return changed refs, created refs, a summary, and any warnings.
