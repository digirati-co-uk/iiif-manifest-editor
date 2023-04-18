import { CreatorDefinition } from "@/creator-api";
import { ThumbnailStripIcon } from "../../../icons/ThumbnailStripIcon";
import { CreatorFunctionContext } from "../../../creator-api";

export const emptyCanvas: CreatorDefinition = {
  id: "@manifest-editor/empty-canvas",
  create: createEmptyCanvas,
  label: "Empty canvas",
  summary: "Canvas with nothing",
  icon: <ThumbnailStripIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {},
};

async function createEmptyCanvas(data: unknown, ctx: CreatorFunctionContext) {
  console.log("ctx", ctx);

  const ref = ctx.create("@manifest-editor/plaintext-creator", { url: '...' });
  const page = ctx.embed({
    id: `https://example.org/canvas/${Date.now()}/page`,
    type: "AnnotationPage",
    items: [],
  });

  return {
    id: `https://example.org/canvas/${Date.now()}`,
    type: "Canvas",
    label: { en: [""] },
    height: 1000,
    width: 1000,
    items: [page],
    seeAlso: [ref],
  };
}
