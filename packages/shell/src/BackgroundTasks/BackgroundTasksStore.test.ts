import { describe, expect, test, vi } from "vitest";
import type {
  BackgroundActionContext,
  BackgroundActionDefinition,
  BackgroundActionSystemContext,
  BackgroundActionTarget,
} from "./BackgroundTasks.types";
import {
  createBackgroundActionsStore,
  getAvailableBackgroundActionGroups,
  getBackgroundActionInstanceKey,
  runBackgroundAction,
  mergeBackgroundActionDefinitions,
} from "./BackgroundTasksStore";

const manifestTarget: BackgroundActionTarget = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: "Manifest",
  scope: "root",
};

const canvasTarget: BackgroundActionTarget = {
  id: "https://example.org/canvas/1",
  type: "Canvas",
  label: "Current canvas",
  scope: "canvas",
};

const systemContext: BackgroundActionSystemContext = {
  rootResource: manifestTarget,
  currentCanvas: canvasTarget,
  vault: {} as any,
  config: {} as any,
  layoutState: {} as any,
  layoutActions: {} as any,
};

function action(definition: Partial<BackgroundActionDefinition> = {}): BackgroundActionDefinition {
  return {
    id: "test-action",
    label: "Test action",
    resourceTypes: ["Manifest"],
    run: vi.fn(),
    ...definition,
  };
}

function context(definition: BackgroundActionDefinition, target = manifestTarget): BackgroundActionContext {
  const instanceKey = getBackgroundActionInstanceKey(definition.id, target);

  return {
    ...systemContext,
    definition,
    target,
    instanceKey,
  };
}

describe("BackgroundTasksStore", () => {
  test("registers and unregisters action definitions", () => {
    const store = createBackgroundActionsStore();
    const dispose = store.getState().registerAction(action({ id: "one" }));

    expect(store.getState().definitions.map((definition) => definition.id)).toEqual(["one"]);

    dispose();

    expect(store.getState().definitions).toEqual([]);
  });

  test("lets extension definitions override base definitions with the same id", () => {
    const base = action({ id: "duplicate", label: "Base action" });
    const override = action({ id: "duplicate", label: "Override action" });
    const added = action({ id: "added", label: "Added action" });

    expect(mergeBackgroundActionDefinitions([base], [override, added]).map((definition) => definition.label)).toEqual([
      "Override action",
      "Added action",
    ]);
  });

  test("filters available actions by root and current canvas targets", () => {
    const manifestAction = action({ id: "manifest-action", resourceTypes: ["Manifest"] });
    const canvasAction = action({ id: "canvas-action", resourceTypes: ["Canvas"] });
    const unsupportedAction = action({
      id: "unsupported-action",
      resourceTypes: ["Manifest"],
      supports: () => false,
    });

    const groups = getAvailableBackgroundActionGroups({
      definitions: [canvasAction, unsupportedAction, manifestAction],
      instances: {},
      systemContext,
      targets: [manifestTarget, canvasTarget],
    });

    expect(groups).toHaveLength(2);
    expect(groups[0]?.actions.map((available) => available.definition.id)).toEqual(["manifest-action"]);
    expect(groups[1]?.actions.map((available) => available.definition.id)).toEqual(["canvas-action"]);
  });

  test("does not start the same action for the same target twice while running", async () => {
    let finish: (value: unknown) => void = () => {};
    const run = vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const definition = action({ run });
    const store = createBackgroundActionsStore([definition]);

    const firstRun = runBackgroundAction({ store, context: context(definition) });
    const secondRun = await runBackgroundAction({ store, context: context(definition) });

    expect(run).toHaveBeenCalledTimes(1);
    expect(secondRun?.status).toBe("running");

    finish({ ok: true });
    await firstRun;

    expect(store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)]?.status).toBe(
      "complete",
    );
  });

  test("records returned results and marks them available", async () => {
    const definition = action({ run: () => ({ ok: true }) });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: context(definition) });

    const instance = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)];
    expect(instance?.status).toBe("complete");
    expect(instance?.resultsAvailable).toBe(true);
    expect(instance?.result).toEqual({ ok: true });
  });

  test("records action errors", async () => {
    const definition = action({
      run: () => {
        throw new Error("boom");
      },
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: context(definition) });

    const instance = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)];
    expect(instance?.status).toBe("error");
    expect(instance?.error?.message).toBe("boom");
  });

  test("allows lifecycle helpers to update labels, status, and result state", async () => {
    const definition = action({
      run: (ctx) => {
        ctx.setActionLabel("Updated label");
        ctx.setActionStatus("running", "Half way");
        ctx.setResult("intermediate");
        ctx.setResultsAvailable(true);
      },
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: context(definition) });

    const instance = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)];
    expect(instance?.label).toBe("Updated label");
    expect(instance?.status).toBe("complete");
    expect(instance?.result).toBe("intermediate");
    expect(instance?.resultsAvailable).toBe(true);
  });
});
