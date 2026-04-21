import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test, vi } from "vitest";
import { createManifestEditorCanvasProgressApi, getCanvasProgressStatus } from "../CanvasProgress";
import type {
  BackgroundActionContext,
  BackgroundActionDefinition,
  BackgroundActionPersistedState,
  BackgroundActionPersistenceKey,
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

const testVault = new Vault();

const systemContext: BackgroundActionSystemContext = {
  rootResource: manifestTarget,
  currentCanvas: canvasTarget,
  vault: testVault,
  tags: {} as any,
  canvasProgress: createManifestEditorCanvasProgressApi(testVault),
  plugins: { getSettings: <T extends Record<string, unknown>>() => ({}) as T },
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
  const persistenceKey: BackgroundActionPersistenceKey = {
    appId: "manifest-editor",
    instanceId: "test-workspace",
    rootResource: manifestTarget,
  };

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

  test("passes the tags api through available action contexts", () => {
    const tags = { getTags: vi.fn() } as any;
    const manifestAction = action({
      id: "manifest-action",
      supports: (ctx) => ctx.tags === tags,
    });

    const groups = getAvailableBackgroundActionGroups({
      definitions: [manifestAction],
      instances: {},
      systemContext: {
        ...systemContext,
        tags,
      },
      targets: [manifestTarget],
    });

    expect(groups[0]?.actions[0]?.context.tags).toBe(tags);
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

  test("cancels a running action by aborting its signal", async () => {
    let capturedSignal: AbortSignal | undefined;
    const run = vi.fn(
      (ctx) =>
        new Promise((_resolve, reject) => {
          capturedSignal = ctx.signal;
          ctx.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        }),
    );
    const definition = action({ run });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    const promise = runBackgroundAction({ store, context: context(definition) });

    expect(store.getState().instances[instanceKey]?.status).toBe("running");

    store.getState().cancelAction(instanceKey);
    await promise;

    expect(capturedSignal?.aborted).toBe(true);
    expect(store.getState().instances[instanceKey]?.status).toBe("cancelled");
    expect(store.getState().instances[instanceKey]?.statusText).toBe("Cancelled");
    expect(store.getState().instances[instanceKey]?.cancelRequestedAt).toBeTypeOf("number");
    expect(store.getState().instances[instanceKey]?.cancelledAt).toBeTypeOf("number");
    expect(store.getState().instances[instanceKey]?.events.map((event) => event.type)).toContain(
      "cancel-requested",
    );
    expect(store.getState().histories[instanceKey]).toHaveLength(1);
  });

  test("does not mark cancelled actions complete when a run resolves after abort", async () => {
    let finish: (value: unknown) => void = () => {};
    const definition = action({
      run: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    const promise = runBackgroundAction({ store, context: context(definition) });
    store.getState().cancelAction(instanceKey);
    finish({ ok: true });
    await promise;

    const instance = store.getState().instances[instanceKey];
    expect(instance?.status).toBe("cancelled");
    expect(instance?.result).toBeUndefined();
    expect(instance?.resultsAvailable).toBe(false);
  });

  test("cancels an action while preparing and does not run it", async () => {
    let capturedSignal: AbortSignal | undefined;
    let finishPrepare: (value: boolean) => void = () => {};
    const run = vi.fn();
    const definition = action({
      prepare: vi.fn(
        (ctx) =>
          new Promise<boolean>((resolve) => {
            capturedSignal = ctx.signal;
            finishPrepare = resolve;
          }),
      ),
      run,
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    const promise = runBackgroundAction({ store, context: context(definition) });

    expect(store.getState().instances[instanceKey]?.status).toBe("preparing");

    store.getState().cancelAction(instanceKey);
    finishPrepare(true);
    await promise;

    expect(capturedSignal?.aborted).toBe(true);
    expect(run).not.toHaveBeenCalled();
    expect(store.getState().instances[instanceKey]?.status).toBe("cancelled");
  });

  test("does not mark actions complete after they set a final cancelled status", async () => {
    const definition = action({
      run: (ctx) => {
        ctx.setActionStatus("cancelled", "Cancelled");
        return { ok: true };
      },
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    await runBackgroundAction({ store, context: context(definition) });

    const instance = store.getState().instances[instanceKey];
    expect(instance?.status).toBe("cancelled");
    expect(instance?.result).toBeUndefined();
    expect(instance?.resultsAvailable).toBe(false);
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

  test("records structured logs and log events", () => {
    const definition = action();
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    store.getState().startAction(instanceKey, definition, manifestTarget);
    store.getState().appendActionLog(instanceKey, "Preparing request");
    store.getState().appendActionLog(instanceKey, "Remote warning", "warn", { code: 503 });

    const instance = store.getState().instances[instanceKey];
    expect(instance?.logs).toHaveLength(2);
    expect(instance?.logs[0]).toMatchObject({ level: "info", message: "Preparing request" });
    expect(instance?.logs[1]).toMatchObject({ level: "warn", message: "Remote warning", data: { code: 503 } });
    expect(instance?.events.filter((event) => event.type === "log")).toHaveLength(2);
  });

  test("normalises progress from units, percent, and clear calls", () => {
    const definition = action();
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    store.getState().startAction(instanceKey, definition, manifestTarget);
    store.getState().setActionProgress(instanceKey, { current: 2, total: 4, label: "Half way" });

    expect(store.getState().instances[instanceKey]?.progress).toEqual({
      current: 2,
      total: 4,
      percent: 50,
      label: "Half way",
    });

    store.getState().setActionProgress(instanceKey, { percent: 125, label: "Too far" });
    expect(store.getState().instances[instanceKey]?.progress).toEqual({
      percent: 100,
      current: undefined,
      total: undefined,
      label: "Too far",
    });

    store.getState().setActionProgress(instanceKey, null);
    expect(store.getState().instances[instanceKey]?.progress).toBeUndefined();
    expect(store.getState().instances[instanceKey]?.events.map((event) => event.type)).toEqual(["started"]);
  });

  test("preserves latest progress in completed history", async () => {
    const definition = action({
      run: (ctx) => {
        ctx.setActionProgress({ current: 1, total: 2, label: "Half way" });
      },
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    await runBackgroundAction({ store, context: context(definition) });

    const history = store.getState().histories[instanceKey];
    expect(history).toHaveLength(1);
    expect(history?.[0]?.progress).toMatchObject({ percent: 50, label: "Half way" });
    expect(history?.[0]?.events.map((event) => String(event.type))).not.toContain("progress");
  });

  test("keeps progress updates in memory without triggering persistence writes", async () => {
    const definition = action({ resumable: true });
    const saved: BackgroundActionPersistedState[] = [];
    const store = createBackgroundActionsStore([definition]);
    const persistence = {
      load: vi.fn(async () => null),
      save: vi.fn(async (_key: BackgroundActionPersistenceKey, snapshot: BackgroundActionPersistedState) => {
        saved.push(snapshot);
      }),
      clear: vi.fn(async () => undefined),
    };
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    store.getState().setPersistence(persistence, persistenceKey);
    store.getState().hydrate(null);
    store.getState().startAction(instanceKey, definition, manifestTarget, new AbortController());
    await store.getState().flushPersistence();
    saved.length = 0;

    store.getState().setActionProgress(instanceKey, { current: 1, total: 4, label: "Latest only" });
    await Promise.resolve();

    expect(store.getState().instances[instanceKey]?.progress).toMatchObject({
      percent: 25,
      label: "Latest only",
    });
    expect(saved).toHaveLength(0);
  });

  test("preserves completed run history with distinct run ids", async () => {
    const definition = action({
      run: vi.fn().mockResolvedValueOnce({ run: 1 }).mockResolvedValueOnce({ run: 2 }),
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    await runBackgroundAction({ store, context: context(definition) });
    const firstRunId = store.getState().instances[instanceKey]?.runId;

    await runBackgroundAction({ store, context: context(definition) });
    const secondRunId = store.getState().instances[instanceKey]?.runId;

    expect(firstRunId).toBeTypeOf("string");
    expect(secondRunId).toBeTypeOf("string");
    expect(secondRunId).not.toBe(firstRunId);
    expect(store.getState().instances[instanceKey]?.result).toEqual({ run: 2 });
    expect(store.getState().histories[instanceKey]?.map((instance) => instance.runId)).toEqual([
      firstRunId,
      secondRunId,
    ]);
  });

  test("hydrates resumable active actions and requeues running tasks", () => {
    const definition = action({ resumable: true });
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);
    const store = createBackgroundActionsStore([definition]);
    const snapshot: BackgroundActionPersistedState = {
      version: 1,
      savedAt: Date.now(),
      instances: {
        [instanceKey]: {
          id: instanceKey,
          runId: "run-1",
          actionId: definition.id,
          target: manifestTarget,
          label: definition.label,
          status: "running",
          statusText: "Running",
          error: null,
          result: undefined,
          resultsAvailable: false,
          logs: [],
          events: [
            {
              id: "old-progress",
              createdAt: Date.now(),
              type: "progress",
              message: "50%",
            } as any,
          ],
          startedAt: Date.now(),
        },
      },
      histories: {},
      plans: {
        [instanceKey]: {
          version: 1,
          tasks: [
            { id: "one", label: "One", status: "complete" },
            { id: "two", label: "Two", status: "running" },
          ],
        },
      },
    };

    store.getState().hydrate(snapshot);

    expect(store.getState().instances[instanceKey]?.status).toBe("running");
    expect(store.getState().instances[instanceKey]?.statusText).toBe("Resuming");
    expect(store.getState().instances[instanceKey]?.events.map((event) => String(event.type))).not.toContain(
      "progress",
    );
    expect(store.getState().plans[instanceKey]?.tasks.map((task) => task.status)).toEqual(["complete", "queued"]);
    expect(store.getState().histories[instanceKey]).toBeUndefined();
  });

  test("hydrates cancellation requests as cancelled instead of resuming", () => {
    const definition = action({ resumable: true });
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);
    const store = createBackgroundActionsStore([definition]);
    const requestedAt = Date.now();
    const snapshot: BackgroundActionPersistedState = {
      version: 1,
      savedAt: requestedAt,
      instances: {
        [instanceKey]: {
          id: instanceKey,
          runId: "run-cancel-requested",
          actionId: definition.id,
          target: manifestTarget,
          label: definition.label,
          status: "running",
          statusText: "Cancelling",
          error: null,
          result: undefined,
          resultsAvailable: false,
          logs: [],
          events: [],
          startedAt: requestedAt - 1000,
          cancelRequestedAt: requestedAt,
        },
      },
      histories: {},
      plans: {
        [instanceKey]: {
          version: 1,
          tasks: [
            { id: "one", label: "One", status: "complete" },
            { id: "two", label: "Two", status: "running" },
            { id: "three", label: "Three", status: "queued" },
          ],
        },
      },
    };

    store.getState().hydrate(snapshot);

    const instance = store.getState().instances[instanceKey];
    expect(instance?.status).toBe("cancelled");
    expect(instance?.statusText).toBe("Cancelled");
    expect(instance?.cancelRequestedAt).toBe(requestedAt);
    expect(store.getState().plans[instanceKey]?.tasks.map((task) => task.status)).toEqual([
      "complete",
      "cancelled",
      "cancelled",
    ]);
    expect(store.getState().histories[instanceKey]).toHaveLength(1);
  });

  test("hydrates active legacy actions as cancelled after reload", () => {
    const definition = action();
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);
    const store = createBackgroundActionsStore([definition]);
    const snapshot: BackgroundActionPersistedState = {
      version: 1,
      savedAt: Date.now(),
      instances: {
        [instanceKey]: {
          id: instanceKey,
          runId: "run-legacy",
          actionId: definition.id,
          target: manifestTarget,
          label: definition.label,
          status: "running",
          statusText: "Running",
          error: null,
          result: undefined,
          resultsAvailable: false,
          logs: [],
          events: [],
          startedAt: Date.now(),
        },
      },
      histories: {},
      plans: {},
    };

    store.getState().hydrate(snapshot);

    const instance = store.getState().instances[instanceKey];
    expect(instance?.status).toBe("cancelled");
    expect(instance?.statusText).toBe("Interrupted by page reload");
    expect(store.getState().histories[instanceKey]).toHaveLength(1);
  });

  test("persists user cancellation immediately as terminal state", async () => {
    const saved: BackgroundActionPersistedState[] = [];
    const definition = action({
      resumable: true,
      prepare: () => ({
        version: 1,
        tasks: [{ id: "one", label: "One", status: "queued" }],
      }),
      run: (ctx) =>
        new Promise((_resolve, reject) => {
          ctx.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        }),
    });
    const persistence = {
      load: vi.fn(async () => null),
      save: vi.fn(async (_key: BackgroundActionPersistenceKey, snapshot: BackgroundActionPersistedState) => {
        saved.push(snapshot);
      }),
      clear: vi.fn(async () => undefined),
    };
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    store.getState().setPersistence(persistence, persistenceKey);
    store.getState().hydrate(null);
    const promise = runBackgroundAction({ store, context: context(definition) });
    await Promise.resolve();
    await Promise.resolve();
    expect(store.getState().instances[instanceKey]?.status).toBe("running");

    saved.length = 0;
    store.getState().cancelAction(instanceKey);
    expect(store.getState().instances[instanceKey]?.status).toBe("cancelled");
    await store.getState().flushPersistence();
    await promise;

    const latest = saved[saved.length - 1]!;
    expect(latest.instances[instanceKey]?.status).toBe("cancelled");
    expect(latest.instances[instanceKey]?.cancelRequestedAt).toBeTypeOf("number");
    expect(latest.plans[instanceKey]?.tasks.map((task) => task.status)).toEqual(["cancelled"]);

    const reloaded = createBackgroundActionsStore([definition]);
    reloaded.getState().hydrate(latest);
    expect(reloaded.getState().instances[instanceKey]?.status).toBe("cancelled");
  });

  test("resumes a persisted plan without rerunning completed tasks", async () => {
    const processed: string[] = [];
    const definition = action({
      resumable: true,
      run: async (ctx) => {
        await ctx.tasks.runEach((task) => {
          processed.push(task.id);
          return { taskStatus: "complete", result: task.id };
        });
        return ctx.tasks.getAll().map((task) => task.result);
      },
    });
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);
    const store = createBackgroundActionsStore([definition]);
    const snapshot: BackgroundActionPersistedState = {
      version: 1,
      savedAt: Date.now(),
      instances: {
        [instanceKey]: {
          id: instanceKey,
          runId: "run-resume",
          actionId: definition.id,
          target: manifestTarget,
          label: definition.label,
          status: "running",
          statusText: "Running",
          error: null,
          result: undefined,
          resultsAvailable: false,
          logs: [],
          events: [],
          startedAt: Date.now(),
        },
      },
      histories: {},
      plans: {
        [instanceKey]: {
          version: 1,
          tasks: [
            { id: "done", label: "Done", status: "complete", result: "done" },
            { id: "pending", label: "Pending", status: "running" },
          ],
        },
      },
    };

    store.getState().hydrate(snapshot);
    await runBackgroundAction({ store, context: context(definition), resume: true });

    expect(processed).toEqual(["pending"]);
    expect(store.getState().instances[instanceKey]?.status).toBe("complete");
    expect(store.getState().instances[instanceKey]?.result).toEqual(["done", "pending"]);
    expect(store.getState().plans[instanceKey]?.tasks.map((task) => task.status)).toEqual(["complete", "complete"]);
  });

  test("persists serializable snapshots without controllers", async () => {
    const definition = action({ resumable: true });
    const saved: BackgroundActionPersistedState[] = [];
    const store = createBackgroundActionsStore([definition]);
    const persistence = {
      load: vi.fn(async () => null),
      save: vi.fn(async (_key: BackgroundActionPersistenceKey, snapshot: BackgroundActionPersistedState) => {
        saved.push(snapshot);
      }),
      clear: vi.fn(async () => undefined),
    };

    store.getState().setPersistence(persistence, persistenceKey);
    store.getState().hydrate(null);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);
    store.getState().startAction(instanceKey, definition, manifestTarget, new AbortController());
    store.getState().setActionPlan(instanceKey, {
      version: 1,
      tasks: [{ id: "one", label: "One", status: "queued" }],
    });
    store.getState().setActionProgress(instanceKey, { percent: 30, label: "Latest" });
    await store.getState().flushPersistence();

    expect(saved.length).toBeGreaterThan(0);
    const latest = saved[saved.length - 1]!;
    expect((latest as any).controllers).toBeUndefined();
    expect(latest.instances[instanceKey]?.status).toBe("preparing");
    expect(latest.instances[instanceKey]?.progress).toMatchObject({ percent: 30, label: "Latest" });
    expect(latest.instances[instanceKey]?.events.map((event) => String(event.type))).not.toContain("progress");
    expect(latest.plans[instanceKey]?.tasks[0]?.id).toBe("one");
  });

  test("clears canvas progress statuses touched by an action when it finishes", async () => {
    const vault = new Vault();
    vault.loadManifestSync(manifestTarget.id, {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: manifestTarget.id,
      type: "Manifest",
      label: { en: ["Test manifest"] },
      items: [
        {
          id: canvasTarget.id,
          type: "Canvas",
          label: { en: ["Canvas 1"] },
          height: 100,
          width: 100,
          items: [],
        },
      ],
    });
    const canvasProgress = createManifestEditorCanvasProgressApi(vault);
    const definition = action({
      run: (ctx) => {
        ctx.canvasProgress.setStatus(canvasTarget, "pending");
        expect(getCanvasProgressStatus(vault, canvasTarget)).toBe("pending");
      },
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: {
        ...context(definition),
        vault,
        canvasProgress,
      },
    });

    expect(getCanvasProgressStatus(vault, canvasTarget)).toBe("none");
  });
});
