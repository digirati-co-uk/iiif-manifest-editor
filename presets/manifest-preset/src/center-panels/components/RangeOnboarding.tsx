import { useTranslations } from "@manifest-editor/i18n";
import { ActionButton, OnboardingTour } from "@manifest-editor/components";
import { useState } from "react";
import type { Step } from "react-joyride";
import { HelpIcon } from "../../icons";

export function RangeOnboarding() {
  const t = useTranslations("manifest");
  const steps: Step[] = [
    {
      placement: "center",
      title: t("workflow.workingWithIiifRanges"),
      content: t("workflow.tourIntroduction"),
      target: "body",
    },
    {
      target: "#range-listing-sidebar",
      title: t("workflow.rangeStructure"),
      content: t("workflow.tourStructure"),
      placement: "right-start",
    },
    {
      target: "#split-range",
      title: t("workflow.splitARange"),
      content: t("workflow.tourSplitting"),
    },
    {
      target: "#edit-ranges",
      title: t("workflow.editOrReorderRanges"),
      content: t("workflow.tourEditing"),
    },
    {
      target: "#card-view",
      title: t("workflow.switchView"),
      content: t("workflow.tourViews"),
    },
    {
      target: "#grid-options",
      title: t("workflow.adjustGridSize"),
      content: t("workflow.thumbnailGridSizeHelp"),
    },
    {
      target: "#launch_range_tour",
      title: t("workflow.thatSIt"),
      content: (
        <>
          {t("workflow.tourCompleteHelp")}{" "}
          <a
            className="text-me-600 underline"
            href="https://manifest-editor-docs.netlify.app/docs/creating-ranges"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("workflow.creatingRangesGuide")}
          </a>
        </>
      ),
    },
  ];

  const [forceStart, setForceStart] = useState(false);
  return (
    <>
      <ActionButton
        id="launch_range_tour"
        aria-label={t("workflow.rangeHelp")}
        primary={forceStart}
        onPress={() => {
          setForceStart(true);
        }}
      >
        <HelpIcon aria-hidden="true" className="text-xl" />
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
