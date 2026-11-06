import { useTranslations } from "@manifest-editor/i18n";
import { manifestMessage } from "../i18n";
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
  labelMessage: manifestMessage("panels.ranges"),
  icon: <RangesIcon />,
  focusedMode: {
    onSelect: ({ actions }) => {
      actions.centerPanel.open({ id: "range-workbench" });
    },
  },
  render: () => {
    return <RangeLeftPanel />;
  },
};

export function RangeLeftPanel() {
  const t = useTranslations("manifest");
  const vault = useVault();
  const manifest = useManifest();
  const { edit } = useLayoutActions();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const [isCardView, setIsCardView] = useLocalStorage("isCardView", false);
  const [selectedTopLevelRange, setSelectedTopLevelRange] = useState<{
    id: string;
    type: "Range";
  } | null>(null);

  const topLevelRange = useMemo(
    () =>
      helper.rangesToTableOfContentsTree(
        selectedTopLevelRange ? [vault.get(selectedTopLevelRange)] : vault.get(manifest!.structures || []),
        undefined,
        {
          showNoNav: true,
        }
      ),
    [selectedTopLevelRange, manifest?.structures]
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
        title={topLevelRange.label || t("workflow.untitledRange")}
        actions={[
          {
            id: "card-view",
            title: isCardView ? t("workflow.treeView") : t("workflow.cardView"),
            icon: isCardView ? <CanvasListingIcon className="text-xl" /> : <CardsViewIcon className="text-xl" />,
            onClick: () => {
              setIsCardView(!isCardView);
            },
          },
          {
            id: "edit-ranges",
            title: t("workflow.editRange"),
            icon: <ListEditIcon className="text-xl" />,
            toggled: isEditing,
            onClick: toggleIsEditing,
            disabled: topLevelRange?.isVirtual,
          },
          {
            id: "split-range",
            title: t("workflow.splitRange"),
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
            <ArrowBackwardIcon /> {t("workflow.backToRangeList")}
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
            {!isContiguous ? (
              <WarningMessage className="mb-2">{t("workflow.warningNonContiguousRange")}</WarningMessage>
            ) : null}

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
