import { expect, test } from "vitest";
import { parseVaultMessage, stringifyVaultMessage } from "./wire";

test("wire codec preserves data values, absent properties and sparse arrays", () => {
  const array = new Array(3);
  array[1] = undefined;
  array[2] = null;
  const original = { array, present: undefined, value: NaN, negative: -0, infinity: Infinity, __proto__: null };
  const value = parseVaultMessage(stringifyVaultMessage(original));
  expect(value).toEqual(original);
  expect(0 in value.array).toBe(false);
  expect(1 in value.array).toBe(true);
  expect(Object.hasOwn(value, "present")).toBe(true);
  expect(Object.hasOwn(value, "absent")).toBe(false);
  expect(Object.is(value.negative, -0)).toBe(true);
});
