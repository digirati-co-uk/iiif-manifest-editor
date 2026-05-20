"use client";
import {
  exhibitionEditorPreset,
  exhibitionEditorSlideshowPreset,
  exhibitionEditorScrollingPreset,
} from "@manifest-editor/exhibition-preset";
import type { Config } from "@manifest-editor/shell";
import type { MappedApp } from "@manifest-editor/shell";
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

type ExhibitionLayoutPreset = "full-page" | "scroll" | "slideshow";

const defaultConfig: Partial<Config> = {
  previews: [
    {
      id: "scroll-theme",
      type: "external-manifest-preview",
      label: "Scrolling exhibition",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/scroll?manifest={manifestId}",
      },
    },
    {
      id: "delft-theme",
      type: "external-manifest-preview",
      label: "Delft exhibition",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/delft?manifest={manifestId}",
      },
    },
    {
      id: "delft-slideshow",
      type: "external-manifest-preview",
      label: "Delft slideshow",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/slideshow?manifest={manifestId}",
      },
    },
    {
      id: "minimal-theme",
      type: "external-manifest-preview",
      label: "Light exhibition",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/minimal?manifest={manifestId}",
      },
    },
    {
      id: "minimal-slideshow",
      type: "external-manifest-preview",
      label: "Light slideshow",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/slideshow?manifest={manifestId}&minimal=true",
      },
    },
    {
      id: "minimal-floating-tour",
      type: "external-manifest-preview",
      label: "Floating tour",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/slideshow?manifest={manifestId}&minimal=true&floating=true",
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

const slideshowConfig: Partial<Config> = {
  previews: [
    {
      id: "delft-slideshow",
      type: "external-manifest-preview",
      label: "Delft slideshow",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/slideshow?manifest={manifestId}",
      },
    },
    {
      id: "minimal-slideshow",
      type: "external-manifest-preview",
      label: "Light slideshow",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/slideshow?manifest={manifestId}&minimal=true",
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

const scrollConfig: Partial<Config> = {
  previews: [
    {
      id: "scroll-theme",
      type: "external-manifest-preview",
      label: "Scrolling exhibition",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/scroll?manifest={manifestId}",
      },
    },
    {
      id: "minimal-theme",
      type: "external-manifest-preview",
      label: "Light exhibition",
      config: {
        url: "https://preview.exhibitionviewer.org/preview/minimal?manifest={manifestId}",
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

const layoutPresets: Record<
  ExhibitionLayoutPreset,
  {
    preset: MappedApp;
    config: Partial<Config>;
    presetPath: string;
    presetName: string;
  }
> = {
  "full-page": {
    preset: exhibitionEditorPreset,
    config: defaultConfig,
    presetPath: "exhibition",
    presetName: "Exhibitions",
  },
  slideshow: {
    preset: exhibitionEditorSlideshowPreset,
    config: slideshowConfig,
    presetPath: "exhibition/slideshow",
    presetName: "Exhibitions / Slideshow",
  },
  scroll: {
    preset: exhibitionEditorScrollingPreset,
    config: scrollConfig,
    presetPath: "exhibition/scroll",
    presetName: "Exhibitions / Scroll",
  },
};

export default function ExhibitionEditor(props: {
  id: string;
  layoutMode?: "default" | "focused";
  preset?: ExhibitionLayoutPreset;
}) {
  const selectedPreset = layoutPresets[props.preset || "full-page"];

  return (
    <>
      <BrowserEditor
        id={props.id}
        preset={selectedPreset.preset}
        config={selectedPreset.config}
        presetPath={selectedPreset.presetPath}
        presetName={selectedPreset.presetName}
        layoutMode={props.layoutMode}
      />
      <OnboardingTour id="exhibition-editor" steps={exhibitionOnboarding} />
    </>
  );
}
