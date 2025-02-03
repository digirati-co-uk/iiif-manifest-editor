"use client";
import type { Config } from "@manifest-editor/shell";
import { useMemo } from "react";
import type { Step } from "react-joyride";
import { exampleCreator } from "../../../../../packages/creators/src/ExampleCreator";
import { OnboardingTour } from "../OnboardingTour";
import BrowserEditor, {
  type BrowserEditorProps,
} from "../browser-editor/BrowserEditor";
import { exampleCanvasEditor } from "./canvas-editors/example-canvas-editor";
import { textPanelCreator } from "./creators/text-panel-creator";
import * as exampleLeftPanel from "./left-panels/Example";
import * as gridView from "./left-panels/GridView";
import * as layoutTest from "./left-panels/LayoutTest";
import {
  customBehaviourEditor,
  slideBehaviours,
} from "./left-panels/SlideBehaviours";

const exhibitionOnboarding: Step[] = [
  // {
  // 	content: <h2>Let's begin our journey!</h2>,
  // 	locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
  // 	placement: "center",
  // 	target: "body",
  // },
  // {
  // 	target: "#share-modal",
  // 	content: "You can share your work with others using the share button.",
  // },
];

export default function ExhibitionEditor(props: { id: string }) {
  const config = useMemo(
    () =>
      ({
        // Custom config here.
        editorConfig: {
          // Canvas: {
          //   singleTab: customBehaviourEditor.id,
          // },
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
      }) as Partial<Config>,
    [],
  );

  const extensions = useMemo(
    () =>
      ({
        leftPanels: [exampleLeftPanel, slideBehaviours, layoutTest, gridView],
        canvasEditors: [exampleCanvasEditor],
        editors: [customBehaviourEditor],
        creators: [textPanelCreator],
      }) as BrowserEditorProps["extensions"],
    [],
  );

  return (
    <>
      <BrowserEditor id={props.id} config={config} extensions={extensions} />
      <OnboardingTour id="exhibition-editor" steps={exhibitionOnboarding} />
    </>
  );
}
