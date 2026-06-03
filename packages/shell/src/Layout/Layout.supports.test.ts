import { describe, expect, test, vi } from "vitest";
import {
  filterSupportedPanels,
  getSupportedPanelFallback,
} from "./Layout.supports";
import type { LayoutPanel } from "./Layout.types";

const panel = (
  id: string,
  supports?: LayoutPanel["supports"],
): LayoutPanel => ({
  id,
  label: id,
  supports,
  render: () => null,
});

describe("layout panel support", () => {
  test("keeps panels without supports and supported panels", () => {
    const panels = [
      panel("base"),
      panel("supported", () => true),
      panel("unsupported", () => false),
    ];

    expect(
      filterSupportedPanels(panels, {} as any).map((item) => item.id),
    ).toEqual(["base", "supported"]);
  });

  test("excludes panels whose supports predicate throws", () => {
    const onError = vi.fn();
    const panels = [
      panel("base"),
      panel("throws", () => {
        throw new Error("Nope");
      }),
    ];

    expect(
      filterSupportedPanels(panels, {} as any, onError).map((item) => item.id),
    ).toEqual(["base"]);
    expect(onError).toHaveBeenCalledWith(panels[1], expect.any(Error));
  });

  test("keeps the active panel when it is supported", () => {
    expect(getSupportedPanelFallback([panel("a"), panel("b")], "b")).toBe("b");
  });

  test("falls back to the first supported panel when active panel disappears", () => {
    expect(getSupportedPanelFallback([panel("a"), panel("b")], "missing")).toBe(
      "a",
    );
  });

  test("returns null when there is no supported panel to fall back to", () => {
    expect(getSupportedPanelFallback([], "missing")).toBeNull();
  });
});
