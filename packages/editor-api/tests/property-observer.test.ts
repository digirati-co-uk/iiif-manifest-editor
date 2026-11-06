import { expect, test } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { PropertyObserver } from "../src/PropertyObserver";

test("observed entities may disappear when a creation is undone", () => {
  const vault = new Vault({ history: true });
  vault.loadSync("m", { id: "m", type: "Manifest", items: [] });
  const canvas = { id: "c", type: "Canvas" as const };
  const context = vault.beginInteraction({ label: "Create Canvas" });
  context.vault.loadSync("c", { ...canvas, label: { en: ["Canvas"] }, items: [] });
  context.finish();
  const observer = new PropertyObserver(vault, canvas);
  observer.track("label");
  let calls = 0;
  const stop = observer.start(() => calls++);
  expect(() => vault.undo()).not.toThrow();
  expect(vault.get(canvas)).toBeNull();
  expect(calls).toBeGreaterThan(0);
  stop();
});
