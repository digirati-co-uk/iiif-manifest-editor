import { afterEach, expect, test, vi } from "vitest";
import { loadResource } from "./load-resource";

const data = { id: "https://example.org/manifest", type: "Manifest", label: { en: ["Original"] }, items: [] };
afterEach(() => vi.unstubAllGlobals());

test("loads canonical resource into a fresh isolated Vault", async () => {
  const request = vi.fn().mockImplementation(async () => new Response(JSON.stringify(data)));
  vi.stubGlobal("fetch", request);
  const signal = new AbortController().signal;
  const first = await loadResource("https://example.org/alias", signal);
  const second = await loadResource(data.id);
  expect(request).toHaveBeenCalledWith("https://example.org/alias", { signal });
  expect(first.resource).toEqual({ id: data.id, type: "Manifest" });
  expect(first.vault.toPresentation3(first.resource)).toMatchObject(data);
  expect(first.vault).not.toBe(second.vault);
});

test("surfaces HTTP failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
  await expect(loadResource(data.id)).rejects.toThrow("503");
});

test.each([{ type: "Manifest" }, { id: 12, type: "Manifest" }, { id: data.id, type: "Canvas" }, null])(
  "rejects invalid resource roots: %j",
  async (value) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(value))));
    await expect(loadResource(data.id)).rejects.toThrow("Expected a IIIF Presentation 3");
  }
);
