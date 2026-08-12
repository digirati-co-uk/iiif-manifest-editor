import { describe, expect, test } from "vitest";
import type { MappedApp, PresetOnboardingDefinition, PresetTemplateDefinition } from "../AppContext/AppContext";
import { getSelectedPresetTemplate } from "../AppContext/AppContext";
import { extendApp, mapApp } from "../helpers";
import { getPresetOnboardingDismissalKey } from "../PresetOnboarding/PresetOnboarding";

const onboarding = (id: string, mode: "global" | "per-resource"): PresetOnboardingDefinition => ({
  id,
  mode,
  title: id,
  renderBody: () => null,
});

const template = (id: string): PresetTemplateDefinition => ({
  id,
  label: id,
  summary: id,
  type: "slideshow",
  previewUrl: `https://example.org/${id}`,
  thumbnailUrl: `https://example.org/${id}.jpg`,
});

const app = (overrides: Partial<MappedApp> = {}): MappedApp => ({
  metadata: {
    id: "manifest-editor",
    title: "Manifest Editor",
    projectType: "Manifest",
  },
  layout: {
    leftPanels: [],
    centerPanels: [],
    rightPanels: [],
  },
  ...overrides,
});

describe("preset config", () => {
  test("mapApp preserves preset config", () => {
    const mapped = mapApp({
      default: {
        id: "example",
        title: "Example",
      },
      preset: {
        onboarding: onboarding("intro", "global"),
        templates: [template("one")],
      },
    });

    expect(mapped.preset?.onboarding?.id).toBe("intro");
    expect(mapped.preset?.templates?.map((item) => item.id)).toEqual(["one"]);
  });

  test("mapApp filters its template list", () => {
    const mapped = mapApp({
      default: { id: "example", title: "Example" },
      preset: {
        templates: [template("delft-template"), template("leeds-template")],
        templateFilter: (item: PresetTemplateDefinition) => item.id.startsWith("leeds-"),
      },
    });

    expect(mapped.preset?.templates?.map((item) => item.id)).toEqual(["leeds-template"]);
  });

  test("extendApp appends templates and overrides onboarding", () => {
    const extended = extendApp(
      app({
        preset: {
          onboarding: onboarding("base", "global"),
          templates: [template("base-template")],
        },
      }),
      {
        id: "extended",
        title: "Extended",
      },
      {
        preset: {
          onboarding: onboarding("override", "per-resource"),
          templates: [template("extra-template")],
        },
      },
    );

    expect(extended.preset?.onboarding?.id).toBe("override");
    expect(extended.preset?.templates?.map((item) => item.id)).toEqual(["base-template", "extra-template"]);
  });

  test("extendApp can replace templates", () => {
    const extended = extendApp(
      app({ preset: { templates: [template("base-template")] } }),
      { id: "extended", title: "Extended" },
      {
        preset: {
          templates: [template("leeds-template")],
          templateStrategy: "replace",
        },
      },
    );

    expect(extended.preset?.templates?.map((item) => item.id)).toEqual(["leeds-template"]);
  });

  test("extendApp filters the resolved template list", () => {
    const extended = extendApp(
      app({
        preset: {
          templates: [template("delft-template"), template("leeds-template")],
        },
      }),
      { id: "extended", title: "Extended" },
      { preset: { templateFilter: (item) => item.id.startsWith("leeds-") } },
    );

    expect(extended.preset?.templates?.map((item) => item.id)).toEqual(["leeds-template"]);
    expect(getSelectedPresetTemplate(extended.preset?.templates || [], "delft-template")).toBeNull();
  });

  test("extendApp preserves inherited preview options when adding host actions", () => {
    const extended = extendApp(
      app({
        preset: {
          preview: {
            mainAction: { id: "preview", label: "Preview", onClick: () => {} },
          },
        },
      }),
      { id: "extended", title: "Extended" },
      {
        preset: {
          preview: {
            actions: [{ id: "host-action", label: "Host action", onClick: () => {} }],
          },
        },
      },
    );

    expect(extended.preset?.preview?.mainAction?.id).toBe("preview");
    expect(extended.preset?.preview?.actions?.map((item) => item.id)).toEqual(["host-action"]);
  });
});

describe("preset onboarding dismissal keys", () => {
  test("global key excludes resource", () => {
    expect(
      getPresetOnboardingDismissalKey(onboarding("intro", "global"), {
        id: "https://example.org/manifest",
        type: "Manifest",
      }),
    ).toBe("preset-onboarding/intro");
  });

  test("per-resource key includes resource type and id", () => {
    expect(
      getPresetOnboardingDismissalKey(onboarding("intro", "per-resource"), {
        id: "https://example.org/manifest",
        type: "Manifest",
      }),
    ).toBe("preset-onboarding/intro/Manifest/https://example.org/manifest");
  });
});

describe("preset template selection", () => {
  const templates = [template("one"), template("two")];

  test("resolves selected template id", () => {
    expect(getSelectedPresetTemplate(templates, "two")?.id).toBe("two");
  });

  test("returns null for missing selected template id", () => {
    expect(getSelectedPresetTemplate(templates, "missing")).toBeNull();
  });
});
