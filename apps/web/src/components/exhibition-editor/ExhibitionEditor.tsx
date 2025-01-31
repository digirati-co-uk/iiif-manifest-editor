'use client';
import type { Config } from "@manifest-editor/shell";
import { useMemo } from "react";
import BrowserEditor, { type BrowserEditorProps } from "../browser-editor/BrowserEditor";
import * as exampleLeftPanel from './left-panels/Example';
import * as layoutTest from './left-panels/LayoutTest';
import * as gridView from './left-panels/GridView';
import { customBehaviourEditor, slideBehaviours } from "./left-panels/SlideBehaviours";
import { exampleCanvasEditor } from "./canvas-editors/example-canvas-editor";

export default function ExhibitionEditor(props: { id: string }) {
  const config = useMemo(() => ({
    // Custom config here.
    editorConfig: {
      Canvas: {
        singleTab: customBehaviourEditor.id,
      }
    },
    previews: [
      {
        id: "delft-exhibition-viewer",
        type: "external-manifest-preview",
        label: "Exhibition viewer",
        config: {
          url: "https://feature-hss-history.delft-exhibition-viewer.pages.dev/?manifest={manifestId}",
        },
      },
      {
        id: "iiif-preview",
        type: "iiif-preview-service",
        label: "IIIF Preview",
        config: {
          url: "/api/iiif/store",
        },
      },
      {
        id: "raw-manifest",
        type: "external-manifest-preview",
        label: "Raw Manifest",
        config: {
          url: "{manifestId}",
        },
      },
    ],
  } as Partial<Config>), []);

  const extensions = useMemo(() => ({
    leftPanels: [
      exampleLeftPanel,
      slideBehaviours,
      layoutTest,
      gridView
    ],
    canvasEditors: [
      exampleCanvasEditor
    ],
    editors: [
      customBehaviourEditor
    ],
  } as BrowserEditorProps['extensions']), []);


  return <BrowserEditor id={props.id} config={config} extensions={extensions} />;
}
