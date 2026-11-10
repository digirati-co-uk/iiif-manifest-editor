import { Vault } from "@iiif/helpers/vault";
import type { MessageReference } from "@manifest-editor/i18n";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Creator } from "../src/Creator";
import { defineCreator, withCustomRender, withInitialData } from "../src/creator-register";
import type {
  CreatorConfigField,
  CreatorContext,
  CreatorDefinition,
  CreatorValidationMessage,
  GetCreatorPayload,
} from "../src/types";

const labelMessage = {
  namespace: "example-creators",
  key: "blank.label",
  defaultValue: "Blank canvas",
} satisfies MessageReference;

const legacy = defineCreator({
  id: "example/blank",
  label: "Blank canvas",
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label"],
  supports: { parentTypes: ["Manifest"], parentFields: ["items"] },
  create(payload: { title: string }, ctx) {
    return { id: ctx.generateId("canvas"), type: "Canvas", label: { cy: [payload.title] } };
  },
  validate: (_payload: { title: string }, _vault: Vault): void => {},
});

const feedback = {
  code: "title-too-short",
  field: "title",
  message: {
    namespace: "example-creators",
    key: "title.minimum",
    values: { count: 2, entered: "<title>", allowed: false, extra: null },
    defaultValue: "Enter at least {{count}} characters",
  },
} satisfies CreatorValidationMessage;

const localized = defineCreator({
  ...legacy,
  labelMessage,
  summaryMessage: { namespace: "example-creators", key: "blank.summary" },
  helpMessage: { namespace: "example-creators", key: "blank.help" },
  placeholderMessage: { namespace: "example-creators", key: "blank.placeholder" },
  actionButtonMessage: { namespace: "example-creators", key: "blank.create" },
  validationErrorMessage(error, context) {
    expectTypeOf(context.payload).toEqualTypeOf<{ title: string }>();
    return error instanceof RangeError ? feedback : undefined;
  },
});

// Checked by tsc: third-party definitions, fields and contexts need no new members.
const thirdParty: CreatorDefinition<{ title: string }> = legacy;
const checkbox: CreatorConfigField = { id: "enabled", type: "checkbox", label: "Enabled" };
const messageCheckbox: CreatorConfigField = { ...checkbox, labelMessage, summaryMessage: labelMessage };
const asyncValidator: NonNullable<typeof legacy.validate> = async () => {};

function formContext(vault: Vault): CreatorContext<{ title: string }> {
  return { vault, options: { targetType: "Canvas" }, validate: () => true, runCreate: () => {} };
}

describe("additive creator UI message contracts", () => {
  it("keeps legacy types, IDs, fields and validation return types compatible", () => {
    expectTypeOf<GetCreatorPayload<typeof localized>>().toEqualTypeOf<{ title: string }>();
    expectTypeOf(localized.id).toEqualTypeOf<"example/blank">();
    expectTypeOf(thirdParty.validate).toEqualTypeOf<
      ((payload: { title: string }, vault: Vault) => void | Promise<void>) | undefined
    >();
    expect(thirdParty).toBe(legacy);
    expect(messageCheckbox.id).toBe(checkbox.id);
    expect(asyncValidator({ title: "a" }, new Vault())).toBeInstanceOf(Promise);
  });

  it("transports only plain feedback and preserves interpolation values", () => {
    expect(JSON.parse(JSON.stringify(feedback))).toEqual(feedback);
    expect(structuredClone(feedback)).toEqual(feedback);
    const context = { payload: { title: "a" }, vault: new Vault() };
    expect(localized.validationErrorMessage!(new RangeError(), context)).toBe(feedback);
    expect(localized.validationErrorMessage!(new Error("technical"), context)).toBeUndefined();
  });

  it("preserves descriptors and optional instance formatting through form wrappers", () => {
    const vault = new Vault();
    const ctx = formContext(vault);
    ctx.i18n = { resolveMessage: vi.fn(() => "Leeg canvas") };
    const render = vi.fn((next: CreatorContext<{ title: string }>) => {
      expect(next.i18n).toBe(ctx.i18n);
      expect(next.options.initialData).toEqual({ language: "cy", title: "invocation", forced: true });
      return next.i18n?.resolveMessage(labelMessage, legacy.label);
    });
    const wrapped = withInitialData({ ...localized, render }, { language: "cy", title: "default" }, { forced: true });
    const custom = withCustomRender(wrapped, (next, original) => original(next));
    ctx.options.initialData = { title: "invocation" };
    expect(custom.render(ctx)).toBe("Leeg canvas");
    expect(custom.labelMessage).toBe(labelMessage);
    expect(custom.validationErrorMessage).toBe(localized.validationErrorMessage);
    expect(ctx.options.initialData).toEqual({ title: "invocation" });
  });

  it("leaves resource generation, authored content, and validation execution unchanged", async () => {
    const vault = new Vault();
    const validate = vi.fn();
    const validationErrorMessage = vi.fn();
    const create = vi.fn(localized.create);
    const definition = { ...localized, create, validate, validationErrorMessage };
    const creator = new Creator(vault, [definition]);
    const payload = { title: "Teitl Cymraeg" };
    const result = await creator.create(definition.id, payload, { rootId: "https://example.org/root" });
    expect(Array.isArray(result)).toBe(false);
    if (Array.isArray(result)) throw new Error("Expected one reference");
    expect(result.id).toMatch(/^https:\/\/example.org\/root\/canvas\//);
    expect(vault.get(result).label).toEqual({ cy: ["Teitl Cymraeg"] });
    expect(create.mock.calls[0]?.[0]).toBe(payload);
    expect(payload).toEqual({ title: "Teitl Cymraeg" });
    expect(validate).not.toHaveBeenCalled();
    expect(validationErrorMessage).not.toHaveBeenCalled();
    expect(vault.get(result)).not.toHaveProperty("labelMessage");
  });

  it("preserves thrown error identity and leaves feedback mapping opt-in", async () => {
    const error = new RangeError("technical failure");
    const validationErrorMessage = vi.fn(localized.validationErrorMessage);
    const definition = {
      ...localized,
      validationErrorMessage,
      create: () => {
        throw error;
      },
    };
    await expect(new Creator(new Vault(), [definition]).create(definition.id, { title: "a" })).rejects.toBe(error);
    expect(validationErrorMessage).not.toHaveBeenCalled();
  });
});
