import type { InternationalString } from "@iiif/presentation-3";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import { type CreatorDefinition, type CreatorFunctionContext, defineCreator } from "@manifest-editor/creator-api";

// declare module "@manifest-editor/creator-api" {
//   namespace IIIFManifestEditor {
//     interface CreatorDefinitions {
//       "@manifest-editor/example-creator": typeof exampleCreator;
//     }
//   }
// }

export const exampleCreator = defineCreator({
  id: "@manifest-editor/example-creator",
  create: createExampleCanvas,
  label: "Example Creator",
  summary: "New large blank canvas ",
  icon: <EmptyCanvasIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

interface ExampleCanvasPayload {
  label?: InternationalString;
  width?: number;
  height?: number;
  behavior?: string[];
}

async function createExampleCanvas(data: ExampleCanvasPayload, ctx: CreatorFunctionContext) {
  const canvasId = ctx.generateId("canvas");
  const page = ctx.embed({
    id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
    type: "AnnotationPage",
    items: [],
  });

  return {
    id: canvasId,
    type: "Canvas",
    label: data.label || { en: [""] },
    height: data.height || 1000,
    width: data.width || 1000,
    items: [page],
    behavior: ["w-12", "h-12"],
  };
}
