import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { SaveModal } from "../components/modals/SaveModal";

export default {
  title: "Manifest Editor/SaveModal",
  component: SaveModal
} as ComponentMeta<typeof SaveModal>;

const Template: ComponentStory<typeof SaveModal> = args => (
  <SaveModal {...args} />
);

export const AnExample = Template.bind({});

AnExample.args = {
  close: () => {console.log("close clicked")},
};
