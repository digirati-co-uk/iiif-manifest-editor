import * as universalViewerPreset from "@manifest-editor/universal-viewer-preset";
import { mapApp } from "@manifest-editor/shell";
import BrowserEditor from "../browser-editor/BrowserEditor";

const preset = mapApp(universalViewerPreset);

export default function UniversalViewerEditor({ id }: { id: string }) {
  return <BrowserEditor id={id} preset={preset} presetPath="universal-viewer" presetName="Universal Viewer" />;
}
