import * as manifestPreset from "@manifest-editor/manifest-preset";
import ocrClassificationPlugin from "@manifest-editor/ocr-classification/lazy";
import ocrDoclingPlugin from "@manifest-editor/ocr-docling/lazy";
import { mapApp } from "@manifest-editor/shell";
import translationPlugin from "@manifest-editor/translation/lazy";
import BrowserEditor from "./BrowserEditor";
import { browserWebPageCreator } from "./browser-web-page-creator";
import { replaceCreator } from "./replace-creator";

const preset = mapApp(manifestPreset, (app) => replaceCreator(app, browserWebPageCreator));

const plugins = [...(manifestPreset.plugins || []), ocrDoclingPlugin, translationPlugin, ocrClassificationPlugin];

export default function BrowserManifestEditor({ id, layoutMode }: { id: string; layoutMode?: "default" | "focused" }) {
  return (
    <BrowserEditor
      //
      id={id}
      preset={preset}
      plugins={plugins}
      layoutMode={layoutMode}
    />
  );
}
