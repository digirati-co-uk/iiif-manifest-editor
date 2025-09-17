import { createRangeHelper } from "@iiif/helpers";
import {
  ListEditIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useLocalStorage,
  WarningMessage,
  OnboardingTour,
} from "@manifest-editor/components";
import type { LayoutPanel } from "@manifest-editor/shell";
import { useEffect, useMemo } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { RangeSplittingPreview } from "./components/RangeSplittingPreview";
import { RangeCreateEmpty } from "./components/RangesCreateEmpty";
import { RangeTree, useRangeTreeOptions } from "./components/RangeTree";
import { CardsViewIcon, RangesIcon, SplitRangeIcon } from "../icons";
import { CanvasListingIcon } from "./canvas-listing";
import { RangeCardView } from "./components/RangeCardView";

export const rangesPanel: LayoutPanel = {
  id: "@manifest-editor/ranges-listing",
  label: "Ranges",
  icon: <RangesIcon />,
  render: () => {
    return <RangeLeftPanel />;
  },
};

export function RangeLeftPanel() {
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const [isCardView, setIsCardView] = useLocalStorage("isCardView", false);
  const topLevelRange = helper.rangesToTableOfContentsTree(
    vault.get(manifest!.structures || []),
  );
  const { isSplitting, splitEffect, setIsSplitting } = useRangeSplittingStore();
  const { showCanvases, toggleShowCanvases, isEditing, toggleIsEditing } =
    useRangeTreeOptions();

  useEffect(() => {
    return splitEffect();
  }, [splitEffect]);

  const isContiguous = useMemo(() => {
    if (!manifest?.structures?.[0]) {
      return null;
    }

    return helper.isContiguous(
      (manifest!.structures || [])[0]!,
      manifest!.items,
      { detail: true },
    );
  }, [manifest, helper]);

  if (!topLevelRange) {
    return <RangeCreateEmpty />;
  }

  return (
    <Sidebar>
      <SidebarHeader
        title={topLevelRange.label || "Untitled range"}
        actions={[
          {
            id: "card-view",
            title: isCardView ? "Tree view" : "Card view",
            icon: isCardView ? (
              <CanvasListingIcon className="text-xl" />
            ) : (
              <CardsViewIcon className="text-xl" />
            ),
            onClick: () => {
              setIsCardView(!isCardView);
            },
          },
          {
            id: "edit-ranges",
            title: "Edit ranges",
            icon: <ListEditIcon className="text-xl" />,
            toggled: isEditing,
            onClick: toggleIsEditing,
          },
          {
            id: "split-range",
            title: "Split range",
            icon: <SplitRangeIcon className="text-xl" />,
            onClick: () => setIsSplitting(!isSplitting),
            toggled: isSplitting,
          },
        ]}
      />
      <SidebarContent className="p-2" id="range-listing-sidebar">
        {topLevelRange.isVirtual ? (
          <WarningMessage className="mb-2">
            This is a virtual top level range
          </WarningMessage>
        ) : null}
        {!isContiguous ? (
          <WarningMessage className="mb-2">
            Warning: Non-contiguous range
          </WarningMessage>
        ) : null}

        {isSplitting ? (
          <RangeSplittingPreview />
        ) : isCardView ? (
          <RangeCardView />
        ) : (
          <RangeTree hideCanvases={!showCanvases} />
        )}

        <OnboardingTour
          id="range-listing-tour"
          steps={[
            // {
            //   content: <h2>Let's begin our journey!</h2>,
            //   locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
            //   placement: "center",
            //   target: "body",
            // },
            {
              target: "#split-range",
              content: "You can split this range into multiple ranges.",
            },
            {
              target: "#edit-ranges",
              content:
                "You can enable edit more here and reorder or edit the ranges.",
            },
            {
              target: "#card-view",
              content: "You can switch between card and tree view.",
            },
            {
              target: "#range-listing-sidebar",
              content: "Here all of the ranges are listed",
              placement: "right-start",
            },
            {
              target: "#grid-options",
              content: "You can change the grid size here.",
            },
          ]}
        />
      </SidebarContent>
    </Sidebar>
  );
}
