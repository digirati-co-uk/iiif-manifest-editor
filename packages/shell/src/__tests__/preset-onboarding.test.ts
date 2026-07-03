import { describe, expect, test } from "vitest";
import type { MappedApp, PresetOnboardingDefinition, PresetTemplateDefinition } from "../AppContext/AppContext";
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
