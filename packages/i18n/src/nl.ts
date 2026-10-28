/** Optional Dutch UI data. Import explicitly; locale metadata alone does not enable translations. */
import { catalog as base0 } from "@manifest-editor/languages/locales/nl/collection";
import { catalog as base1 } from "@manifest-editor/languages/locales/nl/common";
import { catalog as base2 } from "@manifest-editor/languages/locales/nl/components";
import { catalog as base3 } from "@manifest-editor/languages/locales/nl/creator-api";
import { catalog as base4 } from "@manifest-editor/languages/locales/nl/creators";
import { catalog as base5 } from "@manifest-editor/languages/locales/nl/editor-api";
import { catalog as base6 } from "@manifest-editor/languages/locales/nl/editors";
import { catalog as base7 } from "@manifest-editor/languages/locales/nl/exhibition";
import { catalog as base8 } from "@manifest-editor/languages/locales/nl/manifest";
import { catalog as base9 } from "@manifest-editor/languages/locales/nl/plugin-annotations";
import { catalog as base10 } from "@manifest-editor/languages/locales/nl/plugin-canvas-label-generator";
import { catalog as base11 } from "@manifest-editor/languages/locales/nl/plugin-ocr-classification";
import { catalog as base12 } from "@manifest-editor/languages/locales/nl/plugin-ocr-docling";
import { catalog as base13 } from "@manifest-editor/languages/locales/nl/plugin-specifications";
import { catalog as base14 } from "@manifest-editor/languages/locales/nl/plugin-translation";
import { catalog as base15 } from "@manifest-editor/languages/locales/nl/projects";
import { catalog as base16 } from "@manifest-editor/languages/locales/nl/shell";
import { catalog as base17 } from "@manifest-editor/languages/locales/nl/ui";
import { catalog as base18 } from "@manifest-editor/languages/locales/nl/web";
import { catalog as plain0 } from "@manifest-editor/languages/profiles/plain/nl/creators";
import { catalog as plain1 } from "@manifest-editor/languages/profiles/plain/nl/editors";
import { catalog as plain2 } from "@manifest-editor/languages/profiles/plain/nl/exhibition";
import { catalog as plain3 } from "@manifest-editor/languages/profiles/plain/nl/manifest";
import { catalog as plainEditorApi } from "@manifest-editor/languages/profiles/plain/nl/editor-api";
import { catalog as exhibition } from "@manifest-editor/languages/presets/exhibition/nl/editors";
import { catalog as exhibitionPlain } from "@manifest-editor/languages/presets/exhibition/plain/nl/editors";
import type { ResourceStore } from "./types";
export const dutchCatalogs: ResourceStore = {
  nl: {
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
export const dutchPlain: ResourceStore = {
  nl: { creators: plain0, editors: plain1, exhibition: plain2, manifest: plain3, "editor-api": plainEditorApi },
};
export const dutchExhibition: ResourceStore = { nl: { editors: exhibition } };
export const dutchExhibitionPlain: ResourceStore = { nl: { editors: exhibitionPlain } };
