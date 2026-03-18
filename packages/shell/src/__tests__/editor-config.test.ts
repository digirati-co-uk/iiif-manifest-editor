import { describe, expect, it } from "vitest";
import {
  editorMatchesConfiguredFields,
  getEditorConfigForResource,
} from "../ConfigContext/editor-config";

describe("editor config helpers", () => {
  it("uses embedded collection config for nested collections", () => {
    const config = getEditorConfigForResource(
      {
        Collection: { fields: ["label"] },
        EmbeddedCollection: { fields: ["summary"] },
      },
      {
        resourceId: "nested-collection",
        resourceType: "Collection",
        rootResource: { id: "root-collection", type: "Collection" },
      },
    );

    expect(config).toEqual({ fields: ["summary"] });
  });

  it("matches editors against configured field allowlists", () => {
    expect(
      editorMatchesConfiguredFields(
        {
          id: "homepage",
          label: "Homepage",
          supports: {
            edit: true,
            properties: ["homepage"],
            resourceTypes: ["Manifest"],
          },
          component: () => null,
        },
        { fields: ["homepage"] },
      ),
    ).toBe(true);

    expect(
      editorMatchesConfiguredFields(
        {
          id: "summary",
          label: "Summary",
          supports: {
            edit: true,
            properties: ["summary"],
            resourceTypes: ["Manifest"],
          },
          component: () => null,
        },
        { fields: ["homepage"] },
      ),
    ).toBe(false);
  });
});
