import type { Reference } from "@iiif/parser";
import { matchBasedOnResource } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import { completeCreator } from "./creator-completion";

const canvas = (id: string): Reference => ({ id, type: "Canvas" });

describe("creator completion", () => {
  test("edits a newly created resource after closing the creator", async () => {
    const calls: string[] = [];
    const created = canvas("canvas-1");

    await expect(
      completeCreator({
        create: async () => created,
        onCreate: () => calls.push("created"),
        close: () => calls.push("closed"),
        edit: (resource) => calls.push(`edit:${resource.id}`),
      }),
    ).resolves.toBe(true);
    expect(calls).toEqual(["created", "closed", "edit:canvas-1"]);
  });

  test("selects the first resource when a creator returns several", async () => {
    const edit = vi.fn();

    await completeCreator({
      create: async () => [canvas("canvas-1"), canvas("canvas-2")],
      edit,
    });

    expect(edit).toHaveBeenCalledWith(canvas("canvas-1"));
  });

  test("allows editing to be skipped while still completing creation", async () => {
    const close = vi.fn();

    await completeCreator({
      create: async () => canvas("canvas-1"),
      close,
    });

    expect(close).toHaveBeenCalledOnce();
  });

  test("does nothing for an empty result", async () => {
    const onCreate = vi.fn();
    const close = vi.fn();
    const edit = vi.fn();

    await expect(
      completeCreator({
        create: async () => [] as Reference[],
        onCreate,
        close,
        edit,
      }),
    ).resolves.toBe(false);
    expect(onCreate).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  test("leaves completion actions untouched when creation fails", async () => {
    const close = vi.fn();
    const edit = vi.fn();

    await expect(
      completeCreator({
        create: async () => {
          throw new Error("Creation failed");
        },
        close,
        edit,
      }),
    ).rejects.toThrow("Creation failed");
    expect(close).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });
});

test("skipEditingOnCreate is creator control data, not matching data", () => {
  const creator = {
    id: "empty-canvas",
    label: "Empty canvas",
    resourceType: "Canvas",
    resourceFields: [],
    embeddedResources: [],
    staticFields: {},
    supports: {
      parentTypes: ["Manifest"],
      parentFields: ["items"],
    },
    create: vi.fn(),
  } as any;

  expect(
    matchBasedOnResource(
      {
        type: "Canvas",
        parent: { id: "manifest", type: "Manifest" },
        property: "items",
        initialData: { skipEditingOnCreate: true },
      },
      [creator],
      { vault: {} as any },
    ),
  ).toEqual([creator]);
});
