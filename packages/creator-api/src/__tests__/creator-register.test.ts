import { describe, expect, it } from "vitest";
import { defineCreator } from "../creator-register";

describe("defineCreator", () => {
  it("defaults compatibility to Theseus only when omitted", () => {
    const creator = defineCreator({
      id: "test/default-compatibility",
      label: "Default",
      resourceType: "Canvas",
      resourceFields: ["id"],
      create: () => {
        throw new Error("not implemented");
      },
      supports: {},
    });

    expect(creator.compatibility).toEqual({
      viewers: ["theseus"],
    });
  });

  it("keeps explicit compatibility metadata", () => {
    const creator = defineCreator({
      id: "test/explicit-compatibility",
      label: "Explicit",
      resourceType: "Canvas",
      resourceFields: ["id"],
      compatibility: {
        viewers: ["theseus", "universal-viewer"],
      },
      create: () => {
        throw new Error("not implemented");
      },
      supports: {},
    });

    expect(creator.compatibility).toEqual({
      viewers: ["theseus", "universal-viewer"],
    });
  });
});
