import { ActionButton, OnboardingTour } from "@manifest-editor/components";
import { useState } from "react";
import type { Step } from "react-joyride";
import { HelpIcon } from "../../icons";

const steps: Step[] = [
  {
    placement: "center",
    title: "Working with ranges",
    content:
      "Ranges help you organise canvases into sections. This short tour shows you the main tools for creating and manging ranges ",
    target: "body",
  },
  {
    target: "#range-listing-sidebar",
    title: "Range list",
    content: "Browse all ranges. Expand/collapse to navigate. In Edit mode you can drag to reorder or use the ••• menu to insert/delete",
    placement: "right-start",
  },
  {
    target: "#split-range",
    title: "Split a range",
    content: "Enter split mode. Hover a canvas to preview: canvases from that point onward move to a new sibling range. The first canvas can’t be split. Click to confirm.",
  },
  {
    target: "#edit-ranges",
    title: "Edit or reorder ranges",
    content:
      "Toggle Edit to reveal handles and the ••• menu. Insert an empty range, create a full range from all canvases, or delete. Drag to reorder.",
  },
  {
    target: "#card-view",
    title: "Switch view",
    content:
      "Card view is visual; Tree view shows the full hierarchy and precise drag/drop.",
  },
  {
    target: "#grid-options",
    title: "Adjust grid size",
    content: "Change the canvas thumbnail size to suit your workflow.",
  },
  {
    target: "body",
    placement: "center",
    title: "That’s it!",
    content: "Now you know the basics of working with ranges. You can restart this tour anytime from the Help menu.",
  },
];

export function RangeOnboarding() {
  const [forceStart, setForceStart] = useState(false);
  return (
    <>
      <ActionButton
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
