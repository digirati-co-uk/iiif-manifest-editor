import { createRangeHelper } from "@iiif/helpers";
import {
  ActionButton,
  ListEditIcon,
  OnboardingTour,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useLocalStorage,
  WarningMessage,
} from "@manifest-editor/components";
import { type LayoutPanel, useLayoutActions } from "@manifest-editor/shell";
import { useEffect, useMemo, useState } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import { ArrowBackwardIcon, CardsViewIcon, RangesIcon, SplitRangeIcon } from "../icons";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { CanvasListingIcon } from "./canvas-listing";
import { RangeCardView } from "./components/RangeCardView";
import { RangeSplittingPreview } from "./components/RangeSplittingPreview";
import { RangeCreateEmpty } from "./components/RangesCreateEmpty";
import { RangeTree, useRangeTreeOptions } from "./components/RangeTree";
import { VirtualRangeSidebar } from "./components/VirtualRangeSidebar";

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
  const { edit } = useLayoutActions();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const [isCardView, setIsCardView] = useLocalStorage("isCardView", false);
  const [selectedTopLevelRange, setSelectedTopLevelRange] = useState<{ id: string; type: "Range" } | null>(null);

  const topLevelRange = useMemo(
    () =>
      helper.rangesToTableOfContentsTree(
        selectedTopLevelRange ? [vault.get(selectedTopLevelRange)] : vault.get(manifest!.structures || []),
        undefined,
        {
          showNoNav: true,
        },
      ),
    [selectedTopLevelRange, manifest?.structures],
  );
  const { isSplitting, splitEffect, setIsSplitting } = useRangeSplittingStore();
  const { showCanvases, toggleShowCanvases, isEditing, toggleIsEditing } = useRangeTreeOptions();

  useEffect(() => {
    return splitEffect();
  }, [splitEffect]);

  const isContiguous = useMemo(() => {
    if (!manifest?.structures?.[0]) {
      return null;
    }

    return helper.isContiguous((manifest!.structures || [])[0]!, manifest!.items, { detail: true });
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
            icon: isCardView ? <CanvasListingIcon className="text-xl" /> : <CardsViewIcon className="text-xl" />,
            onClick: () => {
              setIsCardView(!isCardView);
            },
          },
          {
            id: "edit-ranges",
            title: "Edit range",
            icon: <ListEditIcon className="text-xl" />,
            toggled: isEditing,
            onClick: toggleIsEditing,
            disabled: topLevelRange?.isVirtual,
          },
          {
            id: "split-range",
            title: "Split range",
            icon: <SplitRangeIcon className="text-xl" />,
            onClick: () => setIsSplitting(!isSplitting),
            toggled: isSplitting,
            disabled: topLevelRange?.isVirtual || (topLevelRange?.items?.length ?? 0) <= 1,
          },
        ]}
      />
      <SidebarContent className="p-2" id="range-listing-sidebar">
        {selectedTopLevelRange ? (
          <ActionButton className="mb-4" onClick={() => setSelectedTopLevelRange(null)}>
            <ArrowBackwardIcon /> Back to Range List
          </ActionButton>
        ) : null}
        {topLevelRange.isVirtual ? (
          <VirtualRangeSidebar
            range={topLevelRange}
            setSelectedTopLevelRange={(range) => {
              edit(range);
              setSelectedTopLevelRange(range);
            }}
          />
        ) : (
          <>
            {!isContiguous ? <WarningMessage className="mb-2">Warning: Non-contiguous range</WarningMessage> : null}

            {isSplitting ? (
              <RangeSplittingPreview />
            ) : isCardView ? (
              <RangeCardView />
            ) : (
              <RangeTree selectedTopLevelRange={selectedTopLevelRange} hideCanvases={!showCanvases} />
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
