import { describe, expect, test, vi } from "vitest";
import type { PresetPreviewOptions } from "../AppContext/AppContext";
import { hasPreviewOption } from "../PreviewButton/PreviewButton";

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
        actions: [
          { id: "host-action", label: "Host action", onClick: vi.fn() },
        ],
      }),
    ).toBe(true);
  });
});
