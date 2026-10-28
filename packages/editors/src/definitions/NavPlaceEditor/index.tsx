import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { NavPlaceEditor } from "./NavPlaceEditor";

export const navPlaceEditor: EditorDefinition & { labelMessage?: MessageReference; summaryMessage?: MessageReference } =
  {
    id: "@manifest-editor/nav-place-editor",
    label: "Nav place",
    labelMessage: { namespace: "editors", key: "ui.navPlace" },
    supports: {
      edit: true,
      properties: ["navPlace"],
      resourceTypes: ["Collection", "Manifest", "Canvas", "Range"],
      readOnlyProperties: [],
    },
    component: () => <NavPlaceEditor />,
  };
