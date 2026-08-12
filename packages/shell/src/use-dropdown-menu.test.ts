import { expect, test } from "vitest";
import useDropdownMenu, { resolveDropdownMenu } from "./use-dropdown-menu";

test("exposes the dropdown hook as a function", () => {
  expect(typeof useDropdownMenu).toBe("function");
});

test.each([
  ["direct", (hook: () => void) => hook],
  ["CommonJS", (hook: () => void) => ({ default: hook })],
  ["bundled CommonJS", (hook: () => void) => ({ default: { default: hook } })],
])("resolves a %s hook export", (_name, wrap) => {
  const hook = () => undefined;
  expect(resolveDropdownMenu(wrap(hook))).toBe(hook);
});
