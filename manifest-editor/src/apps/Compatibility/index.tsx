import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { CompatibilityTable } from "@/_panels/center-panels/CompatibilityTable/CompatibilityTable";
import { allCreators } from "@/_creators";
import React from "react";
import { allEditors } from "@/_editors";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";

export default { id: "manifest-editor-compatibility", title: "Compatibility", project: false };

export const centerPanels: LayoutPanel[] = [
  {
    id: "center-panel-empty",
    label: "Center panel",
    icon: "",
    render: () => (
      <div style={{ background: "#fff", paddingBottom: "4em" }}>
        <CompatibilityTable />
      </div>
    ),
  },
];
export const leftPanels: LayoutPanel[] = [];
export const rightPanels: LayoutPanel[] = [];

export const editors = allEditors;

export const creators = allCreators;
