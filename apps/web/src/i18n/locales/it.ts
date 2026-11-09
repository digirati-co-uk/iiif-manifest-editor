/** Web-only opt-in data for the generated it translation draft. */
import type { ResourceStore } from "@manifest-editor/i18n/core";
import { catalog as catalogs0 } from "../../../../../internal-packages/languages/src/locales/it/collection.ts";
import { catalog as catalogs1 } from "../../../../../internal-packages/languages/src/locales/it/common.ts";
import { catalog as catalogs2 } from "../../../../../internal-packages/languages/src/locales/it/components.ts";
import { catalog as catalogs3 } from "../../../../../internal-packages/languages/src/locales/it/creator-api.ts";
import { catalog as catalogs4 } from "../../../../../internal-packages/languages/src/locales/it/creators.ts";
import { catalog as catalogs5 } from "../../../../../internal-packages/languages/src/locales/it/editor-api.ts";
import { catalog as catalogs6 } from "../../../../../internal-packages/languages/src/locales/it/editors.ts";
import { catalog as catalogs7 } from "../../../../../internal-packages/languages/src/locales/it/exhibition.ts";
import { catalog as catalogs8 } from "../../../../../internal-packages/languages/src/locales/it/manifest.ts";
import { catalog as catalogs9 } from "../../../../../internal-packages/languages/src/locales/it/plugin-annotations.ts";
import { catalog as catalogs10 } from "../../../../../internal-packages/languages/src/locales/it/plugin-canvas-label-generator.ts";
import { catalog as catalogs11 } from "../../../../../internal-packages/languages/src/locales/it/plugin-ocr-classification.ts";
import { catalog as catalogs12 } from "../../../../../internal-packages/languages/src/locales/it/plugin-ocr-docling.ts";
import { catalog as catalogs13 } from "../../../../../internal-packages/languages/src/locales/it/plugin-specifications.ts";
import { catalog as catalogs14 } from "../../../../../internal-packages/languages/src/locales/it/plugin-translation.ts";
import { catalog as catalogs15 } from "../../../../../internal-packages/languages/src/locales/it/projects.ts";
import { catalog as catalogs16 } from "../../../../../internal-packages/languages/src/locales/it/shell.ts";
import { catalog as catalogs17 } from "../../../../../internal-packages/languages/src/locales/it/ui.ts";
import { catalog as catalogs18 } from "../../../../../internal-packages/languages/src/locales/it/web.ts";
import { catalog as plain0 } from "../../../../../internal-packages/languages/src/profiles/plain/it/creators.ts";
import { catalog as plain1 } from "../../../../../internal-packages/languages/src/profiles/plain/it/editor-api.ts";
import { catalog as plain2 } from "../../../../../internal-packages/languages/src/profiles/plain/it/editors.ts";
import { catalog as plain3 } from "../../../../../internal-packages/languages/src/profiles/plain/it/exhibition.ts";
import { catalog as plain4 } from "../../../../../internal-packages/languages/src/profiles/plain/it/manifest.ts";
import { catalog as exhibition0 } from "../../../../../internal-packages/languages/src/presets/exhibition/it/editors.ts";
import { catalog as exhibitionPlain0 } from "../../../../../internal-packages/languages/src/presets/exhibition/plain/it/editors.ts";

export const catalogs: ResourceStore = {
  it: {
    collection: catalogs0,
    common: catalogs1,
    components: catalogs2,
    "creator-api": catalogs3,
    creators: catalogs4,
    "editor-api": catalogs5,
    editors: catalogs6,
    exhibition: catalogs7,
    manifest: catalogs8,
    "plugin-annotations": catalogs9,
    "plugin-canvas-label-generator": catalogs10,
    "plugin-ocr-classification": catalogs11,
    "plugin-ocr-docling": catalogs12,
    "plugin-specifications": catalogs13,
    "plugin-translation": catalogs14,
    projects: catalogs15,
    shell: catalogs16,
    ui: catalogs17,
    web: catalogs18,
  },
};
export const plain: ResourceStore = {
  it: {
    creators: plain0,
    "editor-api": plain1,
    editors: plain2,
    exhibition: plain3,
    manifest: plain4,
  },
};
export const exhibition: ResourceStore = {
  it: {
    editors: exhibition0,
  },
};
export const exhibitionPlain: ResourceStore = {
  it: {
    editors: exhibitionPlain0,
  },
};
