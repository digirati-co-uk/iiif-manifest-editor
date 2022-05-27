import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { SaveModal } from "../components/modals/SaveModal";
import { ExportModal } from "../components/modals/ExportModal";

export default {
  title: "Manifest Editor/Modals",
  component: SaveModal,
} as ComponentMeta<typeof SaveModal>;

const SaveModalExample: ComponentStory<typeof SaveModal> = (args) => <SaveModal {...args} />;

export const Save = SaveModalExample.bind({});
Save.args = {
  close: () => {
    console.log("close clicked");
  },
};

const ExportModalExample: ComponentStory<typeof ExportModal> = (args) => <ExportModal {...args} />;

export const Export = ExportModalExample.bind({});
