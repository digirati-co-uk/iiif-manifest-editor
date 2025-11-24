import { ActionButton, OnboardingTour } from "@manifest-editor/components";
import { useState } from "react";
import type { Step } from "react-joyride";
import { HelpIcon } from "../../icons";

const steps: Step[] = [
  {
    placement: "center",
    title: "Working with IIIF ranges",
    content:
      "IIIF uses Ranges to represent logical structure in a digitised object. The range or Table of Contents can then aid users in navigating that content. This short tour shows you the main tools for creating and managing ranges in the Manifest Editor.",
    target: "body",
  },
  {
    target: "#range-listing-sidebar",
    title: "Range structure",
    content:
      "Browse and navigate your range. Use Edit mode to add more range items, drag to reorder or use the ••• menu to insert empty range items or to delete from the range.",
    placement: "right-start",
  },
  {
    target: "#split-range",
    title: "Split a range",
    content:
      "Using the splittling mode, you can build and manage the contents of your range. Hover over a canvas to preview, then click to create a new range with canvases from that point onward move into the new range.",
  },
  {
    target: "#edit-ranges",
    title: "Edit or reorder ranges",
    content:
      "Toggle Edit to reveal the ••• menu and drag handles for each item in range. Insert an empty range, expand or collapse the structure or delete items. Drag to reorder or move content between range items.",
  },
  {
    target: "#card-view",
    title: "Switch view",
    content:
      "Card view provides a simple visual overview of the range. Tree view shows the full hierarchy and allows precise drag and drop options.",
  },
  {
    target: "#grid-options",
    title: "Adjust grid size",
    content: "Change the canvas thumbnail size to suit your workflow.",
  },
  {
    target: "#launch_range_tour",
    title: "That’s it!",
    content: (
      <>
        Now you know the basics of working with ranges. You can restart this tour anytime from the Help menu.
        Alternatively, you can view the{" "}
        <a
          className="text-me-600 underline"
          href="https://manifest-editor-docs.netlify.app/docs/creating-ranges"
          target="_blank"
          rel="noopener noreferrer"
        >
          Creating Ranges guide
        </a>
      </>
    ),
  },
];

export function RangeOnboarding() {
  const [forceStart, setForceStart] = useState(false);
  return (
    <>
      <ActionButton
        id="launch_range_tour"
        primary={forceStart}
        onPress={() => {
          setForceStart(true);
        }}
      >
        <HelpIcon className="text-xl" />
      </ActionButton>
      <OnboardingTour
        key={forceStart ? "range-listing-tour" : "default"}
        forceStart={forceStart}
        onClose={() => setForceStart(false)}
        id="range-listing-tour"
        steps={steps}
      />
    </>
  );
}
