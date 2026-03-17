import { Vault } from "@iiif/helpers/vault";
import { Creator } from "@manifest-editor/creator-api";
import type {
  ManifestEditorToolRuntime,
  ManifestEditorToolRuntimeOptions,
  ToolMode,
} from "../types";
import { buildToolRegistry } from "./registry";

function detectMode(options: {
  mode?: ToolMode;
  rootResource: { id: string; type: string };
  creators: Array<{ id: string; tags?: string[] }>;
}): ToolMode {
  if (options.mode) {
    return options.mode;
  }

  const hasExhibitionCreators = options.creators.some((creator) => {
    return creator.id.startsWith("@exhibitions/") || (creator.tags || []).includes("exhibition-slide");
  });

  if (hasExhibitionCreators && options.rootResource.type === "Manifest") {
    return "exhibition";
  }

  return "manifest";
}

export function createManifestEditorToolRuntime(
  options: ManifestEditorToolRuntimeOptions,
): ManifestEditorToolRuntime {
  const previewVault = new Vault();
  const creator = new Creator(options.vault, options.creators, previewVault);
  const runtime: ManifestEditorToolRuntime = {
    vault: options.vault,
    rootResource: options.rootResource,
    creators: options.creators,
    mode: detectMode(options),
    creator,
    previewVault,
    onChange: options.onChange,
    registry: [],
  };

  runtime.registry = buildToolRegistry(runtime);

  return runtime;
}
