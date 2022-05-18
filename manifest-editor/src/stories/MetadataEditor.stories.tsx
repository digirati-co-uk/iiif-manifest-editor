import * as React from "react";
import { MetadataEditor } from "../editors/MetadataEditor";

import { metadata } from "./storiesData/metadata-example";

export default {
  title: "Manifest Editor/Metadata Editor",
  component: MetadataEditor,
  args: {
    label: "Field label",
  },
};

const Template: any = (props: any) => <MetadataEditor {...props} />;

export const EmptyLanguageEditor = Template.bind({});
EmptyLanguageEditor.args = {
  label: "Metadata",
  availableLanguages: ["en", "de", "fr"],
  fields: metadata,
};
