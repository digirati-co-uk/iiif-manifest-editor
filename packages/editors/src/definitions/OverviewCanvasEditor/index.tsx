import { EditorDefinition } from "@manifest-editor/shell";
import React from "react";
import { OverviewCanvasEditor } from "./OverviewCanvasEditor";

export const overviewCanvasEditor: EditorDefinition = {
  id: "@manifest-editor/overview-canvas-editor",
  label: "Detail",
  supports: {
    edit: true,
    properties: ["items"],
    resourceTypes: ["Canvas"],
    readOnlyProperties: [],
    custom: (res, vault) => {
      const canvas = vault.get(res.resource);
      if (!canvas) {
        return false;
      }

      const annoPage = canvas.items[0];
      if (!annoPage) {
        return false;
      }

      const annoPageFull = vault.get(annoPage);
      return annoPageFull.items.length !== 1;
    },
  },
  component: () => <OverviewCanvasEditor />,
};
