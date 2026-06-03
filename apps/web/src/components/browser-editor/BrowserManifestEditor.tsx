import * as manifestPreset from "@manifest-editor/manifest-preset";
import { mapApp } from "@manifest-editor/shell";
import BrowserEditor from "./BrowserEditor";
// import * as iframePreviewPlugin from "../iframe-preview-plugin";

const preset = mapApp(manifestPreset);

export default function BrowserManifestEditor({
  id,
  layoutMode,
}: {
  id: string;
  layoutMode?: "default" | "focused";
}) {
  return (
    <BrowserEditor
      id={id}
      preset={preset}
      plugins={manifestPreset.plugins || []}
      layoutMode={layoutMode}
    />
  );
}
