/** Web-only opt-in data for the generated ms translation draft. */
import type { ResourceStore } from "@manifest-editor/i18n/core";
import { catalog as catalogs0 } from "../../../../../internal-packages/languages/src/locales/ms/collection.ts";
import { catalog as catalogs1 } from "../../../../../internal-packages/languages/src/locales/ms/common.ts";
import { catalog as catalogs2 } from "../../../../../internal-packages/languages/src/locales/ms/components.ts";
import { catalog as catalogs3 } from "../../../../../internal-packages/languages/src/locales/ms/creator-api.ts";
import { catalog as catalogs4 } from "../../../../../internal-packages/languages/src/locales/ms/creators.ts";
import { catalog as catalogs5 } from "../../../../../internal-packages/languages/src/locales/ms/editor-api.ts";
import { catalog as catalogs6 } from "../../../../../internal-packages/languages/src/locales/ms/editors.ts";
import { catalog as catalogs7 } from "../../../../../internal-packages/languages/src/locales/ms/exhibition.ts";
import { catalog as catalogs8 } from "../../../../../internal-packages/languages/src/locales/ms/manifest.ts";
import { catalog as catalogs9 } from "../../../../../internal-packages/languages/src/locales/ms/plugin-annotations.ts";
import { catalog as catalogs10 } from "../../../../../internal-packages/languages/src/locales/ms/plugin-canvas-label-generator.ts";
import { catalog as catalogs11 } from "../../../../../internal-packages/languages/src/locales/ms/plugin-ocr-classification.ts";
import { catalog as catalogs12 } from "../../../../../internal-packages/languages/src/locales/ms/plugin-ocr-docling.ts";
import { catalog as catalogs13 } from "../../../../../internal-packages/languages/src/locales/ms/plugin-specifications.ts";
import { catalog as catalogs14 } from "../../../../../internal-packages/languages/src/locales/ms/plugin-translation.ts";
import { catalog as catalogs15 } from "../../../../../internal-packages/languages/src/locales/ms/projects.ts";
import { catalog as catalogs16 } from "../../../../../internal-packages/languages/src/locales/ms/shell.ts";
import { catalog as catalogs17 } from "../../../../../internal-packages/languages/src/locales/ms/ui.ts";
import { catalog as catalogs18 } from "../../../../../internal-packages/languages/src/locales/ms/web.ts";
import { catalog as plain0 } from "../../../../../internal-packages/languages/src/profiles/plain/ms/creators.ts";
import { catalog as plain1 } from "../../../../../internal-packages/languages/src/profiles/plain/ms/editor-api.ts";
import { catalog as plain2 } from "../../../../../internal-packages/languages/src/profiles/plain/ms/editors.ts";
import { catalog as plain3 } from "../../../../../internal-packages/languages/src/profiles/plain/ms/exhibition.ts";
import { catalog as plain4 } from "../../../../../internal-packages/languages/src/profiles/plain/ms/manifest.ts";
import { catalog as exhibition0 } from "../../../../../internal-packages/languages/src/presets/exhibition/ms/editors.ts";
import { catalog as exhibitionPlain0 } from "../../../../../internal-packages/languages/src/presets/exhibition/plain/ms/editors.ts";

export const catalogs: ResourceStore = {
  ms: {
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
  ms: {
    creators: plain0,
    "editor-api": plain1,
    editors: plain2,
    exhibition: plain3,
    manifest: plain4,
  },
};
export const exhibition: ResourceStore = {
  ms: {
    editors: exhibition0,
  },
};
export const exhibitionPlain: ResourceStore = {
  ms: {
    editors: exhibitionPlain0,
  },
};
