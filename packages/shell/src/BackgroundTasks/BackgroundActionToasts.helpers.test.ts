import { describe, expect, test, vi } from "vitest";
import type { BackgroundActionDefinition, BackgroundActionInstance } from "./BackgroundTasks.types";
import { getBackgroundActionToastContent, getBackgroundActionToastDedupKey } from "./BackgroundActionToasts.helpers";

const definition: BackgroundActionDefinition = {
  id: "test-action",
  label: "Test action",
  run: vi.fn(),
};

function instance(partial: Partial<BackgroundActionInstance> = {}): BackgroundActionInstance {
  return {
    id: "test-action::Manifest::https://example.org/manifest",
    actionId: "test-action",
    target: {
      id: "https://example.org/manifest",
      type: "Manifest",
      label: "Manifest",
      scope: "root",
    },
    label: "Test action",
    runId: "run-1",
    status: "idle",
    resultsAvailable: false,
    logs: [],
    events: [],
    ...partial,
  };
}

describe("BackgroundActionToasts helpers", () => {
  test("deduplicates only terminal actions with a completion timestamp", () => {
    expect(getBackgroundActionToastDedupKey(instance({ status: "running" }))).toBeNull();
    expect(getBackgroundActionToastDedupKey(instance({ status: "complete" }))).toBeNull();
    expect(getBackgroundActionToastDedupKey(instance({ status: "complete", completedAt: 123 }))).toBe(
      "test-action::Manifest::https://example.org/manifest:complete:123",
    );
  });

  test("creates success toasts with a results action when results are available", () => {
    const onResults = vi.fn();
    const content = getBackgroundActionToastContent(
      definition,
      instance({ status: "complete", completedAt: 123, resultsAvailable: true }),
      onResults,
    );

    expect(content?.variant).toBe("success");
    expect(content?.title).toBe("Test action complete");
    expect(content?.description).toBe("Results are ready.");
    expect(content?.action?.label).toBe("Results");

    content?.action?.onPress();
    expect(onResults).toHaveBeenCalledTimes(1);
  });

  test("creates error toasts with the recorded error message", () => {
    const content = getBackgroundActionToastContent(
      definition,
      instance({
        status: "error",
        completedAt: 123,
        error: { message: "Remote service failed" },
      }),
    );

    expect(content?.variant).toBe("error");
    expect(content?.title).toBe("Test action failed");
    expect(content?.description).toBe("Remote service failed");
    expect(content?.action).toBeUndefined();
  });
});
