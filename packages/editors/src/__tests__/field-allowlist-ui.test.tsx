// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LinkingProperties } from "../definitions/LinkingProperties/LinkingProperties";
import { TechnicalProperties } from "../definitions/TechnicalProperties/TechnicalProperties";

const shellState = {
  editor: null as any,
  resource: null as any,
};

vi.mock("@manifest-editor/shell", () => ({
  useCreator: () => [
    false,
    {
      create: vi.fn(),
      edit: vi.fn(),
      creator: vi.fn(),
    },
  ],
  useEditingResource: () => shellState.resource,
  useEditor: () => shellState.editor,
  useLayoutActions: () => ({
    edit: vi.fn(),
  }),
}));

function field(property: string, value: any) {
  return {
    containerId: () => `container-${property}`,
    focusId: () => `focus-${property}`,
    get: () => value,
    set: vi.fn(),
    reorder: vi.fn(),
    moveToStart: vi.fn(),
    moveToEnd: vi.fn(),
    deleteAtIndex: vi.fn(),
  };
}

beforeEach(() => {
  shellState.resource = {
    resource: {
      id: "manifest-1",
      type: "Manifest",
      source: {
        id: "manifest-1",
        type: "Manifest",
      },
    },
  };
});

describe("field allowlist UI", () => {
  it("hides disallowed technical fields", () => {
    shellState.editor = {
      notAllowed: [
        "id",
        "format",
        "behavior",
        "viewingDirection",
        "profile",
        "timeMode",
        "motivation",
      ],
      technical: {
        id: field("id", "manifest-1"),
        width: field("width", 1200),
        height: field("height", 900),
        duration: field("duration", 0),
        viewingDirection: field("viewingDirection", "left-to-right"),
        behavior: {
          ...field("behavior", []),
          getSupported: () => [],
        },
        format: field("format", "image/jpeg"),
        motivation: field("motivation", "painting"),
        profile: field("profile", ""),
        timeMode: field("timeMode", null),
      },
    };

    render(<TechnicalProperties />);

    expect(screen.queryByText("Identifier")).toBeNull();
    expect(screen.queryByText("Format")).toBeNull();
    expect(screen.getByText("Height")).toBeTruthy();
    expect(screen.getByText("Width")).toBeTruthy();
  });

  it("shows only the allowed linking sections", () => {
    shellState.editor = {
      notAllowed: ["seeAlso", "supplementary", "start", "logo"],
      linking: {
        seeAlso: field("seeAlso", []),
        service: field("service", []),
        services: field("services", []),
        rendering: field("rendering", []),
        partOf: field("partOf", []),
        start: field("start", null),
        supplementary: field("supplementary", []),
        homepage: field("homepage", []),
        logo: field("logo", []),
      },
    };

    render(<LinkingProperties />);

    expect(screen.getByText("Homepage")).toBeTruthy();
    expect(screen.getByText("Rendering")).toBeTruthy();
    expect(screen.queryByText("See also")).toBeNull();
    expect(screen.queryByText("Supplementary")).toBeNull();
  });
});
