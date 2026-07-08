import type { CreatorDefinition } from "@manifest-editor/creator-api";
import type { MappedApp } from "@manifest-editor/shell";

export function replaceCreator(app: MappedApp, creator: CreatorDefinition): MappedApp {
  return {
    ...app,
    layout: {
      ...app.layout,
      creators: app.layout.creators?.map((existing) => (existing.id === creator.id ? creator : existing)),
    },
  };
}
