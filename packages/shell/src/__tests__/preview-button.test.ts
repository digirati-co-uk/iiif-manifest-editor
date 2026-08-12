import { describe, expect, test, vi } from "vitest";
import type { PresetPreviewOptions } from "../AppContext/AppContext";
import { hasPreviewOption } from "../PreviewButton/PreviewButton";
import { getExportVersion } from "../helpers";

describe("preview button options", () => {
  test("a custom main action enables preview without an external service", () => {
    const preview: PresetPreviewOptions = {
      mainAction: {
        id: "internal-preview",
        label: "Preview",
        onClick: vi.fn(),
      },
    };

    expect(hasPreviewOption(0, preview)).toBe(true);
    preview.mainAction?.onClick();
    expect(preview.mainAction?.onClick).toHaveBeenCalledOnce();
  });

  test("preserves the unavailable state without a service or main action", () => {
    expect(hasPreviewOption(0)).toBe(false);
  });

  test("shows custom menu actions without a preview service", () => {
    expect(
      hasPreviewOption(0, {
        actions: [{ id: "host-action", label: "Host action", onClick: vi.fn() }],
      })
    ).toBe(true);
  });
});

describe("manifest export version", () => {
  test("defaults to Presentation 3 for canvases and 4 for scenes", () => {
    const vault = {
      toPresentation3: vi.fn().mockReturnValue({}),
      get: vi
        .fn()
        .mockReturnValueOnce({ items: [{ id: "canvas", type: "Canvas" }] })
        .mockReturnValueOnce({ items: [{ id: "scene", type: "Scene" }] }),
    };
    const manifest = { id: "manifest", type: "Manifest" };

    expect(getExportVersion(vault as any, manifest)).toBe(3);
    expect(getExportVersion(vault as any, manifest)).toBe(4);
  });

  test("uses Presentation 4 when the v3 compatibility serializer rejects a resource", () => {
    const vault = {
      get: vi.fn().mockReturnValue({ items: [{ id: "canvas", type: "Canvas" }] }),
      toPresentation3: vi.fn(() => {
        throw new Error("Presentation 4 -> 3 downgrade unsupported: PointSelector");
      }),
    };

    expect(getExportVersion(vault as any, { id: "manifest", type: "Manifest" })).toBe(4);
  });

  test("does not hide unexpected serialization failures", () => {
    const error = new Error("Invalid resource");
    const vault = {
      get: vi.fn().mockReturnValue({ items: [] }),
      toPresentation3: vi.fn(() => {
        throw error;
      }),
    };

    expect(() => getExportVersion(vault as any, { id: "manifest", type: "Manifest" })).toThrow(error);
  });

  test("honours an explicit Presentation 2 or 4 export", () => {
    const vault = { get: vi.fn() };
    const manifest = { id: "manifest", type: "Manifest" };

    expect(getExportVersion(vault as any, manifest, 2)).toBe(2);
    expect(getExportVersion(vault as any, manifest, 4)).toBe(4);
    expect(vault.get).not.toHaveBeenCalled();
  });
});
