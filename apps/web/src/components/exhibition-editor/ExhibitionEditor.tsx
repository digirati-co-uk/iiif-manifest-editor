"use client";
import type { Config } from "@manifest-editor/shell";
import { useMemo } from "react";
import type { Step } from "react-joyride";
import { exampleCreator } from "../../../../../packages/creators/src/ExampleCreator";
import { OnboardingTour } from "../OnboardingTour";
import BrowserEditor, { type BrowserEditorProps } from "../browser-editor/BrowserEditor";
import { exampleCanvasEditor } from "./canvas-editors/example-canvas-editor";
import { imageBlockEditor } from "./canvas-editors/image-block-editor";
import { infoBlockEditor } from "./canvas-editors/info-block-editor";
import { textPanelCreator } from "./creators/text-panel-creator";
import * as exampleLeftPanel from "./left-panels/Example";
import { exhibitionGridLeftPanel } from "./left-panels/ExhibitionGrid";
import * as gridView from "./left-panels/GridView";
import * as layoutTest from "./left-panels/LayoutTest";
import { customBehaviourEditor, slideBehaviours } from "./left-panels/SlideBehaviours";
import { exhibitionCanvasEditor } from "./right-panels/ExhibitionCanvasEditor";
import { exhibitionInfoEditorPanel } from "./right-panels/ExhibitionInfoEditor";
import { exhibitionSummaryEdtior } from "./right-panels/ExhibitionSummaryEditor";
import { exhibitionTourSteps } from "./right-panels/ExhibitionTourSteps";

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
          Canvas: {
            hideTabs: [
              "@manifest-editor/overview",
              "@manifest-editor/technical-properties",
              "@manifest-editor/linking-properties",
              "@manifest-editor/nav-place-editor",
              "@manifest-editor/canvas-structural",
              "@manifest-editor/descriptive-properties",
              "@manifest-editor/overview-canvas-editor",
              "@manifest-editor/metadata",
              // "@manifest-editor/overview-canvas-editor",
            ],
          },
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
    []
  );

  const extensions = useMemo(
    () =>
      ({
        leftPanels: [
          //
          exhibitionGridLeftPanel,
          // exampleLeftPanel,
          // slideBehaviours,
          // layoutTest,
          // gridView,
        ],
        leftPanelIds: ["left-panel-manifest"],
        canvasEditors: [imageBlockEditor, infoBlockEditor],
        editors: [
          //
          exhibitionInfoEditorPanel,
          exhibitionCanvasEditor,
          customBehaviourEditor,
          exhibitionSummaryEdtior,
          exhibitionTourSteps,
        ],
        creators: [textPanelCreator],
      }) as BrowserEditorProps["extensions"],
    []
  );

  return (
    <>
      <BrowserEditor id={props.id} config={config} extensions={extensions} />
      <OnboardingTour id="exhibition-editor" steps={exhibitionOnboarding} />
    </>
  );
}
