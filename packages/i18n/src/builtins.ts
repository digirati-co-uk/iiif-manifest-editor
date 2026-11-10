import { catalog as base0 } from "@manifest-editor/languages/locales/en-GB/collection";
import { catalog as base1 } from "@manifest-editor/languages/locales/en-GB/common";
import { catalog as base2 } from "@manifest-editor/languages/locales/en-GB/components";
import { catalog as base3 } from "@manifest-editor/languages/locales/en-GB/creator-api";
import { catalog as base4 } from "@manifest-editor/languages/locales/en-GB/creators";
import { catalog as base5 } from "@manifest-editor/languages/locales/en-GB/editor-api";
import { catalog as base6 } from "@manifest-editor/languages/locales/en-GB/editors";
import { catalog as base7 } from "@manifest-editor/languages/locales/en-GB/exhibition";
import { catalog as base8 } from "@manifest-editor/languages/locales/en-GB/manifest";
import { catalog as base9 } from "@manifest-editor/languages/locales/en-GB/plugin-annotations";
import { catalog as base10 } from "@manifest-editor/languages/locales/en-GB/plugin-canvas-label-generator";
import { catalog as base11 } from "@manifest-editor/languages/locales/en-GB/plugin-ocr-classification";
import { catalog as base12 } from "@manifest-editor/languages/locales/en-GB/plugin-ocr-docling";
import { catalog as base13 } from "@manifest-editor/languages/locales/en-GB/plugin-specifications";
import { catalog as base14 } from "@manifest-editor/languages/locales/en-GB/plugin-translation";
import { catalog as base15 } from "@manifest-editor/languages/locales/en-GB/projects";
import { catalog as base16 } from "@manifest-editor/languages/locales/en-GB/shell";
import { catalog as base17 } from "@manifest-editor/languages/locales/en-GB/ui";
import { catalog as base18 } from "@manifest-editor/languages/locales/en-GB/web";
import { catalog as plain0 } from "@manifest-editor/languages/profiles/plain/en-GB/creators";
import { catalog as plain1 } from "@manifest-editor/languages/profiles/plain/en-GB/editors";
import { catalog as plain2 } from "@manifest-editor/languages/profiles/plain/en-GB/exhibition";
import { catalog as plain3 } from "@manifest-editor/languages/profiles/plain/en-GB/manifest";
import { catalog as plainEditorApi } from "@manifest-editor/languages/profiles/plain/en-GB/editor-api";
import type { ResourceStore } from "./types";
export const builtinCatalogs: ResourceStore = {
  "en-GB": {
    collection: base0,
    common: base1,
    components: base2,
    "creator-api": base3,
    creators: base4,
    "editor-api": base5,
    editors: base6,
    exhibition: base7,
    manifest: base8,
    "plugin-annotations": base9,
    "plugin-canvas-label-generator": base10,
    "plugin-ocr-classification": base11,
    "plugin-ocr-docling": base12,
    "plugin-specifications": base13,
    "plugin-translation": base14,
    projects: base15,
    shell: base16,
    ui: base17,
    web: base18,
  },
};
export const builtinPlain: ResourceStore = {
  "en-GB": { creators: plain0, editors: plain1, exhibition: plain2, manifest: plain3, "editor-api": plainEditorApi },
};
