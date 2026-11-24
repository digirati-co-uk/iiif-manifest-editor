import { Vault } from "@iiif/helpers/vault";
import { Creator, type CreatorDefinition, getCreatorConfigKey } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import { mergePartialConfig } from "./ConfigContext";
import { formatStringListSetting, getCreatorSettings, parseStringListSetting } from "./CreatorSettings.helpers";

const fields = {
  fields: [
    {
      id: "enabled",
      type: "checkbox" as const,
      label: "Enabled",
    },
  ],
};

function creator(
  id: string,
  configKey?: string,
  create = vi.fn((_payload, ctx) => ctx.embed({ id: `urn:test:${id}`, type: "Canvas" }))
): CreatorDefinition {
  return {
    id,
    configKey,
    label: id,
    configuration: fields,
    create,
    resourceType: "Canvas",
    resourceFields: [],
    supports: {},
  } as CreatorDefinition;
}

describe("creator configuration keys", () => {
  test("falls back to the creator id", () => {
    expect(getCreatorConfigKey(creator("base"))).toBe("base");
  });

  test("passes shared settings to base and forked creators while keeping ordinary creators isolated", async () => {
    const received: Record<string, Record<string, unknown>> = {};
    const capture = (id: string) =>
      creator(
        id,
        id === "fork" ? "base" : undefined,
        vi.fn((_payload, ctx) => {
          received[id] = ctx.config;
          return ctx.embed({ id: `urn:test:${id}`, type: "Canvas" });
        })
      );
    const creators = [capture("base"), capture("fork"), capture("other")];
    const runtime = new Creator(new Vault(), creators, undefined, {
      base: { enabled: true },
      other: { enabled: false },
      fork: { enabled: "legacy duplicate" },
    });

    await runtime.create("base", {});
    await runtime.create("fork", {});
    await runtime.create("other", {});

    expect(received.base).toEqual({ enabled: true });
    expect(received.fork).toBe(received.base);
    expect(received.other).toEqual({ enabled: false });
  });

  test("shows one settings definition per effective key and prefers its owner", () => {
    const fork = creator("fork", "base");
    const base = creator("base");
    const other = creator("other");

    expect(getCreatorSettings([fork, other, base])).toEqual([base, other]);
  });

  test("merges fields only under the effective key", () => {
    const merged = mergePartialConfig(
      { creators: { base: { enabled: true, retained: "yes" } } },
      { creators: { base: { enabled: false } } }
    );

    expect(merged.creators).toEqual({
      base: { enabled: false, retained: "yes" },
    });
  });
});

describe("string-list creator settings", () => {
  test("parses one trimmed, de-duplicated value per line", () => {
    expect(parseStringListSetting(" Attribution \r\n\nCredit\nAttribution\n")).toEqual(["Attribution", "Credit"]);
  });

  test("blank input becomes undefined so the creator uses its default", () => {
    expect(parseStringListSetting("")).toBeUndefined();
    expect(parseStringListSetting("  \n \n")).toBeUndefined();
    expect(parseStringListSetting(null)).toBeUndefined();
  });

  test("clears a saved list when merged with undefined", () => {
    const merged = mergePartialConfig(
      { creators: { base: { manifestMetadataLabels: ["Credit"], other: true } } },
      { creators: { base: { manifestMetadataLabels: undefined } } }
    );
    expect(merged.creators.base?.manifestMetadataLabels).toBeUndefined();
    expect(merged.creators.base?.other).toBe(true);
  });

  test("formats saved values, falling back to the declared default", () => {
    expect(formatStringListSetting(["A", "B"])).toBe("A\nB");
    expect(formatStringListSetting(undefined, ["Default"])).toBe("Default");
    expect(formatStringListSetting(undefined)).toBe("");
  });
});
