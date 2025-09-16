import { createRangeHelper } from "@iiif/helpers";
import {
  ListEditIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  WarningMessage,
} from "@manifest-editor/components";
import type { LayoutPanel } from "@manifest-editor/shell";
import { useEffect, useMemo } from "react";
import { Menu, MenuItem } from "react-aria-components";
import { useManifest, useVault } from "react-iiif-vault";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { RangeSplittingPreview } from "./components/RangeSplittingPreview";
import { RangeCreateEmpty } from "./components/RangesCreateEmpty";
import { RangeTree, useRangeTreeOptions } from "./components/RangeTree";

export const rangesPanel: LayoutPanel = {
  id: "@manifest-editor/ranges-listing",
  label: "Ranges",
  icon: <RangesIcon />,
  render: () => {
    return <RangeLeftPanel />;
  },
};

export function RangesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M17 4v16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-4-2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 18H4V4h9zm8-14v12c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5"
      />
    </svg>
  );
}

export function SplitRangeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M4 18V6zm2-2v-5h9v5zm-2 4q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v6h-2V6H4v12h9v2zm12.5-8V9.5H9V8h9v4zM18 22v-3h-3v-2h3v-3h2v3h3v2h-3v3z"
      />
    </svg>
  );
}

export function RangeLeftPanel() {
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
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
            title: "Edit ranges",
            icon: <ListEditIcon className="text-xl" />,
            toggled: isEditing,
            onClick: toggleIsEditing,
          },
          {
            title: "Split range",
            icon: <SplitRangeIcon className="text-xl" />,
            onClick: () => setIsSplitting(!isSplitting),
            toggled: isSplitting,
          },
        ]}
      />
      <SidebarContent className="p-2">
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
        ) : (
          <RangeTree hideCanvases={!showCanvases} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export function RangesListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-1 12H5c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1"
      />
    </svg>
  );
}

export function CanvasesListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 18H6V4h5v7l2.5-1.5L16 11V4h2zm-4.38-6.5L17 18H7l2.38-3.17L11 17z"
      />
    </svg>
  );
}

export function DisplaySettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M20 3H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h4v2h8v-2h4c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2m0 14H4V5h16z"
      />
      <path
        fill="currentColor"
        d="M6 8.25h8v1.5H6zm10.5 1.5H18v-1.5h-1.5V7H15v4h1.5zm-6.5 2.5h8v1.5h-8zM7.5 15H9v-4H7.5v1.25H6v1.5h1.5z"
      />
    </svg>
  );
}
