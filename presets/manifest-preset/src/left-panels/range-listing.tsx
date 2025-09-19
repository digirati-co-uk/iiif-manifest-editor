/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
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
            {
              target: "#split-range",
              title: "Working with ranges",
              content: 'Ranges let you organise your content This short tour shows you the main tools for creating and manging ranges ',
            },
            {
              target: "#range-listing-sidebar",
              title: 'Range list',
              content: 'This panel shows all ranges in your document. Expand or collapse sections to navigate.',
              placement: "right-start",
            },
            {
              target: "#split-range",
              title: 'Split a range',
              content: 'Split this range into multiple ranges to make your content easier to manage.',
            },
            {
              target: "#edit-ranges",
              title: 'Edit or reorder ranges',
              content: 'Add new ranges, insert full or empty ranges, or delete ones you don’t need. Drag ranges up or down to reorder.',
            },
            {
              target: "#card-view",
              title: 'Switch view',
              content: 'Toggle between card view and tree view. Card view is simplified and visual, while tree view is detailed and hierarchical.',
            },
            {
              target: "#grid-options",
              title: 'Adjust grid size',
              content: 'Change the canvas thumbnail size to suit your workflow.'

            },
            {
              target: "body",
              title: 'That’s it!',
              content: 'Now you know the basics of working with ranges. You can restart this tour anytime from the Help menu.'
            },
          ]}
        />
      </SidebarContent>
    </Sidebar>
  );
}
