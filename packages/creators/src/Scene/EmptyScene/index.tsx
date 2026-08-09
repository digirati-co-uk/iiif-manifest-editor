import { EmptyCanvasIcon } from "@manifest-editor/components";
import { type CreatorContext, defineCreator } from "@manifest-editor/creator-api";
import type { CreateEmptyScenePayload } from "./create-empty-scene";
import { createEmptyScene, EmptySceneCreatorForm } from "./create-empty-scene";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/empty-scene": typeof emptyScene;
    }
  }
}

// The cast can go when creator-api exposes Presentation 4 resource names.
export const emptyScene = defineCreator({
  id: "@manifest-editor/empty-scene",
  create: createEmptyScene,
  label: "Scene",
  summary: "An empty 3D scene",
  icon: <EmptyCanvasIcon />,
  render: (ctx: CreatorContext<CreateEmptyScenePayload>) => <EmptySceneCreatorForm {...ctx} />,
  resourceType: "Scene",
  resourceFields: ["id", "type", "label", "backgroundColor", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
  staticFields: { type: "Scene" },
} as any);
