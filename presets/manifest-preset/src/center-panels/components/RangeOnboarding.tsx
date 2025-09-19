import { ActionButton, OnboardingTour } from "@manifest-editor/components";
import { useState } from "react";
import type { Step } from "react-joyride";
import { HelpIcon } from "../../icons";

const steps: Step[] = [
  {
    placement: "center",
    title: "Working with ranges",
    content:
      "Ranges let you organise your content This short tour shows you the main tools for creating and manging ranges ",
    target: "body",
  },
  {
    target: "#range-listing-sidebar",
    title: "Range list",
    content: "This panel shows all ranges in your document. Expand or collapse sections to navigate.",
    placement: "right-start",
  },
  {
    target: "#split-range",
    title: "Split a range",
    content: "Split this range into multiple ranges to make your content easier to manage.",
  },
  {
    target: "#edit-ranges",
    title: "Edit or reorder ranges",
    content:
      "Add new ranges, insert full or empty ranges, or delete ones you don’t need. Drag ranges up or down to reorder.",
  },
  {
    target: "#card-view",
    title: "Switch view",
    content:
      "Toggle between card view and tree view. Card view is simplified and visual, while tree view is detailed and hierarchical.",
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
