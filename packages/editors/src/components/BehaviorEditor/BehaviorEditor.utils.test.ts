import { describe, expect, test } from "vitest";
import { filteredBehaviors } from "./BehaviorEditor.utils";

describe("BehaviorEditor utils", () => {
  test("choice group behavior is treated as configured", () => {
    expect(
      filteredBehaviors(["floating"], [
        {
          id: "floating",
          type: "choice",
          label: { en: ["Floating"] },
          groupBehavior: "floating",
          items: [{ value: "float-top-right", label: { en: ["Float top right"] } }],
        },
      ]),
    ).toEqual([{ value: "floating", configId: "floating", hasConfig: true }]);
  });
});
