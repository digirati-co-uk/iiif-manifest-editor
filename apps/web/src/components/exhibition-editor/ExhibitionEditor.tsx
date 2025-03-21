"use client";
import { exhibitionEditorPreset } from "@manifest-editor/exhibition-preset";
import type { Config } from "@manifest-editor/shell";
import type { Step } from "react-joyride";
import { OnboardingTour } from "../OnboardingTour";
import BrowserEditor from "../browser-editor/BrowserEditor";

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

const config: Partial<Config> = {
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
};

export default function ExhibitionEditor(props: { id: string }) {
  return (
    <>
      <BrowserEditor
        id={props.id}
        preset={exhibitionEditorPreset}
        config={config}
        presetPath="exhibition"
        presetName="Exhibitions"
      />
      <OnboardingTour id="exhibition-editor" steps={exhibitionOnboarding} />
    </>
  );
}
