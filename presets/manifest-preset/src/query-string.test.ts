import { afterEach, describe, expect, test, vi } from "vitest";
import { getSearchParam, replaceSearchParam } from "./query-string-state";

afterEach(() => vi.unstubAllGlobals());

describe("query string state", () => {
  test("uses a configured URL state adapter", () => {
    const urlState = {
      getSearchParam: vi.fn(() => "canvas-1"),
      replaceSearchParam: vi.fn(),
    };

    expect(getSearchParam("canvas", urlState)).toBe("canvas-1");
    replaceSearchParam("canvas", "canvas-2", urlState);

    expect(urlState.getSearchParam).toHaveBeenCalledWith("canvas");
    expect(urlState.replaceSearchParam).toHaveBeenCalledWith("canvas", "canvas-2");
  });

  test("preserves browser history state and hash by default", () => {
    const state = { __TSR_index: 3, __TSR_key: "route" };
    const replaceState = vi.fn();
    vi.stubGlobal("window", {
      location: {
        href: "https://example.org/editor?canvas=canvas-1&mode=edit#preview",
        search: "?canvas=canvas-1&mode=edit",
      },
      history: { state, replaceState },
    });

    replaceSearchParam("canvas", null);

    expect(replaceState).toHaveBeenCalledWith(state, "", "https://example.org/editor?mode=edit#preview");
  });
});
