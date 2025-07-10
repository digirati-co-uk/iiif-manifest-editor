"use client";
import { exhibitionEditorPreset } from "@manifest-editor/exhibition-preset";
import type { Config } from "@manifest-editor/shell";
import type { Step } from "react-joyride";
import BrowserEditor from "../browser-editor/BrowserEditor";
import { OnboardingTour } from "../OnboardingTour";

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
      id: "delft-theme",
      type: "external-manifest-preview",
      label: "Delft exhibition",
      config: {
        url: "https://exhibitionviewer.org/preview/delft?manifest={manifestId}",
      },
    },
    {
      id: "delft-slideshow",
      type: "external-manifest-preview",
      label: "Delft slideshow",
      config: {
        url: "https://exhibitionviewer.org/preview/presentation?manifest={manifestId}",
      },
    },
    {
      id: "minimal-theme",
      type: "external-manifest-preview",
      label: "Light exhibition",
      config: {
        url: "https://exhibitionviewer.org/preview/minimal?manifest={manifestId}",
      },
    },
    {
      id: "minimal-slideshow",
      type: "external-manifest-preview",
      label: "Light slideshow",
      config: {
        url: "https://exhibitionviewer.org/preview/presentation?manifest={manifestId}&minimal=true",
      },
    },
    {
      id: "minimal-floating-tour",
      type: "external-manifest-preview",
      label: "Floating tour",
      config: {
        url: "https://exhibitionviewer.org/preview/presentation?manifest={manifestId}&minimal=true&floating=true",
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
